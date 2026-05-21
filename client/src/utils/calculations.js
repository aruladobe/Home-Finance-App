import {
  startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  isWithinInterval, parseISO, differenceInDays, differenceInMonths, differenceInYears,
  isBefore, isAfter, min as dateMin, max as dateMax
} from 'date-fns';

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const formatCurrencyCompact = (v, currency = '₹') => {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1_00_00_000) return `${currency}${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1_00_000) return `${currency}${(n / 1_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `${currency}${(n / 1_000).toFixed(0)}K`;
  return `${currency}${n}`;
};

// Financial year helpers (Indian FY: April 1 – March 31)
export const getCurrentFY = () => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String(year + 1).slice(2)}`;
};

export const getFYDateRange = (fy) => {
  const startYear = parseInt(fy.split('-')[0]);
  return {
    start: new Date(startYear, 3, 1),
    end: new Date(startYear + 1, 2, 31, 23, 59, 59, 999),
  };
};

export const getAvailableFYs = (count = 5) => {
  const now = new Date();
  const currentStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const y = currentStart - i;
    return `${y}-${String(y + 1).slice(2)}`;
  });
};

export const filterByFY = (items, fy) => {
  const { start, end } = getFYDateRange(fy);
  return items.filter(item => {
    const d = item.date
      ? (typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date))
      : null;
    return d && d >= start && d <= end;
  });
};

export const filterByPeriod = (items, period) => {
  const now = new Date();
  let start, end;
  if (period === 'daily') { start = startOfDay(now); end = endOfDay(now); }
  else if (period === 'weekly') { start = startOfWeek(now); end = endOfWeek(now); }
  else if (period === 'monthly') { start = startOfMonth(now); end = endOfMonth(now); }
  else if (period === 'quarterly') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), qMonth, 1);
    end = endOfMonth(new Date(now.getFullYear(), qMonth + 2, 1));
  }
  else if (period === 'half-yearly') {
    const hMonth = now.getMonth() < 6 ? 0 : 6;
    start = new Date(now.getFullYear(), hMonth, 1);
    end = endOfMonth(new Date(now.getFullYear(), hMonth + 5, 1));
  }
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

export const calculateProjection = (amount, period, effectiveFrom, effectiveTo) => {
  if (!amount || !effectiveFrom) return null;
  const amt = Number(amount);
  const from = new Date(effectiveFrom);
  const to = effectiveTo ? new Date(effectiveTo) : null;
  const today = new Date();

  if (isNaN(from.getTime())) return null;

  const diffWeeks = (a, b) => Math.floor(differenceInDays(a, b) / 7);
  const diffQuarters = (a, b) => Math.floor(differenceInMonths(a, b) / 3);
  const diffHalfYears = (a, b) => Math.floor(differenceInMonths(a, b) / 6);
  const diffFn = period === 'daily' ? differenceInDays
    : period === 'weekly' ? diffWeeks
    : period === 'quarterly' ? diffQuarters
    : period === 'half-yearly' ? diffHalfYears
    : period === 'yearly' ? differenceInYears
    : differenceInMonths;

  const totalPeriods = to ? Math.max(0, diffFn(to, from)) : null;
  const totalExpected = totalPeriods !== null ? totalPeriods * amt : null;

  let elapsedPeriods = 0;
  if (isAfter(today, from)) {
    const elapsedEnd = to ? dateMin([today, to]) : today;
    elapsedPeriods = Math.max(0, diffFn(elapsedEnd, from));
  }
  const elapsedAmount = elapsedPeriods * amt;

  let remainingPeriods = 0;
  let remainingAmount = 0;
  if (to && isBefore(today, to)) {
    const remainStart = dateMax([today, from]);
    remainingPeriods = Math.max(0, diffFn(to, remainStart));
    remainingAmount = remainingPeriods * amt;
  } else if (!to) {
    remainingPeriods = null;
    remainingAmount = null;
  }

  const status = !to ? 'ongoing'
    : isBefore(today, from) ? 'upcoming'
    : isAfter(today, to) ? 'completed'
    : 'active';

  return { totalPeriods, totalExpected, elapsedPeriods, elapsedAmount, remainingPeriods, remainingAmount, status, from, to };
};

export const CATEGORY_COLORS = {
  Kids: '#f43f5e', Education: '#8b5cf6', Transport: '#f59e0b',
  'Grocery or Shopping': '#10b981', Entertainment: '#3b82f6', 'Service and Maintenance': '#6366f1',
  'Furniture or Appliances': '#14b8a6', 'Medicine or Hospitalization': '#ef4444', 'Functions and Celebrations': '#a855f7',
  Rent: '#ec4899', Insurance: '#0ea5e9',
  'Loan Repayment': '#dc2626', Bills: '#d97706', 'Fuel and Gas': '#7c3aed',
  Party: '#db2777', Others: '#64748b'
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
