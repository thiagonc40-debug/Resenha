import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { loginWithGoogle } from '../firebase';

export function AdminLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isAdminAuthenticated = useStore(state => state.isAdminAuthenticated);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
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

        <div className="flex flex-col gap-space-md relative z-10">
          <p className="text-body-sm text-on-surface-variant">Você precisa se autenticar com sua conta Google de administrador para acessar o painel.</p>
          {error && <p className="text-error text-body-sm bg-error/10 p-2 rounded">{error}</p>}
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-headline-sm transition-transform shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? 'Autenticando...' : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </>
            )}
          </button>
        </div>
        
        <div className="mt-space-lg text-center relative z-10">
          <button onClick={() => navigate('/')} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Voltar para o site
          </button>
        </div>
      </div>
    </div>
  );
}
