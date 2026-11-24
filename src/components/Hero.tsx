import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreCatalog: () => void;
  onOpenJewelry: () => void;
  onScrollToWholesale: () => void;
}

export function Hero({
  onExploreCatalog,
  onOpenJewelry,
  onScrollToWholesale,
}: HeroProps) {
  return (
    <section
      aria-label="Presentación MonarkBA"
      className="overflow-x-hidden border-b border-white/[0.08] bg-transparent"
    >
      <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col justify-between lg:col-span-5 lg:py-4"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(6,6,10,0.82)_0%,rgba(6,6,10,0.42)_60%,transparent_85%)]"
            />
            <div>
              <p className="text-xs font-medium tracking-[0.12em] text-[#9A9893]">
                Buenos Aires · Pedidos por encargo
              </p>

              <h1 className="mt-5 font-display text-[clamp(2.5rem,4.5vw,4.15rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-[#F5F4F0] text-balance">
                Tu próxima obsesión.
              </h1>

              <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.65] text-[#B4B2AC]">
                Indumentaria de silueta limpia y joyería en acero y cromo, seleccionadas por encargo en Buenos Aires. Reservá con el 50% de seña y coordiná envío por Correo Argentino o punto de encuentro.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="inline-flex h-11 items-center gap-2.5 rounded-md bg-[#E11D62] px-6 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-[background-color,transform] duration-150 ease-out hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] cursor-pointer"
                >
                  <span>Explorar catálogo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onOpenJewelry}
                  className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#F5F4F0] underline decoration-white/25 underline-offset-4 whitespace-nowrap shrink-0 transition-colors duration-150 hover:decoration-[#E11D62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm cursor-pointer"
                >
                  Ver joyería (37)
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-white/[0.08] pt-6 lg:mt-12">
              <button
                type="button"
                onClick={onScrollToWholesale}
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#9A9893] transition-colors duration-150 hover:text-[#F5F4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm cursor-pointer"
              >
                <span>Compra mayorista disponible desde $50.000</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.div>

          {/* Right Editorial Photography */}
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#121216]/80 min-h-[280px] sm:min-h-[380px] lg:col-span-7 lg:min-h-[480px]">
            <img
              src="/src/assets/images/hero_monark_editorial_1795492384037.jpg"
              alt="Campaña MonarkBA — Bodysuits y cadenas en acero"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060609]/85 via-[#060609]/15 to-transparent"
            />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#F5F4F0]/85">
              <span className="font-medium tracking-[0.08em]">
                Colección Nocturna · Acero &amp; Lycra
              </span>
              <span className="font-mono text-[11px] text-[#B4B2AC]">
                Deslizá para explorar
              </span>
            </div>
          </div>
        </div>

        {/* Full-Width Editorial Service Strip */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-8 sm:grid-cols-3 lg:mt-14">
          <div className="flex flex-col gap-1.5">
            <span className="tabular-nums font-mono text-xs text-[#E11D62]">01</span>
            <h2 className="text-sm font-semibold text-[#F5F4F0]">
              Reserva con 50% de seña
            </h2>
            <p className="text-[13px] leading-relaxed text-[#9A9893]">
              Confirmás tu encargo con el 50% y abonás el saldo restante al recibir tus prendas.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="tabular-nums font-mono text-xs text-[#E11D62]">02</span>
            <h2 className="text-sm font-semibold text-[#F5F4F0]">
              Correo Argentino o entrega
            </h2>
            <p className="text-[13px] leading-relaxed text-[#9A9893]">
              Despachos a todo el país por Correo Argentino o retiro en punto de encuentro coordinado.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="tabular-nums font-mono text-xs text-[#E11D62]">03</span>
            <h2 className="text-sm font-semibold text-[#F5F4F0]">
              Mayorista desde $50.000
            </h2>
            <p className="text-[13px] leading-relaxed text-[#9A9893]">
              Armá tu pedido mayorista o consultanos directo por WhatsApp para listas y stock.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
