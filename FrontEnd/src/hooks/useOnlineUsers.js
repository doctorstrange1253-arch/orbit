import { useEffect, useState } from 'react';
import { connectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

const useOnlineUsers = () => {
  const user = useAuthStore((s) => s.user);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);

    socket.emit('get-online-users');

    const handleUsersOnline = (userIds) => setOnlineUsers(new Set(userIds));
    const handleUserOnline = (userId) => setOnlineUsers((prev) => new Set([...prev, userId]));
    const handleUserOffline = (userId) => setOnlineUsers((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    socket.on('users-online', handleUsersOnline);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline-status', handleUserOffline);
    socket.on('connect', () => socket.emit('get-online-users'));

    return () => {
      socket.off('users-online', handleUsersOnline);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline-status', handleUserOffline);
    };
  }, [user?._id]);

  return onlineUsers;
};

export default useOnlineUsers;
