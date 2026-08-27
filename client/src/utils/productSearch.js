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

export const matchesProductCategory = (product, category) => {
  const wanted = normalize(category);
  return !wanted || normalize(categoryName(product)) === wanted || normalize(product.category?.slug) === wanted;
};

const departmentKey = value => {
  const key = normalize(value).replaceAll(' ', '');
  if (['pastry', 'pastries', 'patry', 'patries'].includes(key)) return 'pastry';
  if (['patie', 'paties', 'patty', 'patties', 'savory', 'savoury'].includes(key)) return 'patties';
  return key.endsWith('s') ? key.slice(0, -1) : key;
};

export const matchesProductDepartment = (product, department) =>
  !department || departmentKey(product.department || product.category?.department) === departmentKey(department);
