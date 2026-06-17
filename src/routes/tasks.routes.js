// src/routes/tasks.routes.js
import { Router } from "express";
import * as Tasks from "../store/tasks.js";
import { enrichTasks } from "../services/taskEnricher.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(enrichTasks(Tasks.listTasks()));
});

router.post("/", (req, res) => {
  res.status(201).json(Tasks.createTask(req.body || {}));
});

router.post("/:id/duplicate", (req, res) => {
  const clone = Tasks.duplicateTask(req.params.id);
  if (!clone) return res.status(404).json({ error: "ไม่พบงานนี้" });
  res.status(201).json(clone);
});

router.put("/:id", (req, res) => {
  const updated = Tasks.updateTask(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: "ไม่พบงานนี้" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  if (!Tasks.deleteTask(req.params.id)) return res.status(404).json({ error: "ไม่พบงานนี้" });
  res.json({ ok: true });
});

export default router;
