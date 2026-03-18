export const CATEGORIES = ['All', 'Coffee', 'Tea', 'Food', 'Drinks'];

export const CATEGORY_COLORS = {
  Coffee: '#6F4E37',
  Tea:    '#4A7C59',
  Food:   '#C0874A',
  Drinks: '#2E86C1',
};

export const initialProducts = [
  { id: 1,  name: 'Espresso',           price: 80,  category: 'Coffee', emoji: '☕', stock: 50, lowStock: 10 },
  { id: 2,  name: 'Americano',          price: 95,  category: 'Coffee', emoji: '🖤', stock: 45, lowStock: 10 },
  { id: 3,  name: 'Café Latte',         price: 120, category: 'Coffee', emoji: '🥛', stock: 40, lowStock: 10 },
  { id: 4,  name: 'Cappuccino',         price: 120, category: 'Coffee', emoji: '☕', stock: 35, lowStock: 10 },
  { id: 5,  name: 'Caramel Macchiato',  price: 145, category: 'Coffee', emoji: '🍮', stock: 25, lowStock: 5  },
  { id: 6,  name: 'Mocha',             price: 130, category: 'Coffee', emoji: '🍫', stock: 30, lowStock: 5  },
  { id: 7,  name: 'Green Tea Latte',   price: 115, category: 'Tea',    emoji: '🍵', stock: 20, lowStock: 5  },
  { id: 8,  name: 'Milk Tea',          price: 110, category: 'Tea',    emoji: '🧋', stock: 30, lowStock: 5  },
  { id: 9,  name: 'Chai Latte',        price: 120, category: 'Tea',    emoji: '🫖', stock: 15, lowStock: 5  },
  { id: 10, name: 'Croissant',         price: 75,  category: 'Food',   emoji: '🥐', stock: 20, lowStock: 5  },
  { id: 11, name: 'Blueberry Muffin',  price: 80,  category: 'Food',   emoji: '🧁', stock: 15, lowStock: 5  },
  { id: 12, name: 'Bagel',             price: 65,  category: 'Food',   emoji: '🥯', stock: 10, lowStock: 3  },
  { id: 13, name: 'Club Sandwich',     price: 145, category: 'Food',   emoji: '🥪', stock: 12, lowStock: 3  },
  { id: 14, name: 'Mineral Water',     price: 35,  category: 'Drinks', emoji: '💧', stock: 60, lowStock: 10 },
  { id: 15, name: 'Orange Juice',      price: 95,  category: 'Drinks', emoji: '🍊', stock: 20, lowStock: 5  },
  { id: 16, name: 'Fresh Lemonade',    price: 100, category: 'Drinks', emoji: '🍋', stock: 15, lowStock: 5  },
];
