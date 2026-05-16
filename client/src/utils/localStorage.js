const KEYS = {
  INCOME: 'finance_income',
  EXPENSES: 'finance_expenses',
  INVESTMENTS: 'finance_investments',
  FAMILY_MEMBERS: 'finance_family_members',
  USER: 'finance_user',
  TOKEN: 'finance_token',
};

const get = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const set = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const remove = (key) => localStorage.removeItem(key);

const addItem = (key, item) => {
  const list = get(key) || [];
  const newItem = { ...item, id: item._id || item.id || Date.now().toString(), createdAt: new Date().toISOString() };
  set(key, [newItem, ...list]);
  return newItem;
};

const updateItem = (key, id, updates) => {
  const list = get(key) || [];
  const updated = list.map(item =>
    (item.id === id || item._id === id) ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
  );
  set(key, updated);
  return updated.find(i => i.id === id || i._id === id);
};

const deleteItem = (key, id) => {
  const list = get(key) || [];
  set(key, list.filter(item => item.id !== id && item._id !== id));
};

const syncFromServer = (key, items) => set(key, items);

export const storage = {
  getIncome: () => get(KEYS.INCOME) || [],
  setIncome: (data) => set(KEYS.INCOME, data),
  addIncome: (item) => addItem(KEYS.INCOME, item),
  updateIncome: (id, data) => updateItem(KEYS.INCOME, id, data),
  deleteIncome: (id) => deleteItem(KEYS.INCOME, id),
  syncIncome: (items) => syncFromServer(KEYS.INCOME, items),

  getExpenses: () => get(KEYS.EXPENSES) || [],
  setExpenses: (data) => set(KEYS.EXPENSES, data),
  addExpense: (item) => addItem(KEYS.EXPENSES, item),
  updateExpense: (id, data) => updateItem(KEYS.EXPENSES, id, data),
  deleteExpense: (id) => deleteItem(KEYS.EXPENSES, id),
  syncExpenses: (items) => syncFromServer(KEYS.EXPENSES, items),

  getInvestments: () => get(KEYS.INVESTMENTS) || [],
  setInvestments: (data) => set(KEYS.INVESTMENTS, data),
  addInvestment: (item) => addItem(KEYS.INVESTMENTS, item),
  updateInvestment: (id, data) => updateItem(KEYS.INVESTMENTS, id, data),
  deleteInvestment: (id) => deleteItem(KEYS.INVESTMENTS, id),
  syncInvestments: (items) => syncFromServer(KEYS.INVESTMENTS, items),

  getFamilyMembers: () => get(KEYS.FAMILY_MEMBERS) || [],
  setFamilyMembers: (data) => set(KEYS.FAMILY_MEMBERS, data),
  addFamilyMember: (item) => addItem(KEYS.FAMILY_MEMBERS, item),
  updateFamilyMember: (id, data) => updateItem(KEYS.FAMILY_MEMBERS, id, data),
  deleteFamilyMember: (id) => deleteItem(KEYS.FAMILY_MEMBERS, id),
  syncFamilyMembers: (items) => syncFromServer(KEYS.FAMILY_MEMBERS, items),

  getUser: () => get(KEYS.USER),
  setUser: (user) => set(KEYS.USER, user),
  getToken: () => localStorage.getItem(KEYS.TOKEN),
  setToken: (token) => localStorage.setItem(KEYS.TOKEN, token),
  clearAuth: () => { remove(KEYS.USER); remove(KEYS.TOKEN); },
};
