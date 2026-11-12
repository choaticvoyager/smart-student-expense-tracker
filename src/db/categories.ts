import type { SQLiteDatabase } from 'expo-sqlite';

import type { Category, CategorySummary } from '../types/models';

export async function listCategories(db: SQLiteDatabase): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT id, name, color FROM categories ORDER BY name ASC');
}

export async function listCategorySummaries(
  db: SQLiteDatabase,
  range?: { from: string; to: string },
): Promise<CategorySummary[]> {
  if (range) {
    return db.getAllAsync<CategorySummary>(
      `SELECT
         c.id,
         c.name,
         c.color,
         COALESCE(SUM(e.amount), 0) AS total,
         COUNT(e.id) AS count
       FROM categories c
       LEFT JOIN expenses e
         ON e.category_id = c.id
        AND e.spent_on >= ?
        AND e.spent_on <= ?
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC, c.name ASC`,
      range.from,
      range.to,
    );
  }

  return db.getAllAsync<CategorySummary>(
    `SELECT
       c.id,
       c.name,
       c.color,
       COALESCE(SUM(e.amount), 0) AS total,
       COUNT(e.id) AS count
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id
     GROUP BY c.id, c.name, c.color
     ORDER BY total DESC, c.name ASC`,
  );
}
