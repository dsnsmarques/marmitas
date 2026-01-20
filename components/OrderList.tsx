
import React from 'react';
import { Order, Category, CATEGORIES } from '../types';
import { Share2, Trash2, ClipboardCheck, FileSpreadsheet, Download, Utensils } from 'lucide-react';
import * as XLSX from 'https://esm.sh/xlsx';

interface OrderListProps {
  orders: Order[];
  onClearOrders: () => void;
  onDeleteOrder: (id: string) => void;
  companyName: string;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onClearOrders, onDeleteOrder, companyName }) => {
  const formatSelection = (items: string[]) => items.length > 0 ? items.join(', ') : 'Nenhuma opção escolhida';

  // Specific formatting function as requested by the user
  const formatOrdersForExport = (ordersList: Order[], isWhatsApp: boolean = false) => {
    let text = isWhatsApp ? `*📋 RESUMO DE PEDIDOS - ${companyName.toUpperCase()}*\n` : `RESUMO DE PEDIDOS - ${companyName.toUpperCase()}\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `--------------------------------\n\n`;

    ordersList.forEach((order, index) => {
      text += `*${order.employeeName}*\n\n`;
      
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
      
      CATEGORIES.forEach(cat => {
        row[cat] = formatSelection(order.selections[cat as Category]);
      });
      
      row['Data/Hora'] = new Date(order.timestamp).toLocaleString('pt-BR');
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos de Hoje");
    
    const fileName = `Pedidos_Marmita_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Relatório Consolidado</h3>
          <p className="text-sm text-gray-500 font-medium">Empresa: {companyName} • {orders.length} pedidos hoje</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
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
              if (confirm('Deseja limpar todos os pedidos do dia? Isso é permanente.')) {
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
          <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group hover:border-orange-200 transition-all transform hover:-translate-y-1">
            <button
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <h4 className="font-black text-lg text-gray-900 mb-4 border-b border-gray-50 pb-2 pr-8 truncate tracking-tight">
              {order.employeeName.toUpperCase()}
            </h4>
            <div className="space-y-4">
              {CATEGORIES.map(cat => (
                <div key={cat} className="group/cat">
                  <span className="text-[10px] font-black uppercase text-gray-300 group-hover/cat:text-orange-400 tracking-widest block mb-1 transition-colors">{cat}</span>
                  <div className="text-sm text-gray-700 font-semibold leading-relaxed">
                    {order.selections[cat as Category] && order.selections[cat as Category].length > 0 ? (
                      <ul className="list-none space-y-0.5">
                        {order.selections[cat as Category].map((item, i) => (
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
              ))}
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
