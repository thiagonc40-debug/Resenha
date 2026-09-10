import { useState, useEffect, useRef, FormEvent } from 'react';
import { useStore } from '../store/useStore';

type Message = { id: string; sender: 'user' | 'bot'; text: string; isCard?: boolean };

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Salve, craque! Procurando horário para hoje ou quer reservar com churrasqueira pro pós-jogo?'
  }
];

// Helper to generate the next 7 days
function generateDates(startDate: Date, operatingDays: number[] = [0,1,2,3,4,5,6]) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayOfWeek = d.getDay();
    const isClosed = !operatingDays.includes(dayOfWeek);
    
    dates.push({
      dateObj: d,
      isoDate: d.toISOString().split('T')[0],
      dayStr: d.getDate().toString().padStart(2, '0'),
      weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', ''),
      isToday: i === 0,
      isClosed,
      labelStatus: isClosed ? 'Fechado' : (i === 0 ? 'Hoje' : (i < 3 ? 'Vagas' : 'Livre'))
    });
  }
  return dates;
}

export function BookingSection() {
  const { courts, settings, getAvailableSlots, addReservation } = useStore();
  const activeCourts = courts.filter(c => c.isActive);

  // Dynamic Date Generation
  const [calendarDates, setCalendarDates] = useState(() => generateDates(new Date(), settings.operatingDays));
  const [selectedDate, setSelectedDate] = useState(calendarDates.find(d => !d.isClosed)?.isoDate || calendarDates[0].isoDate);
  const [selectedCourt, setSelectedCourt] = useState('all');
  
  // Specific Slot Selection
  const [selectedCourtIdForSlot, setSelectedCourtIdForSlot] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [hasChurras, setHasChurras] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'payment'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Customer Data for Checkout
  const [customerName, setCustomerName] = useState('Gabriel Santos');
  const [customerPhone, setCustomerPhone] = useState('(11) 98765-4321');
  
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 48);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    // Regenerate dates if day changes or settings change
    const newDates = generateDates(new Date(), settings.operatingDays);
    setCalendarDates(newDates);
    // If selected date became closed, switch to a valid one
    const currentSelected = newDates.find(d => d.isoDate === selectedDate);
    if (!currentSelected || currentSelected.isClosed) {
      setSelectedDate(newDates.find(d => !d.isClosed)?.isoDate || newDates[0].isoDate);
    }
  }, [settings.operatingDays]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Perfeito! Identifiquei a solicitação. Verifique os horários no painel ao lado e prossiga com o pagamento!'
        }
      ]);
    }, 700);
  };

  const copyPix = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleProceedToPayment = () => {
    if (!selectedCourtIdForSlot || !selectedTime) return alert("Selecione um horário primeiro.");
    if (!customerName.trim() || !customerPhone.trim()) return alert("Preencha seu nome e telefone para prosseguir.");
    
    // VALIDATION: Check if the slot is still available right before confirming
    const currentAvailableSlots = getAvailableSlots(selectedCourtIdForSlot, selectedDate);
    if (!currentAvailableSlots.includes(selectedTime)) {
      alert("Desculpe, este horário acabou de ser reservado por outra pessoa. Por favor, escolha outro horário.");
      setSelectedTime(null); // Reset their selection
      return;
    }

    setCheckoutStep('payment');
  };

  const handleFinalConfirm = async () => {
    setIsConfirming(true);
    
    // Create actual reservation
    const newReservation = {
      id: `res${Date.now()}`,
      courtId: selectedCourtIdForSlot,
      date: selectedDate,
      startTime: selectedTime,
      endTime: `${parseInt(selectedTime.split(':')[0]) + 1}:00`.padStart(5, '0'), // 1 hour duration
      customerName,
      customerPhone,
      status: 'pending' as const, // Changed to pending for manual approval
      totalPrice: totalPrice,
      createdAt: Date.now()
    };

    try {
      await addReservation(newReservation);
      setIsConfirming(false);
      setIsConfirmed(true);

      // Trigger WhatsApp redirection
      const phone = settings.whatsappNumber || '5511999999999';
      const courtName = activeCourts.find(c => c.id === selectedCourtIdForSlot)?.name || '';
      const message = `Olá! Acabei de fazer uma reserva no site.\n\n*Quadra:* ${courtName}\n*Data:* ${selectedDate.split('-').reverse().join('/')}\n*Horário:* ${selectedTime}\n*Valor Total:* R$ ${totalPrice},00\n\nSegue o meu comprovante de pagamento PIX:`;
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      
    } catch (e) {
      setIsConfirming(false);
      alert("Erro ao confirmar reserva.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedCourtObj = activeCourts.find(c => c.id === selectedCourtIdForSlot);
  const basePrice = selectedCourtObj?.price || 0;
  const totalPrice = basePrice + (hasChurras ? 60 : 0);

  const selectedDateObj = calendarDates.find(d => d.isoDate === selectedDate);
  const formattedSelectedDate = selectedDateObj 
    ? `${selectedDateObj.weekday}, ${selectedDateObj.dayStr}` 
    : '';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
      {/* LEFT / MAIN COLUMN */}
      <div className="xl:col-span-8 flex flex-col gap-space-lg">
        {/* Date Selector */}
        <div className="rounded-xl bg-surface-container-low p-space-md shadow-md">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Selecione a Data</h2>
              <span className="text-body-sm font-body-sm text-on-surface-variant capitalize">&bull; {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <button aria-label="Semana anterior" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button aria-label="Próxima semana" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-space-xs">
            {calendarDates.map((d) => {
              const isClosed = d.isClosed;
              return (
              <button 
                key={d.isoDate} 
                onClick={() => {
                  if (!isClosed) {
                    setSelectedDate(d.isoDate);
                    setSelectedTime(null); // Reset time when day changes
                  }
                }} 
                disabled={isClosed}
                className={`flex flex-col items-center py-space-sm px-space-xs rounded-xl transition-all ${
                  isClosed 
                    ? 'bg-surface-container-lowest text-surface-container-highest cursor-not-allowed opacity-50'
                    : selectedDate === d.isoDate 
                      ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className={`text-[11px] font-label-badge uppercase ${
                  isClosed ? 'text-surface-container-highest' 
                  : selectedDate === d.isoDate ? 'text-on-primary' 
                  : (d.isToday ? 'text-primary' : 'text-on-surface-variant')
                }`}>
                  {d.labelStatus}
                </span>
                <span className="font-headline-md text-headline-md font-label-numeric my-0.5">{d.dayStr}</span>
                <span className={`text-body-sm font-body-sm uppercase ${
                  isClosed ? 'text-surface-container-highest'
                  : selectedDate === d.isoDate ? 'text-on-primary' 
                  : 'text-on-surface-variant'
                }`}>{d.weekday}</span>
                {!isClosed && (
                  selectedDate === d.isoDate ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-on-primary mt-1"></span>
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${d.isToday ? 'bg-primary' : 'bg-surface-container-highest'}`}></span>
                  )
                )}
              </button>
            )})}
          </div>
        </div>

        {/* Court Filters */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
            <button onClick={() => setSelectedCourt('all')} className={`px-space-md py-space-xs rounded-full font-body-md whitespace-nowrap transition-all ${selectedCourt === 'all' ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}>
              Todas as Quadras ({activeCourts.length})
            </button>
            {activeCourts.map(court => (
              <button key={court.id} onClick={() => setSelectedCourt(court.id)} className={`px-space-md py-space-xs rounded-full font-body-md whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedCourt === court.id ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}>
                <span className={`material-symbols-outlined text-[16px] ${selectedCourt === court.id ? 'text-on-primary' : 'text-primary'}`}>sports_soccer</span>
                {court.name} - {court.type}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {activeCourts.filter(c => selectedCourt === 'all' || selectedCourt === c.id).map((court) => {
            const isCourtSelected = selectedCourtIdForSlot === court.id;
            const availableSlots = getAvailableSlots(court.id, selectedDate);
            
            return (
              <div key={court.id} className={`relative rounded-2xl p-space-md transition-all shadow-md group ${isCourtSelected ? 'bg-surface-container ring-2 ring-primary shadow-xl shadow-primary/10' : 'bg-surface-container hover:bg-surface-container-high'}`}>
                <div className="flex items-start gap-space-sm mb-space-sm">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${isCourtSelected ? 'bg-primary/15 text-primary' : 'bg-surface-container-high group-hover:bg-primary/15 group-hover:text-primary text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{court.name.split(' ')[1] || 'Q'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{court.name} &bull; {court.type}</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-1">{court.features.join(' • ')}</p>
                    <span className="text-primary font-bold font-label-numeric mt-1 block">R$ {court.price},00 / h</span>
                  </div>
                </div>
                
                <div className="mt-space-sm pt-space-sm border-t border-surface-container-highest">
                  <span className="text-[11px] font-label-badge uppercase text-on-surface-variant mb-2 block">Horários Disponíveis ({selectedDateObj?.dayStr}/{selectedDateObj?.weekday})</span>
                  
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-4 bg-surface-container-lowest rounded-lg border border-surface-container-highest">
                      <p className="text-body-sm text-on-surface-variant">Esgotado para esta data</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                      {availableSlots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => {
                            setSelectedCourtIdForSlot(court.id);
                            setSelectedTime(slot);
                            setIsConfirmed(false);
                          }}
                          className={`py-1.5 rounded-lg text-body-sm font-label-numeric font-bold transition-all
                            ${isCourtSelected && selectedTime === slot 
                              ? 'bg-primary text-on-primary shadow-md' 
                              : 'bg-surface-container-lowest hover:bg-surface-container-highest text-on-surface'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN - CHECKOUT */}
      <div className="xl:col-span-4 flex flex-col gap-space-lg">
        {/* Chatbot (Minified to save space) */}
        
        {/* Checkout Sticky Panel */}
        <div className="sticky top-24 rounded-2xl bg-surface-container-low p-space-md shadow-2xl">
          <div className="mb-space-sm p-space-xs bg-secondary/15 rounded-xl flex items-center justify-between text-secondary">
            <span className="flex items-center gap-1.5 text-body-sm font-body-sm font-bold">
              <span className="material-symbols-outlined text-[18px]">timer</span> Tempo para concluir
            </span>
            <span className="font-label-numeric text-body-sm font-bold tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          <div className="flex flex-col gap-space-xs pb-space-sm mb-space-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-label-badge text-primary uppercase">Sua Seleção</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{selectedCourtObj?.name || 'Selecione a Quadra e Horário'}</h4>
                {selectedTime && selectedDateObj ? (
                  <p className="text-body-sm font-body-sm text-on-surface-variant capitalize">{selectedDateObj.weekday}, {selectedDateObj.dayStr} &bull; {selectedTime} às {parseInt(selectedTime.split(':')[0]) + 1}:00 (60 min)</p>
                ) : (
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Aguardando seleção...</p>
                )}
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-label-numeric">
                R$ {totalPrice > 0 ? totalPrice : '0'},00
              </span>
            </div>

            <div className="mt-1">
              <label className={`flex items-center justify-between p-space-xs rounded-lg transition-colors ${!selectedCourtObj ? 'opacity-50 pointer-events-none' : 'bg-surface-container hover:bg-surface-container-high cursor-pointer'}`}>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={hasChurras}
                    onChange={(e) => setHasChurras(e.target.checked)}
                    className="accent-secondary w-4 h-4 rounded" 
                    disabled={!selectedCourtObj}
                  />
                  <span className="text-body-sm font-body-sm text-on-surface">Churrasqueira Exclusiva (+2h)</span>
                </div>
                <span className="text-body-sm font-label-numeric text-secondary font-bold">+ R$ 60</span>
              </label>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container rounded-xl mb-space-md flex items-center justify-between">
            <div>
              <span className="text-body-sm font-body-sm text-on-surface-variant block">Valor Total</span>
            </div>
            <span className="font-headline-lg text-headline-lg text-primary font-label-numeric">R$ {totalPrice > 0 ? totalPrice : '0'},00</span>
          </div>

          {!isConfirmed ? (
            checkoutStep === 'selection' ? (
              <>
                <form className="flex flex-col gap-space-xs mb-space-md" onSubmit={e => e.preventDefault()}>
                  <span className="text-[11px] font-label-badge text-on-surface-variant uppercase">Dados do Organizador:</span>
                  <input 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-space-sm py-2 rounded-xl bg-surface-container text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Nome Completo do Responsável" type="text" 
                  />
                  <div className="grid grid-cols-1 gap-space-xs">
                    <input 
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-space-sm py-2 rounded-xl bg-surface-container text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="WhatsApp" type="tel" 
                    />
                  </div>
                </form>

                <button 
                  onClick={handleProceedToPayment} 
                  disabled={!selectedTime} 
                  className={`w-full py-3.5 rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all 
                    ${!selectedTime ? 'bg-surface-container-highest text-on-surface-variant shadow-none cursor-not-allowed' : 
                      'bg-primary hover:bg-primary-container text-on-primary shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">payment</span> Ir para Pagamento
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-space-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setCheckoutStep('selection')} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Forma de Pagamento</span>
                </div>

                <div className="bg-surface-container rounded-xl p-space-sm border border-surface-container-highest flex flex-col items-center text-center gap-space-sm">
                  <span className="material-symbols-outlined text-[48px] text-primary">qr_code_2</span>
                  <div>
                    <p className="text-body-sm font-bold text-on-surface">Pagamento via PIX</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">Chave: {settings.pixKey || 'Não configurada'}</p>
                    <p className="text-[12px] text-on-surface-variant">{settings.pixName || 'Consulte o balcão'}</p>
                  </div>
                  <button onClick={copyPix} className="w-full py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-bold text-body-sm transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{pixCopied ? 'check' : 'content_copy'}</span>
                    {pixCopied ? 'Chave Copiada!' : 'Copiar Chave PIX'}
                  </button>
                </div>

                <button 
                  onClick={handleFinalConfirm} 
                  disabled={isConfirming} 
                  className="w-full mt-2 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isConfirming ? (
                    <><span className="material-symbols-outlined text-[24px] animate-spin">sync</span> Processando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[24px]">verified</span> Finalizar Reserva</>
                  )}
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-space-md text-center animate-fade-in">
              <div className="w-16 h-16 bg-tertiary/20 text-tertiary rounded-full flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Quase lá!</h3>
              <p className="text-body-sm text-on-surface-variant px-4">Sua reserva foi pré-agendada no dia {selectedDateObj?.dayStr}/{selectedDateObj?.weekday} às {selectedTime}.</p>
              <p className="text-body-sm font-bold text-primary mt-2">Envie o comprovante no WhatsApp para confirmar.</p>
              <button 
                onClick={() => {
                  setIsConfirmed(false);
                  setCheckoutStep('selection');
                  setSelectedTime(null);
                }}
                className="mt-4 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-body-sm font-bold text-on-surface transition-colors"
              >
                Fazer nova reserva
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
