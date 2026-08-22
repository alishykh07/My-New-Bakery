const categoryName = product =>
  typeof product.category === 'string' ? product.category : product.category?.name || '';

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/gi, ' ')
  .trim()
  .toLowerCase();

const typeKeywords = type => {
  if (type === 'cakes') return ['cake', 'cakes', 'bakery'];
  if (type === 'paties') return ['patie', 'paties', 'patty', 'patties', 'pastry', 'pastries', 'savory', 'savoury'];
  return [type];
};

export const productSearchText = product => normalize([
  product.name,
  product.slug,
  categoryName(product),
  product.category?.slug,
  product.category?.description,
  product.type,
  product.description,
  ...(product.flavors || []),
  ...(product.sizes || []),
  ...typeKeywords(product.type),
].join(' '));

export const matchesProductSearch = (product, query) => {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return true;
  const searchableText = productSearchText(product);
  return terms.every(term => searchableText.includes(term));
};

export const matchesProductCategory = (product, category) =>
  !category || normalize(categoryName(product)) === normalize(category);
