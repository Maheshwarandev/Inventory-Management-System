import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

    const fetchData = async () => {
        try { const res = await api.get('/customers'); setCustomers(res.data); }
        catch (e) { toast.error('Failed to fetch customers'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '' }); setIsModalOpen(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' }); setIsModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/customers/${editing.id}`, form); toast.success('Customer updated'); }
            else { await api.post('/customers', form); toast.success('Customer added'); }
            setIsModalOpen(false); fetchData();
        } catch (e) { toast.error('Operation failed'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/customers/${deleteId}`); toast.success('Customer deleted'); fetchData(); }
        catch (e) { toast.error('Delete failed'); }
    };

    const columns = [
        { key: 'name', header: 'Customer', sortable: true, accessor: 'name', render: (r) => (
            <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{r.name}</p>
                <p className="text-xs text-slate-400">{r.email || '—'}</p>
            </div>
        )},
        { key: 'phone', header: 'Phone', accessor: 'phone', render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.phone || '—'}</span> },
        { key: 'address', header: 'Address', accessor: 'address', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-[200px] block">{r.address || '—'}</span> },
        { key: 'date', header: 'Added', accessor: 'created_at', render: (r) => <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
        { key: 'actions', header: '', align: 'right', render: (r) => (
            <div className="flex items-center justify-end gap-1">
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
        )},
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Customers</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{customers.length} customers</p></div>
                <button onClick={openAdd} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Customer</button>
            </div>
            <DataTable columns={columns} data={customers} loading={loading} searchPlaceholder="Search customers..." emptyTitle="No customers" emptyDescription="Add your first customer." emptyIcon={Users} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label><input required className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input type="email" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label><input className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label><textarea rows="2" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">{editing ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </Modal>
            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Customer" message="Sales history for this customer will remain." />
        </div>
    );
};

export default Customers;
