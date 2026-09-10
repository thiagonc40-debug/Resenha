import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Court } from '../store/useStore';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, logoutAdmin, courts, settings, addCourt, updateCourt, removeCourt, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'agenda' | 'quadras' | 'config'>('quadras');
  const [editingCourt, setEditingCourt] = useState<Partial<Court> | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  if (!isAdminAuthenticated) return null;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const handleSaveCourt = () => {
    if (editingCourt) {
      if (editingCourt.id) {
        updateCourt(editingCourt.id, editingCourt);
      } else {
        const newCourt: Court = {
          id: `q${Date.now()}`,
          name: editingCourt.name || 'Nova Quadra',
          type: editingCourt.type || 'Tipo da Quadra',
          price: editingCourt.price || 0,
          features: editingCourt.features || [],
          imageUrl: editingCourt.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
          isActive: editingCourt.isActive ?? true,
        };
        addCourt(newCourt);
      }
      setEditingCourt(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-surface-container-highest p-space-md flex flex-col gap-space-lg">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield_person</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-on-surface font-bold">Admin Panel</h2>
            <p className="text-[11px] text-primary uppercase font-bold tracking-wider">Gestão Ativa</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-space-2xs overflow-x-auto md:overflow-visible">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-space-sm py-2.5 rounded-lg text-left whitespace-nowrap transition-colors ${activeTab === 'agenda' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span> Agenda e Reservas
          </button>
          <button 
            onClick={() => setActiveTab('quadras')}
            className={`flex items-center gap-2 px-space-sm py-2.5 rounded-lg text-left whitespace-nowrap transition-colors ${activeTab === 'quadras' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">stadium</span> Gestão de Quadras
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-space-sm py-2.5 rounded-lg text-left whitespace-nowrap transition-colors ${activeTab === 'config' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span> Configurações
          </button>
        </nav>

        <div className="mt-auto hidden md:block pt-space-lg border-t border-surface-container-highest">
          <button onClick={handleLogout} className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors w-full px-space-sm py-2">
            <span className="material-symbols-outlined text-[20px]">logout</span> Sair do Painel
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-full px-space-sm py-2 mt-2">
            <span className="material-symbols-outlined text-[20px]">open_in_new</span> Ver Site
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-space-md md:p-space-xl overflow-y-auto">
        {/* AGENDA TAB */}
        {activeTab === 'agenda' && (
          <div className="flex flex-col gap-space-lg max-w-4xl">
            <div>
              <h1 className="font-headline-lg text-headline-md mb-2">Agenda e Reservas</h1>
              <p className="text-on-surface-variant">Gerencie os horários ocupados e bloqueie quadras para manutenção.</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-xl text-center border border-surface-container-highest">
              <span className="material-symbols-outlined text-[48px] text-surface-container-highest mb-4">construction</span>
              <h3 className="font-headline-sm text-on-surface mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-on-surface-variant max-w-md mx-auto">O painel de visualização de calendário e bloqueio de horários será integrado na próxima atualização.</p>
            </div>
          </div>
        )}

        {/* QUADRAS TAB */}
        {activeTab === 'quadras' && (
          <div className="flex flex-col gap-space-lg max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h1 className="font-headline-lg text-headline-md mb-2">Gestão de Quadras</h1>
                <p className="text-on-surface-variant">Cadastre novas quadras, altere valores ou desative campos.</p>
              </div>
              <button 
                onClick={() => setEditingCourt({ name: '', type: '', price: 150, features: [], isActive: true })}
                className="bg-primary text-on-primary px-space-md py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span> Nova Quadra
              </button>
            </div>

            {editingCourt ? (
              <div className="bg-surface-container-low rounded-xl p-space-lg border border-surface-container-highest shadow-xl">
                <h3 className="font-headline-sm mb-space-md">{editingCourt.id ? 'Editar Quadra' : 'Cadastrar Nova Quadra'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-lg">
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">Nome da Quadra</label>
                    <input 
                      type="text" 
                      value={editingCourt.name || ''} 
                      onChange={e => setEditingCourt({...editingCourt, name: e.target.value})}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                      placeholder="Ex: Quadra 4"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">Tipo/Descrição Curta</label>
                    <input 
                      type="text" 
                      value={editingCourt.type || ''} 
                      onChange={e => setEditingCourt({...editingCourt, type: e.target.value})}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                      placeholder="Ex: Coberta Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">Valor por Hora (R$)</label>
                    <input 
                      type="number" 
                      value={editingCourt.price || ''} 
                      onChange={e => setEditingCourt({...editingCourt, price: Number(e.target.value)})}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">URL da Imagem</label>
                    <input 
                      type="text" 
                      value={editingCourt.imageUrl || ''} 
                      onChange={e => setEditingCourt({...editingCourt, imageUrl: e.target.value})}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingCourt.isActive ?? true}
                        onChange={e => setEditingCourt({...editingCourt, isActive: e.target.checked})}
                        className="w-5 h-5 accent-primary rounded"
                      />
                      <span className="text-body-md">Quadra Ativa (Visível para agendamento)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-space-sm justify-end">
                  <button onClick={() => setEditingCourt(null)} className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors">Cancelar</button>
                  <button onClick={handleSaveCourt} className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-bold hover:scale-[1.02] transition-transform">Salvar Quadra</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
                {courts.map(court => (
                  <div key={court.id} className={`bg-surface-container-low rounded-xl p-space-md border border-surface-container-highest flex flex-col sm:flex-row gap-space-md transition-all ${!court.isActive ? 'opacity-60 grayscale' : ''}`}>
                    <div className="w-full sm:w-32 h-32 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                      <img src={court.imageUrl} alt={court.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${court.isActive ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}>
                            {court.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                          <h3 className="font-headline-sm mt-1">{court.name} &bull; {court.type}</h3>
                        </div>
                        <span className="font-headline-md text-primary">R$ {court.price}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2 mb-4">
                        {court.features.map((feat, i) => (
                          <span key={i} className="text-[11px] bg-surface-container px-2 py-1 rounded text-on-surface-variant">{feat}</span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-space-xs">
                        <button onClick={() => setEditingCourt(court)} className="flex-1 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-body-sm font-bold transition-colors">Editar</button>
                        <button onClick={() => { if(window.confirm('Tem certeza que deseja remover esta quadra?')) removeCourt(court.id); }} className="px-3 py-1.5 rounded bg-error/10 text-error hover:bg-error/20 text-body-sm transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONFIGURAÇÕES TAB */}
        {activeTab === 'config' && (
          <div className="flex flex-col gap-space-lg max-w-3xl">
            <div>
              <h1 className="font-headline-lg text-headline-md mb-2">Configurações do App</h1>
              <p className="text-on-surface-variant">Ajuste informações globais da arena.</p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-lg border border-surface-container-highest">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div>
                  <label className="block text-body-sm text-on-surface-variant mb-1">Nome da Arena</label>
                  <input 
                    type="text" 
                    value={settings.appName} 
                    onChange={e => updateSettings({ appName: e.target.value })}
                    className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-space-xs">
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">Abre às</label>
                    <input 
                      type="time" 
                      value={settings.openTime} 
                      onChange={e => updateSettings({ openTime: e.target.value })}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-on-surface-variant mb-1">Fecha às</label>
                    <input 
                      type="time" 
                      value={settings.closeTime} 
                      onChange={e => updateSettings({ closeTime: e.target.value })}
                      className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 mt-space-sm">
                  <h4 className="font-bold text-on-surface mb-space-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">qr_code_2</span> Configurações de Pagamento (PIX)
                  </h4>
                </div>
                <div>
                  <label className="block text-body-sm text-on-surface-variant mb-1">Chave PIX (CNPJ, Email, Celular)</label>
                  <input 
                    type="text" 
                    value={settings.pixKey} 
                    onChange={e => updateSettings({ pixKey: e.target.value })}
                    className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none text-body-sm"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-on-surface-variant mb-1">Nome do Recebedor</label>
                  <input 
                    type="text" 
                    value={settings.pixName} 
                    onChange={e => updateSettings({ pixName: e.target.value })}
                    className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
