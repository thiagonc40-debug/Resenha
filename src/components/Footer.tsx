export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest mt-space-2xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-xl">
          <div>
            <div className="flex items-center gap-space-sm mb-space-md">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
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
                <span className="material-symbols-outlined text-primary text-[18px]">local_parking</span>
                <span>Estacionamento Privativo com Segurança</span>
              </li>
              <li className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">shower</span>
                <span>Vestiários Completos com Ducha Aquecida</span>
              </li>
              <li className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">outdoor_grill</span>
                <span>Bar & Churrasqueiras Climatizadas</span>
              </li>
              <li className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                <span>Transmissão & Replay com Câmeras IA</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Arena & Localização</h4>
            <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <p className="flex items-start gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">location_on</span>
                <span>Av. das Nações Unidas, 1850 - Complexo Esportivo Morumbi, São Paulo - SP</span>
              </p>
              <p className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                <span>Seg a Dom: 06:00 às 00:00</span>
              </p>
              <p className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                <span>(11) 98765-4321 &bull; Recepção & Eventos</span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Pagamento & Segurança</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">Confirmação em tempo real via Pix com split automático entre os jogadores do seu time.</p>
            <div className="flex flex-wrap gap-space-2xs">
              <span className="px-space-sm py-space-2xs rounded-md bg-surface-container text-on-surface text-body-sm font-label-numeric">PIX INSTANTÂNEO</span>
              <span className="px-space-sm py-space-2xs rounded-md bg-surface-container text-on-surface text-body-sm font-label-numeric">CARTÕES</span>
              <span className="px-space-sm py-space-2xs rounded-md bg-surface-container text-on-surface text-body-sm font-label-numeric">SPLIT PAY</span>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container-highest">
          <p>&copy; 2025 Resenha Society Ltda. Todos os direitos reservados.</p>
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
