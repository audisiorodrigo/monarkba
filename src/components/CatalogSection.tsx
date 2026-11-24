import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  CATALOG_SECTIONS,
  type ProductItem,
  type SectionId,
  type SubCategory,
} from '../data/catalog';
import { filterAndSortProducts, type SortMode } from '../utils/catalog';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onInspectProduct: (product: ProductItem) => void;
  onAddToBag: (product: ProductItem) => void;
}

const SUB_FILTERS: Record<
  SectionId,
  Array<{ id: SubCategory; label: string }>
> = {
  catalogo: [
    { id: 'all', label: 'Todo Indumentaria' },
    { id: 'bodys', label: 'Bodys' },
    { id: 'sets', label: 'Sets y Conjuntos' },
    { id: 'tops', label: 'Musculosas y Tops' },
  ],
  accesorios: [
    { id: 'all', label: 'Toda Joyería' },
    { id: 'collares', label: 'Collares y Dijes' },
    { id: 'pulseras', label: 'Pulseras' },
  ],
  liquidacion: [],
};

export function CatalogSection({
  activeSection,
  onSelectSection,
  onInspectProduct,
  onAddToBag,
}: CatalogSectionProps) {
  const [subCategoryBySection, setSubCategoryBySection] = useState<
    Record<SectionId, SubCategory>
  >({
    catalogo: 'all',
    accesorios: 'all',
    liquidacion: 'all',
  });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('featured');

  const currentSection = useMemo(
    () =>
      CATALOG_SECTIONS.find((s) => s.id === activeSection) ??
      CATALOG_SECTIONS[0],
    [activeSection]
  );

  const activeSubCategory = subCategoryBySection[activeSection] ?? 'all';
  const subFilters = SUB_FILTERS[activeSection];

  const visibleProducts = useMemo(
    () =>
      filterAndSortProducts(currentSection.products, {
        subCategory: activeSubCategory,
        query,
        sort,
      }),
    [currentSection.products, activeSubCategory, query, sort]
  );

  const handleSectionChange = (id: SectionId) => {
    setQuery('');
    onSelectSection(id);
  };

  return (
    <section
      id="catalogo-workspace"
      aria-label="Catálogo de productos"
      className="mx-auto max-w-[1360px] scroll-mt-16 px-4 py-12 sm:px-6 lg:px-10 lg:py-16"
    >
      {/* Section Header, Primary Tabs & Filter Toolbar on Clean Dark Scrim */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#07070B]/80 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#FF85B8]">
              Catálogo MonarkBA
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {currentSection.title}
            </h2>
            <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-[#E4E0E8]">
              {currentSection.description}
            </p>
          </div>

          {/* Category Segmented Tabs */}
          <div
            role="tablist"
            aria-label="Categorías del catálogo"
            className="inline-flex w-full overflow-x-auto rounded-lg border border-white/[0.1] bg-[#111116] p-1 sm:w-auto"
          >
            {CATALOG_SECTIONS.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSectionChange(section.id)}
                  className={`relative flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 sm:flex-initial cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] ${
                    isActive
                      ? 'text-white'
                      : 'text-[#DCD8E0] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="catalog-tab-pill"
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-md bg-[#E11D62]"
                    />
                  )}
                  <span className="relative z-10">{section.navLabel}</span>
                  <span
                    className={`relative z-10 tabular-nums font-mono text-[11px] ${
                      isActive ? 'text-white/95' : 'text-[#C6C1CB]'
                    }`}
                  >
                    {section.products.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-filters, Search & Sort Toolbar */}
        {currentSection.products.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Sub-category filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {subFilters.map((f) => {
                const selected = activeSubCategory === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setSubCategoryBySection((prev) => ({
                        ...prev,
                        [activeSection]: f.id,
                      }))
                    }
                    className={`inline-flex h-10 items-center rounded-md px-3.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D62] ${
                      selected
                        ? 'bg-white text-[#09090B] font-semibold'
                        : 'border border-white/[0.12] bg-[#14141A] text-[#E4E0E8] hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C8C4CE]"
                  aria-hidden="true"
                />
                <label htmlFor="catalog-search" className="sr-only">
                  Buscar en {currentSection.title}
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar en ${currentSection.title.toLowerCase()}...`}
                  className="h-10 w-full rounded-md border border-white/[0.12] bg-[#14141A] pl-9 pr-8 text-xs text-white placeholder:text-[#A8A3AE] focus:border-[#E11D62] focus:outline-none focus:ring-1 focus:ring-[#E11D62]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-[#C8C4CE] hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="catalog-sort" className="sr-only">
                  Ordenar productos
                </label>
                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="h-10 rounded-md border border-white/[0.12] bg-[#14141A] px-3 text-xs font-medium text-white focus:border-[#E11D62] focus:outline-none focus:ring-1 focus:ring-[#E11D62] cursor-pointer"
                >
                  <option value="featured">Orden destacado</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {currentSection.products.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#D6D2DC]">
            <span className="tabular-nums font-medium">
              Mostrando {visibleProducts.length} de {currentSection.products.length} piezas
            </span>
            <span>Deslizá o usá las flechas en cada foto para ver más ángulos</span>
          </div>
        )}
      </div>

      {/* Product Grid or Empty State */}
      {visibleProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visibleProducts.map((product) => (
            <div key={product.id} className="contents">
              {product.heading &&
                activeSubCategory === 'all' &&
                !query &&
                sort === 'featured' && (
                  <div className="col-span-full mt-6 flex items-baseline justify-between rounded-xl border border-white/[0.08] bg-[#07070B]/78 px-5 py-4">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
                      {product.heading}
                    </h3>
                    <span className="tabular-nums font-mono text-xs font-medium text-[#E0DCE5]">
                      13 piezas
                    </span>
                  </div>
                )}
              <ProductCard
                product={product}
                onInspect={onInspectProduct}
                onAddToBag={onAddToBag}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#111114] px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-[#F5F4F0]">
            {currentSection.products.length === 0
              ? currentSection.title
              : 'Sin resultados para tu búsqueda'}
          </p>
          <p className="mt-2 max-w-md text-sm text-[#9A9893]">
            {currentSection.products.length === 0
              ? currentSection.emptyMessage
              : `No encontramos piezas que coincidan con "${query}". Probá con otro término o limpiá los filtros.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {currentSection.products.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSectionChange('catalogo')}
                  className="inline-flex h-10 items-center rounded-md bg-[#E11D62] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#C81655] cursor-pointer"
                >
                  Ver Indumentaria
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionChange('accesorios')}
                  className="inline-flex h-10 items-center rounded-md border border-white/[0.12] px-5 text-xs font-medium text-[#F5F4F0] transition-colors hover:bg-white/[0.05] cursor-pointer"
                >
                  Ver Joyería
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSubCategoryBySection((prev) => ({
                    ...prev,
                    [activeSection]: 'all',
                  }));
                }}
                className="inline-flex h-10 items-center rounded-md bg-[#E11D62] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#C81655] cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
