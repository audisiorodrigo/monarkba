import { useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_CONFIG, type ProductItem } from '../data/catalog';
import {
  buildWhatsAppBagUrl,
  calculateBagTotal,
  calculateDepositSplit,
  formatPriceARS,
  getWholesaleProgress,
  type BagItem,
} from '../utils/catalog';

interface OrderBagDrawerProps {
  open: boolean;
  items: BagItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBag: () => void;
  onBrowseCatalog: () => void;
}

export function OrderBagDrawer({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag,
  onBrowseCatalog,
}: OrderBagDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const total = calculateBagTotal(items);
  const { deposit, balance } = calculateDepositSplit(total);
  const wholesale = getWholesaleProgress(total, BRAND_CONFIG.wholesaleMinimumARS);
  const whatsappUrl = buildWhatsAppBagUrl(BRAND_CONFIG.phone, items);

  const getThumbnail = (product: ProductItem) =>
    product.photos.find((p): p is string => Boolean(p)) ?? '';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/[0.1] bg-[#0E0E11] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F5F4F0]">
                  Tu pedido
                </h2>
                <p className="text-xs text-[#9A9893]">
                  Reserva con 50% de seña por encargo
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel de pedido"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-[#F5F4F0] transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#16161B] text-[#9A9893]">
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-4 font-display text-base font-semibold text-[#F5F4F0]">
                    Todavía no agregaste piezas
                  </p>
                  <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#9A9893]">
                    Sumá prendas o joyería a tu pedido para calcular automáticamente tu seña del 50% o enviar todo junto por WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBrowseCatalog();
                    }}
                    className="mt-6 inline-flex h-10 items-center rounded-md bg-[#E11D62] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#C81655] cursor-pointer"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Wholesale Progress Strip */}
                  <div className="rounded-lg border border-white/[0.08] bg-[#141418] p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#F5F4F0]">
                        {wholesale.qualified
                          ? 'Califica para consulta mayorista'
                          : 'Mínimo mayorista ($50.000)'}
                      </span>
                      <span className="tabular-nums font-mono text-[11px] text-[#9A9893]">
                        {wholesale.qualified
                          ? 'Alcanzado'
                          : `Faltan ${formatPriceARS(wholesale.remaining)}`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#E11D62] transition-all duration-300"
                        style={{ width: `${wholesale.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <ul className="divide-y divide-white/[0.08]">
                    {items.map(({ product, quantity }) => (
                      <li
                        key={product.id}
                        className="flex items-start gap-3.5 py-4 first:pt-0"
                      >
                        <img
                          src={getThumbnail(product)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="h-20 w-16 shrink-0 rounded-md bg-[#18181D] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-[#F5F4F0]">
                              {product.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              aria-label={`Quitar ${product.name} del pedido`}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#9A9893] transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-[#9A9893]">
                            {product.size || 'Talle único'}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-md border border-white/[0.1] bg-[#141418]">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, -1)}
                                aria-label={`Reducir cantidad de ${product.name}`}
                                className="flex h-8 w-8 items-center justify-center text-[#B4B2AC] hover:text-white cursor-pointer"
                              >
                                <Minus className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <span className="tabular-nums font-mono w-7 text-center text-xs text-[#F5F4F0]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, 1)}
                                aria-label={`Aumentar cantidad de ${product.name}`}
                                className="flex h-8 w-8 items-center justify-center text-[#B4B2AC] hover:text-white cursor-pointer"
                              >
                                <Plus className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </div>
                            <span className="tabular-nums font-mono text-sm font-medium text-[#F5F4F0]">
                              {product.price}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Checkout Summary */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.08] bg-[#111114] px-6 py-5">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#9A9893]">
                    <span>Total del pedido</span>
                    <span className="tabular-nums font-mono text-sm font-semibold text-[#F5F4F0]">
                      {formatPriceARS(total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#B4B2AC]">
                    <span>Seña para confirmar (50%)</span>
                    <span className="tabular-nums font-mono text-[#E11D62] font-medium">
                      {formatPriceARS(deposit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#9A9893]">
                    <span>Saldo al momento de entrega</span>
                    <span className="tabular-nums font-mono">
                      {formatPriceARS(balance)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#E11D62] px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#C81655] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Enviar pedido por WhatsApp</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={onClearBag}
                    className="inline-flex h-9 w-full items-center justify-center rounded-md text-xs font-medium text-[#9A9893] transition-colors hover:text-[#F5F4F0] cursor-pointer"
                  >
                    Vaciar pedido
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
