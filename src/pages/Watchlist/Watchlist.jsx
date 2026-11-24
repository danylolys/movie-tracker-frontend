import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './Watchlist.module.css'

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'

const TYPES = {
  1: 'Фільм',
  2: 'Серіал'
}

const STATUSES = {
  0: 'Заплановано',
  1: 'Переглядаю',
  2: 'Переглянуто',
  3: 'Кинуто',
  4: 'Відкладено'
}

function Watchlist() {
  const { userId, isAuthenticated } = useAuth()

  const [items, setItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [loading, setLoading] = useState(
    isAuthenticated && !!userId
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return
    }

    let isCancelled = false

    async function fetchWatchlist() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams()
        params.append('userId', userId)

        if (typeFilter !== '') {
          params.append('type', typeFilter)
        }

        if (statusFilter !== '') {
          params.append('status', statusFilter)
        }

        const [watchlistResponse, reviewsResponse] = await Promise.all([
          apiFetch(`/WatchlistItems?${params.toString()}`),
          apiFetch(`/Reviews?userId=${userId}`)
        ])

        if (!watchlistResponse.ok || !reviewsResponse.ok) {
          throw new Error('Не вдалося завантажити дані.')
        }

        const [watchlistData, reviewsData] = await Promise.all([
          watchlistResponse.json(),
          reviewsResponse.json()
        ])

        if (!isCancelled) {
          setItems(watchlistData)
          setReviews(reviewsData)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Сталася помилка.')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchWatchlist()

    return () => {
      isCancelled = true
    }
  }, [userId, isAuthenticated, typeFilter, statusFilter])

  function getMediaLink(item) {
    return item.type === 1
      ? `/movies/${item.tmdbId}`
      : `/series/${item.tmdbId}`
  }

  function getReview(item) {
    return reviews.find(
      (review) =>
        review.tmdbId === item.tmdbId &&
        review.type === item.type
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.message}>
        Увійдіть в обліковий запис, щоб переглянути свій список.
        <Link to="/auth">Увійти</Link>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Мій список перегляду</h1>
          <p>Фільми та серіали, які ви додали до свого списку</p>
        </div>

        <span className={styles.count}>
          {items.length} записів
        </span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="typeFilter">Тип</label>

          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Усі</option>
            <option value="1">Фільми</option>
            <option value="2">Серіали</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter">Статус</label>

          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Усі статуси</option>

            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.message}>
          Завантаження списку...
        </div>
      ) : error ? (
        <div className={styles.error}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <h2>Список порожній</h2>

          <p>
            Тут відображатимуться фільми та серіали,
            які ви додасте до списку перегляду.
          </p>

          <Link to="/movies">Перейти до фільмів</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => {
            const review = getReview(item)

            return (
              <article key={item.id} className={styles.card}>
                <Link
                  to={getMediaLink(item)}
                  className={styles.posterLink}
                >
                  {item.posterPath ? (
                    <img
                      src={`${IMAGE_URL}${item.posterPath}`}
                      alt={item.title}
                      className={styles.poster}
                    />
                  ) : (
                    <div className={styles.noPoster}>
                      Немає постера
                    </div>
                  )}
                </Link>

                <div className={styles.info}>
                  <span className={styles.type}>
                    {TYPES[item.type] || 'Невідомий тип'}
                  </span>

                  <Link
                    to={getMediaLink(item)}
                    className={styles.title}
                  >
                    {item.title}
                  </Link>

                  <span
                    className={`${styles.status} ${styles[`status${item.status}`] || ''}`}
                  >
                    {STATUSES[item.status] || 'Невідомий статус'}
                  </span>

                  {review && (
                    <span className={styles.rating}>
                      ★ {review.rating}/10
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Watchlist