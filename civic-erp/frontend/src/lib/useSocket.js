import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';

export default function useSocket(onEvent) {
  const { user } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.org_id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? '127.0.0.1:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${user.org_id}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      // console.log('[WebSocket Connected]');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onEvent && payload.event) {
          onEvent(payload.event, payload.data);
        }
      } catch (err) {
        // ignore non-json messages
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 20000);

    return () => {
      clearInterval(pingInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.org_id, onEvent]);

  return socketRef;
}
