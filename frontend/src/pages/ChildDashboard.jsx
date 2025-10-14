import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Store from './Store';
import History from '../components/History';
import LogoutButton from "../components/LogoutButton";
import styles from '../styles/ChildApp1.module.css';

export default function ChildDashboard({ user, setUser }) {
  const [child, setChild] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [showStore, setShowStore] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();
  const localhost = '91.229.9.244';

  useEffect(() => {
    if (location.state?.favorites) {
      const updatedFavorites = location.state.favorites;
      axios.get(`/child/${user.id}/store`).then(res => {
        const favProducts = res.data.filter(p => updatedFavorites.includes(p.id));
        setFavorites(favProducts);
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/child/${user.id}`).then(res => setChild(res.data));
    axios.get(`/child/${user.id}/next-lesson`)
      .then(res => setNextLesson(res.data))
      .catch(() => setNextLesson(null));
  }, [user.id]);

  if (!child) return <div>Загрузка...</div>;
  if (showStore) return <Store childId={child.id} />;

  return (
    <div className={`${styles.container} ${styles.dashboard}`}>
      <h1 className={styles.title}>Привет, {child.name}!</h1>
      <div className={styles.coinsBox}>Астракоины: {child.coins} <div className={styles.astacoin}></div></div>
      <LogoutButton setUser={setUser} />
    <div className={styles.character}></div>
      {nextLesson ? (
        <div>
          <h2 className={styles.subtitle}>Следующий урок</h2>
          <p>{nextLesson.day} {nextLesson.time} — {nextLesson.subject}</p>
          {nextLesson.link && <a href={nextLesson.link} target="_blank" rel="noopener noreferrer">Перейти в урок</a>}
        </div>
      ) : <p>Скоро появятся новые уроки ✨</p>}

      <Link to="/store" state={{ user }}><button className={styles.backButton}>🛍 В магазин</button></Link>

      <h3 className={styles.subtitle}>Избранное ❤️</h3>
      <div className={styles.favoriteList}>
        {favorites.map(p => (
          <div key={p.id} className={styles.favoriteCard}>
            <img src={p.image} alt={p.name} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 10 }} />
            <p>{p.name}</p>
            <div className={styles.astacoin_prise}><p className={styles.astacoin_prise_p}>{p.price}</p><p className={styles.astacoin}></p></div>
          </div>
        ))}
      </div>

      <History childId={child.id} />
    </div>
  );
}
