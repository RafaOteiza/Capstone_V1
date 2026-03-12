import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";

const router = Router();

// ==========================================
// 1. LISTAR TÉCNICOS
// ==========================================
router.get("/technicians", firebaseAuth, async (req, res, next) => {
  try {
    const sql = `
      SELECT id, nombre, apellido, correo as email 
      FROM pmp.usuarios 
      WHERE rol = 'tecnico_laboratorio' 
      AND activo = true
      ORDER BY nombre ASC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. ASIGNAR TÉCNICO
// ==========================================
router.put("/assign", firebaseAuth, async (req, res, next) => {
  const { codigo_os, tecnico_id } = req.body;
  try {
    const client = await pool.connect();
    try {
        let uuidFinal = null;
        if (tecnico_id && tecnico_id !== "0" && tecnico_id.trim() !== "") {
            uuidFinal = tecnico_id;
        }
        
        const sql = `
          UPDATE pmp.ordenes_servicio 
          SET tecnico_laboratorio_id = $1, actualizado_en = NOW()
          WHERE codigo_os = $2
          RETURNING *
        `;
        const result = await client.query(sql, [uuidFinal, codigo_os]);

        if (result.rowCount === 0) return res.status(404).json({ error: `OS no encontrada` });
        
        res.json({ success: true, message: `Asignación actualizada` });
    } finally {
        client.release();
    }
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. OBTENER COLA DE TRABAJO
// ==========================================
router.get("/queue/:type", firebaseAuth, async (req, res, next) => {
  const { type } = req.params; 
  try {
    // 4=Diagnóstico, 5=Reparación, 9=Espera Repuesto
    const sql = `
      SELECT 
        o.codigo_os, 
        o.fecha, 
        o.falla, 
        o.estado_id,
        e.nombre as estado_nombre,
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        u.nombre || ' ' || u.apellido as tecnico_origen,
        o.tecnico_laboratorio_id
      FROM pmp.ordenes_servicio o
      JOIN pmp.estados e ON o.estado_id = e.id
      LEFT JOIN pmp.usuarios u ON o.tecnico_terreno_id = u.id
      WHERE o.tipo_equipo = $1 
      AND o.estado_id IN (4, 5, 9) 
      ORDER BY o.estado_id DESC, o.fecha ASC
    `;
    const result = await pool.query(sql, [type.toUpperCase()]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. MOVER DE ESTADO
// ==========================================
router.put("/move", firebaseAuth, async (req, res, next) => {
  const { codigo_os, nuevo_estado_id } = req.body;
  try {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE pmp.ordenes_servicio 
             SET estado_id = $1, actualizado_en = NOW() 
             WHERE codigo_os = $2`, 
            [nuevo_estado_id, codigo_os]
        );
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. REGISTRAR REPARACIÓN (FINALIZAR)
// ==========================================
router.post("/finish", firebaseAuth, async (req, res, next) => {
    const { codigo_os, falla, acciones, repuestos, comentario } = req.body; 
    
    // CORRECCIÓN: Usamos req.firebase en lugar de req.user
    if (!req.firebase || !req.firebase.uid) {
        return res.status(401).json({ error: "No autorizado. Token inválido." });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // 1. Identificar al técnico usando req.firebase.uid
      const userRes = await client.query(
          `SELECT id FROM pmp.usuarios WHERE firebase_uid = $1`,
          [req.firebase.uid]
      );

      if (userRes.rows.length === 0) {
          throw new Error(`Usuario no vinculado en DB. UID: ${req.firebase.uid}`);
      }
      const tecnicoId = userRes.rows[0].id;

      const accionesStr = Array.isArray(acciones) ? acciones.join(', ') : acciones;
      const repuestosStr = Array.isArray(repuestos) ? repuestos.join(', ') : repuestos;
  
      // 2. Insertar Bitácora
      await client.query(
          `INSERT INTO pmp.registro_reparaciones 
          (codigo_os, tecnico_id, falla_detectada, accion_realizada, repuestos_usados, comentario)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [codigo_os, tecnicoId, falla, accionesStr, repuestosStr, comentario]
      );
  
      // 3. Mover a estado 10 (FINALIZADO_TALLER)
      await client.query(
          `UPDATE pmp.ordenes_servicio 
           SET estado_id = 10, actualizado_en = NOW() 
           WHERE codigo_os = $1`,
          [codigo_os]
      );
  
      await client.query('COMMIT');
      res.json({ success: true, message: "Reparación registrada correctamente." });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("Error en /finish:", e.message);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
});
  
// ==========================================
// 6. SOLICITAR REPUESTO
// ==========================================
router.post("/request-part", firebaseAuth, async (req, res, next) => {
    const { codigo_os, repuesto, comentario } = req.body;
    
    // CORRECCIÓN: Usamos req.firebase
    if (!req.firebase || !req.firebase.uid) {
        return res.status(401).json({ error: "No autorizado." });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // 1. Identificar al técnico
      const userRes = await client.query(
          `SELECT id FROM pmp.usuarios WHERE firebase_uid = $1`,
          [req.firebase.uid]
      );

      if (userRes.rows.length === 0) {
          throw new Error("Usuario no vinculado en la base de datos.");
      }
      const tecnicoId = userRes.rows[0].id;

      // 2. Crear solicitud
      await client.query(
          `INSERT INTO pmp.solicitudes_repuestos (codigo_os, solicitado_por, repuesto_solicitado, comentario)
           VALUES ($1, $2, $3, $4)`,
          [codigo_os, tecnicoId, repuesto, comentario]
      );
  
      // 3. Cambiar a estado 9 (ESPERA_REPUESTO)
      await client.query(
          `UPDATE pmp.ordenes_servicio 
           SET estado_id = 9, actualizado_en = NOW() 
           WHERE codigo_os = $1`,
          [codigo_os]
      );
  
      await client.query('COMMIT');
      res.json({ success: true, message: "Solicitud enviada." });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("Error en /request-part:", e.message);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
});

// ==========================================
// 7. CATÁLOGO
// ==========================================
router.get("/parts", firebaseAuth, async (req, res, next) => {
    try {
      const result = await pool.query(
          `SELECT id, nombre, categoria, stock FROM pmp.repuestos WHERE stock > 0 ORDER BY nombre ASC`
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
});

export default router;