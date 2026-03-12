import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listOs, OrdenServicio } from "../api/os";

export default function OsListPage() {
  const [items, setItems] = useState<OrdenServicio[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setBusy(true);
    try {
      const data = await listOs();
      setItems(data);
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? ex?.message ?? "Error cargando OS");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => x.id.toLowerCase().includes(s) || (x.estado ?? "").toLowerCase().includes(s));
  }, [q, items]);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <h2 className="title" style={{ margin: 0 }}>Órdenes de Servicio</h2>
          <button className="btn secondary" onClick={load} disabled={busy}>
            {busy ? "Cargando..." : "Refrescar"}
          </button>
          <div style={{ marginLeft: "auto", width: 320 }}>
            <input className="input" placeholder="Buscar por ID o estado" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {err ? <p className="small" style={{ color: "#b91c1c" }}>{err}</p> : null}

        <hr className="hr" />

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Terminal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((os) => (
              <tr key={os.id}>
                <td><strong>{os.id}</strong></td>
                <td><span className="badge">{os.estado}</span></td>
                <td className="small">{os.equipo_tipo ?? "-"}</td>
                <td className="small">{os.terminal ?? "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <Link className="btn secondary" to={`/os/${encodeURIComponent(os.id)}`}>Ver</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="small muted">Sin resultados.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
