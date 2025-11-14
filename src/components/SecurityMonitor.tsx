import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Camera, Lock, Unlock, AlertTriangle, CheckCircle, Bell, DoorOpen, Shield, Activity, Eye, Radio } from 'lucide-react';
import { motion } from 'motion/react';

const cameras = [
  { id: 1, name: 'Main Entrance', location: 'Floor 1', status: 'online', alert: false },
  { id: 2, name: 'Lobby', location: 'Floor 1', status: 'online', alert: false },
  { id: 3, name: 'Parking Garage', location: 'Basement', status: 'online', alert: true },
  { id: 4, name: 'Loading Dock', location: 'Basement', status: 'online', alert: false },
  { id: 5, name: 'East Stairwell', location: 'Floor 2', status: 'online', alert: false },
  { id: 6, name: 'West Stairwell', location: 'Floor 2', status: 'offline', alert: true },
  { id: 7, name: 'Rooftop Access', location: 'Floor 5', status: 'online', alert: false },
  { id: 8, name: 'Server Room', location: 'Floor 3', status: 'online', alert: false },
];

const doorLocks = [
  { id: 1, name: 'Main Entry', location: 'Floor 1', locked: false, lastAccess: '2 min ago' },
  { id: 2, name: 'Emergency Exit A', location: 'Floor 1', locked: true, lastAccess: '3 hours ago' },
  { id: 3, name: 'Emergency Exit B', location: 'Floor 2', locked: true, lastAccess: '5 hours ago' },
  { id: 4, name: 'Server Room', location: 'Floor 3', locked: true, lastAccess: '1 hour ago' },
  { id: 5, name: 'Executive Suite', location: 'Floor 4', locked: true, lastAccess: '30 min ago' },
  { id: 6, name: 'Rooftop Access', location: 'Floor 5', locked: true, lastAccess: '2 days ago' },
];

const accessLog = [
  { id: 1, user: 'John Smith', location: 'Main Entry', action: 'Entry', time: '2 min ago', status: 'success' },
  { id: 2, user: 'Sarah Johnson', location: 'Server Room', action: 'Entry', time: '15 min ago', status: 'success' },
  { id: 3, user: 'Unknown', location: 'Parking Garage', action: 'Motion Detected', time: '23 min ago', status: 'alert' },
  { id: 4, user: 'Mike Davis', location: 'Executive Suite', action: 'Entry', time: '30 min ago', status: 'success' },
  { id: 5, user: 'Unknown Badge', location: 'Server Room', action: 'Failed Entry', time: '1 hour ago', status: 'denied' },
  { id: 6, user: 'Lisa Anderson', location: 'Main Entry', action: 'Exit', time: '1 hour ago', status: 'success' },
  { id: 7, user: 'Tom Wilson', location: 'Emergency Exit A', action: 'Entry', time: '3 hours ago', status: 'success' },
];

