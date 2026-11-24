import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_CONFIG, CATALOG_SECTIONS, type SectionId } from '../data/catalog';

interface NavbarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onScrollToInfo: () => void;
  bagCount: number;
  onOpenBag: () => void;
}

export function Navbar({
  activeSection,
  onSelectSection,
  onScrollToInfo,
  bagCount,
  onOpenBag,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSectionClick = (id: SectionId) => {
    onSelectSection(id);
    setMobileOpen(false);
  };

  const handleInfoClick = () => {
    onScrollToInfo();
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07070A]/94">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-10">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#catalogo"
          onClick={(e) => {
            e.preventDefault();
            handleSectionClick('catalogo');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-lg font-semibold tracking-[0.14em] text-[#F5F4F0] whitespace-nowrap shrink-0 transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm"
        >
          {BRAND_CONFIG.name}
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          {CATALOG_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionClick(section.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm ${
                  isActive ? 'text-white' : 'text-[#D8D4DF] hover:text-white'
                }`}
              >
                {section.navLabel}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#E11D62]"
                  />
                )}
              </a>
            );
          })}
          <a
            href="#info"
            onClick={(e) => {
              e.preventDefault();
              handleInfoClick();
            }}
            className="relative py-1 text-[#D8D4DF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm"
          >
            Info
          </a>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Abrir pedido, ${bagCount} productos`}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#E11D62] px-4 text-xs font-semibold tracking-wide text-white whitespace-nowrap shrink-0 transition-[background-color,transform] duration-150 ease-out hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pedido</span>
            <span className="tabular-nums font-mono text-[11px] opacity-90">
              ({bagCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-[#F5F4F0] md:hidden transition-colors duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label="Menú móvil"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.08] bg-[#0F0F12] px-4 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {CATALOG_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSectionClick(section.id);
                    }}
                    className={`flex min-h-[44px] items-center justify-between rounded-md px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/[0.06] text-[#F5F4F0]'
                        : 'text-[#9A9893] hover:bg-white/[0.04] hover:text-[#F5F4F0]'
                    }`}
                  >
                    <span>{section.navLabel}</span>
                    <span className="tabular-nums font-mono text-xs text-[#9A9893]">
                      {section.products.length}
                    </span>
                  </a>
                );
              })}
              <a
                href="#info"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoClick();
                }}
                className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-[#9A9893] transition-colors hover:bg-white/[0.04] hover:text-[#F5F4F0]"
              >
                Info, pedidos y mayorista
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
