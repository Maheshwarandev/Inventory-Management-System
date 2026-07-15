import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Form
    const [form, setForm] = useState({ name: '', sku: '', barcode: '', category_id: '', supplier_id: '', price: '', cost_price: '', min_stock: '10', image: null });

    const fetchData = async () => {
        try {
            const [prodRes, catRes, supRes] = await Promise.all([
                api.get('/products'), api.get('/categories'), api.get('/suppliers')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
        } catch (e) { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const getStockStatus = (p) => {
        if (p.stock_qty === 0) return 'out-of-stock';
        if (p.stock_qty <= p.min_stock) return 'low-stock';
        return 'in-stock';
    };

    const openAdd = () => { setEditing(null); setForm({ name: '', sku: '', barcode: '', category_id: '', supplier_id: '', price: '', cost_price: '', min_stock: '10', image: null }); setIsModalOpen(true); };
    const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku || '', barcode: p.barcode || '', category_id: p.category_id || '', supplier_id: p.supplier_id || '', price: p.price, cost_price: p.cost_price, min_stock: p.min_stock, image: null }); setIsModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
        try {
            if (editing) {
                await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product updated');
            } else {
                await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product added');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error('Operation failed'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/products/${deleteId}`); toast.success('Product deleted'); fetchData(); }
        catch (e) { toast.error('Delete failed'); }
    };

    const columns = [
        { key: 'name', header: 'Product', sortable: true, accessor: 'name', render: (row) => (
            <div className="flex items-center gap-3">
                {row.image ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/${row.image}`} className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700" alt="" />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Package className="w-4 h-4 text-slate-400" /></div>
                )}
                <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.sku || '—'}</p>
                </div>
            </div>
        )},
        { key: 'category', header: 'Category', accessor: (r) => r.category_name || '—', render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.category_name || '—'}</span> },
        { key: 'price', header: 'Price', sortable: true, accessor: 'price', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100">${Number(r.price).toFixed(2)}</span> },
        { key: 'stock', header: 'Stock', sortable: true, accessor: 'stock_qty', render: (r) => <span className="font-medium text-slate-800 dark:text-slate-200">{r.stock_qty}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={getStockStatus(r)} /> },
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
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Products</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{products.length} total products</p>
                </div>
                <button onClick={openAdd} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <DataTable columns={columns} data={products} loading={loading} searchPlaceholder="Search products..." emptyTitle="No products yet" emptyDescription="Add your first product to get started." emptyIcon={Package} />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                            <input required className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                            <input className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barcode</label>
                            <input className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                            <select className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                            <select className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.supplier_id} onChange={(e) => setForm({...form, supplier_id: e.target.value})}>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                            <input required type="number" step="0.01" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price</label>
                            <input required type="number" step="0.01" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.cost_price} onChange={(e) => setForm({...form, cost_price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reorder Level</label>
                            <input type="number" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={form.min_stock} onChange={(e) => setForm({...form, min_stock: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image</label>
                            <input type="file" accept="image/*" className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-300" onChange={(e) => setForm({...form, image: e.target.files[0]})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">{editing ? 'Update' : 'Add'} Product</button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="This will permanently remove this product. This action cannot be undone." />
        </div>
    );
};

export default Products;
