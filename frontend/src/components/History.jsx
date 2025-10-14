import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from '../styles/History.module.css';

function formatDate(input) {
  const d = new Date(input);
  if (isNaN(d)) return input;
  return d
    .toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    .replace(',', '');
}

export default function History({ childId }) {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // по 10 записей за раз
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!childId) return;
    setHistory([]); // сбрасываем при смене ребёнка
    setPage(1);
    setHasMore(true);
  }, [childId]);

  useEffect(() => {
    if (!childId || !hasMore) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/child/${childId}/history?page=${page}&limit=${limit}`)
      .then(res => {
        const { history: newHistory, page: currentPage, pages } = res.data;

        setHistory(prev => [...prev, ...newHistory]);
        setHasMore(currentPage < pages); // если текущая страница < всего страниц — можно грузить дальше
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [childId, page]);

  const loadMore = () => {
    if (hasMore) setPage(prev => prev + 1);
  };

  return (
    <div className={styles.history}>
      <h3>История начислений</h3>
      {history.length === 0 ? (
        <p>История пока пуста</p>
      ) : (
        <>
          <ul className={styles.historyList}>
            {history.map((h, i) => {
              const isPositive = h.coins > 0;
              const signSymbol = isPositive ? '+' : '−';
              const signClass = isPositive ? styles.plus : styles.minus;
              return (
                <li key={i} className={styles.transaction}>
                  <span className={signClass}>{signSymbol}</span>
                  <span className={styles.text}>
                    {formatDate(h.date)} — {h.reasons.join(', ') || 'Без причины'}:{" "}
                    <strong>{Math.abs(h.coins)} AC</strong>
                  </span>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <button className={styles.loadMore} onClick={() => setPage(prev => prev + 1)}>
              Показать ещё
            </button>
          )}
        </>
      )}
    </div>
  );
}
