import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, UserCog, ShieldCheck, UserX, CheckCircle2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created');
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'reactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', sortable: true, accessor: 'name', render: (row) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">{row.name}</p>
        <p className="text-xs text-slate-400">{row.email}</p>
      </div>
    )},
    { key: 'role', header: 'Role', accessor: 'role', render: (row) => <StatusBadge status={row.role} label={row.role === 'admin' ? 'Admin' : 'Employee'} /> },
    { key: 'status', header: 'Status', accessor: 'is_active', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
    { key: 'actions', header: '', align: 'right', render: (row) => (
      <button onClick={() => toggleActive(row)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${row.is_active ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>
        {row.is_active ? <UserX className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        {row.is_active ? 'Deactivate' : 'Reactivate'}
      </button>
    ) }
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users & Employees</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create staff accounts and manage access.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <DataTable columns={columns} data={users} loading={loading} searchPlaceholder="Search users..." emptyTitle="No users yet" emptyDescription="Create the first staff account to get started." emptyIcon={UserCog} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
            <input required className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input required type="email" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input required type="password" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
