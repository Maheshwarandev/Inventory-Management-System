import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Eye, DollarSign, ShoppingCart } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [payments, setPayments] = useState([]);

    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState([]);
    const [selProdId, setSelProdId] = useState('');
    const [qty, setQty] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [initialPayment, setInitialPayment] = useState('0');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const fetchData = async () => {
        try {
            const [purRes, supRes, prodRes] = await Promise.all([api.get('/purchases'), api.get('/suppliers'), api.get('/products')]);
            setPurchases(purRes.data); setSuppliers(supRes.data); setProducts(prodRes.data);
        } catch (e) { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const addItem = () => {
        if (!selProdId || !qty || !unitCost) return toast.error('Fill all item fields');
        const prod = products.find(p => p.id === parseInt(selProdId));
        setItems([...items, { product_id: prod.id, product_name: prod.name, quantity: parseInt(qty), unit_cost: parseFloat(unitCost) }]);
        setSelProdId(''); setQty(''); setUnitCost('');
    };

    const getTotal = () => items.reduce((s, i) => s + (i.quantity * i.unit_cost), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierId || items.length === 0) return toast.error('Select supplier and add items');
        try {
            await api.post('/purchases', { supplier_id: supplierId, total_amount: getTotal(), initial_payment: parseFloat(initialPayment) || 0, items });
            toast.success('Purchase created'); setIsModalOpen(false); setSupplierId(''); setItems([]); setInitialPayment('0'); fetchData();
        } catch (e) { toast.error('Failed to create purchase'); }
    };

    const handleView = async (id) => {
        try { const res = await api.get(`/purchases/${id}`); setSelectedPurchase(res.data); setIsViewOpen(true); }
        catch (e) { toast.error('Failed to fetch details'); }
    };

    const openPayments = async (purchase) => {
        try {
            const res = await api.get(`/purchases/${purchase.id}/payments`);
            setSelectedPurchase(purchase); setPayments(res.data);
            setPaymentAmount((purchase.total_amount - (purchase.paid_amount || 0)).toFixed(2));
            setIsPaymentOpen(true);
        } catch (e) { toast.error('Failed to fetch payments'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/purchases/${selectedPurchase.id}/payments`, { amount: parseFloat(paymentAmount), payment_method: paymentMethod });
            toast.success('Payment recorded'); setIsPaymentOpen(false); fetchData();
        } catch (e) { toast.error('Failed to add payment'); }
    };

    const columns = [
        { key: 'po', header: 'PO #', sortable: true, accessor: 'id', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">PO-{String(r.id).padStart(4, '0')}</span> },
        { key: 'supplier', header: 'Supplier', accessor: (r) => r.supplier_name, render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.supplier_name || '—'}</span> },
        { key: 'total', header: 'Total', sortable: true, accessor: 'total_amount', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100">${Number(r.total_amount).toFixed(2)}</span> },
        { key: 'paid', header: 'Paid', accessor: 'paid_amount', render: (r) => <span className="text-brand-600 font-medium">${Number(r.paid_amount || 0).toFixed(2)}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.payment_status || 'unpaid'} /> },
        { key: 'date', header: 'Date', accessor: 'created_at', render: (r) => <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
        { key: 'actions', header: '', align: 'right', render: (r) => (
            <div className="flex items-center justify-end gap-1">
                <button onClick={() => openPayments(r)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Payments"><DollarSign className="w-4 h-4" /></button>
                <button onClick={() => handleView(r.id)} className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
            </div>
        )},
    ];

    const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200";

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Purchases</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{purchases.length} purchase orders</p></div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> Create PO</button>
            </div>

            <DataTable columns={columns} data={purchases} loading={loading} searchPlaceholder="Search purchases..." emptyTitle="No purchases yet" emptyIcon={ShoppingCart} />

            {/* Create PO Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Order" size="xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                        <select required className={inputCls} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Items</p>
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                                <select className={inputCls} value={selProdId} onChange={(e) => { setSelProdId(e.target.value); const p = products.find(x => x.id === parseInt(e.target.value)); if(p) setUnitCost(p.cost_price); }}>
                                    <option value="">Select Product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3"><input type="number" min="1" placeholder="Qty" className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} /></div>
                            <div className="col-span-3"><input type="number" step="0.01" placeholder="Cost" className={inputCls} value={unitCost} onChange={(e) => setUnitCost(e.target.value)} /></div>
                            <div className="col-span-1"><button type="button" onClick={addItem} className="w-full h-full bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button></div>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                    <span className="text-slate-700 dark:text-slate-300">{item.quantity}× {item.product_name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">${(item.quantity * item.unit_cost).toFixed(2)}</span>
                                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">✕</button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Paid Now</span>
                                    <input type="number" step="0.01" className="w-28 px-3 py-2 text-sm border border-brand-300 rounded-lg bg-brand-50 dark:bg-brand-900/30 dark:border-brand-500 dark:text-slate-200 text-right" value={initialPayment} onChange={(e) => setInitialPayment(e.target.value)} />
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Total: ${getTotal().toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">Submit PO</button>
                    </div>
                </form>
            </Modal>

            {/* View Detail Modal */}
            <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`PO-${String(selectedPurchase?.id || '').padStart(4, '0')}`} size="lg">
                {selectedPurchase && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400">Supplier</p><p className="font-medium text-slate-900 dark:text-slate-100">{selectedPurchase.supplier_name}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400">Date</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedPurchase.created_at).toLocaleString()}</p></div>
                        </div>
                        <table className="w-full text-sm">
                            <thead><tr className="bg-slate-50 dark:bg-slate-800"><th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Product</th><th className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Qty</th><th className="p-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Cost</th></tr></thead>
                            <tbody>{selectedPurchase.items?.map((item, idx) => (<tr key={idx} className="border-t border-slate-50 dark:border-slate-800"><td className="p-3 text-slate-700 dark:text-slate-300">{item.product_name}</td><td className="p-3 text-center">{item.quantity}</td><td className="p-3 text-right font-medium">${Number(item.unit_cost).toFixed(2)}</td></tr>))}</tbody>
                        </table>
                        <p className="text-right text-lg font-bold text-brand-600">Total: ${Number(selectedPurchase.total_amount).toFixed(2)}</p>
                    </div>
                )}
            </Modal>

            {/* Payments Modal */}
            <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={`Payments — PO-${String(selectedPurchase?.id || '').padStart(4, '0')}`} size="md">
                {selectedPurchase && (
                    <div className="space-y-5">
                        <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div><p className="text-xs text-slate-500 dark:text-slate-400">Total</p><p className="font-bold text-slate-900 dark:text-slate-100">${Number(selectedPurchase.total_amount).toFixed(2)}</p></div>
                            <div className="text-right"><p className="text-xs text-slate-500 dark:text-slate-400">Balance Due</p><p className="font-bold text-red-600">${(selectedPurchase.total_amount - (selectedPurchase.paid_amount || 0)).toFixed(2)}</p></div>
                        </div>
                        {payments.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">{payments.map(p => (
                                <li key={p.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                    <div><p className="font-medium text-slate-800 dark:text-slate-200">${Number(p.amount).toFixed(2)}</p><p className="text-xs text-slate-400">{p.payment_method}</p></div>
                                    <div className="text-right"><p className="text-slate-500 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p><p className="text-xs text-slate-400">by {p.created_by_name}</p></div>
                                </li>
                            ))}</ul>
                        ) : <p className="text-sm text-slate-400 text-center py-4">No payments recorded yet.</p>}
                        {selectedPurchase.payment_status !== 'paid' && (
                            <form onSubmit={handleAddPayment} className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label><input required type="number" step="0.01" className={inputCls} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Method</label><select className={inputCls} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option>Cash</option><option>Credit Card</option><option>Bank Transfer</option></select></div>
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">Record Payment</button>
                            </form>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Purchases;
