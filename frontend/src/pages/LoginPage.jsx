import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ChildApp.module.css';

export default function LoginPage({ setUser }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Блокируем горизонтальную прокрутку страницы
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { login, password }, { withCredentials: true });
      setUser(res.data);
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Вход</h1>
        <input
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Войти</button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
