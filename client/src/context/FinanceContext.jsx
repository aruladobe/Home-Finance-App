import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { incomeAPI, expenseAPI, investmentAPI, familyAPI } from '../utils/api';
import { storage } from '../utils/localStorage';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inc, exp, inv, fam] = await Promise.all([
        incomeAPI.getAll(),
        expenseAPI.getAll(),
        investmentAPI.getAll(),
        familyAPI.getAll(),
      ]);
      const incData = inc.data; setIncome(incData); storage.syncIncome(incData);
      const expData = exp.data; setExpenses(expData); storage.syncExpenses(expData);
      const invData = inv.data; setInvestments(invData); storage.syncInvestments(invData);
      const famData = fam.data; setFamilyMembers(famData); storage.syncFamilyMembers(famData);
    } catch {
      setIncome(storage.getIncome());
      setExpenses(storage.getExpenses());
      setInvestments(storage.getInvestments());
      setFamilyMembers(storage.getFamilyMembers());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addIncome = async (data) => {
    try {
      const res = await incomeAPI.create(data);
      const item = res.data;
      setIncome(prev => [item, ...prev]);
      storage.addIncome(item);
      return item;
    } catch {
      const item = storage.addIncome({ ...data, _id: Date.now().toString() });
      setIncome(prev => [item, ...prev]);
      return item;
    }
  };

  const updateIncome = async (id, data) => {
    try {
      const res = await incomeAPI.update(id, data);
      const item = res.data;
      setIncome(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      storage.updateIncome(id, item);
      return item;
    } catch {
      const item = storage.updateIncome(id, data);
      setIncome(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      return item;
    }
  };

  const deleteIncome = async (id) => {
    try { await incomeAPI.delete(id); } catch {}
    setIncome(prev => prev.filter(i => i._id !== id && i.id !== id));
    storage.deleteIncome(id);
  };

  const addExpense = async (data) => {
    try {
      const res = await expenseAPI.create(data);
      const item = res.data;
      setExpenses(prev => [item, ...prev]);
      storage.addExpense(item);
      return item;
    } catch {
      const item = storage.addExpense({ ...data, _id: Date.now().toString() });
      setExpenses(prev => [item, ...prev]);
      return item;
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const res = await expenseAPI.update(id, data);
      const item = res.data;
      setExpenses(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      storage.updateExpense(id, item);
      return item;
    } catch {
      const item = storage.updateExpense(id, data);
      setExpenses(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      return item;
    }
  };

  const deleteExpense = async (id) => {
    try { await expenseAPI.delete(id); } catch {}
    setExpenses(prev => prev.filter(i => i._id !== id && i.id !== id));
    storage.deleteExpense(id);
  };

  const addInvestment = async (data) => {
    try {
      const res = await investmentAPI.create(data);
      const item = res.data;
      setInvestments(prev => [item, ...prev]);
      storage.addInvestment(item);
      return item;
    } catch {
      const item = storage.addInvestment({ ...data, _id: Date.now().toString() });
      setInvestments(prev => [item, ...prev]);
      return item;
    }
  };

  const updateInvestment = async (id, data) => {
    try {
      const res = await investmentAPI.update(id, data);
      const item = res.data;
      setInvestments(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      storage.updateInvestment(id, item);
      return item;
    } catch {
      const item = storage.updateInvestment(id, data);
      setInvestments(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      return item;
    }
  };

  const deleteInvestment = async (id) => {
    try { await investmentAPI.delete(id); } catch {}
    setInvestments(prev => prev.filter(i => i._id !== id && i.id !== id));
    storage.deleteInvestment(id);
  };

  const addFamilyMember = async (data) => {
    try {
      const res = await familyAPI.create(data);
      const item = res.data;
      setFamilyMembers(prev => [item, ...prev]);
      storage.addFamilyMember(item);
      return item;
    } catch {
      const item = storage.addFamilyMember({ ...data, _id: Date.now().toString() });
      setFamilyMembers(prev => [item, ...prev]);
      return item;
    }
  };

  const updateFamilyMember = async (id, data) => {
    try {
      const res = await familyAPI.update(id, data);
      const item = res.data;
      setFamilyMembers(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      storage.updateFamilyMember(id, item);
      return item;
    } catch {
      const item = storage.updateFamilyMember(id, data);
      setFamilyMembers(prev => prev.map(i => (i._id === id || i.id === id) ? item : i));
      return item;
    }
  };

  const deleteFamilyMember = async (id) => {
    try { await familyAPI.delete(id); } catch {}
    setFamilyMembers(prev => prev.filter(i => i._id !== id && i.id !== id));
    storage.deleteFamilyMember(id);
  };

  return (
    <FinanceContext.Provider value={{
      income, expenses, investments, familyMembers,
      loading, period, setPeriod, fetchAll,
      addIncome, updateIncome, deleteIncome,
      addExpense, updateExpense, deleteExpense,
      addInvestment, updateInvestment, deleteInvestment,
      addFamilyMember, updateFamilyMember, deleteFamilyMember,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
