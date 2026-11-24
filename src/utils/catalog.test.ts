import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppBagUrl,
  buildWhatsAppProductUrl,
  buildWhatsAppWholesaleUrl,
  calculateBagCount,
  calculateBagTotal,
  calculateDepositSplit,
  filterAndSortProducts,
  formatPriceARS,
  getWholesaleProgress,
  parsePriceARS,
  resolveSectionFromHash,
} from './catalog';
import { BRAND_CONFIG, CATALOG_SECTIONS } from '../data/catalog';

test('parsePriceARS parses Argentine peso strings cleanly', () => {
  assert.equal(parsePriceARS('$15.500'), 15500);
  assert.equal(parsePriceARS('$8.454'), 8454);
  assert.equal(parsePriceARS('$21.000'), 21000);
  assert.equal(parsePriceARS(''), 0);
});

test('formatPriceARS formats numbers with dot thousand separators', () => {
  assert.equal(formatPriceARS(15500), '$15.500');
  assert.equal(formatPriceARS(50000), '$50.000');
  assert.equal(formatPriceARS(9500), '$9.500');
});

test('calculateDepositSplit computes 50% seña and remaining balance', () => {
  assert.deepEqual(calculateDepositSplit(15500), {
    total: 15500,
    deposit: 7750,
    balance: 7750,
  });
  assert.deepEqual(calculateDepositSplit(8455), {
    total: 8455,
    deposit: 4228,
    balance: 4227,
  });
});

test('WhatsApp URLs preserve exact phone and message contracts', () => {
  const prodUrl = buildWhatsAppProductUrl(
    BRAND_CONFIG.phone,
    'Body Strass',
    '$15.500'
  );
  assert.equal(
    prodUrl,
    'https://wa.me/5491130201937?text=Hola!%20Quiero%20encargar%3A%20Body%20Strass%20(%2415.500)'
  );

  const wholesaleUrl = buildWhatsAppWholesaleUrl(BRAND_CONFIG.phone);
  assert.equal(
    wholesaleUrl,
    'https://wa.me/5491130201937?text=Hola!%20Quiero%20consultar%20por%20compra%20mayorista'
  );
});

test('bag totals, counts, wholesale threshold, and bag WhatsApp URL work accurately', () => {
  const indumentaria = CATALOG_SECTIONS[0].products;
  const items = [
    { product: indumentaria[0], quantity: 2 }, // 2 * 15500 = 31000
    { product: indumentaria[15], quantity: 1 }, // 21000
  ];
  assert.equal(calculateBagCount(items), 3);
  assert.equal(calculateBagTotal(items), 52000);

  const progress = getWholesaleProgress(52000, BRAND_CONFIG.wholesaleMinimumARS);
  assert.equal(progress.qualified, true);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.percentage, 100);

  const bagUrl = buildWhatsAppBagUrl(BRAND_CONFIG.phone, items);
  assert.ok(bagUrl.startsWith('https://wa.me/5491130201937?text='));
  assert.ok(decodeURIComponent(bagUrl).includes('Body Strass'));
  assert.ok(decodeURIComponent(bagUrl).includes('Set Angel'));
  assert.ok(decodeURIComponent(bagUrl).includes('$52.000'));
});

test('filterAndSortProducts handles subcategory, accent-insensitive search, and price sorting', () => {
  const indumentaria = CATALOG_SECTIONS[0].products;
  const angelMatches = filterAndSortProducts(indumentaria, { query: 'angel' });
  assert.equal(angelMatches.length, 2); // Body Ángel + Set Angel

  const sortedAsc = filterAndSortProducts(indumentaria, { sort: 'price-asc' });
  assert.equal(parsePriceARS(sortedAsc[0].price), 9500);
  assert.equal(parsePriceARS(sortedAsc[sortedAsc.length - 1].price), 21000);

  const joyeria = CATALOG_SECTIONS[1].products;
  const pulseras = filterAndSortProducts(joyeria, { subCategory: 'pulseras' });
  assert.equal(pulseras.length, 13);
  const collares = filterAndSortProducts(joyeria, { subCategory: 'collares' });
  assert.equal(collares.length, 24);
});

test('resolveSectionFromHash maps original hash routes safely', () => {
  assert.equal(resolveSectionFromHash('#catalogo'), 'catalogo');
  assert.equal(resolveSectionFromHash('#accesorios'), 'accesorios');
  assert.equal(resolveSectionFromHash('#liquidacion'), 'liquidacion');
  assert.equal(resolveSectionFromHash('#info'), null);
  assert.equal(resolveSectionFromHash(''), null);
});
