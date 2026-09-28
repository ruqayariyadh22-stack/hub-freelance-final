import {
  validateContractIdParam,
  validateCreateTask,
  validateTaskIdParam,
  validateUpdateTaskStatus,
} from './tasksValidation.js';
import {
  createContractTask,
  listContractTasks,
  updateTaskStatusById,
} from './tasksService.js';

export const listByContract = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const data = await listContractTasks(contractId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const create = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const payload = validateCreateTask(req.body);
  const data = await createContractTask(contractId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const updateStatusById = async (req, res) => {
  const taskId = validateTaskIdParam(req.params.id);
  const payload = validateUpdateTaskStatus(req.body);
  const data = await updateTaskStatusById(taskId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};
