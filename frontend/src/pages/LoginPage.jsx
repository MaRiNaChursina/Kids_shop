import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/ChildApp.module.css';

export default function LoginPage({ setUser }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const localhost = '91.229.9.244';

  const handleLogin = async () => {
    try {
      const res = await axios.post(`http://${localhost}:5000/auth/login`, { login, password });
      setUser(res.data);
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Вход</h1>
        <input placeholder="Логин" value={login} onChange={e => setLogin(e.target.value)} />
        <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Войти</button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
