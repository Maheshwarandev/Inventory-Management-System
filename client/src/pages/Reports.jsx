import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../components/ChartCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';
    const isAdmin = user?.role === 'admin';
    const [activeTab, setActiveTab] = useState('sales');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAdmin && activeTab === 'purchases') {
            setActiveTab('sales');
        }
    }, [activeTab, isAdmin]);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'sales' ? '/reports/sales' : '/reports/purchases';
                const res = await api.get(endpoint);
                setData(res.data);
            } catch (e) { toast.error('Failed to load report'); }
            finally { setLoading(false); }
        };
        fetchReport();
    }, [activeTab]);

    const chartData = {
        labels: data.slice(0, 14).reverse().map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: activeTab === 'sales' ? 'Daily Sales ($)' : 'Daily Purchases ($)',
            data: data.slice(0, 14).reverse().map(d => Number(activeTab === 'sales' ? d.total_sales : d.total_purchases)),
            backgroundColor: activeTab === 'sales' 
                ? (isDark ? '#3b82f6' : '#2563eb') 
                : (isDark ? '#10b981' : '#059669'),
            borderRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#334155',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
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
                ticks: { 
                    font: { family: 'Inter', size: 11 },
                    color: isDark ? '#94a3b8' : '#64748b'
                } 
            },
            y: { 
                grid: { color: isDark ? '#334155' : '#f1f5f9' }, 
                ticks: { 
                    font: { family: 'Inter', size: 11 }, 
                    color: isDark ? '#94a3b8' : '#64748b',
                    callback: v => `$${v}` 
                } 
            }
        }
    };

    const handleExportPDF = () => {
        const title = activeTab === 'sales' ? 'Sales Report' : 'Purchase Report';
        const w = window.open('', '', 'width=900,height=650');
        
        let rowsHtml = '';
        data.forEach(row => {
            const dateStr = new Date(row.date).toLocaleDateString();
            const orders = row.total_orders;
            const amount = Number(activeTab === 'sales' ? row.total_sales : row.total_purchases).toFixed(2);
            rowsHtml += `
                <tr>
                    <td>${dateStr}</td>
                    <td class="text-center">${orders}</td>
                    <td class="text-right">$${amount}</td>
                </tr>
            `;
        });

        const totalAmount = data.reduce((sum, row) => sum + Number(activeTab === 'sales' ? row.total_sales : row.total_purchases), 0).toFixed(2);
        const totalOrders = data.reduce((sum, row) => sum + row.total_orders, 0);

        w.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #334155; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
                    .header p { margin: 5px 0 0 0; font-size: 14px; color: #64748b; }
                    .summary-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 35px; }
                    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 20px; }
                    .card p { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
                    .card h3 { margin: 5px 0 0 0; font-size: 22px; color: #0f172a; font-weight: 700; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    th { background-color: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                    tr:last-child td { border-bottom: none; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>${title}</h1>
                        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #2563eb; font-size: 20px;">IMS Pro</h2>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Warehouse Ledger</p>
                    </div>
                </div>

                <div class="summary-cards">
                    <div class="card">
                        <p>Total Orders</p>
                        <h3>${totalOrders}</h3>
                    </div>
                    <div class="card">
                        <p>Total Amount</p>
                        <h3>$${totalAmount}</h3>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th class="text-center">Total Orders</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        ${data.length === 0 ? '<tr><td colSpan="3" class="text-center" style="color: #94a3b8; padding: 40px 0;">No records found.</td></tr>' : ''}
                    </tbody>
                </table>

                <div class="footer">
                    <p>IMS Pro Inventory Management System &copy; ${new Date().getFullYear()}. All rights reserved.</p>
                </div>
            </body>
            </html>
        `);
        w.document.close();
        w.setTimeout(() => { w.print(); w.close(); }, 250);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analytics and insights</p></div>
                <button onClick={handleExportPDF} disabled={data.length === 0} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">Export PDF</button>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('sales')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sales' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Sales Report</button>
                {isAdmin && (
                    <button onClick={() => setActiveTab('purchases')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Purchase Report</button>
                )}
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-slate-400">Loading data...</div>
            ) : (
                <div className="space-y-6">
                    <ChartCard title={activeTab === 'sales' ? "Sales Trend (Last 14 Days)" : "Purchase Trend (Last 14 Days)"}>
                        <div className="h-80">
                            {data.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>}
                        </div>
                    </ChartCard>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Total Orders</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{new Date(row.date).toLocaleDateString()}</td>
                                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300 text-center">{row.total_orders}</td>
                                        <td className="px-5 py-3 text-slate-900 dark:text-slate-100 font-medium text-right">${Number(activeTab === 'sales' ? row.total_sales : row.total_purchases).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {data.length === 0 && <tr><td colSpan="3" className="px-5 py-8 text-center text-slate-400">No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
