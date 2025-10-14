import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Store.module.css';
import styles1 from '../styles/ChildApp1.module.css';

export default function Store({user}) {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [coins, setCoins] = useState(0);
  const navigate = useNavigate();
  const childId = user.id;
  const localhost = '91.229.9.244';

  useEffect(() => {
    axios.get(`http://${localhost}:5000/child/${childId}/store`).then(res => setProducts(res.data));
    axios.get(`http://${localhost}:5000/child/${childId}`).then(res => setCoins(res.data.coins || 0));
    axios.get(`http://${localhost}:5000/child/${childId}/favorites`).then(res => setFavorites(res.data));
  }, []);

  const toggleFavorite = async (productId) => {
    const res = await axios.post(`http://${localhost}:5000/child/${childId}/favorites/${productId}`);
    setFavorites(res.data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.storeHeader}>
        <h2 className={styles.title}>Магазин</h2>
        <div className={styles.storeHeader_right}>
          <div className={styles.AstroHeader}>
            <strong>{coins}</strong>
            <p className={styles.astacoin}></p> 
          </div>
          <button className={styles.backButton} onClick={() => navigate('/', { state: { favorites } })}>
              Назад к профилю
            </button>
        </div>
      </div>

      <div className={styles.storeContainer}>
        {products.map(p => {
          const isFavorite = favorites.includes(p.id);
          return (
            <div key={p.id} className={styles.productCard}>
              <div style={{ position: 'relative' }}>
                <img src={p.image} alt={p.name} className={styles.productImage} />
                <button onClick={() => toggleFavorite(p.id)} className={styles.heartButton}>
                  <FaHeart color={isFavorite ? 'red' : 'gray'} size={22} />
                </button>
              </div>
              <h4>{p.name}</h4>
              <div className={styles.astacoin_prise}><p className={styles.astacoin_prise_p}>{p.price}</p><p className={styles.astacoin}></p></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
