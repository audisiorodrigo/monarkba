/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { MotionConfig } from 'motion/react';
import type { ProductItem, SectionId } from './data/catalog';
import {
  calculateBagCount,
  resolveSectionFromHash,
  type BagItem,
} from './utils/catalog';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { ProductModal } from './components/ProductModal';
import { OrderBagDrawer } from './components/OrderBagDrawer';
import { InfoSection } from './components/InfoSection';
import { Footer } from './components/Footer';
import { PinkLedBackdrop } from './components/PinkLedBackdrop';

const BAG_STORAGE_KEY = 'monarkba_order_bag_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (typeof window === 'undefined') return 'catalogo';
    return resolveSectionFromHash(window.location.hash) ?? 'catalogo';
  });

  const [inspectedProduct, setInspectedProduct] = useState<ProductItem | null>(
    null
  );
  const [bagOpen, setBagOpen] = useState(false);

  const [bagItems, setBagItems] = useState<BagItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [bagItems]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash === '#info') {
        const el = document.getElementById('info');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const next = resolveSectionFromHash(hash);
      if (next) {
        setActiveSection(next);
      }
    };

    window.addEventListener('hashchange', syncFromHash);
    if (window.location.hash === '#info') {
      window.setTimeout(() => {
        document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectSection = useCallback((section: SectionId) => {
    setActiveSection(section);
    if (window.location.hash !== `#${section}`) {
      window.history.replaceState(null, '', `#${section}`);
    }
    const workspace = document.getElementById('catalogo-workspace');
    if (workspace) {
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleScrollToInfo = useCallback(() => {
    const el = document.getElementById('info');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#info');
    }
  }, []);

  const handleScrollToWholesale = useCallback(() => {
    const el = document.getElementById('mayorista');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleAddToBag = useCallback((product: ProductItem) => {
    setBagItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setBagItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleClearBag = useCallback(() => {
    setBagItems([]);
  }, []);

  const bagCount = calculateBagCount(bagItems);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-[#060609] text-[#F5F4F0]">
        <PinkLedBackdrop />

        <div className="relative z-10">
          <Navbar
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onScrollToInfo={handleScrollToInfo}
            bagCount={bagCount}
            onOpenBag={() => setBagOpen(true)}
          />

          <main>
            <Hero
              onExploreCatalog={() => handleSelectSection('catalogo')}
              onOpenJewelry={() => handleSelectSection('accesorios')}
              onScrollToWholesale={handleScrollToWholesale}
            />

            <CatalogSection
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              onInspectProduct={setInspectedProduct}
              onAddToBag={handleAddToBag}
            />

            <InfoSection />
          </main>

          <Footer
            onSelectSection={handleSelectSection}
            onScrollToInfo={handleScrollToInfo}
          />
        </div>

        <ProductModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onAddToBag={handleAddToBag}
        />

        <OrderBagDrawer
          open={bagOpen}
          items={bagItems}
          onClose={() => setBagOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearBag={handleClearBag}
          onBrowseCatalog={() => handleSelectSection('catalogo')}
        />
      </div>
    </MotionConfig>
  );
}
