import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExpenseInput } from '../types/models';
import { daysAgoISO } from '../utils/dates';

const DATABASE_VERSION = 1;

const CATEGORIES = [
  { id: 1, name: 'Meals', color: '#C46B3A' },
  { id: 2, name: 'Transport', color: '#2F6F8F' },
  { id: 3, name: 'Study', color: '#3E5C46' },
  { id: 4, name: 'Housing', color: '#6E4C7D' },
  { id: 5, name: 'Personal', color: '#A15C6A' },
  { id: 6, name: 'Connectivity', color: '#3D6B5A' },
  { id: 7, name: 'Health', color: '#8A4B3A' },
  { id: 8, name: 'Activities', color: '#4F6B4A' },
] as const;

type SeedExpense = ExpenseInput & { daysAgo: number };

const SEED_EXPENSES: SeedExpense[] = [
  { title: 'Campus canteen lunch', amount: 450, categoryId: 1, daysAgo: 0, paymentMethod: 'Cash', note: 'Rice and curry at the main canteen.', spentOn: '' },
  { title: 'Evening tea and short eats', amount: 180, categoryId: 1, daysAgo: 0, paymentMethod: 'Cash', note: 'Bought after the lab session.', spentOn: '' },
  { title: 'Bus fare to campus', amount: 120, categoryId: 2, daysAgo: 1, paymentMethod: 'Cash', note: 'Return trip from the boarding house.', spentOn: '' },
  { title: 'Assignment printing', amount: 250, categoryId: 3, daysAgo: 1, paymentMethod: 'Card', note: 'Printed the group report at the faculty shop.', spentOn: '' },
  { title: 'Notebooks and pens', amount: 640, categoryId: 3, daysAgo: 2, paymentMethod: 'Cash', note: 'Stationery for the new semester.', spentOn: '' },
  { title: 'Room rent share', amount: 18500, categoryId: 4, daysAgo: 2, paymentMethod: 'Bank Transfer', note: 'Monthly share of the boarding-house rent.', spentOn: '' },
  { title: 'Shared groceries', amount: 2180, categoryId: 1, daysAgo: 3, paymentMethod: 'Digital Wallet', note: 'Rice, eggs, vegetables, and milk for the week.', spentOn: '' },
  { title: 'Mobile data pack', amount: 999, categoryId: 6, daysAgo: 4, paymentMethod: 'Card', note: 'Student data package for lectures and research.', spentOn: '' },
  { title: 'Pharmacy', amount: 540, categoryId: 7, daysAgo: 5, paymentMethod: 'Cash', note: 'Cold medicine from the campus pharmacy.', spentOn: '' },
  { title: 'Weekend train ticket', amount: 890, categoryId: 2, daysAgo: 6, paymentMethod: 'Card', note: 'Trip home for the weekend.', spentOn: '' },
  { title: 'Electricity share', amount: 1450, categoryId: 4, daysAgo: 7, paymentMethod: 'Bank Transfer', note: 'Share of the boarding-house electricity bill.', spentOn: '' },
  { title: 'Group study snacks', amount: 320, categoryId: 1, daysAgo: 8, paymentMethod: 'Cash', note: 'Snacks during the revision session.', spentOn: '' },
  { title: 'Photocopy lecture notes', amount: 150, categoryId: 3, daysAgo: 12, paymentMethod: 'Cash', note: 'Notes for the missed lecture.', spentOn: '' },
  { title: 'Laundry', amount: 600, categoryId: 5, daysAgo: 14, paymentMethod: 'Digital Wallet', note: 'Weekly laundry near the boarding house.', spentOn: '' },
  { title: 'Database textbook', amount: 3450, categoryId: 3, daysAgo: 18, paymentMethod: 'Card', note: 'Second-hand copy from a senior student.', spentOn: '' },
  { title: 'Student society fee', amount: 500, categoryId: 8, daysAgo: 27, paymentMethod: 'Cash', note: 'Semester membership for the IT society.', spentOn: '' },
  { title: 'Toiletries', amount: 780, categoryId: 5, daysAgo: 33, paymentMethod: 'Cash', note: 'Soap, toothpaste, and detergent.', spentOn: '' },
  { title: 'Library late fee', amount: 100, categoryId: 3, daysAgo: 40, paymentMethod: 'Cash', note: 'Returned a reserved book one day late.', spentOn: '' },
];

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      category_id INTEGER NOT NULL,
      spent_on TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_spent_on ON expenses (spent_on);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_id);
  `);

  await db.withTransactionAsync(async () => {
    for (const category of CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (id, name, color) VALUES (?, ?, ?)',
        category.id,
        category.name,
        category.color,
      );
    }

    for (const expense of SEED_EXPENSES) {
      const spentOn = daysAgoISO(expense.daysAgo);
      await db.runAsync(
        `INSERT INTO expenses
          (title, amount, category_id, spent_on, payment_method, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        expense.title,
        expense.amount,
        expense.categoryId,
        spentOn,
        expense.paymentMethod,
        expense.note,
        `${spentOn}T12:00:00.000`,
      );
    }
  });

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
