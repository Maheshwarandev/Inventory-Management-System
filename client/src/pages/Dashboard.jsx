import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Package, AlertTriangle, DollarSign, Users, Truck, Receipt, Boxes, Warehouse } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { CardSkeleton } from '../components/LoadingSkeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                ]);
                setStats(statsRes.data);
                setSalesData(statsRes.data.revenue_series || []);
            } catch (error) {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = {
        labels: salesData.map(d => d.label),
        datasets: [{
            label: 'Revenue',
            data: salesData.map(d => Number(d.revenue)),
            borderColor: '#1f2a24',
            backgroundColor: 'rgba(31, 42, 36, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#1f2a24',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { size: 12, family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: {
                    font: { size: 11, family: 'Inter' },
                    color: '#94a3b8',
                    callback: (val) => `$${val}`
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-slide-up">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                <CardSkeleton count={6} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="rounded-3xl border border-[#e4dccf] dark:border-slate-700 bg-[#f9f6ef] dark:bg-slate-900 p-5 flex items-start justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#7e6e4f] dark:text-slate-400">Warehouse overview</p>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep receiving, sales, and stock movement aligned in one place.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#1f2a24] text-[#f8efe2] px-3 py-2 text-sm">
                    <Warehouse className="w-4 h-4" /> Live stockroom
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Package} label="Total Products" value={stats?.total_products || 0} color="brand" />
                <StatCard icon={AlertTriangle} label="Low Stock" value={stats?.low_stock_count || 0} color="yellow" />
                <StatCard icon={Receipt} label="Orders" value={stats?.total_sales || 0} color="green" />
                <StatCard icon={DollarSign} label="Revenue (30d)" value={`$${Number(stats?.revenue_30d || 0).toLocaleString()}`} color="green" />
                <StatCard icon={Users} label="Customers" value={stats?.total_customers || 0} color="purple" />
                <StatCard icon={Truck} label="Suppliers" value={stats?.total_suppliers || 0} color="slate" />
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2">
                    <ChartCard title="Revenue Trend (Last 14 Days)">
                        <div className="h-72">
                            {salesData.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                    No sales data yet
                                </div>
                            )}
                        </div>
                    </ChartCard>
                </div>

                {/* Recent Sales */}
                <div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 h-full">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Sales</h3>
                        {stats?.recent_sales?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recent_sales.map((sale, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{sale.customer_name || 'Walk-in'}</p>
                                            <p className="text-xs text-slate-400">{sale.invoice_no}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-3">${Number(sale.total_amount).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No recent sales</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
