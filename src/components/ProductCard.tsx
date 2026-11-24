import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG, type ProductItem } from '../data/catalog';
import { buildWhatsAppProductUrl } from '../utils/catalog';

interface ProductCardProps {
  product: ProductItem;
  onInspect: (product: ProductItem) => void;
  onAddToBag: (product: ProductItem) => void;
}

const SUBCATEGORY_LABEL: Record<ProductItem['subCategory'], string> = {
  bodys: 'Body',
  sets: 'Set',
  tops: 'Top',
  collares: 'Collar',
  pulseras: 'Pulsera',
};

export function ProductCard({
  product,
  onInspect,
  onAddToBag,
}: ProductCardProps) {
  const validPhotos = product.photos.filter((p): p is string => Boolean(p));
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const [justAdded, setJustAdded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const hasMultiple = validPhotos.length > 1;
  const whatsappUrl = buildWhatsAppProductUrl(
    BRAND_CONFIG.phone,
    product.name,
    product.price
  );

  const selectPhoto = (index: number) => {
    const bounded = Math.max(0, Math.min(validPhotos.length - 1, index));
    setActivePhotoIdx(bounded);
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        left: bounded * scrollerRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (!scrollerRef.current || scrollerRef.current.clientWidth === 0) return;
    const idx = Math.round(
      scrollerRef.current.scrollLeft / scrollerRef.current.clientWidth
    );
    if (idx !== activePhotoIdx) {
      setActivePhotoIdx(idx);
    }
  };

  const handleAdd = () => {
    onAddToBag(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const categoryLabel = SUBCATEGORY_LABEL[product.subCategory];
  const sizeText = product.size ? product.size : 'Talle único';

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#111114] p-4 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/[0.16]">
      <div>
        {/* Photo Stage */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#18181D]">
          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            tabIndex={0}
            aria-label={`Galería de ${product.name}`}
            className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62]"
          >
            {validPhotos.map((src, idx) => {
              const isBroken = failedSrcs[src];
              return (
                <div
                  key={`${product.id}-ph-${idx}`}
                  className="relative h-full w-full shrink-0 snap-center"
                >
                  {!isBroken ? (
                    <button
                      type="button"
                      onClick={() => onInspect(product)}
                      aria-label={`Ver detalle de ${product.name}`}
                      className="block h-full w-full cursor-pointer focus-visible:outline-none"
                    >
                      <img
                        src={src}
                        alt={`${product.name} — vista ${idx + 1}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedSrcs((prev) => ({ ...prev, [src]: true }))
                        }
                        className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                    </button>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#18181D] to-[#0F0F12] p-6 text-center">
                      <span className="font-display text-sm tracking-[0.14em] text-[#9A9893]">
                        MONARKBA
                      </span>
                      <span className="mt-2 text-xs text-[#6B6965]">
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Photo Navigation Controls (only when 2 photos exist) */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  selectPhoto(activePhotoIdx === 0 ? 1 : 0);
                }}
                aria-label={`Foto anterior de ${product.name}`}
                className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#09090B]/85 text-white transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  selectPhoto(activePhotoIdx === 1 ? 0 : 1);
                }}
                aria-label={`Siguiente foto de ${product.name}`}
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#09090B]/85 text-white transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Hairline progress bar dots */}
              <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center gap-1.5">
                {validPhotos.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-[2px] flex-1 rounded-full transition-colors duration-200 ${
                      idx === activePhotoIdx ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clean Unboxed Metadata (Zero Pills) */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#CFCBC4]">
          <span>{categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{sizeText}</span>
        </div>

        {/* Product Title */}
        <h3 className="mt-1.5">
          <button
            type="button"
            onClick={() => onInspect(product)}
            className="text-left font-display text-base font-semibold leading-snug text-white transition-colors duration-150 hover:text-[#FF7EB3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] rounded-sm cursor-pointer"
          >
            {product.name}
          </button>
        </h3>
      </div>

      {/* Contiguous Price + Purchase Actions */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3.5">
        <span className="tabular-nums font-mono text-[15px] font-semibold text-white">
          {product.price}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Agregar ${product.name} al pedido`}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/[0.12] bg-transparent px-3 text-xs font-medium text-[#F5F4F0] whitespace-nowrap shrink-0 transition-[background-color,border-color,transform] duration-150 hover:border-white/25 hover:bg-white/[0.05] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#E11D62]" aria-hidden="true" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pedido</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${product.name} por WhatsApp`}
            className="inline-flex h-10 items-center gap-1 rounded-md bg-[#E11D62] px-3.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-[background-color,transform] duration-150 hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Comprar</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
