# Backend Integration Guide

Panduan untuk Backend Developer untuk mengintegrasikan Smart BMS dengan WebSocket server.

## 📡 WebSocket Protocol

### Connection URL
```
ws://your-server:port/ws
```

Untuk production gunakan secure WebSocket:
```
wss://your-server:port/ws
```

### Message Format

Semua message harus dalam format JSON:

```typescript
interface WebSocketMessage {
  type: string;           // Message type: 'subscribe', 'unsubscribe', 'data', 'command', 'auth'
  topic?: string;         // Topic name (optional)
  payload?: any;          // Message payload (optional)
  timestamp?: number;     // Unix timestamp (optional)
}
```

## 📨 Message Types

### 1. Authentication (Optional)

**Client → Server**
```json
{
  "type": "auth",
  "payload": {
    "token": "JWT_TOKEN_HERE"
  },
  "timestamp": 1234567890
}
```

**Server → Client**
```json
{
  "type": "auth_response",
  "payload": {
    "status": "success",
    "user": {
      "id": "user123",
      "username": "admin",
      "role": "Admin"
    }
  },
  "timestamp": 1234567890
}
```

### 2. Subscribe to Topic

**Client → Server**
```json
{
  "type": "subscribe",
  "topic": "energy",
  "timestamp": 1234567890
}
```

**Server → Client** (Confirmation)
```json
{
  "type": "subscribed",
  "topic": "energy",
  "payload": {
    "status": "success"
  },
  "timestamp": 1234567890
}
```

### 3. Unsubscribe from Topic

**Client → Server**
```json
{
  "type": "unsubscribe",
  "topic": "energy",
  "timestamp": 1234567890
}
```

### 4. Data Stream

**Server → Client**
```json
{
  "type": "data",
  "topic": "energy",
  "payload": {
    "power": 145.5,
    "voltage": 220.3,
    "current": 0.66,
    "frequency": 50
  },
  "timestamp": 1234567890
}
```

### 5. Command

**Client → Server**
```json
{
  "type": "command",
  "topic": "lighting",
  "payload": {
    "roomId": "R101",
    "action": "toggle",
    "value": true
  },
  "timestamp": 1234567890
}
```

**Server → Client** (Response)
```json
{
  "type": "command_response",
  "topic": "lighting",
  "payload": {
    "status": "success",
    "roomId": "R101",
    "state": true
  },
  "timestamp": 1234567890
}
```

## 🏷️ Available Topics

### Energy Monitoring
- `energy` - Real-time energy data (power, voltage, current)
- `power` - Power consumption only
- `voltage` - Voltage monitoring
- `current` - Current monitoring

### HVAC System
- `hvac` - HVAC system status
- `temperature` - Temperature readings
- `humidity` - Humidity readings

### Lighting Control
- `lighting` - Lighting status and control

### Room Monitoring
- `room_status` - Room occupancy and status

### Alarms & Notifications
- `alarms` - Critical alarms
- `notifications` - General notifications

### Green Energy
- `solar` - Solar panel data
- `battery` - Battery status

### System
- `system_status` - Overall system health

### Billing
- `billing` - Billing data updates
- `cost` - Cost calculations

## 📊 Data Payload Examples

