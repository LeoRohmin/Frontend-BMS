import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Lightbulb, Wind, Zap, Thermometer, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { websocketService, TOPICS } from "../services/websocketService";

// Device mapping: Room ID → PM device name
const deviceMap: Record<number, string> = {
  1: "PM1",
  2: "PM2",
  3: "PM3",
  4: "PM4",
  5: "PM5",
  6: "PM6",
  7: "PM7",
  8: "PM8",
};

const rooms = [
  { id: 1, name: 'Lobby', lights: true, ac: true, power: 24.5, voltage: 220, ampere: 15.2, temperature: 24, kwh: 24.5, history: [] },
  { id: 2, name: 'Office Area', lights: true, ac: true, power: 45.2, voltage: 220, ampere: 28.5, temperature: 22, kwh: 45.2, history: [] },
  { id: 3, name: 'Meeting Room A', lights: false, ac: false, power: 0, voltage: 220, ampere: 0, temperature: 26, kwh: 18.3, history: [] },
  { id: 4, name: 'Meeting Room B', lights: true, ac: true, power: 18.3, voltage: 220, ampere: 12.1, temperature: 23, kwh: 18.3, history: [] },
  { id: 5, name: 'Server Room', lights: true, ac: true, power: 62.8, voltage: 220, ampere: 42.5, temperature: 19, kwh: 62.8, history: [] },
  { id: 6, name: 'Cafeteria', lights: true, ac: true, power: 28.6, voltage: 220, ampere: 18.9, temperature: 25, kwh: 28.6, history: [] },
  { id: 7, name: 'Storage', lights: false, ac: false, power: 0, voltage: 220, ampere: 0, temperature: 28, kwh: 5.2, history: [] },
  { id: 8, name: 'Parking', lights: true, ac: false, power: 8.4, voltage: 220, ampere: 5.6, temperature: 30, kwh: 8.4, history: [] },
];

export default function RoomControl() {
  const [roomsState, setRoomsState] = useState(rooms);
  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // // Generate mock historical data for selected room
  // const generateHistoricalData = (roomPower: number) => {
  //   return Array.from({ length: 24 }, (_, i) => ({
  //     time: `${i.toString().padStart(2, '0')}:00`,
  //     power: Math.max(0, roomPower * (0.8 + Math.random() * 0.4)),
  //     temp: 20 + Math.random() * 8,
  //   }));
  // };

  // === 🔌 SEND TO BACKEND ===
  const sendToBackend = (roomId: number, target: "lamp" | "ac", value: "on" | "off") => {
    const device = deviceMap[roomId];

    websocketService.send({
      type: "command",
      topic: TOPICS.CONTROL,
      payload: {
        device,
        target,   // lamp / ac
        value,    // on / off
      },
      timestamp: Date.now(),
    });

    console.log("Sent to backend:", { device, target, value });
  };

  const toggleLight = (id: number) => {
    setRoomsState(roomsState.map(room =>
      room.id === id ? { ...room, lights: !room.lights } : room
    ));
    const room = roomsState.find(r => r.id === id);
    if (room) {
      sendToBackend(id, "lamp", room.lights ? "off" : "on");
    }
  };
  

  const toggleAC = (id: number) => {
    setRoomsState(roomsState.map(room =>
      room.id === id ? { ...room, ac: !room.ac } : room
    ));
    const room = roomsState.find(r => r.id === id);
    if (room) {
      sendToBackend(id, "ac", room.ac ? "off" : "on");
    }
  };

  

  // === Subscribe to real-time updates from backend ===
  useEffect(() => {
    const unsubscribe = websocketService.subscribe(TOPICS.ROOM_STATUS, (roomsPayload) => {

      if (!Array.isArray(roomsPayload)) return;

      setRoomsState(prevRooms =>
        prevRooms.map(room => {
          const matched = roomsPayload.find(r => r.device === deviceMap[room.id]);

          if (matched) {

            if (selectedRoom && matched.device === deviceMap[selectedRoom.id]) {
              const updatedHistory = Array.isArray(matched.history)
                ? matched.history.map((item: any) => ({
                    time: item.time || item.timestamp?.slice(11, 16) || "--",
                    kwh: item.kwh ?? item.value ?? 0,
                    temperature: item.temperature ?? item.temp ?? 0
                  }))
                : selectedRoom.history;

              // Only update selectedRoom if the history actually changed
              if (JSON.stringify(updatedHistory) !== JSON.stringify(selectedRoom.history)) {
                setSelectedRoom(prev => ({
                  ...prev!,
                  ...matched,
                  history: updatedHistory,
                }));
              }
            }

            return {
              ...room,
              name: matched.room_name || room.name,
              lights: matched.lights,
              ac: matched.ac,
              voltage: matched.voltage,
              ampere: matched.ampere,
              temperature: matched.temperature,
              kwh: matched.kwh,
              power: matched.power,
              history: Array.isArray(matched.history)
                      ? matched.history.map((item: any) => ({
                          time: item.time || item.timestamp?.slice(11, 16) || "--",
                          kwh: item.kwh ?? item.value ?? 0,
                          temperature: item.temperature ?? item.temp ?? 0
                        }))
                      : room.history

            };
          }

          return room;
        })
      );
    });


      // Tes Data
    const unsubscribeTes = websocketService.subscribe(TOPICS.TES, (payload) => {
        console.log("Received TES data:", payload);
    });

    return () => {
      unsubscribe();
      unsubscribeTes();
    };
  }, []);

  useEffect(() => {
  if (selectedRoom) {
    const updated = roomsState.find(r => r.id === selectedRoom.id);
    if (updated) setSelectedRoom(updated);
  }
}, [roomsState]);

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
                        {room.temperature}°C
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
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsDetailsOpen(true);
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
            <DialogDescription>
              View detailed power consumption and temperature data for the selected room.
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{selectedRoom.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={selectedRoom.lights || selectedRoom.ac ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                >
                  {selectedRoom.lights || selectedRoom.ac ? 'Active' : 'Standby'}
                </Badge>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Zap className="h-3 w-3" />
                  <span>Power Meter</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Voltage</span>
                    <p className="font-medium">{selectedRoom.voltage}V</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Ampere</span>
                    <p className="font-medium">{selectedRoom.ampere}A</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Temp</span>
                    <p className="font-medium flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-primary" />
                      {selectedRoom.temperature}°C
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Usage</span>
                    <p className="font-medium text-primary">{selectedRoom.kwh} kWh</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={selectedRoom.history.length > 0 ? selectedRoom.history : Array.from({ length: 24 }, (_, i) => ({
                      time: `${i.toString().padStart(2, '0')}:00`,
                      kwh: 0,
                      temperature: 0,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="kwh" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}