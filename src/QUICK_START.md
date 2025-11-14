# 🚀 Quick Start Guide - Smart BMS
## SANINDO Orisa ENOSYS

## 📋 Login ke Aplikasi

1. Buka aplikasi di browser
2. Gunakan salah satu credentials berikut:
   ```
   Admin      : admin / admin123
   Operator   : operator / operator123
   Technician : technician / tech123
   ```
3. Klik "Login"
4. Untuk logout, klik icon logout di header (kanan atas)

## 📥 Export Billing Report

1. Buka halaman "Billing Report" dari sidebar
2. Klik tombol "Export PDF" untuk print/save as PDF
3. Atau klik "Export Excel" untuk download CSV file
4. File akan otomatis terdownload

## 🔌 Setup WebSocket (Backend Developer)

### 1. Ubah URL WebSocket
Edit file `/services/websocketService.ts`:
```typescript
export const WEBSOCKET_URL = 'ws://localhost:8080/ws'; // Ganti dengan URL backend Anda
```

### 2. Format Message dari Backend
Backend harus send JSON dengan format:
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

### 3. Test Backend
```bash
# Install wscat
npm install -g wscat

# Connect to your WebSocket server
wscat -c ws://localhost:8080/ws

# Send subscribe message
> {"type":"subscribe","topic":"energy","timestamp":1234567890}
```

## 💻 Integrate WebSocket di Halaman

### Cara Mudah (Copy-Paste)
```typescript
import { websocketService, TOPICS } from '../services/websocketService';
import { useEffect } from 'react';

function MyPage() {
  useEffect(() => {
    // Connect
    websocketService.connect();

    // Subscribe
    const unsubscribe = websocketService.subscribe(TOPICS.ENERGY, (data) => {
      console.log('Data received:', data);
      // Update your state here
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return <div>Your page content</div>;
}
```

## 📊 Available Topics

```typescript
TOPICS.ENERGY        // Real-time energy data
TOPICS.POWER         // Power consumption
TOPICS.TEMPERATURE   // Temperature monitoring
TOPICS.ALARMS        // Alarm notifications
TOPICS.LIGHTING      // Lighting control
TOPICS.HVAC          // HVAC status
TOPICS.SOLAR         // Solar panel data
// ... dan lainnya
```

## 🔄 Send Command ke Backend

```typescript
websocketService.send({
  type: 'command',
  topic: TOPICS.LIGHTING,
  payload: {
    roomId: 'R101',
    action: 'toggle'
  },
  timestamp: Date.now()
});
```

## 📚 Dokumentasi Lengkap

- **Main Documentation**: [README.md](./README.md)
- **WebSocket Guide**: [WEBSOCKET_INTEGRATION.md](./WEBSOCKET_INTEGRATION.md)
- **Backend Guide**: [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)
- **Example Code**: [/examples/DashboardWithWebSocket.example.tsx](./examples/DashboardWithWebSocket.example.tsx)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 🛠️ Common Issues

### WebSocket tidak connect?
1. Check backend server sudah running
2. Verify URL di `/services/websocketService.ts`
3. Check browser console untuk error
4. Test dengan wscat

### Export tidak bekerja?
1. Check popup blocker (untuk PDF)
2. Check browser console untuk error
3. Verify data format sesuai dengan columns

### Login tidak bekerja?
1. Pastikan menggunakan credentials yang benar
2. Check browser console untuk error
3. Clear browser cache jika perlu

## 🎯 Recommended Flow

### Untuk Frontend Developer:
1. ✅ Test login dengan demo credentials
2. ✅ Test export functionality
3. 📝 Pilih halaman untuk integrate WebSocket
4. 📝 Copy code dari example
5. 📝 Customize sesuai kebutuhan

### Untuk Backend Developer:
1. 📝 Read BACKEND_INTEGRATION_GUIDE.md
2. 📝 Setup WebSocket server
3. 📝 Implement message handling
4. 📝 Test dengan wscat
5. 📝 Update frontend URL
6. 📝 Test integration

## ⚡ Tips & Tricks

### Development
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing WebSocket
```javascript
// Quick test di browser console
const ws = new WebSocket('ws://localhost:8080/ws');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'subscribe', topic: 'energy' }));
```

### Debug Mode
```typescript
// Enable verbose logging
localStorage.setItem('debug', 'websocket');
```

## 🔐 Security Checklist

- [ ] Ganti demo credentials dengan real authentication
- [ ] Use HTTPS/WSS di production
- [ ] Implement JWT/OAuth
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Enable CORS properly

## 📞 Need Help?

1. Check documentation files
2. Look at example code
3. Check browser console for errors
4. Contact development team

---

**Happy Coding!** 🎉