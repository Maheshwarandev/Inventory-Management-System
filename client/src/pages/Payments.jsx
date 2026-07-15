import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetchData = async () => {
        try {
            // Fetch sales and purchases to extract their payments
            const [salesRes, purRes] = await Promise.all([api.get('/sales'), api.get('/purchases')]);
            
            const salesPayments = [];
            const purPayments = [];

            // We need to fetch individual payments for each sale/purchase
            // But since the API doesn't have a global /payments endpoint yet, we'll construct a mock view 
            // or just show the invoices/POs and their payment status here instead of individual payments
            // To make it simple, let's list all invoices and POs mixed together as "Transactions"
            
            const allTransactions = [
                ...salesRes.data.map(s => ({ ...s, type: 'Sale (Incoming)', ref: `INV-${s.invoice_no}`, name: s.customer_name || 'Walk-in' })),
                ...purRes.data.map(p => ({ ...p, type: 'Purchase (Outgoing)', ref: `PO-${String(p.id).padStart(4, '0')}`, name: p.supplier_name }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setPayments(allTransactions);
        } catch (e) { toast.error('Failed to fetch payments data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = payments.filter(item => {
        if (activeTab === 'incoming') return item.type.includes('Sale');
        if (activeTab === 'outgoing') return item.type.includes('Purchase');
        return true;
    });

    const columns = [
        { key: 'ref', header: 'Reference', sortable: true, accessor: 'ref', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{r.ref}</span> },
        { key: 'type', header: 'Type', sortable: true, accessor: 'type', render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.type}</span> },
        { key: 'party', header: 'Customer / Supplier', accessor: 'name', render: (r) => <span className="text-slate-900 dark:text-slate-100 text-sm font-medium">{r.name || '—'}</span> },
        { key: 'total', header: 'Total Amount', sortable: true, accessor: 'total_amount', render: (r) => <span className="font-semibold text-slate-900 dark:text-slate-100">${Number(r.total_amount).toFixed(2)}</span> },
        { key: 'paid', header: 'Amount Paid', sortable: true, accessor: 'paid_amount', render: (r) => <span className={`font-semibold ${r.type.includes('Sale') ? 'text-emerald-600' : 'text-amber-600'}`}>${Number(r.paid_amount || 0).toFixed(2)}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.payment_status || 'unpaid'} /> },
        { key: 'date', header: 'Date', sortable: true, accessor: 'created_at', render: (r) => <span className="text-slate-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
    ];

    const tabs = [
        { label: 'All Transactions', value: 'all' },
        { label: 'Incoming (Sales)', value: 'incoming' },
        { label: 'Outgoing (Purchases)', value: 'outgoing' }
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Payments & Invoices</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of all incoming and outgoing payments</p>
            </div>
            <DataTable 
                columns={columns} 
                data={filteredData} 
                loading={loading} 
                filterTabs={tabs} 
                activeFilter={activeTab} 
                onFilterChange={setActiveTab}
                searchPlaceholder="Search transactions..." 
                emptyTitle="No transactions" 
                emptyIcon={CreditCard} 
            />
        </div>
    );
};

export default Payments;
