
export type Category = 'Principal' | 'Mistura' | 'Guarnição' | 'Salada';

export const CATEGORIES: Category[] = ['Principal', 'Mistura', 'Guarnição', 'Salada'];

export const INITIAL_CONFIGS: Record<Category, CategoryConfig> = {
  Principal: { category: 'Principal', maxSelections: 1, isRequired: true },
  Mistura: { category: 'Mistura', maxSelections: 1, isRequired: true },
  Guarnição: { category: 'Guarnição', maxSelections: 2, isRequired: false },
  Salada: { category: 'Salada', maxSelections: 1, isRequired: false },
};

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
  observations?: string;
  timestamp: number;
  launched?: boolean | number;
}
