import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

import authRoutes from "./routes/auth.routes.js";
import osRoutes from "./routes/os.routes.js";
import usersRoutes from "./routes/users.routes.js";
import adminUsersRoutes from "./routes/admin.users.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js"; // <--- 1. IMPORTAR
import labRoutes from "./routes/lab.routes.js";
import qaRoutes from "./routes/qa.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/os", osRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/dashboard", dashboardRoutes); // <--- 2. USAR
app.use("/api/lab", labRoutes);
app.use("/api/qa", qaRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default app;