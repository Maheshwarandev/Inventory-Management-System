import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Archive } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetchData = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch (e) { toast.error('Failed to fetch inventory'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = inventory.filter(item => {
        if (activeTab === 'low') return item.stock_qty <= item.min_stock && item.stock_qty > 0;
        if (activeTab === 'out') return item.stock_qty === 0;
        return true;
    });

    const getStatus = (item) => {
        if (item.stock_qty === 0) return 'out-of-stock';
        if (item.stock_qty <= item.min_stock) return 'low-stock';
        return 'in-stock';
    };

    const columns = [
        { key: 'name', header: 'Product', sortable: true, accessor: 'name', render: (r) => (
            <div><p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{r.name}</p><p className="text-xs text-slate-400">{r.sku || '—'}</p></div>
        )},
        { key: 'category', header: 'Category', sortable: true, accessor: (r) => r.category_name, render: (r) => <span className="text-slate-600 dark:text-slate-400 text-sm">{r.category_name || '—'}</span> },
        { key: 'min', header: 'Min Level', sortable: true, accessor: 'min_stock', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.min_stock}</span> },
        { key: 'qty', header: 'Current Stock', sortable: true, accessor: 'stock_qty', render: (r) => <span className={`font-bold ${r.stock_qty === 0 ? 'text-red-600' : r.stock_qty <= r.min_stock ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}`}>{r.stock_qty}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={getStatus(r)} /> }
    ];

    const tabs = [
        { label: 'All Stock', value: 'all', count: inventory.length },
        { label: 'Low Stock', value: 'low', count: inventory.filter(i => i.stock_qty <= i.min_stock && i.stock_qty > 0).length },
        { label: 'Out of Stock', value: 'out', count: inventory.filter(i => i.stock_qty === 0).length }
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Stock Control</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor real-time inventory levels</p>
            </div>
            <DataTable 
                columns={columns} 
                data={filteredData} 
                loading={loading} 
                filterTabs={tabs} 
                activeFilter={activeTab} 
                onFilterChange={setActiveTab}
                searchPlaceholder="Search inventory..." 
                emptyTitle="No inventory data" 
                emptyIcon={Archive} 
            />
        </div>
    );
};

export default Inventory;
