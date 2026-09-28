import { AppError } from '../../../utils/appError.js';
import { findClientProfileByUserId } from '../../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import { findContractById } from '../contracts/contractsPersistence.js';
import {
  findTaskById,
  insertTask,
  listTasksByContractId,
  updateTaskStatusById as updateTaskStatusRow,
} from './tasksPersistence.js';

const toPublicTask = (task) => ({
  id: task.id,
  contract_id: task.contract_id,
  title: task.title,
  description: task.description,
  status: task.status,
  due_date: task.due_date,
});

const requireContract = (contract) => {
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return contract;
};

const requireTask = (task) => {
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return toPublicTask(task);
};

const assertContractParticipant = async (contract, actor) => {
  if (actor?.role === 'client') {
    const profile = await findClientProfileByUserId(actor.id);

    if (profile && profile.id === contract.client_id) {
      return;
    }
  }

  if (actor?.role === 'freelancer') {
    const profile = await findFreelancerProfileByUserId(actor.id);

    if (profile && profile.id === contract.freelancer_id) {
      return;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const requireContractParticipant = async (contractId, actor) => {
  const contract = requireContract(await findContractById(contractId));
  await assertContractParticipant(contract, actor);
  return contract;
};

const toDateError = (error) => {
  if (error?.statusCode === 400) {
    throw new AppError('Validation failed', 400, [
      { field: 'due_date', message: 'Due date must be a valid date' },
    ]);
  }

  throw error;
};

export const listContractTasks = async (contractId, actor) => {
  await requireContractParticipant(contractId, actor);
  const tasks = await listTasksByContractId(contractId);
  return tasks.map(toPublicTask);
};

export const createContractTask = async (contractId, actor, payload) => {
  await requireContractParticipant(contractId, actor);

  try {
    const created = await insertTask({
      contractId,
      title: payload.title ?? null,
      description: payload.description ?? null,
      status: payload.status ?? null,
      dueDate: payload.due_date ?? null,
    });

    return toPublicTask(created);
  } catch (error) {
    toDateError(error);
  }
};

export const updateTaskStatusById = async (taskId, actor, payload) => {
  const task = requireTask(await findTaskById(taskId));
  await requireContractParticipant(task.contract_id, actor);

  const updated = await updateTaskStatusRow(taskId, payload.status);
  return requireTask(updated);
};
