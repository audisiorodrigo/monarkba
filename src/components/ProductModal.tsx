import { useState, useEffect } from 'react';
import { X, Plus, ArrowUpRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_CONFIG, type ProductItem } from '../data/catalog';
import {
  buildWhatsAppProductUrl,
  calculateDepositSplit,
  formatPriceARS,
  parsePriceARS,
} from '../utils/catalog';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToBag: (product: ProductItem) => void;
}

export function ProductModal({
  product,
  onClose,
  onAddToBag,
}: ProductModalProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setPhotoIdx(0);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  const validPhotos = product
    ? product.photos.filter((p): p is string => Boolean(p))
    : [];

  const priceNum = product ? parsePriceARS(product.price) : 0;
  const { deposit, balance } = calculateDepositSplit(priceNum);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-xl border border-white/[0.12] bg-[#111114] shadow-2xl md:grid-cols-12"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista rápida"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#09090B]/80 text-[#F5F4F0] border border-white/10 transition-colors hover:bg-[#1E1E24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Left Gallery */}
            <div className="flex flex-col bg-[#18181D] md:col-span-6">
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={validPhotos[photoIdx] ?? validPhotos[0] ?? ''}
                  alt={`${product.name} — vista ${photoIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {validPhotos.length > 1 && (
                <div className="flex items-center gap-2 border-t border-white/[0.08] p-3">
                  {validPhotos.map((src, idx) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPhotoIdx(idx)}
                      aria-label={`Ver foto ${idx + 1} de ${product.name}`}
                      className={`h-14 w-12 overflow-hidden rounded-md border transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] ${
                        photoIdx === idx
                          ? 'border-[#E11D62] opacity-100'
                          : 'border-white/10 opacity-55 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Purchase Module */}
            <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-6">
              <div>
                <p className="text-xs font-medium text-[#9A9893]">
                  {product.sectionId === 'catalogo' ? 'Indumentaria' : 'Joyería'}
                  {' · '}
                  {product.size || 'Talle único'}
                </p>

                <h2
                  id="product-modal-title"
                  className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F5F4F0]"
                >
                  {product.name}
                </h2>

                <p className="mt-3 tabular-nums font-mono text-xl font-medium text-[#F5F4F0]">
                  {product.price}
                </p>

                <div className="mt-6 space-y-2.5 border-y border-white/[0.08] py-4 text-xs">
                  <div className="flex items-center justify-between text-[#B4B2AC]">
                    <span>Seña para reservar (50%)</span>
                    <span className="tabular-nums font-mono text-[#F5F4F0]">
                      {formatPriceARS(deposit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#B4B2AC]">
                    <span>Saldo contra entrega</span>
                    <span className="tabular-nums font-mono text-[#F5F4F0]">
                      {formatPriceARS(balance)}
                    </span>
                  </div>
                  <p className="pt-1 text-[12px] leading-relaxed text-[#9A9893]">
                    Pedido por encargo. Envío por Correo Argentino o entrega en punto de encuentro coordinado.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={buildWhatsAppProductUrl(
                    BRAND_CONFIG.phone,
                    product.name,
                    product.price
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#E11D62] px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Comprar por WhatsApp</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onAddToBag(product);
                    setAdded(true);
                  }}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.14] bg-transparent px-5 text-sm font-medium text-[#F5F4F0] transition-[background-color,border-color,transform] duration-150 hover:border-white/30 hover:bg-white/[0.05] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 text-[#E11D62]" aria-hidden="true" />
                      <span>Agregado a tu pedido</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Agregar al pedido</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
