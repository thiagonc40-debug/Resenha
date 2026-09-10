export function Hero() {
  return (
    <section className="relative rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl overflow-hidden shadow-xl mb-space-xl">
      <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[320px] text-primary">sports_soccer</span>
      </div>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-primary/15 text-primary text-body-sm font-label-badge mb-space-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            RESERVAS EM TEMPO REAL &bull; TEMPORADA 2025
          </div>
          <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight leading-tight">
            Reserve seu campo na <span className="text-primary underline decoration-primary/40 decoration-4">Resenha Society</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs max-w-xl">
            Grama sintética padrão internacional FIFA, iluminação LED com taxa zero de sombra, replay instantâneo por IA e resenha completa com chopp gelado.
          </p>
          <div className="flex flex-wrap gap-space-xs mt-space-md">
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container text-body-sm font-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">grass</span> Monofilamento 52mm FIFA
            </span>
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container text-body-sm font-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">light_mode</span> LED 600 Lux Pro
            </span>
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container text-body-sm font-body-sm text-secondary">
              <span className="material-symbols-outlined text-secondary text-[18px]">sports_bar</span> Bar & Churrasqueira
            </span>
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container text-body-sm font-body-sm text-tertiary">
              <span className="material-symbols-outlined text-tertiary text-[18px]">videocam</span> Gravação de Gols c/ IA
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-sm bg-surface-container-lowest/80 p-space-md rounded-xl backdrop-blur-md min-w-[280px]">
          <div className="p-space-sm rounded-lg bg-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">Hoje no Complexo</span>
            <span className="font-headline-md text-headline-md text-primary font-label-numeric">18 Jogos</span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">86% das vagas ocupadas</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">Atendimento</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              <span className="font-headline-sm text-headline-sm text-primary font-label-numeric">(47) 99113-9748</span>
            </div>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Recepção & Eventos</span>
          </div>
          <div className="col-span-2 p-space-xs bg-primary/10 rounded-lg flex items-center justify-between px-space-sm">
            <span className="text-body-sm font-body-sm text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">bolt</span> Pix split ativado para times
            </span>
            <span className="text-body-sm font-label-numeric text-primary font-bold">100% grátis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
