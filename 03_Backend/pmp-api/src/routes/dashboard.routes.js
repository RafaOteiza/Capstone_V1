import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/summary", firebaseAuth, ensureUser, requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
        // 1. OBTENER INVENTARIO TOTAL
        const totalValidadoresRes = await client.query("SELECT COUNT(*) FROM pmp.validadores");
        const totalConsolasRes = await client.query("SELECT COUNT(*) FROM pmp.consolas");
        
        const totalValidadores = parseInt(totalValidadoresRes.rows[0].count, 10);
        const totalConsolas = parseInt(totalConsolasRes.rows[0].count, 10);
        const totalFlota = totalValidadores + totalConsolas;

        // 2. OBTENER ORDENES DE SERVICIO ACTIVAS
        const osSql = `
          SELECT 
            o.tipo_equipo as tipo, 
            e.nombre as estado_actual, 
            o.es_pod, 
            COUNT(*)::int as total 
          FROM pmp.ordenes_servicio o
          JOIN pmp.estados e ON o.estado_id = e.id
          WHERE e.nombre != 'RECHAZADO'
          GROUP BY o.tipo_equipo, e.nombre, o.es_pod
        `;

        const { rows: osRows } = await client.query(osSql);

        // 3. PROCESAR METRICAS
        let conteoEnTaller = 0;   
        let conteoDisponibles = 0; 
        let conteoFallaRuta = 0;   
        
        // Contadores específicos para subtítulos
        let consolasFallaTotal = 0;      // Falla general (incluye ruta)
        let validadoresFallaTotal = 0;   // Falla general (incluye ruta)
        
        // --- CORRECCIÓN: Contadores específicos para "En Taller" ---
        let consolasEnTaller = 0;
        let validadoresEnTaller = 0;

        let podsTotalesEnProceso = 0;
        let podsRecuperados = 0;

        osRows.forEach(r => {
            const { tipo, estado_actual, es_pod, total } = r;
            const nTotal = parseInt(total, 10);

            // Totales generales de falla (para gráfico de torta)
            if (tipo === 'CONSOLA') consolasFallaTotal += nTotal;
            if (tipo === 'VALIDADOR') validadoresFallaTotal += nTotal;

            // PODs
            if (es_pod) {
                podsTotalesEnProceso += nTotal;
                if (estado_actual === 'DISPONIBLE') podsRecuperados += nTotal;
            }

            // Clasificación por Ubicación/Estado
            if (estado_actual === 'DISPONIBLE') {
                conteoDisponibles += nTotal;
            } else if (estado_actual === 'EN_RUTA') {
                conteoFallaRuta += nTotal;
            } else {
                // ESTO ES LO QUE ESTÁ FÍSICAMENTE EN TALLER/LAB/TRANSITO
                conteoEnTaller += nTotal;
                
                // Aquí llenamos los subtítulos correctos
                if (tipo === 'CONSOLA') consolasEnTaller += nTotal;
                if (tipo === 'VALIDADOR') validadoresEnTaller += nTotal;
            }
        });

        // 4. CALCULAR OPERATIVOS REALES
        const totalConIncidencia = conteoEnTaller + conteoDisponibles + conteoFallaRuta;
        const totalOperativosReales = totalFlota - totalConIncidencia;
        const operativosFinal = totalOperativosReales < 0 ? 0 : totalOperativosReales;

        // 5. DATOS PARA GRÁFICOS
        // El gráfico de torta muestra la distribución de lo que está EN TALLER (no en ruta)
        const pieData = [
            { name: 'Consolas', value: consolasEnTaller },
            { name: 'Validadores', value: validadoresEnTaller }
        ].filter(d => d.value > 0);

        const barData = [
            { name: 'Operativos OK', cantidad: operativosFinal },
            { name: 'Reportados Ruta', cantidad: conteoFallaRuta },
            { name: 'En Laboratorio', cantidad: conteoEnTaller },
            { name: 'Disponibles', cantidad: conteoDisponibles }
        ];

        res.json({
            kpis: {
                totalEnProceso: conteoEnTaller,
                // Enviamos los datos segregados correctamente
                consolasEnLab: consolasEnTaller,    // <--- NUEVO
                validadoresEnLab: validadoresEnTaller, // <--- NUEVO
                
                totalReparados: conteoDisponibles,
                totalOperativos: operativosFinal,
                totalPods: podsTotalesEnProceso,
                podsReparados: podsRecuperados
            },
            charts: {
                pieData, // Ahora coincide con "En Taller"
                barData
            }
        });

    } finally {
        client.release();
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    next(err);
  }
});

export default router;