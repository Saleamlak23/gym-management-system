// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Equipment Controller
//  File: backend/src/controllers/equipment.controller.js
//
//  Handles:
//    listCategories  — all equipment categories
//    createCategory  — new category
//    list            — all equipment with filters
//    getOne          — single item with maintenance summary
//    create          — add new equipment
//    updateStatus    — change equipment status
//    listOverdue     — items overdue for service or over cost threshold
//    listMaintenance — maintenance history for one item
//    logMaintenance  — record a new maintenance event
// =============================================================

import { query, transaction } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// Configurable thresholds
const OVERDUE_DAYS         = 90;    // days since last service before flagged as overdue
const COST_THRESHOLD       = 5000;  // cumulative maintenance cost threshold (USD/ETB)


export const listCategories = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT
       ec.category_id,
       ec.category_name,
       COUNT(e.equipment_id)::int AS equipment_count
     FROM equipment_categories ec
     LEFT JOIN equipment e ON e.category_id = ec.category_id
     GROUP BY ec.category_id
     ORDER BY ec.category_name ASC`
  );

  return sendSuccess(res, { categories: rows });
});


export const createCategory = asyncHandler(async (req, res) => {
  const { category_name } = req.body;

  const existing = await query(
    'SELECT category_id FROM equipment_categories WHERE LOWER(category_name) = LOWER($1)',
    [category_name]
  );

  if (existing.rows.length > 0) {
    return sendError(res, 'A category with this name already exists.', 409);
  }

  const { rows } = await query(
    `INSERT INTO equipment_categories (category_name)
     VALUES ($1)
     RETURNING category_id, category_name`,
    [category_name]
  );

  return sendSuccess(res, { category: rows[0] }, 201, 'Category created successfully');
});


export const list = asyncHandler(async (req, res) => {
  const branchId   = req.query.branch_id   || '';
  const categoryId = req.query.category_id || '';
  const status     = req.query.status      || '';

  const filters = [];
  const params  = [];
  let   pIndex  = 1;

  if (branchId)   { filters.push(`e.branch_id   = $${pIndex++}`); params.push(branchId);   }
  if (categoryId) { filters.push(`e.category_id = $${pIndex++}`); params.push(categoryId); }
  if (status)     { filters.push(`e.status       = $${pIndex++}`); params.push(status);     }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

  const { rows } = await query(
    `SELECT
       e.equipment_id,
       e.model_number,
       e.purchase_date,
       e.status,
       -- Branch info
       b.branch_id,
       b.name                          AS branch_name,
       -- Category info
       ec.category_id,
       ec.category_name,
       -- Maintenance summary
       COUNT(ml.log_id)::int           AS maintenance_count,
       COALESCE(SUM(ml.cost), 0)       AS total_maintenance_cost,
       MAX(ml.service_date)            AS last_service_date,
       -- Days since last service
       CASE
         WHEN MAX(ml.service_date) IS NOT NULL
         THEN (CURRENT_DATE - MAX(ml.service_date))
         ELSE NULL
       END                             AS days_since_service
     FROM equipment             e
     JOIN branches              b  ON b.branch_id    = e.branch_id
     JOIN equipment_categories  ec ON ec.category_id = e.category_id
     LEFT JOIN maintenance_logs ml ON ml.equipment_id = e.equipment_id
     ${whereClause}
     GROUP BY
       e.equipment_id, e.model_number, e.purchase_date, e.status,
       b.branch_id, b.name,
       ec.category_id, ec.category_name
     ORDER BY b.name ASC, ec.category_name ASC, e.model_number ASC`,
    params
  );

  return sendSuccess(res, { equipment: rows, total: rows.length });
});


export const getOne = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;

  const { rows } = await query(
    `SELECT
       e.equipment_id,
       e.model_number,
       e.purchase_date,
       e.status,
       b.branch_id,
       b.name                     AS branch_name,
       ec.category_id,
       ec.category_name,
       COUNT(ml.log_id)::int      AS maintenance_count,
       COALESCE(SUM(ml.cost), 0)  AS total_maintenance_cost,
       MAX(ml.service_date)       AS last_service_date,
       CASE
         WHEN MAX(ml.service_date) IS NOT NULL
         THEN (CURRENT_DATE - MAX(ml.service_date))
         ELSE NULL
       END                        AS days_since_service
     FROM equipment             e
     JOIN branches              b  ON b.branch_id    = e.branch_id
     JOIN equipment_categories  ec ON ec.category_id = e.category_id
     LEFT JOIN maintenance_logs ml ON ml.equipment_id = e.equipment_id
     WHERE e.equipment_id = $1
     GROUP BY
       e.equipment_id, e.model_number, e.purchase_date, e.status,
       b.branch_id, b.name, ec.category_id, ec.category_name`,
    [equipmentId]
  );

  if (rows.length === 0) {
    return sendError(res, 'Equipment not found.', 404);
  }

  const item = rows[0];

  // Attach computed flags for the frontend
  item.is_overdue       = item.days_since_service !== null && item.days_since_service > OVERDUE_DAYS;
  item.exceeds_cost     = parseFloat(item.total_maintenance_cost) >= COST_THRESHOLD;
  item.overdue_threshold_days = OVERDUE_DAYS;
  item.cost_threshold         = COST_THRESHOLD;

  return sendSuccess(res, { equipment: item });
});


export const create = asyncHandler(async (req, res) => {
  const { branch_id, category_id, model_number, purchase_date, status } = req.body;

  // Confirm branch exists
  const branchCheck = await query(
    'SELECT branch_id FROM branches WHERE branch_id = $1',
    [branch_id]
  );
  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  // Confirm category exists
  const catCheck = await query(
    'SELECT category_id FROM equipment_categories WHERE category_id = $1',
    [category_id]
  );
  if (catCheck.rows.length === 0) {
    return sendError(res, 'Equipment category not found.', 404);
  }

  const { rows } = await query(
    `INSERT INTO equipment (branch_id, category_id, model_number, purchase_date, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING equipment_id, branch_id, category_id, model_number, purchase_date, status`,
    [branch_id, category_id, model_number, purchase_date || null, status || 'active']
  );

  return sendSuccess(res, { equipment: rows[0] }, 201, 'Equipment added successfully');
});


export const updateStatus = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;
  const { status }      = req.body;

  const existing = await query(
    'SELECT equipment_id, status FROM equipment WHERE equipment_id = $1',
    [equipmentId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Equipment not found.', 404);
  }

  const current = existing.rows[0];

  // Retired equipment cannot be changed back to any other status
  if (current.status === 'retired') {
    return sendError(
      res,
      'Retired equipment cannot be reactivated. Please add a new equipment record instead.',
      409
    );
  }

  const { rows } = await query(
    `UPDATE equipment
     SET    status = $1
     WHERE  equipment_id = $2
     RETURNING equipment_id, model_number, status`,
    [status, equipmentId]
  );

  const warning = status === 'retired'
    ? 'Equipment has been retired. This action cannot be undone.'
    : null;

  return sendSuccess(
    res,
    { equipment: rows[0], warning },
    200,
    `Equipment status updated to '${status}'`
  );
});


export const listOverdue = asyncHandler(async (req, res) => {
  const overdueDays   = parseInt(req.query.overdue_days)   || OVERDUE_DAYS;
  const costThreshold = parseFloat(req.query.cost_threshold) || COST_THRESHOLD;
  const branchId      = req.query.branch_id || '';

  const params  = [overdueDays, costThreshold];
  const filters = [];
  let   pIndex  = 3;

  if (branchId) {
    filters.push(`e.branch_id = $${pIndex++}`);
    params.push(branchId);
  }

  // Only check non-retired equipment
  filters.push(`e.status != 'retired'`);

  const whereClause = 'WHERE ' + filters.join(' AND ');

  const { rows } = await query(
    `SELECT
       e.equipment_id,
       e.model_number,
       e.status,
       e.purchase_date,
       b.name                     AS branch_name,
       ec.category_name,
       COALESCE(SUM(ml.cost), 0)  AS total_maintenance_cost,
       MAX(ml.service_date)       AS last_service_date,
       CASE
         WHEN MAX(ml.service_date) IS NOT NULL
         THEN (CURRENT_DATE - MAX(ml.service_date))
         ELSE NULL
       END                        AS days_since_service,
       -- Flag which condition triggered this item
       CASE
         WHEN MAX(ml.service_date) IS NULL
           OR (CURRENT_DATE - MAX(ml.service_date)) > $1
         THEN true ELSE false
       END                        AS is_service_overdue,
       CASE
         WHEN COALESCE(SUM(ml.cost), 0) >= $2
         THEN true ELSE false
       END                        AS exceeds_cost_threshold
     FROM equipment             e
     JOIN branches              b  ON b.branch_id    = e.branch_id
     JOIN equipment_categories  ec ON ec.category_id = e.category_id
     LEFT JOIN maintenance_logs ml ON ml.equipment_id = e.equipment_id
     ${whereClause}
     GROUP BY
       e.equipment_id, e.model_number, e.status, e.purchase_date,
       b.name, ec.category_name
     HAVING
       -- Include if overdue for service
       (MAX(ml.service_date) IS NULL OR (CURRENT_DATE - MAX(ml.service_date)) > $1)
       OR
       -- Include if cumulative cost exceeds threshold
       COALESCE(SUM(ml.cost), 0) >= $2
     ORDER BY days_since_service DESC NULLS FIRST, total_maintenance_cost DESC`,
    params
  );

  return sendSuccess(res, {
    overdue_equipment:   rows,
    total:               rows.length,
    thresholds_applied: {
      overdue_days:    overdueDays,
      cost_threshold:  costThreshold,
    },
  });
});


export const listMaintenance = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;

  const equipCheck = await query(
    `SELECT e.equipment_id, e.model_number, b.name AS branch_name
     FROM equipment e
     JOIN branches  b ON b.branch_id = e.branch_id
     WHERE e.equipment_id = $1`,
    [equipmentId]
  );

  if (equipCheck.rows.length === 0) {
    return sendError(res, 'Equipment not found.', 404);
  }

  const { rows } = await query(
    `SELECT
       log_id,
       service_date,
       description,
       cost,
       -- Running cumulative cost (oldest to newest)
       SUM(cost) OVER (
         ORDER BY service_date ASC, log_id ASC
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS cumulative_cost
     FROM maintenance_logs
     WHERE equipment_id = $1
     ORDER BY service_date DESC, log_id DESC`,
    [equipmentId]
  );

  const totalCost = rows.length > 0
    ? parseFloat(rows[0].cumulative_cost)
    : 0;

  return sendSuccess(res, {
    equipment:           equipCheck.rows[0],
    maintenance_logs:    rows,
    total_cost:          totalCost,
    log_count:           rows.length,
    exceeds_threshold:   totalCost >= COST_THRESHOLD,
  });
});


export const logMaintenance = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;
  const { description, cost, service_date } = req.body;

  // Confirm equipment exists and is not retired
  const equipCheck = await query(
    'SELECT equipment_id, status FROM equipment WHERE equipment_id = $1',
    [equipmentId]
  );

  if (equipCheck.rows.length === 0) {
    return sendError(res, 'Equipment not found.', 404);
  }

  if (equipCheck.rows[0].status === 'retired') {
    return sendError(res, 'Cannot log maintenance for retired equipment.', 409);
  }

  const result = await transaction(async (client) => {
    // Insert the maintenance log
    const logResult = await client.query(
      `INSERT INTO maintenance_logs (equipment_id, service_date, description, cost)
       VALUES ($1, $2, $3, $4)
       RETURNING log_id, equipment_id, service_date, description, cost`,
      [equipmentId, service_date || new Date(), description, cost]
    );

    // If the equipment was under maintenance, restore it to active
    let statusUpdated = false;
    if (equipCheck.rows[0].status === 'maintenance') {
      await client.query(
        `UPDATE equipment SET status = 'active' WHERE equipment_id = $1`,
        [equipmentId]
      );
      statusUpdated = true;
    }

    return { log: logResult.rows[0], statusUpdated };
  });

  const message = result.statusUpdated
    ? 'Maintenance logged and equipment status restored to active'
    : 'Maintenance event logged successfully';

  return sendSuccess(res, { maintenance_log: result.log }, 201, message);
});