export const CATEGORIES = [
  'All',
  'Iced Coffee',
  'Hot Coffee',
  'Frappe - Espresso Based',
  'Frappe - Non Coffee',
  'Milktea & Cheesecake Series',
  'Fruit Soda',
  'Add Ons',
];

export const CATEGORY_COLORS = {
  'Iced Coffee': '#2E86C1',
  'Hot Coffee': '#6F4E37',
  'Frappe - Espresso Based': '#5D6D7E',
  'Frappe - Non Coffee': '#A569BD',
  'Milktea & Cheesecake Series': '#AF7AC5',
  'Fruit Soda': '#16A085',
  'Add Ons': '#F39C12',
};

export const initialProducts = [
  { id: 1,  name: 'Iced Americano',         price: 110, category: 'Iced Coffee',                  emoji: '🧊', stock: 45, lowStock: 10 },
  { id: 2,  name: 'Iced Latte',             price: 130, category: 'Iced Coffee',                  emoji: '🥛', stock: 40, lowStock: 10 },
  { id: 3,  name: 'Iced Caramel Macchiato', price: 145, category: 'Iced Coffee',                  emoji: '🍮', stock: 30, lowStock: 8  },
  { id: 4,  name: 'Iced Mocha',             price: 140, category: 'Iced Coffee',                  emoji: '🍫', stock: 30, lowStock: 8  },

  { id: 5,  name: 'Espresso',               price: 80,  category: 'Hot Coffee',                   emoji: '☕', stock: 50, lowStock: 10 },
  { id: 6,  name: 'Hot Americano',          price: 95,  category: 'Hot Coffee',                   emoji: '🖤', stock: 45, lowStock: 10 },
  { id: 7,  name: 'Hot Latte',              price: 120, category: 'Hot Coffee',                   emoji: '☕', stock: 40, lowStock: 10 },
  { id: 8,  name: 'Cappuccino',             price: 125, category: 'Hot Coffee',                   emoji: '🌫️', stock: 35, lowStock: 8  },

  { id: 9,  name: 'Java Chip Frappe',       price: 170, category: 'Frappe - Espresso Based',     emoji: '🧋', stock: 25, lowStock: 6  },
  { id: 10, name: 'Mocha Espresso Frappe',  price: 175, category: 'Frappe - Espresso Based',     emoji: '🍫', stock: 20, lowStock: 6  },
  { id: 11, name: 'Caramel Espresso Frappe',price: 180, category: 'Frappe - Espresso Based',     emoji: '🍮', stock: 20, lowStock: 6  },

  { id: 12, name: 'Matcha Frappe',          price: 165, category: 'Frappe - Non Coffee',         emoji: '🍵', stock: 20, lowStock: 6  },
  { id: 13, name: 'Choco Frappe',           price: 160, category: 'Frappe - Non Coffee',         emoji: '🍫', stock: 20, lowStock: 6  },
  { id: 14, name: 'Cookies & Cream Frappe', price: 170, category: 'Frappe - Non Coffee',         emoji: '🍪', stock: 18, lowStock: 6  },

  { id: 15, name: 'Wintermelon Milk Tea',   price: 120, category: 'Milktea & Cheesecake Series', emoji: '🧋', stock: 35, lowStock: 8  },
  { id: 16, name: 'Okinawa Milk Tea',       price: 125, category: 'Milktea & Cheesecake Series', emoji: '🧋', stock: 35, lowStock: 8  },
  { id: 17, name: 'Strawberry Cheesecake',  price: 150, category: 'Milktea & Cheesecake Series', emoji: '🍰', stock: 20, lowStock: 6  },
  { id: 18, name: 'Dark Choco Cheesecake',  price: 155, category: 'Milktea & Cheesecake Series', emoji: '🍫', stock: 20, lowStock: 6  },

  { id: 19, name: 'Green Apple Soda',       price: 105, category: 'Fruit Soda',                  emoji: '🍏', stock: 25, lowStock: 6  },
  { id: 20, name: 'Blue Lemon Soda',        price: 110, category: 'Fruit Soda',                  emoji: '🫐', stock: 25, lowStock: 6  },
  { id: 21, name: 'Strawberry Soda',        price: 110, category: 'Fruit Soda',                  emoji: '🍓', stock: 25, lowStock: 6  },

  { id: 22, name: 'Pearls',                 price: 20,  category: 'Add Ons',                     emoji: '⚫', stock: 80, lowStock: 20 },
  { id: 23, name: 'Cheesecake Foam',        price: 25,  category: 'Add Ons',                     emoji: '🧀', stock: 60, lowStock: 15 },
  { id: 24, name: 'Espresso Shot',          price: 30,  category: 'Add Ons',                     emoji: '☕', stock: 50, lowStock: 10 },
  { id: 25, name: 'Whipped Cream',          price: 20,  category: 'Add Ons',                     emoji: '🍦', stock: 60, lowStock: 15 },
];
