export const CATEGORIES = [
  'All',
  'Iced Coffee',
  'Hot Coffee',
  'Frappe - Espresso Based',
  'Frappe - Non Coffee',
  'Classic Milktea',
  'Cheesecake Series',
  'Fruit Soda',
  'Add Ons',
];

export const CATEGORY_COLORS = {
  'Iced Coffee': '#2E86C1',
  'Hot Coffee': '#6F4E37',
  'Frappe - Espresso Based': '#5D6D7E',
  'Frappe - Non Coffee': '#A569BD',
  'Classic Milktea': '#AF7AC5',
  'Cheesecake Series': '#D7BDE2',
  'Fruit Soda': '#16A085',
  'Add Ons': '#F39C12',
};

export const initialProducts = [
  { id: 1,  name: 'Iced Americano',         price: 110, cost: 40, category: 'Iced Coffee',                  emoji: '🧊', stock: 45, lowStock: 10 },
  { id: 2,  name: 'Iced Latte',             price: 130, cost: 50, category: 'Iced Coffee',                  emoji: '🥛', stock: 40, lowStock: 10 },
  { id: 3,  name: 'Iced Caramel Macchiato', price: 145, cost: 60, category: 'Iced Coffee',                  emoji: '🍮', stock: 30, lowStock: 8  },
  { id: 4,  name: 'Iced Mocha',             price: 140, cost: 55, category: 'Iced Coffee',                  emoji: '🍫', stock: 30, lowStock: 8  },

  { id: 5,  name: 'Espresso',               price: 80,  cost: 20, category: 'Hot Coffee',                   emoji: '☕', stock: 50, lowStock: 10 },
  { id: 6,  name: 'Hot Americano',          price: 95,  cost: 30, category: 'Hot Coffee',                   emoji: '🖤', stock: 45, lowStock: 10 },
  { id: 7,  name: 'Hot Latte',              price: 120, cost: 45, category: 'Hot Coffee',                   emoji: '☕', stock: 40, lowStock: 10 },
  { id: 8,  name: 'Cappuccino',             price: 125, cost: 48, category: 'Hot Coffee',                   emoji: '🌫️', stock: 35, lowStock: 8  },

  { id: 9,  name: 'Java Chip Frappe',       price: 170, cost: 70, category: 'Frappe - Espresso Based',     emoji: '🧋', stock: 25, lowStock: 6  },
  { id: 10, name: 'Mocha Espresso Frappe',  price: 175, cost: 72, category: 'Frappe - Espresso Based',     emoji: '🍫', stock: 20, lowStock: 6  },
  { id: 11, name: 'Caramel Espresso Frappe',price: 180, cost: 75, category: 'Frappe - Espresso Based',     emoji: '🍮', stock: 20, lowStock: 6  },

  { id: 12, name: 'Matcha Frappe',          price: 165, cost: 65, category: 'Frappe - Non Coffee',         emoji: '🍵', stock: 20, lowStock: 6  },
  { id: 13, name: 'Choco Frappe',           price: 160, cost: 60, category: 'Frappe - Non Coffee',         emoji: '🍫', stock: 20, lowStock: 6  },
  { id: 14, name: 'Cookies & Cream Frappe', price: 170, cost: 68, category: 'Frappe - Non Coffee',         emoji: '🍪', stock: 18, lowStock: 6  },

  { id: 15, name: 'Wintermelon Milk Tea',   price: 120, cost: 45, category: 'Classic Milktea', emoji: '🧋', stock: 35, lowStock: 8  },
  { id: 16, name: 'Okinawa Milk Tea',       price: 125, cost: 48, category: 'Classic Milktea', emoji: '🧋', stock: 35, lowStock: 8  },
  { id: 17, name: 'Strawberry Cheesecake',  price: 150, cost: 60, category: 'Cheesecake Series', emoji: '🍰', stock: 20, lowStock: 6  },
  { id: 18, name: 'Dark Choco Cheesecake',  price: 155, cost: 62, category: 'Cheesecake Series', emoji: '🍫', stock: 20, lowStock: 6  },

  { id: 19, name: 'Green Apple Soda',       price: 105, cost: 35, category: 'Fruit Soda',                  emoji: '🍏', stock: 25, lowStock: 6  },
  { id: 20, name: 'Blue Lemon Soda',        price: 110, cost: 38, category: 'Fruit Soda',                  emoji: '🫐', stock: 25, lowStock: 6  },
  { id: 21, name: 'Strawberry Soda',        price: 110, cost: 38, category: 'Fruit Soda',                  emoji: '🍓', stock: 25, lowStock: 6  },

  { id: 22, name: 'Pearls',                 price: 20,  cost: 5,  category: 'Add Ons',                     emoji: '⚫', stock: 80, lowStock: 20 },
  { id: 23, name: 'Cheesecake Foam',        price: 25,  cost: 8,  category: 'Add Ons',                     emoji: '🧀', stock: 60, lowStock: 15 },
  { id: 24, name: 'Espresso Shot',          price: 30,  cost: 10, category: 'Add Ons',                     emoji: '☕', stock: 50, lowStock: 10 },
  { id: 25, name: 'Whipped Cream',          price: 20,  cost: 6,  category: 'Add Ons',                     emoji: '🍦', stock: 60, lowStock: 15 },
];
