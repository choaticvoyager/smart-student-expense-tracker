export const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Digital Wallet'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Category = {
  id: number;
  name: string;
  color: string;
};

export type CategorySummary = Category & {
  total: number;
  count: number;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  spentOn: string;
  paymentMethod: PaymentMethod;
  note: string;
  createdAt: string;
};

export type ExpenseInput = {
  title: string;
  amount: number;
  categoryId: number;
  spentOn: string;
  paymentMethod: PaymentMethod;
  note: string;
};

export type ExpenseFilters = {
  query?: string;
  categoryId?: number | null;
  paymentMethod?: PaymentMethod | null;
  fromDate?: string | null;
  toDate?: string | null;
};

export type DashboardData = {
  monthTotal: number;
  monthCount: number;
  categories: CategorySummary[];
  recent: Expense[];
};
