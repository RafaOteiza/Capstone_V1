import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
// import { changeState } from "../services/osStateMachine.js"; // Comentado si no tienes este archivo aun
import { ROLES } from "../constants/roles.js";

const router = Router();
const allowedOsRoles = [ROLES.ADMIN, ROLES.TECNICO_LAB, ROLES.TECNICO_TERRENO];

router.use(firebaseAuth, ensureUser, requireAnyRole(...allowedOsRoles));

/**
 * POST /api/os/crear
 * Crea una nueva Orden de Servicio en pmp.ordenes_servicio
 */
router.post("/crear", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { 
        tipo,           // "CONSOLA" o "VALIDADOR"
        es_pod, 
        falla, 
        bus_ppu, 
        serie_equipo, 
        modelo, 
        marca,
        // Nuevos campos requeridos por la DB:
        terminal_id,    
        pst_codigo
    } = req.body;

    // 1. Validaciones básicas
    if (!["CONSOLA", "VALIDADOR"].includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser CONSOLA o VALIDADOR" });
    }
    if (!bus_ppu || !serie_equipo || !falla) {
      return res.status(400).json({ error: "Faltan datos obligatorios (ppu, serie, falla)" });
    }

    await client.query("BEGIN");

    // 2. Asegurar que el equipo existe en el inventario (Upsert)
    const tablaEquipo = tipo === "CONSOLA" ? "pmp.consolas" : "pmp.validadores";
    await client.query(
      `INSERT INTO ${tablaEquipo} (serie, modelo, marca, activo)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (serie) DO UPDATE SET modelo = EXCLUDED.modelo, marca = EXCLUDED.marca`,
      [serie_equipo, modelo || 'Genérico', marca || 'Genérico']
    );

    // 3. Asegurar que el bus existe (sino falla la FK)
    await client.query(
        `INSERT INTO pmp.buses (ppu) VALUES ($1) ON CONFLICT DO NOTHING`,
        [bus_ppu]
    );

    // 4. Determinar columnas dinámicas según tipo
    const colSerie = tipo === "CONSOLA" ? "consola_serie" : "validador_serie";
    
    // NOTA: Usamos valores por defecto para Terminal/PST si no vienen, 
    // para evitar error de NOT NULL en esta demo. 
    // En prod, deberías enviarlos desde el front.
    const terminalIdFinal = terminal_id || 1; // 1 = El Conquistador (según seed)
    const pstCodigoFinal = pst_codigo || 'U7'; // U7 = STP (según seed)
    
    // Estado inicial: 2 = EN_TRANSITO (Asumiendo que falla en terreno y viaja a lab)
    const estadoInicialId = 2; 

    // 5. Insertar la OS (El Trigger generará el codigo_os automáticamente)
    const insertQuery = `
      INSERT INTO pmp.ordenes_servicio (
        tipo_equipo, 
        es_pod, 
        falla,
        bus_ppu, 
        ${colSerie}, 
        estado_id,
        terminal_id,
        pst_codigo,
        tecnico_terreno_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
        tipo, 
        es_pod || false, 
        falla, 
        bus_ppu, 
        serie_equipo, 
        estadoInicialId,
        terminalIdFinal,
        pstCodigoFinal,
        req.user.id // ID del usuario logueado (UUID)
    ];

    const { rows } = await client.query(insertQuery, values);
    const nuevaOS = rows[0];

    // 6. Registrar Evento en Historial (Opcional pero recomendado)
    // Nota: Como no creamos la tabla 'os_eventos' en el script de correccion anterior, 
    // omito este paso para que no falle. Si la creaste, descomenta lo siguiente:
    /*
    await client.query(
        `INSERT INTO pmp.os_eventos (os_id, evento_tipo, usuario_id, comentario) VALUES ($1, 'CREACION', $2, 'OS creada desde Terreno')`,
        [nuevaOS.codigo_os, req.user.id] // Ojo: os_eventos usaba ID serial o codigo_os según tu diseño.
    );
    */

    await client.query("COMMIT");
    
    res.status(201).json({ 
        message: "Orden de Servicio creada exitosamente",
        os: nuevaOS 
    });

  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error creando OS:", e);
    // Manejo de error específico del trigger de validación
    if (e.message && e.message.includes("Operador") && e.message.includes("no autorizado")) {
        return res.status(409).json({ error: e.message }); // 409 Conflict
    }
    next(e);
  } finally {
    client.release();
  }
});

/**
 * GET /api/os/:id
 * Obtiene el detalle de una OS por su código (ej: MC-000001)
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params; // Esto es el codigo_os (string)

    const sql = `
        SELECT 
            o.*, 
            e.nombre as estado_nombre,
            u.nombre || ' ' || u.apellido as tecnico_nombre
        FROM pmp.ordenes_servicio o
        JOIN pmp.estados e ON o.estado_id = e.id
        LEFT JOIN pmp.usuarios u ON o.tecnico_terreno_id = u.id
        WHERE o.codigo_os = $1
    `;
    
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "OS no encontrada" });

    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;