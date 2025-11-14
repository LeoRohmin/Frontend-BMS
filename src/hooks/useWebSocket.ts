import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
}

export interface WebSocketStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

/**
 * Custom hook untuk WebSocket connection
 * 
 * Usage:
 const { status, sendMessage, lastMessage } = useWebSocket({
 *   url: 'ws://localhost:8080/ws',
 *   onMessage: (data) => console.log('Received:', data)
 * });
 */
export function useWebSocket(config: WebSocketConfig) {
  const {
    url,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = config;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });
  
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (!url) return;

    // Jangan koneksi jika sudah connecting atau connected
    if (ws.current?.readyState === WebSocket.CONNECTING || 
        ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Create WebSocket connection
      // TODO: Ganti dengan URL backend WebSocket Anda
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected to:', url);
        setStatus({
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        });
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus(prev => ({
          ...prev,
          error: 'Connection error occurred',
        }));
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to create connection',
      }));
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setStatus({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.current.send(message);
      return true;
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

/**
 * Hook untuk subscribe ke specific topic/channel
 */
export function useWebSocketSubscription(
  websocketUrl: string,
  topic: string,
  onData: (data: any) => void
) {
  const { status, sendMessage, lastMessage } = useWebSocket({
    url: websocketUrl,
    onOpen: () => {
      // Subscribe to topic when connection opens
      sendMessage({
        type: 'subscribe',
        topic: topic,
      });
    },
    onMessage: (data) => {
      // Filter messages by topic
      if (data.topic === topic) {
        onData(data.payload);
      }
    },
  });

  return { status, lastMessage };
}
