import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import ChildDashboard from './pages/ChildDashboard';
import GroupPage from './pages/GroupPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Store from './pages/Store';

axios.defaults.withCredentials = true; // обязательно для работы сессий

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Автоматический выход через 5 минут бездействия
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, 5 * 60 * 1000); // 5 минут
    };

    const handleLogout = () => {
      axios.post('http://91.229.9.244:5000/auth/logout').catch(() => {});
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  if (!user) return <LoginPage setUser={setUser} />;

  return (
    <Router>
      <Routes>
        {user.role === 'child' && (
          <Route path="/" element={<ChildDashboard user={user} setUser={setUser} />} />
        )}

        {user.role === 'teacher' && (
          <Route path="/*" element={<TeacherDashboard user={user} setUser={setUser} />} />
        )}

        {user.role === 'admin' && (
          <>
            <Route path="/" element={<AdminDashboard user={user} />} />
            <Route path="/group/:groupId" element={<GroupPage />} />
          </>
        )}
        <Route path="/store" element={<Store user={user} />} />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
