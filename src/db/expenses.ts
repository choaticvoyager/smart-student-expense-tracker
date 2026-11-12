import type { SQLiteDatabase } from 'expo-sqlite';

import type { DashboardData, Expense, ExpenseFilters, ExpenseInput } from '../types/models';
import { listCategorySummaries } from './categories';

const EXPENSE_SELECT = `
  SELECT
    e.id,
    e.title,
    e.amount,
    e.category_id AS categoryId,
    c.name AS categoryName,
    c.color AS categoryColor,
    e.spent_on AS spentOn,
    e.payment_method AS paymentMethod,
    e.note,
    e.created_at AS createdAt
  FROM expenses e
  INNER JOIN categories c ON c.id = e.category_id
`;

export async function listExpenses(db: SQLiteDatabase, filters: ExpenseFilters = {}): Promise<Expense[]> {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  const query = filters.query?.trim();

  if (query) {
    clauses.push('(e.title LIKE ? OR e.note LIKE ? OR c.name LIKE ?)');
    const like = `%${query}%`;
    params.push(like, like, like);
  }

  if (filters.categoryId) {
    clauses.push('e.category_id = ?');
    params.push(filters.categoryId);
  }

  if (filters.paymentMethod) {
    clauses.push('e.payment_method = ?');
    params.push(filters.paymentMethod);
  }

  if (filters.fromDate) {
    clauses.push('e.spent_on >= ?');
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    clauses.push('e.spent_on <= ?');
    params.push(filters.toDate);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.getAllAsync<Expense>(
    `${EXPENSE_SELECT} ${where} ORDER BY e.spent_on DESC, e.id DESC`,
    params,
  );
}

export async function getExpense(db: SQLiteDatabase, id: number): Promise<Expense | null> {
  return db.getFirstAsync<Expense>(`${EXPENSE_SELECT} WHERE e.id = ?`, id);
}

export async function createExpense(db: SQLiteDatabase, input: ExpenseInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO expenses
      (title, amount, category_id, spent_on, payment_method, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.title.trim(),
    input.amount,
    input.categoryId,
    input.spentOn,
    input.paymentMethod,
    input.note.trim(),
    new Date().toISOString(),
  );
  return Number(result.lastInsertRowId);
}

export async function updateExpense(db: SQLiteDatabase, id: number, input: ExpenseInput): Promise<void> {
  await db.runAsync(
    `UPDATE expenses
     SET title = ?, amount = ?, category_id = ?, spent_on = ?, payment_method = ?, note = ?
     WHERE id = ?`,
    input.title.trim(),
    input.amount,
    input.categoryId,
    input.spentOn,
    input.paymentMethod,
    input.note.trim(),
    id,
  );
}

export async function deleteExpense(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export async function getDashboard(
  db: SQLiteDatabase,
  range: { from: string; to: string },
): Promise<DashboardData> {
  const summary = await db.getFirstAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM expenses
     WHERE spent_on >= ? AND spent_on <= ?`,
    range.from,
    range.to,
  );

  const categories = await listCategorySummaries(db, range);
  const recent = await db.getAllAsync<Expense>(
    `${EXPENSE_SELECT}
     WHERE e.spent_on >= ? AND e.spent_on <= ?
     ORDER BY e.spent_on DESC, e.id DESC
     LIMIT 5`,
    range.from,
    range.to,
  );

  return {
    monthTotal: summary?.total ?? 0,
    monthCount: summary?.count ?? 0,
    categories,
    recent,
  };
}