export default function SecurityMonitor() {
  const [locks, setLocks] = useState(doorLocks);

  const toggleLock = (lockId: number) => {
    setLocks(locks.map(lock => 
      lock.id === lockId ? { ...lock, locked: !lock.locked } : lock
    ));
  };

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const activeLocks = locks.filter(l => l.locked).length;
  const activeAlerts = cameras.filter(c => c.alert).length + 
                        accessLog.filter(l => l.status === 'alert' || l.status === 'denied').length;

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Cameras', value: `${onlineCameras}/${cameras.length}`, sub: 'Online', icon: Camera, color: 'from-blue-400 to-cyan-400' },
          { title: 'Door Locks', value: `${activeLocks}/${locks.length}`, sub: 'Secured', icon: Lock, color: 'from-green-400 to-teal-400' },
          { title: 'Active Alerts', value: activeAlerts, sub: activeAlerts > 0 ? 'Attention Required' : 'All Clear', icon: AlertTriangle, color: 'from-amber-400 to-orange-400' },
          { title: 'System Status', value: 'Armed', sub: 'Operational', icon: Shield, color: 'from-indigo-400 to-purple-400' },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow relative overflow-hidden">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`}
                animate={{
                  opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <card.icon className="h-4 w-4 text-primary" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                    {card.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cameras */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                Surveillance Cameras
              </CardTitle>
              <CardDescription>Monitor camera feeds</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {cameras.map((camera, index) => (
                    <motion.div
                      key={camera.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-3 border border-primary/20 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={camera.status === 'online' ? {
                              scale: [1, 1.2, 1],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Camera className={`h-4 w-4 ${camera.status === 'online' ? 'text-green-400' : 'text-red-400'}`} />
                          </motion.div>
                          <div>
                            <h4>{camera.name}</h4>
                            <p className="text-sm text-muted-foreground">{camera.location}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={camera.status === 'online' ? 'default' : 'destructive'} 
                          className={camera.status === 'online' ? 'bg-green-500' : ''}
                        >
                          <motion.div
                            animate={camera.status === 'online' ? {
                              opacity: [1, 0.5, 1],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1"
                          >
                            <Radio className="h-3 w-3" />
                            {camera.status}
                          </motion.div>
                        </Badge>
                      </div>
                      {camera.alert && (
                        <motion.div 
                          className="flex items-center gap-2 p-2 bg-amber-500/20 border border-amber-500/40 rounded text-sm"
                          animate={{
                            borderColor: ['rgba(251, 146, 60, 0.4)', 'rgba(251, 146, 60, 0.8)', 'rgba(251, 146, 60, 0.4)'],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span>Motion detected</span>
                        </motion.div>
                      )}
                      {!camera.alert && camera.status === 'online' && (
                        <Button variant="outline" size="sm" className="w-full mt-2 border-primary/20 hover:border-primary/40">
                          View Feed
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Door Locks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-400" />
                Access Control
              </CardTitle>
              <CardDescription>Door lock management</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {locks.map((lock, index) => (
                    <motion.div
                      key={lock.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 border border-primary/20 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{
                              rotate: lock.locked ? 0 : 20,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {lock.locked ? (
                              <Lock className="h-4 w-4 text-green-400" />
                            ) : (
                              <Unlock className="h-4 w-4 text-amber-400" />
                            )}
                          </motion.div>
                          <div>
                            <h4>{lock.name}</h4>
                            <p className="text-sm text-muted-foreground">{lock.location}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={lock.locked ? 'default' : 'secondary'} 
                          className={lock.locked ? 'bg-green-500' : 'bg-amber-500'}
                        >
                          {lock.locked ? 'Locked' : 'Unlocked'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Last access: {lock.lastAccess}
                      </p>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={lock.locked ? 'outline' : 'default'}
                          size="sm"
                          className="w-full border-primary/20"
                          onClick={() => toggleLock(lock.id)}
                        >
                          {lock.locked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Lock
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Access Log
              </CardTitle>
              <CardDescription>Recent security events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {accessLog.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className="p-3 border border-primary/20 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            >
                              {entry.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                              {entry.status === 'denied' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                              {entry.status === 'alert' && <Bell className="h-4 w-4 text-amber-400" />}
                            </motion.div>
                            <h4>{entry.action}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.user}</p>
                          <p className="text-sm text-muted-foreground">{entry.location}</p>
                        </div>
                        <Badge 
                          variant={entry.status === 'success' ? 'default' : entry.status === 'denied' ? 'destructive' : 'secondary'}
                          className={
                            entry.status === 'success' ? 'bg-green-500' :
                            entry.status === 'alert' ? 'bg-amber-500' : ''
                          }
                        >
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.time}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emergency Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Emergency Controls
            </CardTitle>
            <CardDescription>Quick access to emergency functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Unlock All Doors', icon: DoorOpen, variant: 'outline' as const },
                { label: 'Lock All Doors', icon: Lock, variant: 'outline' as const },
                { label: 'Emergency Alert', icon: AlertTriangle, variant: 'destructive' as const },
              ].map((btn, index) => (
                <motion.div
                  key={btn.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant={btn.variant} className="h-20 w-full border-primary/20">
                    <div className="flex flex-col items-center gap-2">
                      <btn.icon className="h-6 w-6" />
                      <span>{btn.label}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
