import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export function Header() {
  const { settings, courts } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeCourtsCount = courts.filter(c => c.isActive).length;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <div className="h-20 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <Link className="flex items-center gap-space-sm group" to="/">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary transition-transform group-hover:scale-105 overflow-hidden">
              <img 
                src="/logo.jpeg" 
                alt="Resenha Society Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.removeAttribute('style');
                }}
              />
              <span className="material-symbols-outlined text-[24px]" style={{ display: 'none' }}>sports_soccer</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface group-hover:text-primary transition-colors">{settings.appName}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse"></span> Aberto até {settings.closeTime} &bull; {activeCourtsCount} Quadra(s)
              </span>
            </div>
          </Link>
          <nav className="hidden xl:flex items-center gap-space-lg ml-space-md">
            <a className="transition-colors text-primary font-bold hover:text-primary/80" href="#reservas">Agendar Quadras</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#como-funciona">Como Funciona</a>
          </nav>
        </div>
        <div className="flex items-center gap-space-sm">
          <Link className="hidden sm:flex items-center gap-space-2xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-body-sm font-body-sm" to="/admin/login">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>Área Admin</span>
          </Link>
          <div className="h-6 w-[1px] bg-surface-container-highest hidden sm:block"></div>
          <button className="hidden sm:flex items-center gap-space-sm p-space-2xs pr-space-sm rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1WsyYcmdxdmWHfxeWR5_WzBwSOdAsC-oHcxBCt3-bIf-FtmqfsZ68AmjX5seVz0k7q14oFWe1umEtE79W2B1az9OxGRRrIrPTQNy_inZuATr7fGV-TNmaNWMw0Ac1_sPQkkJtoEx5Plnl_ks3glX__1Ajw6_X1QeV1PuhX19BZqFCAIGgWcPhRKPLmtTMx1iu2JWzmDYyaDLUShK2GPK68QAqECpMKpBPCn48U_qs6h-0CiPzCRU_olEyMWmBmlYT448sCIpG8LatM" />
            <div className="hidden md:flex flex-col text-left">
              <span className="font-body-sm text-body-sm font-bold text-on-surface leading-tight">Artilheiro VIP</span>
              <span className="text-[10px] text-secondary leading-tight font-label-badge">NÍVEL OURO</span>
            </div>
          </button>
          
          <button 
            className="xl:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-[24px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-t border-surface-container-highest shadow-xl absolute w-full left-0">
          <nav className="flex flex-col p-space-md gap-4 max-w-container-max mx-auto px-gutter-mobile">
            <a 
              className="text-on-surface font-bold text-headline-sm hover:text-primary transition-colors flex items-center gap-3 bg-surface-container p-3 rounded-xl" 
              href="#reservas"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Agendar Quadras
            </a>
            <a 
              className="text-on-surface-variant text-body-lg hover:text-on-surface transition-colors flex items-center gap-3 p-3" 
              href="#como-funciona"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined">help</span>
              Como Funciona
            </a>
            <div className="h-[1px] w-full bg-surface-container-highest my-2"></div>
            <Link 
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface text-body-lg p-3" 
              to="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Área Admin
            </Link>
            
            <button className="flex items-center gap-space-sm p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors mt-2">
              <img alt="Profile" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1WsyYcmdxdmWHfxeWR5_WzBwSOdAsC-oHcxBCt3-bIf-FtmqfsZ68AmjX5seVz0k7q14oFWe1umEtE79W2B1az9OxGRRrIrPTQNy_inZuATr7fGV-TNmaNWMw0Ac1_sPQkkJtoEx5Plnl_ks3glX__1Ajw6_X1QeV1PuhX19BZqFCAIGgWcPhRKPLmtTMx1iu2JWzmDYyaDLUShK2GPK68QAqECpMKpBPCn48U_qs6h-0CiPzCRU_olEyMWmBmlYT448sCIpG8LatM" />
              <div className="flex flex-col text-left">
                <span className="font-body-sm text-body-sm font-bold text-on-surface leading-tight">Artilheiro VIP</span>
                <span className="text-[10px] text-secondary leading-tight font-label-badge">NÍVEL OURO</span>
              </div>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
