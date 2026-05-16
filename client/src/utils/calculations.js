import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const formatCurrencyCompact = (v, currency = '₹') => {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1_00_00_000) return `${currency}${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1_00_000) return `${currency}${(n / 1_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `${currency}${(n / 1_000).toFixed(0)}K`;
  return `${currency}${n}`;
};

export const filterByPeriod = (items, period) => {
  const now = new Date();
  let start, end;
  if (period === 'daily') { start = startOfDay(now); end = endOfDay(now); }
  else if (period === 'monthly') { start = startOfMonth(now); end = endOfMonth(now); }
  else if (period === 'yearly') { start = startOfYear(now); end = endOfYear(now); }
  else return items;

  return items.filter(item => {
    const date = item.date ? (typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date)) : null;
    return date && isWithinInterval(date, { start, end });
  });
};

export const sumAmounts = (items) =>
  items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

export const calculateProfit = (income, expenses, investments) => {
  const totalIncome = sumAmounts(income);
  const totalExpenses = sumAmounts(expenses);
  const totalInvested = sumAmounts(investments);
  const totalReturns = investments.reduce((sum, i) => sum + Number(i.actualReturns || 0), 0);
  const netProfit = totalIncome - totalExpenses - totalInvested + totalReturns;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  return { totalIncome, totalExpenses, totalInvested, totalReturns, netProfit, savingsRate };
};

export const groupByCategory = (expenses) => {
  const groups = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'Other';
    groups[cat] = (groups[cat] || 0) + Number(exp.amount || 0);
  });
  return Object.entries(groups).map(([name, value]) => ({ name, value }));
};

export const groupByMonth = (items, year = new Date().getFullYear()) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((month, idx) => {
    const monthItems = items.filter(item => {
      const d = item.date ? new Date(item.date) : null;
      return d && d.getMonth() === idx && d.getFullYear() === year;
    });
    return { month, amount: sumAmounts(monthItems) };
  });
};

export const groupByType = (items) => {
  const groups = {};
  items.forEach(item => {
    const type = item.type || 'Other';
    groups[type] = (groups[type] || 0) + Number(item.amount || 0);
  });
  return Object.entries(groups).map(([name, value]) => ({ name, value }));
};

export const CATEGORY_COLORS = {
  Kids: '#f43f5e', Education: '#8b5cf6', Transport: '#f59e0b',
  Grocery: '#10b981', Entertainment: '#3b82f6', Maintenance: '#6366f1',
  Furniture: '#14b8a6', Medicine: '#ef4444', Functions: '#a855f7',
  Celebrations: '#ec4899', Insurance: '#0ea5e9'
};

export const INCOME_COLORS = {
  Salary: '#10b981', Earning: '#6366f1', Interest: '#f59e0b',
  'House Rent': '#3b82f6', 'Other Source': '#8b5cf6'
};

export const INVESTMENT_COLORS = {
  Stocks: '#10b981', 'Mutual Funds': '#6366f1', 'Fixed Deposit': '#f59e0b',
  'Real Estate': '#3b82f6', Gold: '#f59e0b', Crypto: '#8b5cf6',
  PPF: '#10b981', NPS: '#14b8a6', Other: '#94a3b8'
};
