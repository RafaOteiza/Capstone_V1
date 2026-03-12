import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";

const router = Router();

// GET: Obtener cola de QA (Solo estado 6 = EN_QA)
router.get("/queue", firebaseAuth, async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        o.codigo_os, 
        o.tipo_equipo,
        o.fecha, 
        o.falla, 
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        u_tec.nombre || ' ' || u_tec.apellido as tecnico_reparador
      FROM pmp.ordenes_servicio o
      LEFT JOIN pmp.usuarios u_tec ON o.tecnico_laboratorio_id = u_tec.id
      WHERE o.estado_id = 6 
      ORDER BY o.actualizado_en ASC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST: Procesar QA (Aprobar o Rechazar)
router.post("/process", firebaseAuth, async (req, res, next) => {
  const { codigo_os, accion, comentario } = req.body; // accion: 'APROBAR' | 'RECHAZAR'
  
  try {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let nuevoEstado = 0;
        let evento = '';

        if (accion === 'APROBAR') {
            nuevoEstado = 7; // 7 = DISPONIBLE (Vuelve a Bodega)
            evento = 'QA_APPROVED';
        } else {
            nuevoEstado = 4; // 4 = EN_DIAGNOSTICO (Vuelve a Lab para revisar de nuevo)
            evento = 'QA_REJECTED';
        }

        // 1. Actualizar OS
        await client.query(
            `UPDATE pmp.ordenes_servicio SET estado_id = $1, actualizado_en = NOW() WHERE codigo_os = $2`,
            [nuevoEstado, codigo_os]
        );

        // 2. Registrar comentario en historial (si tuvieras tabla de historial)
        // await client.query(...)

        await client.query('COMMIT');
        res.json({ success: true, message: `OS ${codigo_os} procesada (${accion})` });

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

export default router;