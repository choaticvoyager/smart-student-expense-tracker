import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Tracker: undefined;
  Expenses: { categoryId?: number } | undefined;
  Categories: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ExpenseDetail: { expenseId: number };
  ExpenseForm: { expenseId?: number } | undefined;
};
