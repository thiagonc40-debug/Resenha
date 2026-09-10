import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginAdmin = useStore(state => state.loginAdmin);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (password === 'admin123') {
      loginAdmin();
      navigate('/admin/dashboard');
    } else {
      setError('Senha incorreta. (Dica: admin123)');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-space-md">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl p-space-xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="flex items-center gap-space-sm mb-space-lg relative z-10">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-md text-on-surface">Acesso Restrito</h1>
            <p className="text-body-sm text-on-surface-variant">Painel de Administração</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-space-md relative z-10">
          <div>
            <label className="block text-body-sm font-bold text-on-surface-variant mb-2">Senha de Administrador</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-space-md py-3 rounded-xl bg-surface-container-lowest text-on-surface text-body-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 border border-surface-container-highest"
              placeholder="Digite a senha"
              autoFocus
            />
            {error && <p className="text-error text-body-sm mt-2">{error}</p>}
          </div>
          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-headline-sm hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            Entrar <span className="material-symbols-outlined text-[20px]">login</span>
          </button>
        </form>
        
        <div className="mt-space-lg text-center relative z-10">
          <button onClick={() => navigate('/')} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Voltar para o site
          </button>
        </div>
      </div>
    </div>
  );
}
