
import React, { useState } from 'react';
import { Utensils, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  companyName: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, companyName }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo password - in a real PHP environment this would be a server-side check
    if (password === 'admin123' || password === 'marmita') {
      onLogin();
    } else {
      setError('Senha incorreta. Tente "admin123" ou "marmita".');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex bg-orange-500 p-4 rounded-2xl shadow-lg shadow-orange-200 mb-4">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{companyName}</h1>
          <p className="text-gray-500 text-sm">Acesso Restrito - Gestão de Pedidos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:border-orange-500 focus:ring-0 outline-none text-lg transition-all"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-100"
          >
            Entrar no Sistema
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">© 2025 Marmita Express - Versão Web</p>
        </div>
      </div>
    </div>
  );
};
