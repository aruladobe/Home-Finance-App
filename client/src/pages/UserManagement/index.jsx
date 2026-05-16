import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Phone, Mail, UserCheck } from 'lucide-react';
import { useSortable, SortIcon } from '../../hooks/useSortable';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

const RELATIONSHIPS = ['Self','Father','Mother','Brother','Sister','Son','Daughter','Spouse','Grandfather','Grandmother','Other'];

const RELATIONSHIP_AVATARS = {
  Self: '🧑', Father: '👨', Mother: '👩', Brother: '👱', Sister: '👱‍♀️',
  Son: '👦', Daughter: '👧', Spouse: '💑', Grandfather: '👴', Grandmother: '👵', Other: '👤'
};

const RELATIONSHIP_COLORS = {
  Self: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
  Father: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  Mother: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
  Brother: 'from-sky-500/20 to-sky-600/10 border-sky-500/20',
  Sister: 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/20',
  Son: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  Daughter: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  Spouse: 'from-rose-500/20 to-rose-600/10 border-rose-500/20',
  Grandfather: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  Grandmother: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
  Other: 'from-slate-500/20 to-slate-600/10 border-slate-500/20',
};

const emptyForm = { name: '', relationship: 'Son', email: '', phone: '', age: '', occupation: '' };

export default function UserManagement() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useFinance();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { sorted: sortedMembers, sortKey, sortDir, toggle } = useSortable(familyMembers, 'name');
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, relationship: item.relationship, email: item.email || '', phone: item.phone || '', age: item.age || '', occupation: item.occupation || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, age: form.age ? Number(form.age) : undefined };
    try {
      if (editItem) await updateFamilyMember(editItem._id || editItem.id, payload);
      else await addFamilyMember(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (confirm('Remove this family member?')) await deleteFamilyMember(id);
  };

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Account owner card */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary-500/15 to-purple-600/10 border-primary-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Account Owner</h3>
          <span className="badge bg-primary-500/20 text-primary-400">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            {RELATIONSHIP_AVATARS[user?.relationship] || '👤'}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-white/50">{user?.relationship} · {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Family members header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-slate-400 dark:text-white/50" />
          <h3 className="section-title">Family Members</h3>
          <span className="badge bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 ml-1">{familyMembers.length}</span>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Members grid */}
      {familyMembers.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-slate-500 dark:text-white/50 mb-2">No family members added yet</p>
          <p className="text-slate-400 dark:text-white/30 text-sm mb-6">Add family members to track their income and expenses separately</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map(member => (
            <div key={member._id || member.id} className={`glass-card p-5 bg-gradient-to-br ${RELATIONSHIP_COLORS[member.relationship] || RELATIONSHIP_COLORS.Other} hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl">
                  {RELATIONSHIP_AVATARS[member.relationship] || '👤'}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/40 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(member._id || member.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{member.name}</h4>
              <span className="badge bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 text-xs">{member.relationship}</span>
              {member.age && <span className="badge bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/40 text-xs ml-1">Age {member.age}</span>}

              <div className="mt-4 space-y-1.5">
                {member.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                    <Mail size={12} /><span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                    <Phone size={12} /><span>{member.phone}</span>
                  </div>
                )}
                {!member.email && !member.phone && (
                  <p className="text-xs text-slate-300 dark:text-white/25">No contact info</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary table */}
      {familyMembers.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
            <UserCheck size={16} className="text-slate-400 dark:text-white/50" />
            <h3 className="section-title">Members Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th onClick={() => toggle('name')} className="table-header text-left px-5 py-3 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="flex items-center">Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th onClick={() => toggle('relationship')} className="table-header text-left px-5 py-3 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="flex items-center">Relationship <SortIcon col="relationship" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th onClick={() => toggle('age')} className="table-header text-left px-5 py-3 hidden sm:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                    <span className="flex items-center">Age <SortIcon col="age" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="table-header text-left px-5 py-3 hidden md:table-cell">Email</th>
                  <th className="table-header text-left px-5 py-3 hidden lg:table-cell">Phone</th>
                  <th className="table-header text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map(member => (
                  <tr key={member._id || member.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{RELATIONSHIP_AVATARS[member.relationship] || '👤'}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60">{member.relationship}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-slate-500 dark:text-white/50">{member.age || '-'}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-500 dark:text-white/50">{member.email || '-'}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-sm text-slate-500 dark:text-white/50">{member.phone || '-'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/40 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(member._id || member.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Family Member' : 'Add Family Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input type="text" className="input-field" placeholder="Enter name" value={form.name} onChange={setField('name')} required />
            </div>
            <div>
              <label className="label">Relationship *</label>
              <select className="select-field" value={form.relationship} onChange={setField('relationship')} required>
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input-field" placeholder="Age" min="0" max="120" value={form.age} onChange={setField('age')} />
            </div>
            <div className="col-span-2">
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="email@example.com" value={form.email} onChange={setField('email')} />
            </div>
            <div className="col-span-2">
              <label className="label">Phone</label>
              <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={setField('phone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Occupation</label>
              <input type="text" className="input-field" placeholder="e.g. Engineer, Student, Retired" value={form.occupation} onChange={setField('occupation')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editItem ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
