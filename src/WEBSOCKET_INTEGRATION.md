# WebSocket Integration Guide untuk Smart BMS

## Overview
Aplikasi Smart BMS sudah dilengkapi dengan WebSocket service dan custom hook untuk koneksi real-time ke backend.

## File-file yang Tersedia

### 1. `/hooks/useWebSocket.ts`
Custom React hook untuk WebSocket connection dengan fitur:
- Auto-reconnect
- Connection status tracking
- Message handling
- Topic subscription

### 2. `/services/websocketService.ts`
Singleton WebSocket service dengan fitur:
- Connection management
- Topic-based subscription
- Message broadcasting
- Reconnection logic

### 3. `/utils/exportUtils.ts`
Utility functions untuk export data ke PDF, Excel, dan JSON

## Cara Mengintegrasikan WebSocket di Halaman

### Opsi 1: Menggunakan Custom Hook (Recommended)

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { status, lastMessage, sendMessage } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    onOpen: () => {
      console.log('Connected to WebSocket');
    },
    onMessage: (data) => {
      console.log('Received data:', data);
      // Update state dengan data real-time
    },
  });

  // Kirim message ke server
  const handleSendMessage = () => {
    sendMessage({
      type: 'command',
      action: 'turn_on_light',
      roomId: '101',
    });
  };

  return (
    <div>
      <p>Status: {status.isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSendMessage}>Send Command</button>
    </div>
  );
}
```

### Opsi 2: Menggunakan WebSocket Service

```typescript
import { websocketService, TOPICS } from '../services/websocketService';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to topic
    const unsubscribe = websocketService.subscribe(TOPICS.ENERGY, (data) => {
      console.log('Energy data:', data);
      // Update state dengan data
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return <div>...</div>;
}
```

## Contoh Integrasi per Halaman

### Dashboard
Subscribe ke multiple topics untuk overview:
```typescript
const topics = [TOPICS.POWER, TOPICS.ALARMS, TOPICS.SYSTEM_STATUS];

useEffect(() => {
  const unsubscribes = topics.map(topic => 
    websocketService.subscribe(topic, handleDataUpdate)
  );

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}, []);
```

### Energy Monitoring
Real-time energy data:
```typescript
websocketService.subscribe(TOPICS.ENERGY, (data) => {
  setPowerData(prev => [...prev.slice(-20), {
    time: new Date().toLocaleTimeString(),
    power: data.power,
    voltage: data.voltage,
    current: data.current,
  }]);
});
```

### Room Control
Control dan monitoring ruangan:
```typescript
// Subscribe to room status
websocketService.subscribe(TOPICS.ROOM_STATUS, (data) => {
  setRooms(prev => prev.map(room => 
    room.id === data.roomId 
      ? { ...room, ...data }
      : room
  ));
});

// Send control command
const handleToggleLight = (roomId: string) => {
  websocketService.send({
    type: 'command',
    topic: TOPICS.LIGHTING,
    payload: {
      roomId,
      action: 'toggle',
    },
  });
};
```

### Alarm & Notification
Real-time alarm updates:
```typescript
websocketService.subscribe(TOPICS.ALARMS, (data) => {
  setAlarms(prev => [data, ...prev]);
  
  // Show toast notification
  toast.error(`Alarm: ${data.message}`);
});
```

## Konfigurasi Backend

### 1. URL WebSocket
Ubah URL di `/services/websocketService.ts`:
```typescript
export const WEBSOCKET_URL = 'ws://your-backend-url:port/ws';
```

### 2. Message Format
Backend harus mengirim message dalam format JSON:
```json
{
  "type": "data",
  "topic": "energy",
  "payload": {
    "power": 145.5,
    "voltage": 220,
    "current": 0.66
  },
  "timestamp": 1234567890
}
```

### 3. Authentication (Optional)
Jika backend memerlukan authentication:
```typescript
websocketService.connect().then(() => {
  websocketService.send({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN',
  });
});
```

## Topics yang Tersedia

```typescript
TOPICS = {
  ENERGY: 'energy',           // Real-time energy data
  POWER: 'power',            // Power consumption
  VOLTAGE: 'voltage',        // Voltage monitoring
  CURRENT: 'current',        // Current monitoring
  HVAC: 'hvac',              // HVAC status
  TEMPERATURE: 'temperature', // Temperature data
  HUMIDITY: 'humidity',      // Humidity data
  LIGHTING: 'lighting',      // Lighting control
  ROOM_STATUS: 'room_status', // Room status updates
  ALARMS: 'alarms',          // Alarm notifications
  NOTIFICATIONS: 'notifications', // General notifications
  SOLAR: 'solar',            // Solar panel data
  BATTERY: 'battery',        // Battery status
  SYSTEM_STATUS: 'system_status', // System health
  BILLING: 'billing',        // Billing updates
  COST: 'cost',              // Cost calculations
  ALL: '*',                  // All messages
}
```

## Error Handling

```typescript
const { status, sendMessage } = useWebSocket({
  url: 'ws://localhost:8080/ws',
  onError: (error) => {
    console.error('WebSocket error:', error);
    toast.error('Connection error occurred');
  },
  onClose: () => {
    console.log('Connection closed');
    toast.warning('Disconnected from server');
  },
});

// Check status
if (status.error) {
  return <div>Error: {status.error}</div>;
}

if (!status.isConnected) {
  return <div>Connecting... ({status.reconnectAttempts} attempts)</div>;
}
```

## Testing dengan Mock Data

Untuk testing tanpa backend, gunakan mock data dengan interval:
```typescript
useEffect(() => {
  // Simulate WebSocket data updates
  const interval = setInterval(() => {
    const mockData = {
      power: Math.random() * 100 + 100,
      voltage: 220 + Math.random() * 10,
      current: Math.random() * 2,
    };
    
    handleDataUpdate(mockData);
  }, 3000);

  return () => clearInterval(interval);
}, []);
```

## Best Practices

1. **Always cleanup subscriptions** di useEffect return
2. **Handle connection errors** gracefully dengan fallback UI
3. **Use TypeScript interfaces** untuk message types
4. **Implement rate limiting** untuk prevent spam
5. **Show connection status** di UI
6. **Buffer messages** saat disconnected (optional)
7. **Validate incoming data** sebelum update state
8. **Use error boundaries** untuk catch runtime errors

## Troubleshooting

### Connection gagal
- Pastikan backend WebSocket server sudah running
- Check CORS configuration di backend
- Verify WebSocket URL correct
- Check firewall/network settings

### Reconnection tidak bekerja
- Check maxReconnectAttempts setting
- Verify reconnectInterval value
- Check browser console untuk error messages

### Data tidak update
- Verify subscription topic correct
- Check message format dari backend
- Verify callback function dipanggil
- Check state update logic

## Production Deployment

1. **Use secure WebSocket (wss://)** untuk production
2. **Implement authentication** dengan JWT token
3. **Add rate limiting** di backend
4. **Monitor connection health** dengan heartbeat
5. **Log errors** untuk debugging
6. **Use environment variables** untuk WebSocket URL

```typescript
const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
```
