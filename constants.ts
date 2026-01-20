
import { Category, MenuItem, CategoryConfig } from './types';

export const CATEGORIES: Category[] = ['Principal', 'Mistura', 'Guarnição', 'Salada'];

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Arroz e Feijão', category: 'Principal', isActive: true },
  { id: '2', name: 'Macarrão alho e óleo', category: 'Principal', isActive: false },
  { id: '3', name: 'Frango Grelhado', category: 'Mistura', isActive: true },
  { id: '4', name: 'Bife Acebolado', category: 'Mistura', isActive: true },
  { id: '5', name: 'Omelete', category: 'Mistura', isActive: true },
  { id: '6', name: 'Farofa', category: 'Guarnição', isActive: true },
  { id: '7', name: 'Batata Frita', category: 'Guarnição', isActive: true },
  { id: '8', name: 'Mix de Folhas', category: 'Salada', isActive: true },
  { id: '9', name: 'Tomate e Cebola', category: 'Salada', isActive: true },
];

export const INITIAL_CONFIGS: Record<Category, CategoryConfig> = {
  Principal: { category: 'Principal', maxSelections: 1, isRequired: true },
  Mistura: { category: 'Mistura', maxSelections: 1, isRequired: true },
  Guarnição: { category: 'Guarnição', maxSelections: 2, isRequired: false },
  Salada: { category: 'Salada', maxSelections: 1, isRequired: false },
};
