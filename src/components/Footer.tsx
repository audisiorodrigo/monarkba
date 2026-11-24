import { BRAND_CONFIG, CATALOG_SECTIONS, type SectionId } from '../data/catalog';

interface FooterProps {
  onSelectSection: (section: SectionId) => void;
  onScrollToInfo: () => void;
}

export function Footer({ onSelectSection, onScrollToInfo }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07070A]/80">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex flex-col gap-1">
          <span className="font-display text-sm font-semibold tracking-[0.14em] text-[#F5F4F0]">
            {BRAND_CONFIG.name}
          </span>
          <span className="text-xs text-[#9A9893]">
            {BRAND_CONFIG.footer} · {BRAND_CONFIG.tagline}
          </span>
        </div>

        <nav
          aria-label="Enlaces del pie de página"
          className="flex flex-wrap items-center gap-6 text-xs text-[#9A9893]"
        >
          {CATALOG_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectSection(section.id);
              }}
              className="transition-colors hover:text-[#F5F4F0]"
            >
              {section.navLabel}
            </a>
          ))}
          <a
            href="#info"
            onClick={(e) => {
              e.preventDefault();
              onScrollToInfo();
            }}
            className="transition-colors hover:text-[#F5F4F0]"
          >
            Info
          </a>
          <a
            href={BRAND_CONFIG.whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#F5F4F0]"
          >
            WhatsApp
          </a>
          <a
            href={BRAND_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#F5F4F0]"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
