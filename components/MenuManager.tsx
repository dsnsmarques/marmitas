
import React, { useState } from 'react';
import { MenuItem, Category, CategoryConfig, Employee } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Trash2, ToggleLeft, ToggleRight, Sparkles, Edit2, Check, X, Building, Save, Users, Settings2 } from 'lucide-react';
import { suggestMenu } from '../services/geminiService';

interface MenuManagerProps {
  menu: MenuItem[];
  onUpdateMenu: (menu: MenuItem[]) => void;
  categoryConfigs: Record<Category, CategoryConfig>;
  onUpdateConfig: (config: CategoryConfig) => void;
  companyName: string;
  onUpdateCompanyName: (name: string) => void;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ 
  menu, 
  onUpdateMenu, 
  categoryConfigs, 
  onUpdateConfig,
  companyName,
  onUpdateCompanyName,
  employees,
  onUpdateEmployees
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Principal');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) return;
    const newEmp = { id: crypto.randomUUID(), name: newEmployeeName.trim() };
    onUpdateEmployees([...employees, newEmp]);
    setNewEmployeeName('');
    
    try {
      await fetch('/marmitas/api.php?action=saveEmployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp)
      });
    } catch (err) {
      console.error("Erro ao salvar funcionário no banco:", err);
    }
  };

  const removeEmployee = async (id: string) => {
    onUpdateEmployees(employees.filter(e => e.id !== id));
    try {
      await fetch(`/marmitas/api.php?action=deleteEmployee&id=${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Erro ao remover funcionário no banco:", err);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    const newItem = { id: crypto.randomUUID(), name: newItemName.trim(), category: newCategory, isActive: true };
    onUpdateMenu([...menu, newItem]);
    setNewItemName('');
    
    try {
      await fetch('/marmitas/api.php?action=saveMenuItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.error("Erro ao salvar item no banco:", err);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const updatedMenu = menu.map(item => item.id === editingId ? { ...item, name: editName } : item);
    const updatedItem = updatedMenu.find(i => i.id === editingId);
    onUpdateMenu(updatedMenu);
    setEditingId(null);

    if (updatedItem) {
      try {
        await fetch('/marmitas/api.php?action=saveMenuItem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (err) {
        console.error("Erro ao atualizar item no banco:", err);
      }
    }
  };

  const toggleItem = async (id: string) => {
    const updatedMenu = menu.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item);
    const updatedItem = updatedMenu.find(i => i.id === id);
    onUpdateMenu(updatedMenu);

    if (updatedItem) {
      try {
        await fetch('/marmitas/api.php?action=saveMenuItem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (err) {
        console.error("Erro ao alterar status no banco:", err);
      }
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este item permanentemente?')) return;
    onUpdateMenu(menu.filter(item => item.id !== id));
    try {
      await fetch(`/marmitas/api.php?action=deleteMenuItem&id=${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Erro ao deletar item no banco:", err);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const existingNames = menu.map(m => m.name);
    const suggestions = await suggestMenu(existingNames);
    if (suggestions && suggestions.length > 0) {
      const newItems = suggestions.map((s: any) => ({
        id: crypto.randomUUID(),
        name: s.name,
        category: s.category as Category,
        isActive: false
      }));
      onUpdateMenu([...menu, ...newItems]);
    }
    setIsSuggesting(false);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Nome da Empresa */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Building className="w-5 h-5 text-orange-500" /> Identidade da Empresa
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={tempCompanyName}
            onChange={(e) => setTempCompanyName(e.target.value)}
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button onClick={() => onUpdateCompanyName(tempCompanyName)} className="bg-gray-800 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-colors hover:bg-black">
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>

      {/* Gerenciar Funcionários */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5 text-orange-500" /> Cadastro de Funcionários
        </h3>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            placeholder="Nome do novo funcionário"
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button onClick={addEmployee} className="bg-orange-500 text-white px-6 rounded-xl font-bold transition-colors hover:bg-orange-600">
            Cadastrar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {employees.sort((a,b) => a.name.localeCompare(b.name)).map(emp => (
            <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
              <span className="text-sm font-semibold text-gray-700">{emp.name}</span>
              <button onClick={() => removeEmployee(emp.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {employees.length === 0 && <p className="col-span-full text-center text-gray-400 italic py-4 text-sm">Nenhum funcionário cadastrado.</p>}
        </div>
      </div>

      {/* Adicionar Itens ao Cardápio */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" /> Itens do Cardápio
          </h3>
          <button
            onClick={handleSuggest}
            disabled={isSuggesting}
            className="text-xs text-purple-600 font-black uppercase tracking-widest flex items-center gap-1 hover:text-purple-800 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> 
            {isSuggesting ? 'Sugerindo...' : 'Sugerir com IA'}
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Ex: Arroz à Grega"
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="p-3 border rounded-xl bg-white outline-none"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={addItem} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold transition-colors hover:bg-orange-600">Adicionar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CATEGORIES.map(category => (
            <div key={category} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest">{category}</h4>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400">Máx</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={categoryConfigs[category].maxSelections}
                      onChange={(e) => onUpdateConfig({...categoryConfigs[category], maxSelections: parseInt(e.target.value) || 1})}
                      className="w-10 border rounded px-1 py-0.5 text-center focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-gray-400">Obrig.</span>
                    <input 
                      type="checkbox" 
                      checked={categoryConfigs[category].isRequired}
                      onChange={(e) => onUpdateConfig({...categoryConfigs[category], isRequired: e.target.checked})}
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {menu.filter(i => i.category === category).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all group">
                    {editingId === item.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 p-1 border rounded focus:ring-1 focus:ring-orange-500 outline-none text-sm"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="text-green-600 hover:scale-110 transition-transform"><Check className="w-5 h-5"/></button>
                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:scale-110 transition-transform"><X className="w-5 h-5"/></button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm font-medium ${item.isActive ? 'text-gray-800' : 'text-gray-300 line-through'}`}>{item.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 text-gray-200 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleItem(item.id)} className={item.isActive ? 'text-green-500' : 'text-gray-200'}>
                            {item.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="text-gray-200 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {menu.filter(i => i.category === category).length === 0 && (
                  <p className="text-gray-300 text-xs italic py-2 text-center">Vazio</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
