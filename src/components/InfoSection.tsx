import { ArrowUpRight, Instagram, MessageCircle } from 'lucide-react';
import { BRAND_CONFIG, INFO_CONTENT } from '../data/catalog';
import { buildWhatsAppWholesaleUrl } from '../utils/catalog';

export function InfoSection() {
  const wholesaleUrl = buildWhatsAppWholesaleUrl(BRAND_CONFIG.phone);

  return (
    <section
      id="info"
      aria-label="Información de pedidos, mayorista y contactos"
      className="scroll-mt-16 border-t border-white/[0.1] bg-[#07070B]/86"
    >
      <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Editorial Visual */}
          <div className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-[#121216] lg:col-span-5 min-h-[260px] sm:min-h-[340px]">
            <img
              src="/src/assets/images/monark_jewelry_atelier_1795492385409.jpg"
              alt="Selección de joyería MonarkBA en acero y cromo"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090B]/85 via-[#09090B]/20 to-transparent"
            />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs font-medium tracking-[0.1em] text-white/90">
                Pedidos por encargo · Envío a todo el país
              </p>
            </div>
          </div>

          {/* Right Info & Wholesale Columns */}
          <div className="flex flex-col justify-between gap-10 lg:col-span-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#FF85B8]">
                {INFO_CONTENT.title}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                Cómo comprar en MonarkBA
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-8 border-t border-white/[0.1] pt-8 md:grid-cols-2">
                {/* Order terms */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {INFO_CONTENT.order.title}
                  </h3>
                  {INFO_CONTENT.order.paragraphs.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-sm leading-relaxed text-[#E4E0E8]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Wholesale info */}
                <div id="mayorista" className="flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {INFO_CONTENT.wholesale.title}
                    </h3>
                    {INFO_CONTENT.wholesale.paragraphs.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm leading-relaxed text-[#E4E0E8]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div>
                    <a
                      href={wholesaleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-[#E11D62] px-5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-[background-color,transform] duration-150 hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>{INFO_CONTENT.wholesale.ctaLabel}</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="border-t border-white/[0.1] pt-8">
              <h3 className="text-xs font-semibold tracking-[0.12em] text-[#D8D4DF]">
                {INFO_CONTENT.contact.title}
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href={BRAND_CONFIG.whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${INFO_CONTENT.contact.whatsappValue}`}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.1] bg-[#121218] p-4 transition-colors duration-150 hover:border-white/25 hover:bg-[#17171F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-[#D0CCD6]">
                        {INFO_CONTENT.contact.whatsappLabel}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {INFO_CONTENT.contact.whatsappValue}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-[#D0CCD6] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={BRAND_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram ${INFO_CONTENT.contact.instagramValue}`}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.1] bg-[#121218] p-4 transition-colors duration-150 hover:border-white/25 hover:bg-[#17171F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E11D62]/20 text-[#FF7EB3]">
                      <Instagram className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-[#D0CCD6]">
                        {INFO_CONTENT.contact.instagramLabel}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {INFO_CONTENT.contact.instagramValue}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-[#D0CCD6] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
