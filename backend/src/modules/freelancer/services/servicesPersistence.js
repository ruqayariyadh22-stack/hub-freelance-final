import { query } from '../../../config/db.js';

const SERVICE_COLUMNS = `
  id,
  freelancer_id,
  title,
  description,
  category,
  price,
  delivery_time,
  status,
  is_featured
`;

const UPDATABLE_COLUMNS = [
  'title',
  'description',
  'category',
  'price',
  'delivery_time',
  'status',
];

export const findFreelancerProfileByUserId = async (userId) => {
  const result = await query(
    `SELECT id, user_id
     FROM freelancer_profiles
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const listServicesByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT ${SERVICE_COLUMNS}
     FROM services
     WHERE freelancer_id = $1
     ORDER BY is_featured DESC, id ASC`,
    [freelancerId],
  );

  return result.rows;
};

export const findServiceById = async (serviceId) => {
  const result = await query(
    `SELECT ${SERVICE_COLUMNS}
     FROM services
     WHERE id = $1`,
    [serviceId],
  );

  return result.rows[0] || null;
};

export const insertService = async (freelancerId, payload) => {
  const result = await query(
    `INSERT INTO services (
       freelancer_id,
       title,
       description,
       category,
       price,
       delivery_time,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SERVICE_COLUMNS}`,
    [
      freelancerId,
      payload.title,
      payload.description,
      payload.category,
      payload.price,
      payload.delivery_time,
      Object.prototype.hasOwnProperty.call(payload, 'status')
        ? payload.status
        : null,
    ],
  );

  return result.rows[0];
};

export const updateServiceById = async (serviceId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findServiceById(serviceId);
  }

  values.push(serviceId);

  const result = await query(
    `UPDATE services
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${SERVICE_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const updateServiceFeaturedById = async (serviceId, isFeatured) => {
  const result = await query(
    `UPDATE services
     SET is_featured = $1
     WHERE id = $2
     RETURNING ${SERVICE_COLUMNS}`,
    [isFeatured, serviceId],
  );

  return result.rows[0] || null;
};

export const clearFeaturedServicesByFreelancerId = async (freelancerId) => {
  const result = await query(
    `UPDATE services
     SET is_featured = FALSE
     WHERE freelancer_id = $1
       AND is_featured IS TRUE
     RETURNING ${SERVICE_COLUMNS}`,
    [freelancerId],
  );

  return result.rows;
};

export const deleteServiceById = async (serviceId) => {
  const result = await query(
    `DELETE FROM services
     WHERE id = $1
     RETURNING ${SERVICE_COLUMNS}`,
    [serviceId],
  );

  return result.rows[0] || null;
};
