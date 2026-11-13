import Mediator from './Mediator.js';
import { createTask, completeTask } from '../commands/taskCommands.js';
import { getTask, listTasks } from '../queries/taskQueries.js';

const mediator = new Mediator();

mediator.register('CreateTask', createTask);
mediator.register('CompleteTask', completeTask);
mediator.register('GetTask', getTask);
mediator.register('ListTasks', listTasks);

export default mediator;
