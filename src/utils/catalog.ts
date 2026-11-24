import type { ProductItem, SectionId, SubCategory } from '../data/catalog';

export type SortMode = 'featured' | 'price-asc' | 'price-desc';

export interface BagItem {
  product: ProductItem;
  quantity: number;
}

export function parsePriceARS(priceLabel: string): number {
  const digits = priceLabel.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function formatPriceARS(amount: number): string {
  const rounded = Math.round(amount);
  return '$' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function calculateDepositSplit(totalARS: number): {
  total: number;
  deposit: number;
  balance: number;
} {
  const safeTotal = Math.max(0, Math.round(totalARS));
  const deposit = Math.round(safeTotal * 0.5);
  const balance = safeTotal - deposit;
  return { total: safeTotal, deposit, balance };
}

export function buildWhatsAppProductUrl(
  phone: string,
  name: string,
  price: string
): string {
  const message = `Hola! Quiero encargar: ${name} (${price})`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppWholesaleUrl(phone: string): string {
  const message = 'Hola! Quiero consultar por compra mayorista';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppBagUrl(phone: string, items: BagItem[]): string {
  if (items.length === 0) {
    return `https://wa.me/${phone}`;
  }
  const lines = items.map(({ product, quantity }) => {
    const unit = parsePriceARS(product.price);
    const sub = formatPriceARS(unit * quantity);
    return `- ${quantity}x ${product.name} (${product.size || 'Talle único'}) — ${sub}`;
  });
  const total = calculateBagTotal(items);
  const { deposit, balance } = calculateDepositSplit(total);
  const message = [
    'Hola! Quiero hacer este pedido en MonarkBA:',
    ...lines,
    `Total: ${formatPriceARS(total)}`,
    `Seña 50%: ${formatPriceARS(deposit)} · Saldo contra entrega: ${formatPriceARS(balance)}`,
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function calculateBagTotal(items: BagItem[]): number {
  return items.reduce(
    (sum, item) => sum + parsePriceARS(item.product.price) * item.quantity,
    0
  );
}

export function calculateBagCount(items: BagItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function filterAndSortProducts(
  products: ProductItem[],
  options: {
    subCategory?: SubCategory;
    query?: string;
    sort?: SortMode;
  }
): ProductItem[] {
  const { subCategory = 'all', query = '', sort = 'featured' } = options;
  const normalizedQuery = normalizeText(query);

  const filtered = products.filter((item) => {
    if (subCategory !== 'all' && item.subCategory !== subCategory) {
      return false;
    }
    if (normalizedQuery) {
      const hay = normalizeText(`${item.name} ${item.size} ${item.subCategory}`);
      if (!hay.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  if (sort === 'featured') {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    const pa = parsePriceARS(a.price);
    const pb = parsePriceARS(b.price);
    return sort === 'price-asc' ? pa - pb : pb - pa;
  });
}

export function resolveSectionFromHash(hash: string): SectionId | null {
  const clean = hash.replace(/^#/, '').trim().toLowerCase();
  if (clean === 'catalogo' || clean === 'accesorios' || clean === 'liquidacion') {
    return clean;
  }
  return null;
}

export function getWholesaleProgress(totalARS: number, minimumARS = 50000): {
  qualified: boolean;
  remaining: number;
  percentage: number;
} {
  const safeTotal = Math.max(0, totalARS);
  const remaining = Math.max(0, minimumARS - safeTotal);
  const percentage = Math.min(100, Math.round((safeTotal / minimumARS) * 100));
  return {
    qualified: safeTotal >= minimumARS,
    remaining,
    percentage,
  };
}
