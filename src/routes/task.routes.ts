import { Router } from "express";
import {
  getTasks,
  getTaskById,
  getTasksByUserId,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.get("/user/:userId", getTasksByUserId);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
