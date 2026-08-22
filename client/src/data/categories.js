const toShop = (department, category, type = 'cakes') => {
  const params = new URLSearchParams({ department });
  if (category) params.set('category', category);
  return `/${type === 'paties' ? 'paties' : 'cakes'}?${params.toString()}`;
};

export const shopCategories = [
  { key: 'cakes', label: 'Cakes', to: toShop('cakes'), items: ['Birthday', 'Chocolate', 'Wedding', 'Anniversary', 'Kids', 'Custom'] },
  { key: 'pastries', label: 'Pastries', to: toShop('pastries', null, 'paties'), items: ['Chocolate', 'Vanilla', 'Fruit', 'Red Velvet'] },
  { key: 'cupcakes', label: 'Cupcakes', to: toShop('cupcakes'), items: ['Chocolate', 'Vanilla', 'Red Velvet', 'Custom'] },
  { key: 'cookies', label: 'Cookies', to: toShop('cookies'), items: ['Chocolate Chip', 'Butter', 'Oatmeal', 'Almond'] },
  { key: 'donuts', label: 'Donuts', to: toShop('donuts'), items: ['Chocolate', 'Glazed', 'Filled', 'Sprinkle'] },
  { key: 'brownies', label: 'Brownies', to: toShop('brownies'), items: ['Classic Chocolate', 'Fudge', 'Nutella', 'Walnut'] },
  { key: 'breads', label: 'Breads', to: toShop('breads'), items: ['White Bread', 'Brown Bread', 'Garlic Bread', 'Buns'] },
  { key: 'savory', label: 'Savory', to: toShop('savory', null, 'paties'), items: ['Chicken Patties', 'Samosa', 'Spring Rolls', 'Chicken Sandwich'] },
];

export const subCategoryLink = (group, item) => {
  if (group.key === 'cakes' && item === 'Custom') return '/custom-cake';
  const type = group.key === 'pastries' || group.key === 'savory' ? 'paties' : 'cakes';
  const category = group.key === 'cakes' ? `${item} Cakes` : item;
  return toShop(group.key, category, type);
};
