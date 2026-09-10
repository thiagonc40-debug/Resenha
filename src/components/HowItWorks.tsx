export function HowItWorks() {
  return (
    <section className="mt-space-2xl rounded-2xl bg-surface-container-low p-space-lg">
      <div className="text-center max-w-xl mx-auto mb-space-lg">
        <span className="text-primary font-label-badge text-body-sm uppercase">Sem stress na hora do jogo</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">Como funciona o jogo na Resenha?</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">Praticidade desde o primeiro clique até o churrasco depois do apito final.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-label-numeric font-bold">01</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Reserve em 30s</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Escolha dia, horário e receba o comprovante e QR code de acesso direto no WhatsApp.</p>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-label-numeric font-bold">02</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Divisão Automática</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Envie o link do rachão para a galera do WhatsApp com cobrança PIX individual instantânea.</p>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-label-numeric font-bold">03</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Jogada Gravada</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Botões na beira do gramado e IA para recortar os gols mais bonitos em alta definição.</p>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center font-label-numeric font-bold">04</span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Pós-Jogo Garantido</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Churrasqueira pronta, chopp Brahma e Heineken na temperatura certa e telões esportivos.</p>
        </div>
      </div>
    </section>
  );
}
