import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Lightbulb, Sun, Moon, Zap, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const lightingZones = [
  { id: 1, name: 'Floor 1 - Lobby', lights: 48, active: 48, brightness: 100, status: 'on' },
  { id: 2, name: 'Floor 2 - Open Office', lights: 96, active: 72, brightness: 75, status: 'on' },
  { id: 3, name: 'Floor 3 - Meeting Rooms', lights: 32, active: 16, brightness: 60, status: 'partial' },
  { id: 4, name: 'Floor 4 - Executive', lights: 24, active: 24, brightness: 85, status: 'on' },
  { id: 5, name: 'Floor 5 - Storage', lights: 16, active: 0, brightness: 0, status: 'off' },
  { id: 6, name: 'Parking Garage', lights: 64, active: 64, brightness: 50, status: 'on' },
  { id: 7, name: 'Emergency Exits', lights: 20, active: 20, brightness: 100, status: 'on' },
];

const presets = [
  { name: 'Full Brightness', icon: Sun, brightness: 100, color: 'from-yellow-400 to-orange-400' },
  { name: 'Working Hours', icon: Lightbulb, brightness: 75, color: 'from-blue-400 to-cyan-400' },
  { name: 'Energy Saving', icon: Zap, brightness: 50, color: 'from-green-400 to-teal-400' },
  { name: 'Night Mode', icon: Moon, brightness: 25, color: 'from-indigo-400 to-purple-400' },
];

export default function LightingControl() {
  const [zones, setZones] = useState(lightingZones);
  const [selectedZone, setSelectedZone] = useState(lightingZones[0]);
  const [brightness, setBrightness] = useState([selectedZone.brightness]);
  const [autoSchedule, setAutoSchedule] = useState(true);

  const handleZoneToggle = (zoneId: number) => {
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        const newStatus = zone.status === 'off' ? 'on' : 'off';
        const newActive = newStatus === 'off' ? 0 : zone.lights;
        const newBrightness = newStatus === 'off' ? 0 : 75;
        return { ...zone, status: newStatus, active: newActive, brightness: newBrightness };
      }
      return zone;
    }));
  };

  const applyPreset = (presetBrightness: number) => {
    setBrightness([presetBrightness]);
    setZones(zones.map(zone => ({
      ...zone,
      brightness: zone.status !== 'off' ? presetBrightness : 0,
    })));
  };

  const totalLights = zones.reduce((sum, zone) => sum + zone.lights, 0);
  const activeLights = zones.reduce((sum, zone) => sum + zone.active, 0);
  const avgBrightness = Math.round(zones.reduce((sum, zone) => sum + zone.brightness, 0) / zones.length);

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Lights', value: `${activeLights}/${totalLights}`, icon: Lightbulb, sub: 'Active lights' },
          { title: 'Avg Brightness', value: `${avgBrightness}%`, icon: Sun, sub: 'Across all zones' },
          { title: 'Power Usage', value: '2.4 kW', icon: Zap, sub: 'Current draw' },
          { title: 'Efficiency', value: '87%', icon: Clock, sub: 'vs. baseline' },
        ].map((card, index) => (
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
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <card.icon className="h-4 w-4 text-yellow-400" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {card.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Quick Presets
            </CardTitle>
            <CardDescription>Apply lighting presets across all zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presets.map((preset, index) => (
                <motion.div
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className={`h-24 flex flex-col items-center justify-center gap-2 border-primary/20 bg-gradient-to-br ${preset.color} bg-opacity-10 hover:bg-opacity-20 transition-all`}
                    onClick={() => applyPreset(preset.brightness)}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <preset.icon className="h-6 w-6" />
                    </motion.div>
                    <span>{preset.name}</span>
                    <span className="text-sm text-muted-foreground">{preset.brightness}%</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone List */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle>Lighting Zones</CardTitle>
              <CardDescription>Manage lighting by zone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {zones.map((zone, index) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                  className="p-4 border border-primary/20 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <motion.div
                          animate={zone.status !== 'off' ? {
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.6, 1]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className={`h-4 w-4 ${zone.status !== 'off' ? 'text-yellow-400' : 'text-gray-500'}`} />
                        </motion.div>
                        <h4>{zone.name}</h4>
                        <Badge 
                          variant={zone.status === 'on' ? 'default' : zone.status === 'partial' ? 'secondary' : 'outline'}
                          className={zone.status === 'on' ? 'bg-green-500 animate-pulse' : zone.status === 'partial' ? 'bg-amber-500' : ''}
                        >
                          {zone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {zone.active}/{zone.lights} lights active
                      </p>
                    </div>
                    <Switch
                      checked={zone.status !== 'off'}
                      onCheckedChange={() => handleZoneToggle(zone.id)}
                    />
                  </div>
                  {zone.status !== 'off' && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <Label>Brightness</Label>
                        <motion.span
                          key={zone.brightness}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-yellow-400"
                        >
                          {zone.brightness}%
                        </motion.span>
                      </div>
                      <Slider
                        value={[zone.brightness]}
                        onValueChange={(value) => {
                          setZones(zones.map(z => z.id === zone.id ? { ...z, brightness: value[0] } : z));
                        }}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Lighting automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Schedule */}
              <motion.div 
                className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-muted/10"
                whileHover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <div>
                  <Label>Auto Schedule</Label>
                  <p className="text-sm text-muted-foreground">Time-based control</p>
                </div>
                <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
              </motion.div>

              {/* Schedule Info */}
              {autoSchedule && (
                <motion.div 
                  className="space-y-3 p-4 bg-accent/30 rounded-lg border border-primary/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <h4 className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Active Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { time: '6:00 - 9:00', bright: '50%' },
                      { time: '9:00 - 18:00', bright: '75%' },
                      { time: '18:00 - 22:00', bright: '50%' },
                      { time: '22:00 - 6:00', bright: '25%' },
                    ].map((schedule, index) => (
                      <motion.div
                        key={schedule.time}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between p-2 rounded hover:bg-primary/5"
                      >
                        <span className="text-muted-foreground">{schedule.time}</span>
                        <span className="text-yellow-400">{schedule.bright} Brightness</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Motion Sensors */}
              <div className="space-y-3">
                <h4>Motion Sensors</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Floor 2 - Zone A', status: 'Active', active: true },
                    { name: 'Floor 3 - Zone B', status: 'Active', active: true },
                    { name: 'Parking Garage', status: 'Idle', active: false },
                  ].map((sensor, index) => (
                    <motion.div
                      key={sensor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/20"
                    >
                      <span>{sensor.name}</span>
                      <Badge 
                        variant={sensor.active ? 'default' : 'outline'} 
                        className={sensor.active ? 'bg-green-500 animate-pulse' : ''}
                      >
                        {sensor.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Energy Savings */}
              <motion.div 
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                whileHover={{ borderColor: 'rgba(34, 197, 94, 0.5)' }}
              >
                <h4 className="mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  Energy Savings
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Today's savings vs. full brightness</p>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    className="text-2xl text-green-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    12.4 kWh
                  </motion.span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
