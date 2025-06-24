import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (!user || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with user ID
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id
        }));

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          console.log('WebSocket message received:', message);

          // Handle different message types
          switch (message.type) {
            case 'authenticated':
              console.log('WebSocket authenticated for user:', message.data?.userId || user.id);
              break;
              
            case 'progress_update':
              handleProgressUpdate(message.data);
              break;
              
            case 'progress_created':
              handleProgressCreated(message.data);
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && user) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const handleProgressUpdate = (data: any) => {
    if (data?.type === 'topic_progress') {
      // Invalidate and refetch progress-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmaps/${data.roadmapId}/progress`] });
      
      // Show a subtle notification
      toast({
        title: "Progress Synchronized",
        description: `${data.action === 'complete' ? 'Completed' : 'Updated'}: ${data.topic}`,
        duration: 2000,
      });
    }
  };

  const handleProgressCreated = (data: any) => {
    // Invalidate progress queries when new progress is created
    queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    
    toast({
      title: "Progress Started",
      description: "Your learning progress has been initialized",
      duration: 2000,
    });
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect
  };
}