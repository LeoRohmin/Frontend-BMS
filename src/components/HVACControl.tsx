import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Wind, Snowflake, Flame, Fan, Gauge, Clock, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const zoneData = [
  { id: 1, name: 'Floor 1 - Lobby', temp: 21.5, target: 22, mode: 'auto', status: 'active' },
  { id: 2, name: 'Floor 2 - Offices', temp: 22.0, target: 22, mode: 'cool', status: 'active' },
  { id: 3, name: 'Floor 3 - Conference', temp: 20.5, target: 21, mode: 'heat', status: 'active' },
  { id: 4, name: 'Floor 4 - Labs', temp: 19.0, target: 19, mode: 'cool', status: 'active' },
  { id: 5, name: 'Floor 5 - Storage', temp: 18.0, target: 18, mode: 'off', status: 'standby' },
];

const initialTempHistoryData = [
  { time: '00:00', actual: 20, target: 22 },
  { time: '04:00', actual: 19.5, target: 22 },
  { time: '08:00', actual: 21, target: 22 },
  { time: '12:00', actual: 22.5, target: 22 },
  { time: '16:00', actual: 22, target: 22 },
  { time: '20:00', actual: 21.5, target: 22 },
  { time: '23:59', actual: 21, target: 22 },
];

export default function HVACControl() {
  const [selectedZone, setSelectedZone] = useState(zoneData[0]);
  const [temperature, setTemperature] = useState([selectedZone.target]);
  const [fanSpeed, setFanSpeed] = useState([50]);
  const [autoMode, setAutoMode] = useState(true);
  const [hvacMode, setHvacMode] = useState('auto');
  const [tempHistoryData, setTempHistoryData] = useState(initialTempHistoryData);

  // Real-time data update simulation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTempHistoryData((prev) => {
        const newData = [...prev];
        const lastItem = newData[newData.length - 1];
        
        // Parse time and add 4 hours
        const [hours, minutes] = lastItem.time.split(':').map(Number);
        let newHours = (hours + 4) % 24;
        const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        // Generate realistic temperature fluctuation
        const target = 22;
        const actualVariance = (Math.random() - 0.5) * 1.5; // ±0.75°C
        const newActual = Number((target + actualVariance).toFixed(1));
        
        newData.shift(); // Remove oldest
        newData.push({ time: newTime, actual: newActual, target: target });
        return newData;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: 'Average Temp', value: '21.2°C', icon: Gauge },
    { title: 'Active Zones', value: '4/5', icon: Wind },
    { title: 'Power Usage', value: '3.8 kW', icon: Fan },
    { title: 'Efficiency', value: '94%', icon: Clock },
  ];

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <card.icon className="h-4 w-4 text-primary" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {card.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle>Climate Zones</CardTitle>
              <CardDescription>Select a zone to control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {zoneData.map((zone, index) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedZone.id === zone.id
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                      : 'hover:bg-accent/50 border-primary/20'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>{zone.name}</span>
                    <Badge 
                      variant={zone.status === 'active' ? 'default' : 'secondary'} 
                      className={zone.status === 'active' ? 'bg-green-500 animate-pulse' : ''}
                    >
                      {zone.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Thermometer className="h-3 w-3" />
                      </motion.div>
                      {zone.temp}°C
                    </span>
                    <span>Target: {zone.target}°C</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone Controls */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedZone.name}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Wind className="h-5 w-5 text-primary" />
                </motion.div>
              </CardTitle>
              <CardDescription>Climate control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="control" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                  <TabsTrigger value="control">Control</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>
                <TabsContent value="control" className="space-y-6 mt-6">
                  {/* Temperature Control */}
                  <motion.div 
                    className="space-y-4 p-4 rounded-lg bg-muted/20 border border-primary/10"
                    whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <div className="flex items-center justify-between">
                      <Label>Target Temperature</Label>
                      <motion.span 
                        className="text-2xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                        key={temperature[0]}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {temperature[0]}°C
                      </motion.span>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      min={16}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>16°C</span>
                      <span>30°C</span>
                    </div>
                  </motion.div>

                  {/* Mode Selection */}
                  <div className="space-y-2">
                    <Label>HVAC Mode</Label>
                    <Select value={hvacMode} onValueChange={setHvacMode}>
                      <SelectTrigger className="bg-muted/30 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover backdrop-blur-xl border-primary/20">
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-primary" />
                            Auto
                          </div>
                        </SelectItem>
                        <SelectItem value="cool">
                          <div className="flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-400" />
                            Cool
                          </div>
                        </SelectItem>
                        <SelectItem value="heat">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-400" />
                            Heat
                          </div>
                        </SelectItem>
                        <SelectItem value="fan">
                          <div className="flex items-center gap-2">
                            <Fan className="h-4 w-4 text-teal-400" />
                            Fan Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fan Speed */}
                  <motion.div 
                    className="space-y-4 p-4 rounded-lg bg-muted/20 border border-primary/10"
                    whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: fanSpeed[0] * 3.6 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Fan className="h-4 w-4" />
                        </motion.div>
                        Fan Speed
                      </Label>
                      <span className="text-lg">{fanSpeed[0]}%</span>
                    </div>
                    <Slider
                      value={fanSpeed}
                      onValueChange={setFanSpeed}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </motion.div>

                  {/* Auto Mode Toggle */}
                  <motion.div 
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 border-primary/10"
                    whileHover={{ 
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }}
                  >
                    <div>
                      <Label>Automatic Mode</Label>
                      <p className="text-sm text-muted-foreground">AI-optimized climate control</p>
                    </div>
                    <Switch checked={autoMode} onCheckedChange={setAutoMode} />
                  </motion.div>
                </TabsContent>
                <TabsContent value="schedule" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Schedule automatic temperature adjustments based on time of day and occupancy.</p>
                    <motion.div 
                      className="border rounded-lg p-4 space-y-3 bg-muted/20 border-primary/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[
                        { time: 'Weekday Morning (6:00 - 9:00)', temp: '22°C' },
                        { time: 'Weekday Day (9:00 - 18:00)', temp: '21°C' },
                        { time: 'Weekday Evening (18:00 - 23:00)', temp: '20°C' },
                        { time: 'Night (23:00 - 6:00)', temp: '18°C' },
                      ].map((schedule, index) => (
                        <motion.div
                          key={schedule.time}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-2 rounded hover:bg-primary/5 transition-colors"
                        >
                          <span>{schedule.time}</span>
                          <span className="text-primary">{schedule.temp}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Temperature History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
          <CardHeader>
            <CardTitle>Temperature History - {selectedZone.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tempHistoryData}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[15, 25]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  name="Actual Temp (°C)"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  name="Target Temp (°C)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
