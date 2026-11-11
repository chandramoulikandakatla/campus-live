import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  ChevronDown,
  Check,
  AlertCircle,
  Minus,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useStore, categories } from '@/lib/store';

// Mock transaction data
const mockTransactions = [
  { id: '1', date: 'Today, 2:30 PM', items: ['Glucose Biscuits 100g', 'Mineral Water 1L'], amount: 30, category: 'Biscuits & Cookies' },
  { id: '2', date: 'Today, 10:15 AM', items: ['Dairy Milk Classic 25g', 'Munch Bar'], amount: 35, category: 'Chocolates' },
  { id: '3', date: 'Yesterday', items: ['Surf Excel Powder 500g', 'Tissue Pack 50pcs'], amount: 120, category: 'Hygiene & Home Care' },
  { id: '4', date: 'Yesterday', items: ['Aloo Bhujia 200g', 'Navratan Mix 200g'], amount: 120, category: 'Snacks & Namkeen' },
  { id: '5', date: '2 days ago', items: ['Fresh Coconut Water 300ml', 'Elaichi Rusk 300g'], amount: 100, category: 'Coconut Water' },
];

// Mock spend data for chart
const weeklySpend = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 85 },
  { day: 'Wed', amount: 200 },
  { day: 'Thu', amount: 45 },
  { day: 'Fri', amount: 150 },
  { day: 'Sat', amount: 90 },
  { day: 'Sun', amount: 60 },
];

export default function ParentDashboard() {
  const { parentLimits, updateParentLimits } = useStore();
  const [dailyLimit, setDailyLimit] = useState(parentLimits.daily);
  const [monthlyLimit, setMonthlyLimit] = useState(parentLimits.monthly);
  const [allowedCategories, setAllowedCategories] = useState(parentLimits.categories);

  const spentToday = 125;
  const spentThisMonth = 2450;
  const maxWeeklySpend = Math.max(...weeklySpend.map((d) => d.amount));

  const toggleCategory = (categoryName: string) => {
    setAllowedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const saveSettings = () => {
    updateParentLimits({
      daily: dailyLimit,
      monthly: monthlyLimit,
      categories: allowedCategories,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-trust flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                </div>
                <Badge variant="verified">Parent Portal</Badge>
                <Badge variant="secondary">Sample demo data</Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Spending Control Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage your child's campus spending
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Spent Today',
                value: `₹${spentToday}`,
                limit: `of ₹${dailyLimit}`,
                percent: (spentToday / dailyLimit) * 100,
                icon: DollarSign,
                color: 'text-primary',
              },
              {
                label: 'This Month',
                value: `₹${spentThisMonth}`,
                limit: `of ₹${monthlyLimit}`,
                percent: (spentThisMonth / monthlyLimit) * 100,
                icon: Calendar,
                color: 'text-secondary',
              },
              {
                label: 'Total Orders',
                value: '24',
                limit: 'this month',
                percent: null,
                icon: TrendingUp,
                color: 'text-accent',
              },
              {
                label: 'Healthy Items',
                value: '68%',
                limit: 'of orders',
                percent: 68,
                icon: Check,
                color: 'text-primary',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.limit}</div>
                  {stat.percent !== null && (
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stat.percent, 100)}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          stat.percent > 80 ? 'bg-destructive' : 'bg-primary'
                        }`}
                      />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Spending Chart */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <CardTitle className="mb-6">Weekly Spending</CardTitle>
                <div className="h-48 flex items-end justify-between gap-2">
                  {weeklySpend.map((day, index) => (
                    <motion.div
                      key={day.day}
                      className="flex-1 flex flex-col items-center gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-full relative h-36 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.amount / maxWeeklySpend) * 100}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                          className="w-full bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/30 transition-colors"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              ₹{day.amount}
                            </Badge>
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card className="p-6 mt-6">
                <CardTitle className="mb-4">Recent Transactions</CardTitle>
                <div className="space-y-4">
                  {mockTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-lg">
                            {categories.find((c) => c.name === tx.category)?.icon || '📦'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {tx.items.join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className="font-display font-semibold text-foreground">
                        ₹{tx.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Spending Limits */}
              <Card className="p-6">
                <CardTitle className="mb-6">Spending Limits</CardTitle>
                <div className="space-y-6">
                  {/* Daily Limit */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Daily Limit</span>
                      <span className="font-display font-bold text-lg">₹{dailyLimit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setDailyLimit(Math.max(100, dailyLimit - 50))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(dailyLimit / 1000) * 100}%` }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setDailyLimit(Math.min(1000, dailyLimit + 50))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Monthly Limit */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Monthly Limit</span>
                      <span className="font-display font-bold text-lg">₹{monthlyLimit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setMonthlyLimit(Math.max(1000, monthlyLimit - 500))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${(monthlyLimit / 10000) * 100}%` }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setMonthlyLimit(Math.min(10000, monthlyLimit + 500))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Category Permissions */}
              <Card className="p-6">
                <CardTitle className="mb-4">Category Permissions</CardTitle>
                <p className="text-sm text-muted-foreground mb-4">
                  Select which categories your child can order from
                </p>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const isAllowed = allowedCategories.includes(category.name);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          isAllowed
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span
                            className={`text-sm font-medium ${
                              isAllowed ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {category.name}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isAllowed ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          {isAllowed && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Save Button */}
              <Button variant="hero" size="lg" className="w-full" onClick={saveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
