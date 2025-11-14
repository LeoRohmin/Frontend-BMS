import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Lightbulb, Wind, Zap, Thermometer, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const rooms = [
  { id: 1, name: 'Lobby', lights: true, ac: true, power: 24.5, voltage: 220, ampere: 15.2, temp: 24, kwh: 24.5 },
  { id: 2, name: 'Office Area', lights: true, ac: true, power: 45.2, voltage: 220, ampere: 28.5, temp: 22, kwh: 45.2 },
  { id: 3, name: 'Meeting Room A', lights: false, ac: false, power: 0, voltage: 220, ampere: 0, temp: 26, kwh: 18.3 },
  { id: 4, name: 'Meeting Room B', lights: true, ac: true, power: 18.3, voltage: 220, ampere: 12.1, temp: 23, kwh: 18.3 },
  { id: 5, name: 'Server Room', lights: true, ac: true, power: 62.8, voltage: 220, ampere: 42.5, temp: 19, kwh: 62.8 },
  { id: 6, name: 'Cafeteria', lights: true, ac: true, power: 28.6, voltage: 220, ampere: 18.9, temp: 25, kwh: 28.6 },
  { id: 7, name: 'Storage', lights: false, ac: false, power: 0, voltage: 220, ampere: 0, temp: 28, kwh: 5.2 },
  { id: 8, name: 'Parking', lights: true, ac: false, power: 8.4, voltage: 220, ampere: 5.6, temp: 30, kwh: 8.4 },
];

export default function RoomControl() {
  const [roomsState, setRoomsState] = useState(rooms);

  const toggleLight = (id: number) => {
    setRoomsState(roomsState.map(room =>
      room.id === id ? { ...room, lights: !room.lights } : room
    ));
  };

  const toggleAC = (id: number) => {
    setRoomsState(roomsState.map(room =>
      room.id === id ? { ...room, ac: !room.ac } : room
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage lighting and AC controls for each room
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Turn All Lights ON</span>
            <span className="sm:hidden">Lights ON</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Turn All AC ON</span>
            <span className="sm:hidden">AC ON</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roomsState.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold">{room.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={room.lights || room.ac ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                  >
                    {room.lights || room.ac ? 'Active' : 'Standby'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className={`h-4 w-4 ${room.lights ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">Lights</span>
                    </div>
                    <Switch 
                      checked={room.lights} 
                      onCheckedChange={() => toggleLight(room.id)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind className={`h-4 w-4 ${room.ac ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">AC</span>
                    </div>
                    <Switch 
                      checked={room.ac} 
                      onCheckedChange={() => toggleAC(room.id)}
                    />
                  </div>
                </div>

                {/* Power Meter */}
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Zap className="h-3 w-3" />
                    <span>Power Meter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Voltage</span>
                      <p className="font-medium">{room.voltage}V</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Ampere</span>
                      <p className="font-medium">{room.ampere}A</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Temp</span>
                      <p className="font-medium flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-primary" />
                        {room.temp}°C
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Usage</span>
                      <p className="font-medium text-primary">{room.kwh} kWh</p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
