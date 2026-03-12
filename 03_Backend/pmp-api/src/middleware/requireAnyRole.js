// src/middleware/requireAnyRole.js

export function requireAnyRole(...allowed) {
  return (req, res, next) => {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (roles.length === 0) return res.status(403).json({ error: "Forbidden" });

    const hasRole = roles.some(r => allowed.includes(r));
    if (!hasRole) return res.status(403).json({ error: "Forbidden" });

    next();
  };
}
