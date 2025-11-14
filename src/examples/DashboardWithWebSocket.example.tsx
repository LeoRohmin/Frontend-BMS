/**
 * CONTOH INTEGRASI WEBSOCKET DI DASHBOARD
 * 
 * File ini adalah contoh cara mengintegrasikan WebSocket di halaman Dashboard.
 * Copy dan sesuaikan dengan kebutuhan Anda.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Zap, AlertTriangle, Sun } from 'lucide-react';
import { websocketService, TOPICS } from '../services/websocketService';
import { toast } from 'sonner';

// Interface untuk data real-time
interface EnergyData {
  power: number;
  voltage: number;
  current: number;
  timestamp: number;
}

interface AlarmData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface SolarData {
  output: number;
  percentage: number;
  timestamp: number;
}

export default function DashboardWithWebSocket() {
  // States untuk real-time data
  const [energyData, setEnergyData] = useState<EnergyData>({
    power: 0,
    voltage: 0,
    current: 0,
    timestamp: Date.now(),
  });

  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const [solarData, setSolarData] = useState<SolarData>({
    output: 0,
    percentage: 0,
    timestamp: Date.now(),
  });

  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Connect ke WebSocket saat component mount
  useEffect(() => {
    // Connect to WebSocket server
    websocketService.connect()
      .then(() => {
        console.log('✅ Connected to WebSocket');
        setConnectionStatus('connected');
        toast.success('Connected to real-time server');
      })
      .catch((error) => {
        console.error('❌ Failed to connect:', error);
        setConnectionStatus('error');
        toast.error('Failed to connect to server');
      });

    // Subscribe ke topic ENERGY
    const unsubscribeEnergy = websocketService.subscribe(
      TOPICS.ENERGY,
      (data: EnergyData) => {
        console.log('📊 Energy data received:', data);
        setEnergyData(data);
      }
    );

    // Subscribe ke topic ALARMS
    const unsubscribeAlarms = websocketService.subscribe(
      TOPICS.ALARMS,
      (data: AlarmData) => {
        console.log('🚨 Alarm received:', data);
        
        // Add new alarm to list
        setAlarms((prev) => [data, ...prev].slice(0, 10)); // Keep last 10 alarms
        
        // Show toast notification
        if (data.type === 'critical') {
          toast.error(data.message);
        } else if (data.type === 'warning') {
          toast.warning(data.message);
        } else {
          toast.info(data.message);
        }
      }
    );

    // Subscribe ke topic SOLAR
    const unsubscribeSolar = websocketService.subscribe(
      TOPICS.SOLAR,
      (data: SolarData) => {
        console.log('☀️ Solar data received:', data);
        setSolarData(data);
      }
    );

    // Cleanup saat component unmount
    return () => {
      unsubscribeEnergy();
      unsubscribeAlarms();
      unsubscribeSolar();
      websocketService.disconnect();
    };
  }, []);

  // Function untuk send command ke server
  const handleSendCommand = (command: string, payload: any) => {
    const success = websocketService.send({
      type: 'command',
      topic: TOPICS.SYSTEM_STATUS,
      payload: {
        command,
        ...payload,
      },
      timestamp: Date.now(),
    });

    if (success) {
      toast.success('Command sent successfully');
    } else {
      toast.error('Failed to send command. Not connected.');
    }
  };

  // Render connection status indicator
  const renderConnectionStatus = () => {
    const status = websocketService.getStatus();
    
    if (status.connected) {
      return (
        <Badge className="bg-green-500 text-white">
          <div className="h-2 w-2 rounded-full bg-white mr-2 animate-pulse" />
          Connected
        </Badge>
      );
    } else if (status.connecting) {
      return (
        <Badge className="bg-yellow-500 text-white">
          Connecting... ({status.reconnectAttempts})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500 text-white">
          Disconnected
        </Badge>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard (WebSocket Enabled)</h1>
        {renderConnectionStatus()}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Energy Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Power Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {energyData.power.toFixed(1)} kW
              </div>
              <div className="text-sm text-muted-foreground">
                Voltage: {energyData.voltage.toFixed(1)}V | 
                Current: {energyData.current.toFixed(2)}A
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {new Date(energyData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solar Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sun className="h-4 w-4 text-accent" />
              Solar Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">
                {solarData.output.toFixed(1)} kW
              </div>
              <div className="text-sm text-muted-foreground">
                {solarData.percentage.toFixed(1)}% of total
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {new Date(solarData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alarms Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Active Alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-500">
                {alarms.length}
              </div>
              {alarms.length > 0 ? (
                <div className="space-y-1">
                  {alarms.slice(0, 3).map((alarm) => (
                    <div key={alarm.id} className="text-xs text-muted-foreground">
                      • {alarm.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active alarms
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons - Example */}
      <Card>
        <CardHeader>
          <CardTitle>Remote Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button
              onClick={() => handleSendCommand('reset_alarms', {})}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Reset All Alarms
            </button>
            <button
              onClick={() => handleSendCommand('refresh_data', {})}
              className="px-4 py-2 bg-secondary text-foreground rounded hover:bg-secondary/90"
            >
              Refresh Data
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alarms List */}
      {alarms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alarms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        alarm.type === 'critical'
                          ? 'bg-red-500 text-white'
                          : alarm.type === 'warning'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                      }
                    >
                      {alarm.type}
                    </Badge>
                    <span>{alarm.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alarm.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * ALTERNATIVE: Using useWebSocket Hook
 * 
 * Jika prefer menggunakan hook daripada service:
 */

/*
import { useWebSocket } from '../hooks/useWebSocket';

export default function DashboardWithWebSocketHook() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);

  const { status, lastMessage, sendMessage } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    onOpen: () => {
      console.log('Connected!');
      toast.success('Connected to server');
    },
    onMessage: (data) => {
      // Handle incoming messages
      if (data.topic === 'energy') {
        setEnergyData(data.payload);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error');
    },
  });

  return (
    <div>
      <div>Status: {status.isConnected ? 'Connected' : 'Disconnected'}</div>
      {energyData && (
        <div>Power: {energyData.power} kW</div>
      )}
    </div>
  );
}
*/
