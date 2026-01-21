
import React, { useState } from 'react';
import { MenuItem, Selection, Order, CategoryConfig, Category, Employee, CATEGORIES } from '../types';
import { CheckCircle, AlertCircle, Info, User, UserPlus } from 'lucide-react';

interface OrderFormProps {
  menu: MenuItem[];
  onPlaceOrder: (order: Order) => void;
  categoryConfigs: Record<Category, CategoryConfig>;
  companyName: string;
  employees: Employee[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ menu, onPlaceOrder, categoryConfigs, companyName, employees }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [manualName, setManualName] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [observations, setObservations] = useState('');
  const [selections, setSelections] = useState<Selection>({
    Principal: [], Mistura: [], Guarnição: [], Salada: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalName = isManual ? manualName.trim() : employeeName;

    if (!finalName) {
      setError('Por favor, informe ou selecione seu nome.');
      return;
    }

    for (const cat of CATEGORIES) {
      const config = categoryConfigs[cat];
      if (config.isRequired && selections[cat].length === 0) {
        setError(`A categoria ${cat} é obrigatória.`);
        return;
      }
    }

    onPlaceOrder({
      id: crypto.randomUUID(),
      employeeName: finalName,
      selections,
      observations: observations.trim(),
      timestamp: Date.now(),
    });

    setSuccess(true);
    setEmployeeName('');
    setManualName('');
    setIsManual(false);
    setObservations('');
    setSelections({ Principal: [], Mistura: [], Guarnição: [], Salada: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleSelect = (category: Category, itemName: string) => {
    const config = categoryConfigs[category];
    const current = selections[category];
    
    // Find if the item (or a numbered version of it) is already selected
    const existingIndex = current.findIndex(i => i === itemName || i.endsWith(`X ${itemName}`));
    const isSelected = existingIndex !== -1;

    if (isSelected) {
      const selectedItem = current[existingIndex];
      // Check if it's already a numbered item (e.g., "2X Batata rústica")
      const match = selectedItem.match(/^(\d+)X\s(.*)/);
      const currentCount = match ? parseInt(match[1]) : 1;
      const baseName = match ? match[2] : selectedItem;

      if (config.maxSelections === 1) {
        // Toggle off if max is 1
        setSelections(prev => ({ ...prev, [category]: [] }));
      } else {
        // Multi-selection logic
        const totalItemsInCat = current.reduce((acc, item) => {
          const m = item.match(/^(\d+)X\s(.*)/);
          return acc + (m ? parseInt(m[1]) : 1);
        }, 0);

        if (totalItemsInCat < config.maxSelections) {
          // Increment quantity
          const newItems = [...current];
          newItems[existingIndex] = `${currentCount + 1}X ${baseName}`;
          setSelections(prev => ({ ...prev, [category]: newItems }));
        } else {
          // At max, toggle off the item entirely
          setSelections(prev => ({ ...prev, [category]: prev[category].filter((_, idx) => idx !== existingIndex) }));
        }
      }
    } else {
      // Not selected yet, try to add
      const totalItemsInCat = current.reduce((acc, item) => {
        const m = item.match(/^(\d+)X\s(.*)/);
        return acc + (m ? parseInt(m[1]) : 1);
      }, 0);

      if (totalItemsInCat < config.maxSelections) {
        if (config.maxSelections === 1) {
          setSelections(prev => ({ ...prev, [category]: [itemName] }));
        } else {
          setSelections(prev => ({ ...prev, [category]: [...current, itemName] }));
        }
      }
    }
  };

  const activeMenu = menu.filter(item => item.isActive == true || item.isActive == 1 || item.isActive == "1");

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{companyName}</h2>
        <p className="text-gray-500 font-medium">Monte sua marmita de hoje</p>
      </div>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-500">
          <CheckCircle className="w-6 h-6" /> 
          <p className="font-bold text-sm">Pedido registrado com sucesso!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-6 h-6" /> <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
          <div className="flex justify-between items-center mb-3">
            <label className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest">
              {isManual ? <UserPlus className="w-4 h-4" /> : <User className="w-4 h-4" />} 
              {isManual ? 'Digite seu Nome' : 'Selecione seu Nome'}
            </label>
            <button 
              type="button" 
              onClick={() => setIsManual(!isManual)}
              className="text-[10px] font-black uppercase text-orange-400 hover:text-orange-600 underline"
            >
              {isManual ? 'Escolher da lista' : 'Inserir manualmente'}
            </button>
          </div>
          
          {isManual ? (
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full p-4 border-2 border-white bg-white rounded-xl focus:border-orange-500 focus:ring-0 outline-none text-lg font-bold text-gray-700 shadow-sm transition-all"
            />
          ) : (
            <select
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full p-4 border-2 border-white bg-white rounded-xl focus:border-orange-500 focus:ring-0 outline-none text-lg font-bold text-gray-700 shadow-sm transition-all"
            >
              <option value="">Clique para escolher...</option>
              {employees.sort((a, b) => a.name.localeCompare(b.name)).map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          )}
          
          {employees.length === 0 && !isManual && (
            <p className="text-[10px] text-orange-400 mt-2 italic font-medium">Nenhum funcionário cadastrado no sistema.</p>
          )}
        </div>

        {CATEGORIES.map(category => (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-tighter">{category}</h3>
              <span className="text-[10px] font-black text-gray-300 uppercase">Máx: {categoryConfigs[category].maxSelections}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeMenu.filter(item => item.category === category).map(item => {
                const selectedEntry = selections[category].find(i => i === item.name || i.endsWith(`X ${item.name}`));
                const isSelected = !!selectedEntry;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(category, item.name)}
                    className={`p-4 text-left border-2 rounded-2xl transition-all relative ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg shadow-orange-100'
                        : 'border-gray-50 bg-white text-gray-500 hover:border-orange-200'
                    }`}
                  >
                    <span className="font-bold text-sm">{isSelected ? selectedEntry : item.name}</span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Observações</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Sem cebola, caprichar no feijão..."
            className="w-full p-4 border-2 border-gray-50 rounded-2xl focus:border-orange-500 outline-none min-h-[100px] text-sm font-medium text-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={!isManual && employees.length === 0}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white p-5 rounded-2xl font-black text-xl transition-all transform active:scale-95 shadow-xl shadow-orange-100"
        >
          ENVIAR PEDIDO
        </button>
      </form>
    </div>
  );
};
