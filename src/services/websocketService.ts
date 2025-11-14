/**
 * WebSocket Service untuk Smart BMS
 * 
 * CARA MENGGUNAKAN:
 * 
 * 1. Ganti WEBSOCKET_URL dengan URL backend WebSocket Anda
 * 2. Sesuaikan message types dengan protocol backend Anda
 * 3. Import service ini di komponen yang membutuhkan real-time data
 */

// TODO: Ganti dengan URL backend WebSocket Anda
export const WEBSOCKET_URL = 'wss://enosys-backend.up.railway.app/ws/dashboard/';

export interface WebSocketMessage {
  type: string;
  topic?: string;
  payload?: any;
  timestamp?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private isManualClose = false;
  private url: string;
  private options?: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  };

  constructor(
    url: string = WEBSOCKET_URL,
    options?: {
      reconnectInterval?: number;
      maxReconnectAttempts?: number;
    }
  ) {
    this.url = url;
    if (options?.reconnectInterval) {
      this.reconnectInterval = options.reconnectInterval;
    }
    if (options?.maxReconnectAttempts) {
      this.maxReconnectAttempts = options.maxReconnectAttempts;
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to:', this.url);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          // Send authentication message if needed
          // this.send({ type: 'auth', token: 'YOUR_TOKEN' });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnecting = false;
          this.ws = null;

          if (!this.isManualClose) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.isManualClose = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectInterval);
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }
  }

  /**
   * Subscribe to a specific topic
   */
  subscribe(topic: string, callback: (data: any) => void) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(callback);

    // Send subscribe message to server
    this.send({
      type: 'subscribe',
      topic: topic,
      timestamp: Date.now(),
    });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(topic, callback);
    };
  }

  /**
   * Unsubscribe from a specific topic
   */
  unsubscribe(topic: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(topic);
    if (listeners) {
      listeners.delete(callback);
      
      if (listeners.size === 0) {
        this.listeners.delete(topic);
        
        // Send unsubscribe message to server
        this.send({
          type: 'unsubscribe',
          topic: topic,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage) {
    const { type, topic, payload } = message;

    // Handle different message types
    if (topic) {
      const listeners = this.listeners.get(topic);
      if (listeners) {
        listeners.forEach((callback) => {
          try {
            callback(payload);
          } catch (error) {
            console.error(`Error in listener for topic ${topic}:`, error);
          }
        });
      }
    }

    // Handle broadcast messages
    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in broadcast listener:', error);
        }
      });
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Available topics for subscription
export const TOPICS = {
  // Real-time energy monitoring
  ENERGY: 'energy',
  POWER: 'power',
  VOLTAGE: 'voltage',
  CURRENT: 'current',
  PLNvsSOLAR: 'pln_vs_solar',

  // HVAC monitoring
  HVAC: 'hvac',
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  
  // Lighting control
  LIGHTING: 'lighting',
  
  // Room status
  ROOM_STATUS: 'room_status',
  
  // Alarms and notifications
  ALARMS: 'alarms',
  NOTIFICATIONS: 'notifications',
  
  // Green energy
  SOLAR: 'solar',
  BATTERY: 'battery',
  
  // System status
  SYSTEM_STATUS: 'system_status',
  
  // Billing and cost
  BILLING: 'billing',
  COST: 'cost',
  
  // All messages
  ALL: '*',
};
