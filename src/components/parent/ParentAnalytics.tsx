import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useStore } from '../../lib/store';

export function ParentAnalytics() {
  const { ecosystem, linkedStudentId } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentOrders = ecosystem.orders.filter((o) => o.studentId === parentLinkedStudent.id);
  const parentTransactions = ecosystem.transactions.filter(
    (t) => t.studentId === parentLinkedStudent.id
  );

  let totalSpent = 0;
  let purchaseCount = 0;

  parentTransactions.forEach((t) => {
    if (t.type === 'Student Purchase') {
      totalSpent += Math.abs(t.amount);
      purchaseCount += 1;
    } else if (t.type === 'Adjustment' && t.amount < 0) {
      totalSpent += Math.abs(t.amount);
    }
  });

  const avgPurchase = purchaseCount > 0 ? Math.round(totalSpent / purchaseCount) : 0;

  // Category Pie Chart
  const categoryMap: Record<string, number> = {
    'Food and Snacks': 0,
    Beverages: 0,
    'Personal Care': 0,
    'Daily Essentials': 0,
    'Academic Supplies': 0,
    'Other Services': 0
  };

  parentOrders.forEach((ord) => {
    if (ord.status === 'Cancelled') return;
    ord.items.forEach((it) => {
      const cat = it.category || 'Daily Essentials';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.subtotal;
    });
  });

  const parentCategoryChartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const highestSpendCategory =
    parentCategoryChartData.length > 0
      ? [...parentCategoryChartData].sort((a, b) => b.value - a.value)[0].name
      : 'None';

  // Monthly Bar Chart Data
  const months = ['Sep 2026', 'Oct 2026', 'Nov 2026'];
  const baseMonthly: Record<string, { month: string; funded: number; spent: number }> = {
    'Sep 2026': { month: 'Sep 2026', funded: 1200, spent: 940 },
    'Oct 2026': { month: 'Oct 2026', funded: 1500, spent: 355 },
    'Nov 2026': { month: 'Nov 2026', funded: 0, spent: 0 }
  };

  parentTransactions.forEach((t) => {
    const m = t.month || 'Nov 2026';
    if (!baseMonthly[m]) baseMonthly[m] = { month: m, funded: 0, spent: 0 };
    if (t.type === 'Wallet Funding') baseMonthly[m].funded += t.amount;
    if (t.type === 'Student Purchase') baseMonthly[m].spent += Math.abs(t.amount);
  });

  const parentMonthlyChartData = months.map((m) => baseMonthly[m]);

  // Daily Trend Line Chart Data
  const days = [
    { day: 'Nov 10', amount: 0, funded: 0 },
    { day: 'Nov 12', amount: 0, funded: 0 },
    { day: 'Nov 14', amount: 0, funded: 0 },
    { day: 'Nov 15', amount: 0, funded: 0 },
    { day: 'Nov 16', amount: 0, funded: 0 }
  ];

  parentTransactions.forEach((t) => {
    const datePrefix = t.timestamp.slice(5, 10); // MM-DD
    const mapDay: Record<string, string> = {
      '11-10': 'Nov 10',
      '11-12': 'Nov 12',
      '11-14': 'Nov 14',
      '11-15': 'Nov 15',
      '11-16': 'Nov 16'
    };
    const targetDay = mapDay[datePrefix];
    const target = days.find((d) => d.day === targetDay);
    if (target) {
      if (t.type === 'Student Purchase') target.amount += Math.abs(t.amount);
      if (t.type === 'Wallet Funding') target.funded += t.amount;
    }
  });

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* 5 Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400">Total Expenditure</span>
          <p className="text-xl font-black text-white mt-1">₹{totalSpent}</p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400">Avg Transaction</span>
          <p className="text-xl font-black text-cyan-400 mt-1">₹{avgPurchase}</p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400">Number of Purchases</span>
          <p className="text-xl font-black text-indigo-400 mt-1">{purchaseCount} Orders</p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400">Highest Spend Category</span>
          <p className="text-base font-extrabold text-amber-400 mt-1 truncate">
            {highestSpendCategory}
          </p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400">Remaining Wallet Balance</span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            ₹{parentLinkedStudent.walletBalance}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">1. Category Distribution (Pie Chart)</h3>
          <div className="relative h-64">
            {parentCategoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parentCategoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ name, value }) => `${name}: ₹${value}`}
                  >
                    {parentCategoryChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No orders available for category distribution.
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">
            2. Monthly Funding vs. Spending (Bar Chart)
          </h3>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parentMonthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="funded"
                  name="Wallet Funded (₹)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="spent"
                  name="Total Spent (₹)"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">
            3. Daily Spending & Top-Up Trend (Line Chart)
          </h3>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Daily Spend (₹)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="funded"
                  name="Wallet Funded (₹)"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
