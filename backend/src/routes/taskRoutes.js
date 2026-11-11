import { Router } from 'express';
import { createTask, completeTask } from '../commands/taskCommands.js';
import { getTask, listTasks } from '../queries/taskQueries.js';

const router = Router();

// HTTP layer delegates; business rules live in command/query handlers.
router.post('/', async (req, res) => {
  res.status(201).json(await createTask(req.body));
});

router.put('/:id/complete', async (req, res) => {
  res.json(await completeTask(req.params.id));
});

router.get('/:id', async (req, res) => {
  res.json(await getTask(req.params.id));
});

router.get('/', async (req, res) => {
  res.json(await listTasks(req.query.isCompleted));
});

export default router;
