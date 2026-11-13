import { Router } from "express";
import mediator from "../mediator/taskMediator.js";

const router = Router();

// The mediator dispatches requests, business rules stay in the handlers.
router.post("/", async (req, res) => {
  res.status(201).json(await mediator.send("CreateTask", req.body));
});

router.put("/:id/complete", async (req, res) => {
  res.json(await mediator.send("CompleteTask", req.params.id));
});

router.get("/:id", async (req, res) => {
  res.json(await mediator.send("GetTask", req.params.id));
});

router.get("/", async (req, res) => {
  res.json(await mediator.send("ListTasks", req.query.isCompleted));
});

export default router;
