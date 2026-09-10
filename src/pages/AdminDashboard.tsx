import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Court } from '../store/useStore';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    isAdminAuthenticated, 
    adminUser, 
    courts, 
    settings, 
    reservations,
    addCourt, 
    updateCourt, 
    removeCourt, 
    updateSettings,
    updateReservationStatus,
    removeReservation,
    getAvailableSlots,
    addReservation
  } = useStore();
  const [activeTab, setActiveTab] = useState<'agenda' | 'historico' | 'quadras' | 'config'>('agenda');
  const [editingCourt, setEditingCourt] = useState<Partial<Court> | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Manual Reservation State
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [newResCourt, setNewResCourt] = useState('');
  const [newResTime, setNewResTime] = useState('');
  const [newResName, setNewResName] = useState('');
  const [newResPhone, setNewResPhone] = useState('');

  useEffect(() => {
    // Only redirect if explicitly not authenticated and we've verified they're not logging in.
    // In a real app we might want a loading state for Auth.
    if (!isAdminAuthenticated && adminUser === null) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, adminUser, navigate]);

  if (!isAdminAuthenticated) return null;

  const handleLogout = async () => {
    try {
      const { logout } = await import('../lib/firebase');
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
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

  const handleAddManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResCourt || !newResTime || !newResName) return alert('Preencha quadra, horário e cliente.');

    const courtObj = courts.find(c => c.id === newResCourt);
    if (!courtObj) return;

    const endTime = `${parseInt(newResTime.split(':')[0]) + 1}:00`.padStart(5, '0');

    try {
      await addReservation({
        id: `res_admin_${Date.now()}`,
        courtId: newResCourt,
        date: selectedDate,
        startTime: newResTime,
        endTime: endTime,
        customerName: newResName,
        customerPhone: newResPhone,
        totalPrice: courtObj.price,
        status: 'confirmed',
        createdAt: Date.now()
      });
      setIsAddingReservation(false);
      setNewResCourt('');
      setNewResTime('');
      setNewResName('');
      setNewResPhone('');
    } catch (error) {
      alert("Erro ao criar reserva manual.");
    }
  };

  // Calculate if a reservation is "new" (created within last 24h)
  const isNewReservation = (createdAt: number | undefined) => {
    if (!createdAt) return false;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return (Date.now() - createdAt) < ONE_DAY;
  };

  const newReservationsCount = reservations.filter(r => isNewReservation(r.createdAt) && r.status === 'pending').length;

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
            className={`flex items-center justify-between px-space-sm py-2.5 rounded-lg text-left whitespace-nowrap transition-colors ${activeTab === 'agenda' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span> Agenda e Reservas
            </div>
            {newReservationsCount > 0 && (
              <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                {newReservationsCount} Novas
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-space-sm py-2.5 rounded-lg text-left whitespace-nowrap transition-colors ${activeTab === 'historico' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">history</span> Histórico
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
          <div className="flex flex-col gap-space-lg max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h1 className="font-headline-lg text-headline-md mb-2">Agenda e Reservas</h1>
                <p className="text-on-surface-variant">Gerencie os horários e visualize as reservas dos clientes.</p>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg border border-surface-container-highest">
                <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-on-surface font-bold font-body-lg"
                />
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl border border-surface-container-highest overflow-hidden">
              <div className="p-space-md border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-bold">Agendamentos para {selectedDate.split('-').reverse().join('/')}</h3>
                <button 
                  onClick={() => setIsAddingReservation(!isAddingReservation)}
                  className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-body-sm font-bold flex items-center gap-1 hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Nova Reserva
                </button>
              </div>

              {isAddingReservation && (
                <form onSubmit={handleAddManualReservation} className="p-space-md border-b border-surface-container-highest bg-surface-container flex flex-wrap gap-space-sm items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[11px] uppercase font-bold text-on-surface-variant mb-1">Quadra</label>
                    <select 
                      value={newResCourt} 
                      onChange={e => setNewResCourt(e.target.value)}
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    >
                      <option value="">Selecione a Quadra</option>
                      {courts.filter(c => c.isActive).map(c => (
                        <option key={c.id} value={c.id}>{c.name} - R${c.price}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[11px] uppercase font-bold text-on-surface-variant mb-1">Horário (Livres)</label>
                    <select 
                      value={newResTime} 
                      onChange={e => setNewResTime(e.target.value)}
                      disabled={!newResCourt}
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Horário</option>
                      {newResCourt && getAvailableSlots(newResCourt, selectedDate).map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[11px] uppercase font-bold text-on-surface-variant mb-1">Nome do Cliente</label>
                    <input 
                      type="text" 
                      value={newResName} 
                      onChange={e => setNewResName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="px-space-md py-2 bg-primary text-on-primary font-bold rounded-lg hover:scale-[1.02] transition-transform">
                    Lançar Reserva
                  </button>
                </form>
              )}

              {reservations.filter(r => r.date === selectedDate).length === 0 ? (
                <div className="p-space-xl text-center">
                  <span className="material-symbols-outlined text-[48px] text-surface-container-highest mb-4">event_busy</span>
                  <h3 className="font-headline-sm text-on-surface mb-2">Nenhuma reserva neste dia</h3>
                  <p className="text-on-surface-variant">Não há agendamentos registrados para a data selecionada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-surface-container-highest text-body-sm text-on-surface-variant uppercase tracking-wider">
                        <th className="p-4 font-bold">Horário</th>
                        <th className="p-4 font-bold">Quadra</th>
                        <th className="p-4 font-bold">Cliente</th>
                        <th className="p-4 font-bold">Contato</th>
                        <th className="p-4 font-bold">Valor</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-highest">
                      {reservations
                        .filter(r => r.date === selectedDate)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(reservation => {
                          const court = courts.find(c => c.id === reservation.courtId);
                          const isNew = isNewReservation(reservation.createdAt) && reservation.status === 'pending';
                          return (
                            <tr key={reservation.id} className={`hover:bg-surface-container-lowest transition-colors ${isNew ? 'bg-primary/5' : ''}`}>
                              <td className="p-4 whitespace-nowrap font-bold text-primary">
                                <div className="flex items-center gap-2">
                                  {isNew && <span className="w-2 h-2 rounded-full bg-error" title="Nova Reserva Pendente"></span>}
                                  {reservation.startTime} - {reservation.endTime}
                                </div>
                              </td>
                              <td className="p-4 whitespace-nowrap">{court?.name || 'Quadra Removida'}</td>
                              <td className="p-4 font-bold">{reservation.customerName}</td>
                              <td className="p-4 whitespace-nowrap text-on-surface-variant">{reservation.customerPhone}</td>
                              <td className="p-4 whitespace-nowrap text-primary font-bold">R$ {reservation.totalPrice}</td>
                              <td className="p-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                  ${reservation.status === 'confirmed' ? 'bg-success/20 text-success' : 
                                    reservation.status === 'pending' ? 'bg-warning/20 text-warning' : 
                                    'bg-error/20 text-error'}`}
                                >
                                  {reservation.status === 'confirmed' ? 'Confirmado' : 
                                   reservation.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-right">
                                <div className="flex justify-end gap-2">
                                  {reservation.status === 'pending' && (
                                    <button 
                                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                      className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                                      title="Confirmar"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                  )}
                                  {reservation.status !== 'cancelled' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
                                          updateReservationStatus(reservation.id, 'cancelled');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                                      title="Cancelar"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                  )}
                                  {reservation.status === 'cancelled' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Deseja excluir permanentemente esta reserva?')) {
                                          removeReservation(reservation.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                                      title="Excluir Definitivamente"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORICO TAB */}
        {activeTab === 'historico' && (
          <div className="flex flex-col gap-space-lg max-w-5xl">
            <div>
              <h1 className="font-headline-lg text-headline-md mb-2">Histórico de Reservas</h1>
              <p className="text-on-surface-variant">Visualize as reservas de dias anteriores.</p>
            </div>

            <div className="bg-surface-container-low rounded-xl border border-surface-container-highest overflow-hidden">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const pastReservations = reservations
                  .filter(r => r.date < todayStr)
                  .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

                if (pastReservations.length === 0) {
                  return (
                    <div className="p-space-xl text-center">
                      <span className="material-symbols-outlined text-[48px] text-surface-container-highest mb-4">history</span>
                      <h3 className="font-headline-sm text-on-surface mb-2">Nenhum histórico encontrado</h3>
                      <p className="text-on-surface-variant">Não há reservas registradas em datas anteriores a hoje.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container border-b border-surface-container-highest text-body-sm text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 font-bold">Data/Hora</th>
                          <th className="p-4 font-bold">Quadra</th>
                          <th className="p-4 font-bold">Cliente</th>
                          <th className="p-4 font-bold">Valor</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 text-right font-bold">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-highest">
                        {pastReservations.map(reservation => {
                          const court = courts.find(c => c.id === reservation.courtId);
                          return (
                            <tr key={reservation.id} className="hover:bg-surface-container-lowest transition-colors">
                              <td className="p-4 whitespace-nowrap font-bold text-primary">
                                {reservation.date.split('-').reverse().join('/')} &bull; {reservation.startTime}
                              </td>
                              <td className="p-4 whitespace-nowrap">{court?.name || 'Quadra Removida'}</td>
                              <td className="p-4 font-bold">{reservation.customerName}</td>
                              <td className="p-4 whitespace-nowrap text-primary font-bold">R$ {reservation.totalPrice}</td>
                              <td className="p-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                  ${reservation.status === 'confirmed' ? 'bg-success/20 text-success' : 
                                    reservation.status === 'pending' ? 'bg-warning/20 text-warning' : 
                                    'bg-error/20 text-error'}`}
                                >
                                  {reservation.status === 'confirmed' ? 'Confirmado' : 
                                   reservation.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-right">
                                <div className="flex justify-end gap-2">
                                  {reservation.status === 'cancelled' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Deseja excluir permanentemente esta reserva do histórico?')) {
                                          removeReservation(reservation.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                                      title="Excluir Definitivamente"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
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
                    className="w-full bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none text-body-sm"
                  />
                </div>
                <div className="md:col-span-2 mt-space-sm border-t border-surface-container-highest pt-space-sm">
                  <h4 className="font-bold text-on-surface mb-space-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">chat</span> Atendimento (WhatsApp)
                  </h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-body-sm text-on-surface-variant mb-1">Número do WhatsApp (apenas números com DDI + DDD)</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber || ''} 
                    onChange={e => updateSettings({ whatsappNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="Ex: 5511999999999"
                    className="w-full md:w-1/2 bg-surface-container px-space-sm py-2 rounded-lg border border-surface-container-highest focus:border-primary focus:outline-none text-body-sm"
                  />
                  <p className="text-[12px] text-on-surface-variant mt-1">Este número receberá os comprovantes de pagamento PIX dos clientes.</p>
                </div>

                <div className="md:col-span-2 mt-space-sm border-t border-surface-container-highest pt-space-sm">
                  <h4 className="font-bold text-on-surface mb-space-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span> Dias de Funcionamento
                  </h4>
                  <p className="text-[12px] text-on-surface-variant mb-3">Selecione em quais dias da semana a quadra estará aberta para reservas.</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 0, label: 'Dom' },
                      { value: 1, label: 'Seg' },
                      { value: 2, label: 'Ter' },
                      { value: 3, label: 'Qua' },
                      { value: 4, label: 'Qui' },
                      { value: 5, label: 'Sex' },
                      { value: 6, label: 'Sáb' },
                    ].map(day => {
                      const isSelected = (settings.operatingDays || [0,1,2,3,4,5,6]).includes(day.value);
                      return (
                        <button
                          key={day.value}
                          onClick={() => {
                            const current = settings.operatingDays || [0,1,2,3,4,5,6];
                            const next = isSelected 
                              ? current.filter(d => d !== day.value)
                              : [...current, day.value].sort();
                            
                            // Prevent unselecting all days
                            if (next.length > 0) {
                              updateSettings({ operatingDays: next });
                            } else {
                              alert('Você precisa ter pelo menos um dia de funcionamento.');
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-bold text-body-sm transition-colors border ${
                            isSelected 
                              ? 'bg-primary text-on-primary border-primary' 
                              : 'bg-surface-container text-on-surface-variant border-surface-container-highest hover:bg-surface-container-high'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
