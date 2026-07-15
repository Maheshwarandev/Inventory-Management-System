import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Printer, DollarSign, Receipt } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [payments, setPayments] = useState([]);

    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState([]);
    const [selProdId, setSelProdId] = useState('');
    const [qty, setQty] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [discount, setDiscount] = useState('0');
    const [tax, setTax] = useState('0');
    const [initialPayment, setInitialPayment] = useState('0');
    
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const invoiceRef = useRef(null);

    const fetchData = async () => {
        try {
            const [salesRes, custRes, prodRes] = await Promise.all([api.get('/sales'), api.get('/customers'), api.get('/products')]);
            setSales(salesRes.data); setCustomers(custRes.data); setProducts(prodRes.data);
        } catch (e) { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const addItem = () => {
        if (!selProdId || !qty || !unitPrice) return toast.error('Fill all fields');
        const p = products.find(x => x.id === parseInt(selProdId));
        if (p.stock_qty < parseInt(qty)) return toast.error(`Only ${p.stock_qty} in stock!`);
        setItems([...items, { product_id: p.id, product_name: p.name, quantity: parseInt(qty), unit_price: parseFloat(unitPrice) }]);
        setSelProdId(''); setQty(''); setUnitPrice('');
    };

    const getSubtotal = () => items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
    const getTotal = () => getSubtotal() - (parseFloat(discount) || 0) + (parseFloat(tax) || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) return toast.error('Add items to sale');
        try {
            const res = await api.post('/sales', { customer_id: customerId || null, total_amount: getTotal(), discount: parseFloat(discount)||0, tax: parseFloat(tax)||0, initial_payment: parseFloat(initialPayment)||0, items });
            toast.success('Sale completed'); setIsModalOpen(false); setCustomerId(''); setItems([]); setDiscount('0'); setTax('0'); setInitialPayment('0');
            fetchData(); handleView(res.data.id);
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to complete sale'); }
    };

    const handleView = async (id) => {
        try { const res = await api.get(`/sales/${id}`); setSelectedSale(res.data); setIsInvoiceOpen(true); }
        catch (e) { toast.error('Failed to load invoice'); }
    };

    const openPayments = async (s) => {
        try {
            const res = await api.get(`/sales/${s.id}/payments`);
            setSelectedSale(s); setPayments(res.data);
            setPaymentAmount((s.total_amount - (s.paid_amount || 0)).toFixed(2));
            setIsPaymentOpen(true);
        } catch (e) { toast.error('Failed to load payments'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/sales/${selectedSale.id}/payments`, { amount: parseFloat(paymentAmount), payment_method: paymentMethod });
            toast.success('Payment recorded'); setIsPaymentOpen(false); fetchData();
        } catch (e) { toast.error('Failed to record payment'); }
    };

    const handlePrint = () => {
        const c = invoiceRef.current;
        const w = window.open('', '', 'width=900,height=650');
        w.document.write('<html><head><title>Print Invoice</title><style>body{font-family:sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f9f9f9}.text-right{text-align:right}.font-bold{font-weight:bold}.header{display:flex;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:20px}.total-section{margin-top:20px;text-align:right}</style></head><body>');
        w.document.write(c.innerHTML);
        w.document.write('</body></html>');
        w.document.close();
        w.setTimeout(() => { w.print(); w.close(); }, 250);
    };

    const columns = [
        { key: 'inv', header: 'Invoice', sortable: true, accessor: 'invoice_no', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{r.invoice_no}</span> },
        { key: 'customer', header: 'Customer', accessor: (r) => r.customer_name, render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.customer_name || 'Walk-in'}</span> },
        { key: 'total', header: 'Total', sortable: true, accessor: 'total_amount', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100">${Number(r.total_amount).toFixed(2)}</span> },
        { key: 'paid', header: 'Paid', accessor: 'paid_amount', render: (r) => <span className="text-brand-600 font-medium">${Number(r.paid_amount || 0).toFixed(2)}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.payment_status || 'unpaid'} /> },
        { key: 'date', header: 'Date', accessor: 'created_at', render: (r) => <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
        { key: 'actions', header: '', align: 'right', render: (r) => (
            <div className="flex items-center justify-end gap-1">
                <button onClick={() => openPayments(r)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Payments"><DollarSign className="w-4 h-4" /></button>
                <button onClick={() => handleView(r.id)} className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors" title="Invoice"><Printer className="w-4 h-4" /></button>
            </div>
        )},
    ];

    const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-slate-200";

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sales</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sales.length} invoices generated</p></div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" /> New Sale</button>
            </div>

            <DataTable columns={columns} data={sales} loading={loading} searchPlaceholder="Search invoices..." emptyTitle="No sales yet" emptyIcon={Receipt} />

            {/* New Sale Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Sale (POS)" size="xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer (Optional)</label>
                        <select className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Item to Cart</p>
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                                <select className={inputCls} value={selProdId} onChange={(e) => { setSelProdId(e.target.value); const p = products.find(x => x.id === parseInt(e.target.value)); if(p) setUnitPrice(p.price); }}>
                                    <option value="">Select Product...</option>
                                    {products.filter(p => p.stock_qty > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_qty})</option>)}
                                </select>
                            </div>
                            <div className="col-span-3"><input type="number" min="1" placeholder="Qty" className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} /></div>
                            <div className="col-span-3"><input type="number" step="0.01" placeholder="Price" className={inputCls} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} /></div>
                            <div className="col-span-1"><button type="button" onClick={addItem} className="w-full h-full bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center"><Plus className="w-4 h-4" /></button></div>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item.quantity}× {item.product_name}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">${(item.quantity * item.unit_price).toFixed(2)}</span>
                                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 max-w-sm ml-auto">
                                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>${getSubtotal().toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-sm"><span>Discount ($)</span><input type="number" step="0.01" className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-right dark:bg-slate-800 dark:text-slate-200" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
                                <div className="flex justify-between items-center text-sm"><span>Tax ($)</span><input type="number" step="0.01" className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-right dark:bg-slate-800 dark:text-slate-200" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
                                <div className="flex justify-between items-center text-sm font-medium text-brand-700 bg-brand-50 dark:bg-brand-900/30 p-2 rounded"><span>Amount Paid Now ($)</span><input type="number" step="0.01" className="w-24 px-2 py-1 border border-brand-300 rounded text-right bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-brand-500" value={initialPayment} onChange={(e) => setInitialPayment(e.target.value)} /></div>
                                <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700"><span>Total</span><span>${getTotal().toFixed(2)}</span></div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm">Complete Sale</button>
                    </div>
                </form>
            </Modal>

            {/* Invoice Modal */}
            <Modal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} title="Invoice" size="2xl">
                {selectedSale && (
                    <div className="space-y-6">
                        <div ref={invoiceRef} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg">
                            <div className="flex justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-6">
                                <div><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">INVOICE</h2><p className="text-slate-500 dark:text-slate-400 mt-1">#{selectedSale.invoice_no}</p></div>
                                <div className="text-right"><p className="font-bold text-lg text-slate-900 dark:text-slate-100">IMS Pro</p><p className="text-slate-500 dark:text-slate-400 text-sm">123 Business Rd.<br/>City, Country</p></div>
                            </div>
                            <div className="flex justify-between mb-8 text-sm">
                                <div><p className="text-slate-500 dark:text-slate-400 mb-1">Bill To:</p><p className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedSale.customer_name || 'Walk-in Customer'}</p></div>
                                <div className="text-right"><p className="text-slate-500 dark:text-slate-400 mb-1">Date:</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedSale.created_at).toLocaleDateString()}</p></div>
                            </div>
                            <table className="w-full text-sm mb-6">
                                <thead><tr className="border-b-2 border-slate-200 dark:border-slate-700"><th className="py-2 text-left font-semibold text-slate-900 dark:text-slate-100">Item</th><th className="py-2 text-center font-semibold text-slate-900 dark:text-slate-100">Qty</th><th className="py-2 text-right font-semibold text-slate-900 dark:text-slate-100">Price</th><th className="py-2 text-right font-semibold text-slate-900 dark:text-slate-100">Total</th></tr></thead>
                                <tbody>{selectedSale.items?.map((item, idx) => (<tr key={idx} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 text-slate-700 dark:text-slate-300">{item.product_name}</td><td className="py-3 text-center text-slate-700 dark:text-slate-300">{item.quantity}</td><td className="py-3 text-right text-slate-700 dark:text-slate-300">${Number(item.unit_price).toFixed(2)}</td><td className="py-3 text-right font-medium text-slate-900 dark:text-slate-100">${(item.quantity * item.unit_price).toFixed(2)}</td></tr>))}</tbody>
                            </table>
                            <div className="w-64 ml-auto space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Discount</span><span>${Number(selectedSale.discount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Tax</span><span>${Number(selectedSale.tax || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700"><span>Total</span><span>${Number(selectedSale.total_amount).toFixed(2)}</span></div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2"><span>Paid</span><span>${Number(selectedSale.paid_amount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between font-semibold text-red-600"><span>Balance Due</span><span>${(selectedSale.total_amount - (selectedSale.paid_amount||0)).toFixed(2)}</span></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3"><button onClick={() => setIsInvoiceOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">Close</button><button onClick={handlePrint} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"><Printer className="w-4 h-4"/> Print Invoice</button></div>
                    </div>
                )}
            </Modal>

            {/* Payments Modal */}
            <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={`Payments — ${selectedSale?.invoice_no}`} size="md">
                {selectedSale && (
                    <div className="space-y-5">
                        <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div><p className="text-xs text-slate-500 dark:text-slate-400">Total</p><p className="font-bold text-slate-900 dark:text-slate-100">${Number(selectedSale.total_amount).toFixed(2)}</p></div>
                            <div className="text-right"><p className="text-xs text-slate-500 dark:text-slate-400">Balance Due</p><p className="font-bold text-red-600">${(selectedSale.total_amount - (selectedSale.paid_amount || 0)).toFixed(2)}</p></div>
                        </div>
                        {payments.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">{payments.map(p => (
                                <li key={p.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                    <div><p className="font-medium text-slate-800 dark:text-slate-200">${Number(p.amount).toFixed(2)}</p><p className="text-xs text-slate-400">{p.payment_method}</p></div>
                                    <div className="text-right"><p className="text-slate-500 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p><p className="text-xs text-slate-400">by {p.created_by_name}</p></div>
                                </li>
                            ))}</ul>
                        ) : <p className="text-sm text-slate-400 text-center py-4">No payments recorded yet.</p>}
                        {selectedSale.payment_status !== 'paid' && (
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

export default Sales;
