// src/routes/index.js — รวม route ทั้งหมดไว้ภายใต้ /api
import { Router } from "express";
import tasks from "./tasks.routes.js";
import brands from "./brands.routes.js";
import importRoutes from "./import.routes.js";
import settings from "./settings.routes.js";
import notify from "./notify.routes.js";
import attachments from "./attachments.routes.js";

const api = Router();

api.use("/tasks", tasks);
api.use("/brands", brands);
api.use("/import", importRoutes);
api.use("/settings", settings);
api.use("/notify", notify);
api.use("/attachments", attachments);

export default api;
