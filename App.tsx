
import React, { useState, useEffect } from 'react';
import { MenuItem, Order, CategoryConfig, Category, Employee } from './types';
import { INITIAL_MENU, INITIAL_CONFIGS } from './constants';
import { MenuManager } from './components/MenuManager';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { Login } from './components/Login';
import { Utensils, ClipboardList, Settings, ChefHat, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('marmita_logged_in') === 'true');
  const [companyName, setCompanyName] = useState('Marmita Express');
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<Record<Category, CategoryConfig>>(INITIAL_CONFIGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'order' | 'report' | 'admin'>('order');

  const API_URL = '/marmitas/api.php';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, ordersRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}?action=getMenu`),
          fetch(`${API_URL}?action=getOrders`),
          fetch(`${API_URL}?action=getSettings`)
        ]);
        
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          if (Array.isArray(menuData) && menuData.length > 0) {
            setMenu(menuData.map((m: any) => ({
              id: m.id,
              name: m.name,
              category: m.category,
              isActive: m.isActive == "1" || m.isActive === true
            })));
          }
        }
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData)) {
            setOrders(ordersData.map((o: any) => ({
              id: o.id,
              employeeName: o.employeeName,
              selections: typeof o.selections === 'string' ? JSON.parse(o.selections) : o.selections,
              timestamp: Number(o.timestamp)
            })));
          }
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.company_name) setCompanyName(settings.company_name);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da API:", err);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleUpdateMenu = (newMenu: MenuItem[]) => setMenu(newMenu);
  const handleUpdateConfig = (config: CategoryConfig) => setCategoryConfigs(prev => ({ ...prev, [config.category]: config }));
  const handleUpdateEmployees = (newEmployees: Employee[]) => setEmployees(newEmployees);

  const handlePlaceOrder = async (order: Order) => {
    try {
      setOrders(prev => [order, ...prev]);
      await fetch(`${API_URL}?action=saveOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
    }
  };

  const handleClearOrders = async () => {
    try {
      if (confirm('Deseja limpar todos os pedidos?')) {
        setOrders([]);
        await fetch(`${API_URL}?action=clearOrders`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error("Erro ao limpar pedidos:", err);
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    // O backend atual não tem delete individual, mas mantemos o estado sync
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('marmita_logged_in', 'true');
    setActiveTab('report');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('marmita_logged_in');
    setActiveTab('order');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 md:pb-0 font-sans">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight">
                {companyName.split(' ')[0]}<span className="text-orange-500">{companyName.split(' ').slice(1).join(' ')}</span>
              </h1>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block -mt-1">Sistema Web</span>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-gray-50 p-1 rounded-2xl border">
            <button onClick={() => setActiveTab('order')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'order' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>Pedido</button>
            {isLoggedIn && (
              <>
                <button onClick={() => setActiveTab('report')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'report' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>Relatório</button>
                <button onClick={() => setActiveTab('admin')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'admin' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>Configurar</button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <button onClick={() => setActiveTab('report')} className="text-xs font-black uppercase text-gray-400 hover:text-orange-500">Restrito</button>
            ) : (
              <button onClick={handleLogout} className="text-xs font-black uppercase text-red-400"><LogOut className="w-4 h-4" /></button>
            )}
          </div>
        </div>
      </header>

      {(activeTab !== 'order' && !isLoggedIn) ? (
        <Login onLogin={handleLogin} companyName={companyName} />
      ) : (
        <main className="max-w-6xl mx-auto px-4 pt-6 pb-12">
          {activeTab === 'order' && <OrderForm menu={menu} onPlaceOrder={handlePlaceOrder} categoryConfigs={categoryConfigs} companyName={companyName} employees={employees} />}
          {activeTab === 'report' && isLoggedIn && <OrderList orders={orders} onClearOrders={handleClearOrders} onDeleteOrder={handleDeleteOrder} companyName={companyName} />}
          {activeTab === 'admin' && isLoggedIn && (
            <MenuManager 
              menu={menu} onUpdateMenu={handleUpdateMenu} 
              categoryConfigs={categoryConfigs} onUpdateConfig={handleUpdateConfig}
              companyName={companyName} onUpdateCompanyName={setCompanyName}
              employees={employees} onUpdateEmployees={handleUpdateEmployees}
            />
          )}
        </main>
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border border-gray-100 flex justify-around p-2 rounded-3xl shadow-2xl z-50 w-[90%]">
        <button onClick={() => setActiveTab('order')} className={`flex-1 py-3 px-2 rounded-2xl ${activeTab === 'order' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}><ChefHat className="w-6 h-6 mx-auto" /></button>
        <button onClick={() => { if(!isLoggedIn) setActiveTab('report'); else setActiveTab('report'); }} className={`flex-1 py-3 px-2 rounded-2xl ${activeTab === 'report' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}><ClipboardList className="w-6 h-6 mx-auto" /></button>
        {isLoggedIn && <button onClick={() => setActiveTab('admin')} className={`flex-1 py-3 px-2 rounded-2xl ${activeTab === 'admin' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}><Settings className="w-6 h-6 mx-auto" /></button>}
      </nav>
    </div>
  );
};

export default App;
