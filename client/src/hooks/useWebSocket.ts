import { useState, useEffect, useCallback, useRef } from "react";

export interface WebSocketMessage {
  type: string;
  payload?: any;
  message?: string;
  timestamp: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // Cleanup previous connection if exists
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Clear any existing reconnect timer
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Establish connection with correct protocol and path
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          console.log("WebSocket message received:", message);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error occurred");
      };

      socket.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connect();
        }, 3000);
      };
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setError("Failed to connect to server");
      setIsConnected(false);
    }
  }, []);

  // Send a message through the WebSocket
  const sendMessage = useCallback((type: string, payload?: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Connect on component mount
  useEffect(() => {
    connect();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect: connect
  };
}