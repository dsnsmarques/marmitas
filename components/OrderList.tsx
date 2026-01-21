
import React, { useState } from 'react';
import { Order, Category, CATEGORIES } from '../types';
import { Share2, Trash2, ClipboardCheck, FileSpreadsheet, Utensils, RotateCcw, Lock } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx';

interface OrderListProps {
  orders: Order[];
  onClearOrders: () => void;
  onDeleteOrder: (id: string) => void;
  onLaunchOrders: (ids: string[]) => void;
  onUnlaunchOrders: (ids: string[]) => void;
  companyName: string;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onClearOrders, onDeleteOrder, onLaunchOrders, onUnlaunchOrders, companyName }) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [showUnlaunchModal, setShowUnlaunchModal] = useState<string[] | null>(null);

  const formatSelection = (items: string[]) => items.length > 0 ? items.join(', ') : 'Nenhuma opção escolhida';

  // Specific formatting function as requested by the user
  const formatOrdersForExport = (ordersList: Order[], isWhatsApp: boolean = false) => {
    let text = isWhatsApp ? `*📋 RESUMO DE PEDIDOS - ${companyName.toUpperCase()}*\n` : `RESUMO DE PEDIDOS - ${companyName.toUpperCase()}\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `--------------------------------\n\n`;

    ordersList.forEach((order) => {
      text += `*${order.employeeName}*\n`;
      
      if (order.observations) {
        text += `- OBS: ${order.observations}\n`;
      }

      const selections = typeof order.selections === 'string' ? JSON.parse(order.selections) : order.selections;
      
      CATEGORIES.forEach(cat => {
        const catSelections = selections[cat as Category];
        if (catSelections && Array.isArray(catSelections) && catSelections.length > 0) {
          catSelections.forEach(item => {
            text += `${item}\n`;
          });
        }
      });
      text += `\n`; 
    });

    text += `--------------------------------\n`;
    text += isWhatsApp ? `*🛍️ Total de pedidos:* ${ordersList.length}` : `Total de pedidos: ${ordersList.length}`;
    
    return text;
  };

  const shareToWhatsApp = () => {
    if (orders.length === 0) return;
    const text = formatOrdersForExport(orders, true);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (orders.length === 0) return;
    const text = formatOrdersForExport(orders, false);
    navigator.clipboard.writeText(text);
    alert('Resumo formatado copiado para a área de transferência!');
  };

  const downloadXlsx = () => {
    if (orders.length === 0) return;
    
    // Flatten orders for Excel
    const data = orders.map((order, idx) => {
      const row: any = {
        'Nº': idx + 1,
        'Funcionário': order.employeeName.toUpperCase(),
      };
      
      const selections = typeof order.selections === 'string' ? JSON.parse(order.selections) : order.selections;
      CATEGORIES.forEach(cat => {
        row[cat] = formatSelection(selections[cat as Category] || []);
      });
      
      row['Observações'] = order.observations || '';
      row['Status'] = order.launched ? 'Lançado' : 'Pendente';
      row['Data/Hora'] = new Date(order.timestamp).toLocaleString('pt-BR');
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos de Hoje");
    
    const fileName = `Pedidos_Marmita_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleUnlaunch = () => {
    if (masterPassword === 'MASTER2026') { // Senha mestre mestre definida aqui
      if (showUnlaunchModal) {
        onUnlaunchOrders(showUnlaunchModal);
      }
      setMasterPassword('');
      setShowUnlaunchModal(null);
    } else {
      alert('Senha mestre incorreta!');
    }
  };

  const unlaunchedOrders = orders.filter(o => !o.launched);
  
  // Financial Stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const stats = {
    today: orders.filter(o => o.launched && o.timestamp >= todayStart.getTime()).length,
    week: orders.filter(o => o.launched && o.timestamp >= weekStart.getTime()).length,
    month: orders.filter(o => o.launched && o.timestamp >= monthStart.getTime()).length
  };

  return (
    <div className="space-y-6">
      {showUnlaunchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
            <div className="bg-orange-50 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-black text-gray-900 uppercase">Acesso Restrito</h3>
                <p className="text-xs text-orange-600 font-bold">Senha mestre para reverter lançamento</p>
              </div>
            </div>
            <input
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Digite a senha mestre"
              className="w-full p-4 border-2 border-gray-50 rounded-2xl focus:border-orange-500 outline-none text-center text-lg font-black tracking-widest mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowUnlaunchModal(null); setMasterPassword(''); }}
                className="flex-1 p-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black rounded-2xl transition-all"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleUnlaunch}
                className="flex-1 p-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-100"
              >
                REVERTER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finance/Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Pedidos Lançados (Hoje)</span>
          <span className="text-3xl font-black text-orange-600">{stats.today}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Fechamento Semanal</span>
          <span className="text-3xl font-black text-blue-600">{stats.week}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Fechamento Mensal</span>
          <span className="text-3xl font-black text-green-600">{stats.month}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Relatório Consolidado</h3>
          <p className="text-sm text-gray-500 font-medium">Empresa: {companyName} • {orders.length} pedidos hoje</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {unlaunchedOrders.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Deseja lançar ${unlaunchedOrders.length} pedidos pendentes? Eles não poderão mais ser excluídos.`)) {
                  onLaunchOrders(unlaunchedOrders.map(o => o.id));
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-100 text-sm"
            >
              <Utensils className="w-5 h-5" /> Lançar Pedidos
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-bold transition-all border border-gray-200 text-sm"
          >
            <ClipboardCheck className="w-5 h-5" /> Copiar Texto
          </button>
          <button
            onClick={downloadXlsx}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 text-sm"
          >
            <FileSpreadsheet className="w-5 h-5" /> Baixar Excel
          </button>
          <button
            onClick={shareToWhatsApp}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100 text-sm"
          >
            <Share2 className="w-5 h-5" /> WhatsApp
          </button>
          <button
            onClick={() => {
              if (confirm('Deseja limpar todos os pedidos da tela? Isso não apagará o histórico do banco de dados.')) {
                onClearOrders();
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold transition-all border border-red-100 text-sm"
            title="Limpar pedidos do dia"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {orders.map((order) => (
          <div key={order.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all transform hover:-translate-y-1 relative group ${order.launched ? 'border-green-100 bg-green-50/10' : 'border-gray-100 hover:border-orange-200'}`}>
            <div className="absolute top-4 right-4 flex gap-2">
              {!order.launched ? (
                <>
                  <button
                    onClick={() => onLaunchOrders([order.id])}
                    className="text-gray-200 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Lançar Pedido"
                  >
                    <Utensils className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir Pedido"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUnlaunchModal([order.id])}
                    className="text-gray-200 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Reverter Lançamento"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <div className="text-green-500" title="Pedido Lançado">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                </>
              )}
            </div>
            <h4 className="font-black text-lg text-gray-900 mb-4 border-b border-gray-50 pb-2 pr-12 truncate tracking-tight">
              {order.employeeName.toUpperCase()}
            </h4>
            <div className="space-y-4">
              {CATEGORIES.map(cat => {
                const selections = typeof order.selections === 'string' ? JSON.parse(order.selections) : order.selections;
                const catItems = selections[cat as Category] || [];
                return (
                  <div key={cat} className="group/cat">
                    <span className="text-[10px] font-black uppercase text-gray-300 group-hover/cat:text-orange-400 tracking-widest block mb-1 transition-colors">{cat}</span>
                    <div className="text-sm text-gray-700 font-semibold leading-relaxed">
                      {catItems.length > 0 ? (
                        <ul className="list-none space-y-0.5">
                          {catItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 font-normal italic">Vazio</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {order.observations && (
                <div className="pt-2 border-t border-gray-50">
                  <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest block mb-1">Observações</span>
                  <p className="text-xs text-gray-600 italic font-medium bg-orange-50/50 p-2 rounded-lg leading-relaxed">{order.observations}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-3 border-t border-gray-50 text-[10px] text-gray-300 font-bold flex justify-between items-center">
              <span>#{order.id.slice(0, 4)}</span>
              <span>{new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-32 text-center text-gray-400 bg-white rounded-[2rem] border-4 border-dashed border-gray-50 flex flex-col items-center justify-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <Utensils className="w-12 h-12 text-gray-200" />
            </div>
            <p className="text-xl font-bold text-gray-300">Nenhum pedido realizado hoje.</p>
            <p className="text-sm font-medium mt-1">Os pedidos dos funcionários aparecerão aqui em tempo real.</p>
          </div>
        )}
      </div>
    </div>
  );
};