### Energy Data
```json
{
  "type": "data",
  "topic": "energy",
  "payload": {
    "power": 145.5,        // kW
    "voltage": 220.3,      // V
    "current": 0.66,       // A
    "frequency": 50.0,     // Hz
    "powerFactor": 0.95,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Temperature Data
```json
{
  "type": "data",
  "topic": "temperature",
  "payload": {
    "roomId": "R101",
    "temperature": 24.5,   // °C
    "setpoint": 24.0,
    "status": "cooling",
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Alarm Data
```json
{
  "type": "data",
  "topic": "alarms",
  "payload": {
    "id": "alarm_001",
    "type": "critical",    // critical, warning, info
    "category": "power",
    "message": "Power consumption exceeded threshold",
    "value": 200.5,
    "threshold": 180.0,
    "location": "Main Panel",
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Solar Data
```json
{
  "type": "data",
  "topic": "solar",
  "payload": {
    "output": 45.5,        // kW
    "percentage": 31.2,    // % of total consumption
    "panelVoltage": 380.5,
    "panelCurrent": 120.0,
    "efficiency": 18.5,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Lighting Status
```json
{
  "type": "data",
  "topic": "lighting",
  "payload": {
    "roomId": "R101",
    "state": true,         // on/off
    "brightness": 80,      // 0-100
    "mode": "auto",        // auto, manual
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Room Status
```json
{
  "type": "data",
  "topic": "room_status",
  "payload": {
    "roomId": "R101",
    "name": "Meeting Room 1",
    "occupied": true,
    "temperature": 24.5,
    "humidity": 60,
    "lightingOn": true,
    "hvacOn": true,
    "peopleCount": 5,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

## 🔄 Update Frequency

Recommended update intervals untuk setiap topic:

- **energy, power, voltage, current**: 1-5 seconds
- **temperature, humidity**: 10-30 seconds
- **lighting**: On change only
- **room_status**: 5-10 seconds
- **alarms**: Immediate (on event)
- **solar**: 5-10 seconds
- **system_status**: 30-60 seconds
- **billing, cost**: 1 hour atau on demand

## 🔐 Security Recommendations

### 1. Authentication
```javascript
// Verify JWT token on connection
function handleAuth(message, ws) {
  const { token } = message.payload;
  
  try {
    const user = verifyJWT(token);
    ws.user = user;
    ws.authenticated = true;
    
    ws.send(JSON.stringify({
      type: 'auth_response',
      payload: { status: 'success', user },
      timestamp: Date.now()
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'auth_response',
      payload: { status: 'error', message: 'Invalid token' },
      timestamp: Date.now()
    }));
    ws.close();
  }
}
```

### 2. Authorization
```javascript
// Check permissions before sending data
function canSubscribe(user, topic) {
  const permissions = {
    'admin': ['*'],
    'operator': ['energy', 'power', 'temperature', 'lighting'],
    'technician': ['alarms', 'system_status', 'hvac']
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(topic);
}
```

### 3. Rate Limiting
```javascript
// Limit message rate per client
const rateLimiter = new Map();

function checkRateLimit(ws) {
  const key = ws.user.id;
  const now = Date.now();
  const windowMs = 1000; // 1 second
  const maxMessages = 10;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const limit = rateLimiter.get(key);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }
  
  if (limit.count >= maxMessages) {
    return false;
  }
  
  limit.count++;
  return true;
}
```

## 🛠️ Backend Implementation Example (Node.js)

### Using `ws` library

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store subscriptions
const subscriptions = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Initialize client subscriptions
  ws.subscriptions = new Set();
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    // Cleanup subscriptions
    ws.subscriptions.forEach(topic => {
      unsubscribeFromTopic(ws, topic);
    });
  });
});

function handleMessage(ws, message) {
  const { type, topic, payload } = message;
  
  switch (type) {
    case 'auth':
      handleAuth(ws, payload);
      break;
      
    case 'subscribe':
      subscribeToTopic(ws, topic);
      break;
      
    case 'unsubscribe':
      unsubscribeFromTopic(ws, topic);
      break;
      
    case 'command':
      handleCommand(ws, topic, payload);
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
}

function subscribeToTopic(ws, topic) {
  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, new Set());
  }
  
  subscriptions.get(topic).add(ws);
  ws.subscriptions.add(topic);
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: 'subscribed',
    topic: topic,
    payload: { status: 'success' },
    timestamp: Date.now()
  }));
  
  console.log(`Client subscribed to ${topic}`);
}

function unsubscribeFromTopic(ws, topic) {
  if (subscriptions.has(topic)) {
    subscriptions.get(topic).delete(ws);
    ws.subscriptions.delete(topic);
  }
}

function broadcastToTopic(topic, payload) {
  if (!subscriptions.has(topic)) return;
  
  const message = JSON.stringify({
    type: 'data',
    topic: topic,
    payload: payload,
    timestamp: Date.now()
  });
  
  subscriptions.get(topic).forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Example: Send energy data every 3 seconds
setInterval(() => {
  const energyData = {
    power: Math.random() * 100 + 100,
    voltage: 220 + Math.random() * 10,
    current: Math.random() * 2,
    frequency: 50.0,
    powerFactor: 0.95,
    timestamp: Date.now()
  };
  
  broadcastToTopic('energy', energyData);
}, 3000);

console.log('WebSocket server running on ws://localhost:8080');
```

## 🧪 Testing

### Using wscat
```bash
# Install wscat
npm install -g wscat

# Connect to server
wscat -c ws://localhost:8080/ws

# Subscribe to topic
> {"type":"subscribe","topic":"energy","timestamp":1234567890}

# Send command
> {"type":"command","topic":"lighting","payload":{"roomId":"R101","action":"toggle"},"timestamp":1234567890}
```

### Using JavaScript
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  console.log('Connected');
  
  // Subscribe to energy topic
  ws.send(JSON.stringify({
    type: 'subscribe',
    topic: 'energy',
    timestamp: Date.now()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('Error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

## 📝 Checklist untuk Backend Developer

- [ ] WebSocket server running pada URL yang specified
- [ ] Support JSON message format
- [ ] Implement authentication (jika required)
- [ ] Implement topic-based subscription
- [ ] Send data dengan format yang benar
- [ ] Handle subscribe/unsubscribe requests
- [ ] Handle command requests
- [ ] Implement rate limiting
- [ ] Add error handling
- [ ] Test dengan multiple clients
- [ ] Document API endpoints
- [ ] Setup monitoring dan logging
- [ ] Configure CORS jika needed
- [ ] Use WSS (secure WebSocket) untuk production

## 🔍 Debugging

### Enable verbose logging
```javascript
ws.on('message', (message) => {
  console.log('[RECEIVED]', message);
  // Process message
});

function broadcastToTopic(topic, payload) {
  console.log(`[BROADCAST] Topic: ${topic}, Subscribers: ${subscriptions.get(topic)?.size || 0}`);
  // Send message
}
```

### Monitor connections
```javascript
setInterval(() => {
  console.log(`Active connections: ${wss.clients.size}`);
  subscriptions.forEach((clients, topic) => {
    console.log(`  ${topic}: ${clients.size} subscribers`);
  });
}, 30000);
```

## 📞 Support

Jika ada pertanyaan tentang integration:
1. Check dokumentasi di `/WEBSOCKET_INTEGRATION.md`
2. Lihat example implementation di `/examples/DashboardWithWebSocket.example.tsx`
3. Contact frontend team

---

Happy coding! 🚀
