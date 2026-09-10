import { useState, useEffect, useRef, FormEvent } from 'react';
import { useStore } from '../store/useStore';

type Message = { id: string; sender: 'user' | 'bot'; text: string; isCard?: boolean };

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Salve, craque! Procurando horário para hoje ou quer reservar com churrasqueira pro pós-jogo?'
  },
  {
    id: '2',
    sender: 'bot',
    isCard: true,
    text: 'Encontrei 2 horários nobres livres para você hoje na Quadra 1 Coberta!'
  }
];

export function BookingSection() {
  const { courts, settings } = useStore();
  const activeCourts = courts.filter(c => c.isActive);

  const [selectedDate, setSelectedDate] = useState('24');
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(activeCourts[0]?.id || null);
  const [hasChurras, setHasChurras] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Timer state (9 mins 48 secs)
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 48);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  const [pixCopied, setPixCopied] = useState(false);

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

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Perfeito! Identifiquei a solicitação. Esse horário já está adicionado ao seu carrinho lateral para pagamento imediato com garantia de reserva!'
        }
      ]);
    }, 700);
  };

  const handleQuickPrompt = (text: string) => {
    const cleanText = text.replace(/^⚡|🥩|⚽/, '').trim();
    setChatInput(cleanText);
    // Focus input or auto-submit based on preference, auto-submitting here for flair
    setTimeout(() => {
      document.getElementById('chatFormSubmitBtn')?.click();
    }, 100);
  };

  const copyPix = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setIsConfirmed(true);
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedCourtObj = activeCourts.find(c => c.id === selectedSlotId) || activeCourts[0];
  const basePrice = selectedCourtObj?.price || 190;
  const totalPrice = basePrice + (hasChurras ? 60 : 0);

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
              <span className="text-body-sm font-body-sm text-on-surface-variant">&bull; Outubro / Novembro 2025</span>
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
            {/* Hardcoded dates matching UI */}
            <button onClick={() => setSelectedDate('24')} className={`flex flex-col items-center py-space-sm px-space-xs rounded-xl transition-all ${selectedDate === '24' ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}>
              <span className="text-[11px] font-label-badge uppercase tracking-wider">{selectedDate === '24' ? 'Hoje' : 'Qui'}</span>
              <span className="font-headline-md text-headline-md font-label-numeric my-0.5">24</span>
              <span className="text-body-sm font-body-sm uppercase">Qui</span>
              {selectedDate === '24' && <span className="w-1.5 h-1.5 rounded-full bg-on-primary mt-1"></span>}
            </button>
            
            {[
              { day: '25', label: 'Sex', status: 'Vagas', color: 'text-secondary', dot: 'bg-secondary' },
              { day: '26', label: 'Sáb', status: 'Livre', color: 'text-primary', dot: 'bg-primary' },
              { day: '27', label: 'Dom', status: 'Livre', color: 'text-primary', dot: 'bg-primary' },
              { day: '28', label: 'Seg', status: 'Últimas', color: 'text-on-surface-variant', dot: 'bg-secondary' },
              { day: '29', label: 'Ter', status: 'Livre', color: 'text-primary', dot: 'bg-primary' },
              { day: '30', label: 'Qua', status: 'Livre', color: 'text-primary', dot: 'bg-primary' }
            ].map((d) => (
              <button key={d.day} onClick={() => setSelectedDate(d.day)} className={`flex flex-col items-center py-space-sm px-space-xs rounded-xl transition-all ${selectedDate === d.day ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}>
                <span className={`text-[11px] font-label-badge uppercase ${selectedDate === d.day ? 'text-on-primary' : d.color}`}>{d.status}</span>
                <span className="font-headline-md text-headline-md font-label-numeric my-0.5">{d.day}</span>
                <span className={`text-body-sm font-body-sm uppercase ${selectedDate === d.day ? 'text-on-primary' : 'text-on-surface-variant'}`}>{d.label}</span>
                {selectedDate !== d.day && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${d.dot}`}></span>}
                {selectedDate === d.day && <span className="w-1.5 h-1.5 rounded-full bg-on-primary mt-1"></span>}
              </button>
            ))}
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
          
          <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
            <div className="flex items-center gap-space-xs">
              <span className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span> Turnos:
              </span>
              <div className="inline-flex rounded-lg bg-surface-container p-0.5">
                <button className="px-space-sm py-1 rounded-md text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface">Manhã (07h-12h)</button>
                <button className="px-space-sm py-1 rounded-md text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface">Tarde (12h-18h)</button>
                <button className="px-space-sm py-1 rounded-md text-body-sm font-body-sm bg-primary text-on-primary font-bold">Noite (18h-00h)</button>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-space-md text-body-sm font-body-sm">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Disponível
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span> Horário Nobre
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest inline-block"></span> Ocupado
              </span>
            </div>
          </div>
        </div>

        {/* Time Slots Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {activeCourts.filter(c => selectedCourt === 'all' || selectedCourt === c.id).map((court, index) => {
            const isSelected = selectedSlotId === court.id;
            
            return (
              <div key={court.id} className={`relative rounded-2xl p-space-md transition-all shadow-md group ${isSelected ? 'bg-surface-container ring-2 ring-primary shadow-xl shadow-primary/10' : 'bg-surface-container hover:bg-surface-container-high'}`}>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`px-space-xs py-0.5 rounded font-label-badge text-[10px] uppercase ${isSelected ? 'bg-secondary/20 text-secondary' : 'bg-primary/15 text-primary'}`}>
                    {index % 2 === 0 ? 'Horário Nobre' : 'Livre'}
                  </span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-space-sm mb-space-sm pr-16">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${isSelected ? 'bg-primary/15 text-primary' : 'bg-surface-container-high group-hover:bg-primary/15 group-hover:text-primary text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{court.name.split(' ')[1] || 'Q'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{court.name} &bull; {court.type}</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-1">{court.features.join(' • ')}</p>
                  </div>
                </div>
                <div className="flex items-baseline justify-between py-space-xs bg-surface-container-lowest/60 px-space-sm rounded-lg mb-space-md">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">alarm</span>
                    <span className="font-label-slot text-label-slot text-on-surface font-bold">20:00 às 21:00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-on-surface-variant block">Valor do horário</span>
                    <span className={`font-headline-md text-headline-md font-label-numeric transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>R$ {court.price},00</span>
                  </div>
                </div>
                <button onClick={() => setSelectedSlotId(court.id)} className={`w-full py-2.5 rounded-xl font-body-md font-bold flex items-center justify-center gap-1.5 transition-all ${isSelected ? 'bg-primary text-on-primary hover:scale-[1.01]' : 'bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface'}`}>
                  {isSelected ? (
                    <><span className="material-symbols-outlined text-[18px]">done_all</span> Horário Selecionado</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">add_circle</span> + Selecionar Horário</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mt-space-sm">
          {activeCourts.slice(0, 3).map((court, i) => (
            <div key={court.id} className="relative h-44 rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={court.imageUrl} alt={court.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-label-badge text-primary uppercase">{court.name}</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface leading-none truncate pr-2 max-w-[120px]">{court.type}</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-primary font-label-badge text-[10px] truncate">{court.features[0]?.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="xl:col-span-4 flex flex-col gap-space-lg">
        {/* Chatbot */}
        <div className="rounded-2xl bg-surface-container-low shadow-xl overflow-hidden flex flex-col">
          <div className="p-space-md bg-surface-container flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container"></span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">Assistente da Resenha</h3>
                <p className="font-body-sm text-body-sm text-primary flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> IA Online &bull; Resposta em 2s
                </p>
              </div>
            </div>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-badge text-[10px]">GPT-4o Sport</span>
          </div>
          
          <div ref={chatScrollRef} className="p-space-md flex flex-col gap-space-sm max-h-[320px] overflow-y-auto">
            {messages.map(msg => (
              msg.sender === 'bot' ? (
                <div key={msg.id} className="flex items-start gap-space-xs">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex-shrink-0 flex items-center justify-center text-[12px] font-bold">R</div>
                  <div className="bg-surface-container p-space-sm rounded-xl rounded-tl-none max-w-[88%] text-body-md font-body-md text-on-surface flex flex-col gap-2">
                    <p>{msg.text}</p>
                    {msg.isCard && (
                      <div className="p-space-xs bg-surface-container-lowest rounded-lg">
                        <div className="flex items-center justify-between text-body-sm mb-1">
                          <span className="font-bold text-on-surface">Hoje (Qui), 20:00 - 21:00</span>
                          <span className="text-primary font-bold font-label-numeric">R$ 190</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mb-2">Quadra 1 Coberta &bull; Câmeras ativas</p>
                        <button className="w-full py-1.5 rounded-md bg-primary text-on-primary font-bold text-body-sm transition-transform hover:scale-[1.01]">
                          Horário Selecionado no Painel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start justify-end gap-space-xs">
                  <div className="bg-primary text-on-primary p-space-sm rounded-xl rounded-tr-none max-w-[85%] text-body-md font-body-md">
                    {msg.text}
                  </div>
                </div>
              )
            ))}
            
            {/* Quick chips - only show if just bot initial messages */}
            {messages.length === 2 && (
              <div className="flex flex-wrap gap-1.5 pl-space-lg">
                <button onClick={() => handleQuickPrompt('⚡ Vagas hoje na Coberta?')} className="text-left px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-[11px] text-primary transition-colors">
                  ⚡ Vagas hoje na Coberta?
                </button>
                <button onClick={() => handleQuickPrompt('🥩 Quanto custa c/ Churrasqueira?')} className="text-left px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-[11px] text-secondary transition-colors">
                  🥩 Quanto custa c/ Churrasqueira?
                </button>
                <button onClick={() => handleQuickPrompt('⚽ Regras de cancelamento?')} className="text-left px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface-variant transition-colors">
                  ⚽ Regras de cancelamento?
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleChatSubmit} className="p-space-sm bg-surface-container border-t-0 flex items-center gap-space-xs">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-space-sm py-2 rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50" 
              placeholder="Ex: Tem vaga nesta sexta às 21h?" 
              type="text"
            />
            <button id="chatFormSubmitBtn" aria-label="Enviar mensagem" className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-transform" type="submit">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>

        {/* Checkout Sticky Panel */}
        <div className="sticky top-24 rounded-2xl bg-surface-container-low p-space-md shadow-2xl">
          <div className="mb-space-sm p-space-xs bg-secondary/15 rounded-xl flex items-center justify-between text-secondary">
            <span className="flex items-center gap-1.5 text-body-sm font-body-sm font-bold">
              <span className="material-symbols-outlined text-[18px]">timer</span> Horário pré-reservado
            </span>
            <span className="font-label-numeric text-body-sm font-bold tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          <div className="flex flex-col gap-space-xs pb-space-sm mb-space-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-label-badge text-primary uppercase">Quadra Selecionada</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{selectedCourtObj?.name || 'Nenhuma'} &bull; {selectedCourtObj?.type || ''}</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Hoje, 24 de Out &bull; 20:00 às 21:00 (60 min)</p>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-label-numeric">R$ {basePrice},00</span>
            </div>

            <div className="p-space-xs bg-surface-container rounded-lg flex flex-col gap-1 text-[11px] text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[14px]">sports_soccer</span> 1x Bola Penalty Oficial Society</span>
                <span className="text-primary font-bold">INCLUSO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[14px]">styler</span> 14x Coletes (2 cores lavados)</span>
                <span className="text-primary font-bold">INCLUSO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[14px]">videocam</span> Download dos Melhores Momentos IA</span>
                <span className="text-primary font-bold">GRÁTIS</span>
              </div>
            </div>

            <div className="mt-1">
              <span className="text-[11px] font-label-badge text-on-surface-variant uppercase block mb-1">Adicionais para a sua resenha:</span>
              <label className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={hasChurras}
                    onChange={(e) => setHasChurras(e.target.checked)}
                    className="accent-secondary w-4 h-4 rounded" 
                  />
                  <span className="text-body-sm font-body-sm text-on-surface">Churrasqueira Exclusiva (+2h)</span>
                </div>
                <span className="text-body-sm font-label-numeric text-secondary font-bold">+ R$ 60</span>
              </label>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container rounded-xl mb-space-md flex items-center justify-between">
            <div>
              <span className="text-body-sm font-body-sm text-on-surface-variant block">Valor Total do Aluguel</span>
              <span className="text-[11px] text-primary">Dividido por 14 atletas = ~R$ {(totalPrice / 14).toFixed(2).replace('.', ',')} cada</span>
            </div>
            <span className="font-headline-lg text-headline-lg text-primary font-label-numeric">R$ {totalPrice},00</span>
          </div>

          <form className="flex flex-col gap-space-xs mb-space-md" onSubmit={e => e.preventDefault()}>
            <span className="text-[11px] font-label-badge text-on-surface-variant uppercase">Dados do Organizador:</span>
            <input className="w-full px-space-sm py-2 rounded-xl bg-surface-container text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Nome Completo do Responsável" type="text" defaultValue="Gabriel Santos" />
            <div className="grid grid-cols-2 gap-space-xs">
              <input className="w-full px-space-sm py-2 rounded-xl bg-surface-container text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary" placeholder="WhatsApp" type="tel" defaultValue="(11) 98765-4321" />
              <input className="w-full px-space-sm py-2 rounded-xl bg-surface-container text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Seu E-mail" type="email" defaultValue="gabriel.santos@email.com" />
            </div>

            <div className="mt-space-xs">
              <span className="text-[11px] font-label-badge text-on-surface-variant uppercase block mb-1">Método de Confirmação:</span>
              <div className="grid grid-cols-2 gap-space-2xs p-1 bg-surface-container rounded-xl">
                <button onClick={() => setPaymentMethod('pix')} className={`py-2 rounded-lg font-body-sm flex items-center justify-center gap-1 transition-all ${paymentMethod === 'pix' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span> PIX Instantâneo
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`py-2 rounded-lg font-body-sm flex items-center justify-center gap-1 transition-all ${paymentMethod === 'card' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">
                  <span className="material-symbols-outlined text-[16px]">credit_card</span> Cartão (até 3x)
                </button>
              </div>
            </div>
          </form>

          {paymentMethod === 'pix' && (
            <div className="p-space-sm bg-surface-container-lowest rounded-xl mb-space-md flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-20 h-20 bg-surface-container p-1 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                    <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="5"></rect>
                    <rect fill="#0a0e14" height="20" rx="2" width="20" x="9" y="9"></rect>
                    <rect fill="currentColor" height="12" width="12" x="13" y="13"></rect>
                    <rect fill="currentColor" height="28" rx="4" width="28" x="67" y="5"></rect>
                    <rect fill="#0a0e14" height="20" rx="2" width="20" x="71" y="9"></rect>
                    <rect fill="currentColor" height="12" width="12" x="75" y="13"></rect>
                    <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="67"></rect>
                    <rect fill="#0a0e14" height="20" rx="2" width="20" x="9" y="71"></rect>
                    <rect fill="currentColor" height="12" width="12" x="13" y="75"></rect>
                    <rect height="6" width="6" x="40" y="8"></rect>
                    <rect height="6" width="6" x="50" y="8"></rect>
                    <rect height="6" width="16" x="40" y="20"></rect>
                    <rect height="10" width="10" x="45" y="32"></rect>
                    <rect height="6" width="24" x="10" y="45"></rect>
                    <rect height="6" width="20" x="40" y="48"></rect>
                    <rect height="18" width="8" x="67" y="45"></rect>
                    <rect height="6" width="14" x="80" y="45"></rect>
                    <rect height="18" width="8" x="80" y="60"></rect>
                    <rect height="6" width="18" x="40" y="65"></rect>
                    <rect height="14" width="12" x="45" y="78"></rect>
                    <rect height="16" width="26" x="65" y="75"></rect>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-primary text-body-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    QR Code Pix Ativo
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">{settings.pixKey}</p>
                  <button onClick={copyPix} className={`mt-1 px-space-xs py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold flex items-center gap-1 transition-colors ${pixCopied ? 'text-primary' : ''}`}>
                    {pixCopied ? <span className="material-symbols-outlined text-[14px]">check</span> : <span className="material-symbols-outlined text-[14px]">content_copy</span>}
                    {pixCopied ? 'Código Copiado!' : 'Copiar Chave Pix'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleConfirm} disabled={isConfirmed || isConfirming} className={`w-full py-3.5 rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isConfirmed ? 'bg-tertiary text-on-tertiary shadow-tertiary/30' : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'}`}>
            {isConfirming ? (
              <><span className="material-symbols-outlined text-[24px] animate-spin">sync</span> Validando...</>
            ) : isConfirmed ? (
              <><span className="material-symbols-outlined text-[24px]">task_alt</span> Horário Garantido!</>
            ) : (
              <><span className="material-symbols-outlined text-[24px]">verified</span> Confirmar Pagamento e Garantir Quadra</>
            )}
          </button>
          
          <div className="mt-space-sm flex items-center justify-center gap-space-xs text-[11px] text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-primary text-[16px]">shield</span>
            <span>Cancelamento sem custo até 6h antes &bull; Sistema 100% Criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
