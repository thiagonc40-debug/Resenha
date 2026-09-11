import { useStore } from '../store/useStore';

export function Footer() {
  const settings = useStore(state => state.settings);

  // Map operating days from [0, 1, 2, 3, 4, 5, 6] to text
  const getOperatingDaysText = () => {
    const days = [...settings.operatingDays].sort((a, b) => a - b);
    if (days.length === 0) return 'Fechado';
    if (days.length === 7) return 'Seg a Dom';
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Check if it's a continuous sequence
    let isSequence = true;
    for (let i = 1; i < days.length; i++) {
      if (days[i] !== days[i-1] + 1) {
        isSequence = false;
        break;
      }
    }
    
    if (isSequence && days.length >= 3) {
      return `${dayNames[days[0]]} a ${dayNames[days[days.length - 1]]}`;
    }
    
    // Non-sequential or small groups (e.g. Seg, Qua e Sex)
    const names = days.map(d => dayNames[d]);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} e ${names[1]}`;
    
    const last = names.pop();
    return `${names.join(', ')} e ${last}`;
  };

  return (
    <footer className="w-full bg-surface-container-lowest mt-space-2xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-xl">
          <div>
            <div className="flex items-center gap-space-sm mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Resenha Society Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                  }}
                />
                <span className="material-symbols-outlined text-[24px]" style={{ display: 'none' }}>sports_soccer</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface">Resenha Society</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md leading-relaxed">
              A experiência definitiva do futebol society com grama sintética profissional homologada, iluminação LED de alta performance, gravação de jogadas por IA e o pós-jogo mais animado da cidade.
            </p>
            <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-primary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Estrutura Homologada Pro</span>
            </div>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Comodidades</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">outdoor_grill</span>
                <span>Bar & Churrasqueiras Climatizadas</span>
              </li>
              <li className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                <a href="https://clippa.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-transparent hover:decoration-primary">
                  Gravação e Replay pelo APP Clippa
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Arena & Localização</h4>
            <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <p className="flex items-start gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">location_on</span>
                <span>Rua Ludovico Schuster, 1330 - Bairro Passa Três, Rio Negro - PR</span>
              </p>
              <p className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                <span>{getOperatingDaysText()}: {settings.openTime} às {settings.closeTime}</span>
              </p>
              <p className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                <span>(47) 99113-9748 &bull; Recepção & Eventos</span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Pagamento & Segurança</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">Confirmação de reserva rápida e segura através de pagamento via Pix.</p>
            <div className="flex flex-wrap gap-space-2xs">
              <span className="px-space-sm py-space-2xs rounded-md bg-surface-container text-on-surface text-body-sm font-label-numeric">PIX INSTANTÂNEO</span>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container-highest">
          <p>&copy; {new Date().getFullYear()} Resenha Society Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-space-md">
            <a className="hover:text-on-surface transition-colors" href="#">Termos de Uso</a>
            <a className="hover:text-on-surface transition-colors" href="#">Privacidade</a>
            <a className="hover:text-on-surface transition-colors" href="#">Regulamento Interno</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
