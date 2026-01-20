
export type Category = 'Principal' | 'Mistura' | 'Guarnição' | 'Salada';

export interface CategoryConfig {
  category: Category;
  maxSelections: number;
  isRequired: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
}

export type Selection = Record<Category, string[]>;

export interface Order {
  id: string;
  employeeName: string;
  selections: Selection;
  timestamp: number;
}
