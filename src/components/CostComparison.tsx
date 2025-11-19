import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, DollarSign, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { websocketService, TOPICS } from '../services/websocketService';

const initialWeeklyComparison = [
  { day: 'Mon', pln: 293000, solar: 0 },
  { day: 'Tue', pln: 265600, solar: 0 },
  { day: 'Wed', pln: 278400, solar: 0 },
  { day: 'Thu', pln: 251000, solar: 0 },
  { day: 'Fri', pln: 296000, solar: 0 },
  { day: 'Sat', pln: 197000, solar: 0 },
  { day: 'Sun', pln: 179000, solar: 0 },
];

const initialMonthlyComparison = [
  { month: 'Jul', pln: 6420000, solar: 0 },
  { month: 'Aug', pln: 6580000, solar: 0 },
  { month: 'Sep', pln: 6350000, solar: 1200000 },
  { month: 'Oct', pln: 4920000, solar: 1580000 },
  { month: 'Nov', pln: 4785000, solar: 1650000 },
  { month: 'Dec', pln: 4650000, solar: 1720000 },
  { month: 'Jan', pln: 4580000, solar: 1780000 },
];

export default function CostComparison() {
  const [period, setPeriod] = useState('monthly');
  const [weeklyComparison, setWeeklyComparison] = useState(initialWeeklyComparison);
  const [monthlyComparison, setMonthlyComparison] = useState(initialMonthlyComparison);


  // Real-time data update simulation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update weekly data
      setWeeklyComparison((prev) => {
        const newData = [...prev];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const lastDay = newData[newData.length - 1].day;
        const currentIndex = days.indexOf(lastDay);
        const nextDay = days[(currentIndex + 1) % 7];
        
        // Generate realistic cost data
        const basePlnCost = 250000;
        const variance = Math.random() * 80000 - 40000;
        const newPlnCost = Math.round(basePlnCost + variance);
        const newSolarCost = Math.round(Math.random() * 50000);
        
        newData.shift(); // Remove oldest
        newData.push({ day: nextDay, pln: newPlnCost, solar: newSolarCost });
        return newData;
      });

      // Update monthly data
      setMonthlyComparison((prev) => {
        const newData = [...prev];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const lastMonth = newData[newData.length - 1].month;
        const currentIndex = months.indexOf(lastMonth);
        const nextMonth = months[(currentIndex + 1) % 12];
        
        // Generate realistic monthly cost data
        const basePlnCost = 4500000;
        const plnVariance = Math.random() * 800000 - 400000;
        const newPlnCost = Math.round(basePlnCost + plnVariance);
        const newSolarCost = Math.round(Math.random() * 500000 + 1500000); // 1.5M - 2M
        
        newData.shift(); // Remove oldest
        newData.push({ month: nextMonth, pln: newPlnCost, solar: newSolarCost });
        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const totalPlnCost = 4580000;
  const totalSolarCost = 0;
  const solarSavings = 1780000;
  const savingsPercent = ((solarSavings / (totalPlnCost + solarSavings)) * 100).toFixed(1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Compare energy costs between PLN and Solar sources
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost PLN</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  Rp {totalPlnCost.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Solar Energy Value</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  Rp {solarSavings.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-muted-foreground">Cost avoided</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-green-200 bg-green-50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">Total Savings</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-700">
                  {savingsPercent}%
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>Rp {solarSavings.toLocaleString('id-ID')} saved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Comparison Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Cost Comparison Analysis</CardTitle>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {period === 'weekly' ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="pln" 
                    fill="#59C19B" 
                    name="PLN Cost (Rp)" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar 
                    dataKey="solar" 
                    fill="#FFA048" 
                    name="Solar Cost (Rp)" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pln" 
                    stroke="#59C19B" 
                    strokeWidth={3} 
                    name="PLN Cost (Rp)"
                    dot={{ fill: '#59C19B', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="solar" 
                    stroke="#FFA048" 
                    strokeWidth={3} 
                    name="Solar Savings (Rp)"
                    dot={{ fill: '#FFA048', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Cost Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Solar panels installed in September 2024</p>
              <p>• Average monthly savings: <strong className="text-primary">Rp 1,650,000</strong></p>
              <p>• Peak solar production: <strong className="text-primary">10:00 - 14:00</strong></p>
              <p>• ROI projection: <strong className="text-primary">24 months</strong></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Maximize solar usage during 10:00-15:00</p>
              <p>• Schedule heavy loads during solar peak hours</p>
              <p>• Consider battery storage for night usage</p>
              <p>• Monitor daily patterns for optimization</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
