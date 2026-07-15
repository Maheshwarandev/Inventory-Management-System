import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const fetchData = async () => {
        try { const res = await api.get('/categories'); setCategories(res.data); }
        catch (e) { toast.error('Failed to fetch categories'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setIsModalOpen(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setIsModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/categories/${editing.id}`, form); toast.success('Category updated'); }
            else { await api.post('/categories', form); toast.success('Category added'); }
            setIsModalOpen(false); fetchData();
        } catch (e) { toast.error('Operation failed'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/categories/${deleteId}`); toast.success('Category deleted'); fetchData(); }
        catch (e) { toast.error('Delete failed'); }
    };

    const columns = [
        { key: 'name', header: 'Name', sortable: true, accessor: 'name', render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.name}</span> },
        { key: 'description', header: 'Description', accessor: 'description', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.description || '—'}</span> },
        { key: 'date', header: 'Created', accessor: 'created_at', render: (r) => <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
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
                <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Categories</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{categories.length} categories</p></div>
                <button onClick={openAdd} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Category</button>
            </div>
            <DataTable columns={columns} data={categories} loading={loading} searchPlaceholder="Search categories..." emptyTitle="No categories" emptyDescription="Create your first category." emptyIcon={Tags} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label><input required className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label><textarea rows="3" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">{editing ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </Modal>
            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category" message="Products in this category will be uncategorized." />
        </div>
    );
};

export default Categories;
