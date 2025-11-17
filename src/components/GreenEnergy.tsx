import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Sun, Battery, Zap, TrendingUp, Cloud } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { websocketService, TOPICS } from '../services/websocketService';

const initialSolarProductionData = [
  { time: '06:00', production: 5.2 },
  { time: '08:00', production: 28.5 },
  { time: '10:00', production: 52.8 },
  { time: '12:00', production: 68.2 },
  { time: '14:00', production: 58.4 },
  { time: '16:00', production: 38.6 },
  { time: '18:00', production: 12.4 },
];

const initialComparisonData = [
  { month: 'Sep', solar: 1200, pln: 6350 },
  { month: 'Oct', solar: 1580, pln: 4920 },
  { month: 'Nov', solar: 1650, pln: 4785 },
  { month: 'Dec', solar: 1720, pln: 4650 },
  { month: 'Jan', solar: 1780, pln: 4580 },
];

export default function GreenEnergy() {
  const [totalGenerated, setTotalGenerated] = useState(68.2);
  const [efficiency, setEfficiency] = useState(94.5);
  const [solarProductionData, setSolarProductionData] = useState(initialSolarProductionData);
  const [comparisonData, setComparisonData] = useState(initialComparisonData);

  // === CONNECT WEBSOCKET ===
    useEffect(() => {
      websocketService.connect()
      return () => websocketService.disconnect();
    }, []);

  // Update animated stats every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalGenerated(prev => prev + (Math.random() - 0.5) * 0.5);
      setEfficiency(prev => Math.min(99, Math.max(85, prev + (Math.random() - 0.5) * 0.5)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time data update simulation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update solar production data
      setSolarProductionData((prev) => {
        const newData = [...prev];
        const lastItem = newData[newData.length - 1];
        
        // Parse time and add 2 hours
        const [hours, minutes] = lastItem.time.split(':').map(Number);
        let newHours = (hours + 2) % 24;
        const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        // Generate realistic solar production based on time
        let production = 0;
        if (newHours >= 6 && newHours <= 18) {
          // Peak production between 10:00-14:00
          const peakTime = 12;
          const hoursFromPeak = Math.abs(newHours - peakTime);
          const maxProduction = 70;
          production = Math.max(0, maxProduction - (hoursFromPeak * 8) + (Math.random() - 0.5) * 10);
        }
        
        newData.shift(); // Remove oldest
        newData.push({ time: newTime, production: Math.max(0, production) });
        return newData;
      });

      // Update comparison data
      setComparisonData((prev) => {
        const newData = [...prev];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const lastMonth = newData[newData.length - 1].month;
        const currentIndex = months.indexOf(lastMonth);
        const nextMonth = months[(currentIndex + 1) % 12];
        
        // Generate realistic data
        const newSolar = Math.round(Math.random() * 400 + 1400); // 1400-1800 kWh
        const newPln = Math.round(Math.random() * 800 + 4200); // 4200-5000 kWh
        
        newData.shift(); // Remove oldest
        newData.push({ month: nextMonth, solar: newSolar, pln: newPln });
        return newData;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const savedCost = Math.round(totalGenerated * 2000);
  const solarPercentage = 32;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Monitor solar panel performance and green energy production
        </p>
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <Sun className="h-3 w-3 mr-1" />
          System Active
        </Badge>
      </div>

      {/* Solar Panel Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Generated Power</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Sun className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {totalGenerated.toFixed(1)} kWh
                </div>
                <p className="text-xs text-muted-foreground">Today's production</p>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">System Efficiency</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {efficiency.toFixed(1)}%
                </div>
                <Progress value={efficiency} className="h-2" />
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
                <CardTitle className="text-sm font-medium text-green-700">Saved Cost</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-700">
                  Rp {savedCost.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-green-600">vs PLN rate today</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Production Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-600" />
              Solar Production Over Time (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={solarProductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#FFA048" 
                  strokeWidth={3} 
                  name="Production (kWh)"
                  dot={{ fill: '#FFA048', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PLN vs Solar Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Solar vs PLN Usage (Monthly kWh)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="solar" 
                    fill="#FFA048" 
                    name="Solar (kWh)" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar 
                    dataKey="pln" 
                    fill="#59C19B" 
                    name="PLN (kWh)" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Panel Capacity</span>
                  <span className="font-medium">100 kWp</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Active Panels</span>
                  <Badge className="bg-green-100 text-green-700">48/48 Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Today's Peak</span>
                  <span className="font-medium text-accent">68.2 kWh @ 12:00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Weather Condition</span>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Sunny</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Solar Contribution</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{solarPercentage}%</span>
                    <span className="text-sm text-muted-foreground">of total</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm">
                    <strong className="text-yellow-800">Environmental Impact:</strong>
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Today's solar production avoided <strong>34.1 kg CO₂</strong> emissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
