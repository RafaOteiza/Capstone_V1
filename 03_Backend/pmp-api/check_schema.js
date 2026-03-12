
import pg from 'pg';
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'pmp' AND table_name = 'ordenes_servicio';
    `);

        console.log("COLUMNAS DE pmp.ordenes_servicio:");
        res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

        if (res.rows.find(c => c.column_name === 'terminal_id')) {
            console.log("✅ terminal_id EXISTE");
        } else {
            console.log("❌ terminal_id NO EXISTE");
        }

        if (res.rows.find(c => c.column_name === 'pst_codigo')) {
            console.log("✅ pst_codigo EXISTE");
        } else {
            console.log("❌ pst_codigo NO EXISTE");
        }

    } catch (err) {
        console.error("Error consultando schema:", err);
    } finally {
        await pool.end();
    }
}

checkSchema();
