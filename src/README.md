# Smart BMS (Building Management System)
## SANINDO Orisa ENOSYS

## 🏢 Overview
Smart BMS adalah sistem manajemen gedung berbasis web yang dikembangkan oleh SANINDO Orisa ENOSYS untuk memungkinkan operator dan teknisi memantau dan mengontrol sistem listrik, AC, dan lampu secara real-time.

## 🎨 Design System
- **Warna Utama**: Hijau Toska (#59C19B)
- **Warna Aksen**: Oranye (#FFA048)
- **Background**: Putih (#F7F9FA)
- **Teks**: Abu Tua (#2E2E2E)
- **Status Colors**: 
  - Hijau untuk normal
  - Merah untuk alarm
  - Kuning untuk warning

## 📱 Fitur Utama

### 1. **Dashboard**
   - Overview sistem secara keseluruhan
   - Real-time monitoring konsumsi energi
   - Status alarm dan notifikasi
   - Grafik power consumption dan solar output

### 2. **Room Control**
   - Kontrol pencahayaan per ruangan
   - Monitoring suhu dan kelembaban
   - Control HVAC system
   - Status occupancy detection

### 3. **Energy Monitoring**
   - Real-time power consumption
   - Voltage dan current monitoring
   - Historical data dan trends
   - Energy efficiency metrics

### 4. **Scheduling**
   - Automation scheduling untuk lighting
   - HVAC scheduling berdasarkan occupancy
   - Time-based energy management
   - Holiday dan weekend schedules

### 5. **Billing Report**
   - Monthly billing reports
   - Cost analysis dan breakdown
   - Export ke PDF dan Excel
   - Cost comparison dengan periode sebelumnya

### 6. **Cost Comparison**
   - Perbandingan biaya PLN vs Solar
   - ROI analysis
   - Savings calculation
   - Monthly dan yearly trends

### 7. **Green Energy**
   - Solar panel monitoring
   - Battery status dan capacity
   - Green energy percentage
   - Carbon footprint reduction

### 8. **Alarm & Notification**
   - Real-time alarm system
   - Priority-based notifications
   - Alarm history dan logging
   - Acknowledgment system

### 9. **Settings**
   - User management
   - System configuration
   - Threshold settings
   - Notification preferences

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 14.x
npm atau yarn
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔐 Login Credentials

Aplikasi sudah dilengkapi dengan sistem login. Gunakan credentials berikut untuk testing:

- **Admin**: username: `admin`, password: `admin123`
- **Operator**: username: `operator`, password: `operator123`
- **Technician**: username: `technician`, password: `tech123`

## 📡 WebSocket Integration

Aplikasi sudah siap untuk koneksi real-time ke backend melalui WebSocket.

### Setup WebSocket Backend

1. **Edit WebSocket URL** di `/services/websocketService.ts`:
```typescript
export const WEBSOCKET_URL = 'ws://your-backend-url:port/ws';
```

2. **Message Format** yang diterima dari backend:
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

3. **Available Topics**:
   - `energy` - Real-time energy data
   - `power` - Power consumption
   - `temperature` - Temperature monitoring
   - `humidity` - Humidity data
   - `alarms` - Alarm notifications
   - `lighting` - Lighting control
   - `hvac` - HVAC status
   - `solar` - Solar panel data
   - Dan lainnya (lihat `/services/websocketService.ts`)

### Cara Menggunakan WebSocket

**Opsi 1: Menggunakan WebSocket Service**
```typescript
import { websocketService, TOPICS } from './services/websocketService';

// Connect
websocketService.connect();

// Subscribe to topic
const unsubscribe = websocketService.subscribe(TOPICS.ENERGY, (data) => {
  console.log('Energy data:', data);
});

// Send command
websocketService.send({
  type: 'command',
  topic: TOPICS.LIGHTING,
  payload: { roomId: '101', action: 'toggle' }
});

// Cleanup
unsubscribe();
```

**Opsi 2: Menggunakan Custom Hook**
```typescript
import { useWebSocket } from './hooks/useWebSocket';

const { status, sendMessage } = useWebSocket({
  url: 'ws://localhost:8080/ws',
  onMessage: (data) => {
    console.log('Received:', data);
  }
});
```

Lihat dokumentasi lengkap di `/WEBSOCKET_INTEGRATION.md` dan contoh implementasi di `/examples/DashboardWithWebSocket.example.tsx`.

## 📊 Export Functionality

### Export Billing Report

Aplikasi mendukung export data billing ke format:
- **PDF**: Browser-based print untuk generate PDF
- **Excel**: Export ke CSV format yang compatible dengan Excel
- **JSON**: Raw data export

```typescript
import { exportToPDF, exportToExcel } from './utils/exportUtils';

// Export to PDF
exportToPDF(data, 'report-name', 'Report Title', columns);

// Export to Excel
exportToExcel(data, 'report-name', columns);
```

## 🏗️ Project Structure

```
/
├── App.tsx                      # Main application
├── components/
│   ├── LoginPage.tsx            # Login page
│   ├── Dashboard.tsx            # Dashboard page
│   ├── RoomControl.tsx          # Room control page
│   ├── EnergyMonitoring.tsx     # Energy monitoring page
│   ├── Scheduling.tsx           # Scheduling page
│   ├── BillingReport.tsx        # Billing report page
│   ├── CostComparison.tsx       # Cost comparison page
│   ├── GreenEnergy.tsx          # Green energy page
│   ├── AlarmPage.tsx            # Alarm & notification page
│   ├── SettingsPage.tsx         # Settings page
│   └── ui/                      # Shadcn UI components
├── hooks/
│   └── useWebSocket.ts          # WebSocket custom hook
├── services/
│   └── websocketService.ts      # WebSocket service singleton
├── utils/
│   └── exportUtils.ts           # Export utilities
├── examples/
│   └── DashboardWithWebSocket.example.tsx  # WebSocket integration example
└── styles/
    └── globals.css              # Global styles
```

## 🔧 Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📝 Development Guidelines

### Adding WebSocket to a Page

1. Import WebSocket service atau hook
2. Subscribe to relevant topics
3. Handle incoming data
4. Update UI state
5. Cleanup on unmount

Contoh lengkap ada di `/examples/DashboardWithWebSocket.example.tsx`.

### Creating New Components

1. Gunakan TypeScript untuk type safety
2. Follow existing component structure
3. Gunakan Shadcn UI components
4. Apply design system colors
5. Add responsive design

### Styling Guidelines

- Gunakan Tailwind CSS classes
- Ikuti design system colors
- JANGAN gunakan font-size, font-weight, atau line-height classes (sudah di-set di globals.css)
- Gunakan motion/react untuk animations
- Responsive design: mobile-first approach

## 🚀 Deployment

### Environment Variables

Buat file `.env` untuk production:
```env
REACT_APP_WS_URL=wss://your-production-websocket-url
REACT_APP_API_URL=https://your-production-api-url
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Backend Requirements

Backend WebSocket server harus:
1. Support WebSocket protocol
2. Accept JSON messages
3. Support topic-based subscription
4. Send data dalam format yang sesuai
5. Handle authentication jika required

## 📖 Documentation

- **WebSocket Integration**: `/WEBSOCKET_INTEGRATION.md`
- **Example Implementation**: `/examples/DashboardWithWebSocket.example.tsx`
- **API Documentation**: [Link to your API docs]

## 🔒 Security Notes

⚠️ **PENTING**: 
- Aplikasi ini untuk demo/development. JANGAN gunakan credentials hardcoded di production.
- Implement proper authentication dengan JWT atau OAuth
- Use HTTPS/WSS untuk production
- Validate dan sanitize semua input dari user
- Implement rate limiting di backend
- Tidak untuk collecting PII atau sensitive data tanpa proper security

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

[Your License Here]

## 👥 Team

- **Your Name** - Developer
- **Your Team** - Design & Development

## 📞 Support

Untuk bantuan dan support:
- Email: [your-email@example.com]
- Docs: [Link to documentation]
- Issues: [Link to issue tracker]

---

© 2025 SANINDO Orisa ENOSYS. All rights reserved.