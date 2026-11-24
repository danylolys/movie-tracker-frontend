import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './WatchlistControl.module.css'

const statuses = [
  { value: 0, label: 'Заплановано' },
  { value: 1, label: 'Переглядаю' },
  { value: 2, label: 'Переглянуто' },
  { value: 3, label: 'Закинуто' },
  { value: 4, label: 'На паузі' }
]

function WatchlistControl({ media, mediaType }) {
  const { isAuthenticated, userId } = useAuth()

  const mediaName = mediaType === 1 ? media.title : media.name
  const mediaId = media.id

  const [watchlistItem, setWatchlistItem] = useState(null)
  const [review, setReview] = useState(null)
  const [rating, setRating] = useState(10)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadData() {
      if (!isAuthenticated || !userId) {
        setIsLoading(false)
        return
      }

      try {
        setError('')

        const response = await apiFetch(
          `/WatchlistItems?userId=${userId}`
        )

        if (!response.ok) {
          throw new Error('Не вдалося завантажити список перегляду')
        }

        const items = await response.json()

        const existingItem = items.find(item =>
          item.tmdbId === mediaId &&
          item.type === mediaType
        )

        if (!isActive) return

        setWatchlistItem(existingItem || null)

        if (existingItem) {
          const reviewResponse = await apiFetch(
            `/Reviews?userId=${userId}&tmdbId=${mediaId}&type=${mediaType}`
          )

          if (!reviewResponse.ok) {
            throw new Error('Не вдалося завантажити оцінку')
          }

          const reviews = await reviewResponse.json()

          const existingReview = reviews.find(review =>
            review.tmdbId === mediaId &&
            review.type === mediaType
          )

          if (isActive) {
            setReview(existingReview || null)
            setRating(existingReview ? existingReview.rating : 10)
          }
        } else {
          setReview(null)
          setRating(10)
        }
      } catch (error) {
        if (isActive) {
          setError(error.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [userId, mediaId, mediaType, isAuthenticated])

  async function handleAdd() {
    try {
      setIsSaving(true)
      setError('')

      const response = await apiFetch(
        `/WatchlistItems?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tmdbId: mediaId,
            type: mediaType,
            title: mediaName,
            posterPath: media.poster_path,
            status: 0
          })
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося додати до списку')
      }

      setWatchlistItem(await response.json())
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(event) {
    const newStatus = Number(event.target.value)

    try {
      setIsSaving(true)
      setError('')

      const response = await apiFetch(
        `/WatchlistItems/${watchlistItem.id}?userId=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tmdbId: mediaId,
            type: mediaType,
            title: mediaName,
            posterPath: media.poster_path,
            status: newStatus
          })
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося змінити статус')
      }

      setWatchlistItem(previous => ({
        ...previous,
        status: newStatus
      }))
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setIsSaving(true)
      setError('')

      if (review) {
        const reviewResponse = await apiFetch(
          `/Reviews/${review.id}?userId=${userId}`,
          {
            method: 'DELETE'
          }
        )

        if (!reviewResponse.ok) {
          throw new Error('Не вдалося видалити оцінку')
        }
      }

      const response = await apiFetch(
        `/WatchlistItems/${watchlistItem.id}?userId=${userId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося видалити зі списку')
      }

      setWatchlistItem(null)
      setReview(null)
      setRating(10)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveRating() {
    if (!watchlistItem) {
      setError('Спочатку додайте до списку перегляду')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      const reviewData = {
        tmdbId: mediaId,
        type: mediaType,
        rating: Number(rating),
        comment: ''
      }

      const response = await apiFetch(
        review
          ? `/Reviews/${review.id}?userId=${userId}`
          : `/Reviews?userId=${userId}`,
        {
          method: review ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reviewData)
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося зберегти оцінку')
      }

      if (review) {
        setReview(previous => ({
          ...previous,
          rating: Number(rating)
        }))
      } else {
        setReview(await response.json())
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteRating() {
    try {
      setIsSaving(true)
      setError('')

      const response = await apiFetch(
        `/Reviews/${review.id}?userId=${userId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося видалити оцінку')
      }

      setReview(null)
      setRating(10)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <p>Увійдіть, щоб додати до списку або оцінити.</p>

        <Link to="/auth" className={styles.button}>
          Увійти
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <p>Завантаження...</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.watchlistContainer}>
        {watchlistItem ? (
          <>
            <label htmlFor="watchStatus">
              Статус перегляду
            </label>

            <select
              id="watchStatus"
              value={watchlistItem.status}
              onChange={handleStatusChange}
              disabled={isSaving}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleDelete}
              disabled={isSaving}
              className={styles.deleteButton}
            >
              Видалити зі списку
            </button>
          </>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isSaving}
            className={styles.button}
          >
            {isSaving ? 'Додавання...' : 'Додати до списку'}
          </button>
        )}
      </div>

      {watchlistItem && (
        <div className={styles.ratingContainer}>
          <label htmlFor="mediaRating">
            Ваша оцінка
          </label>

          <select
            id="mediaRating"
            value={rating}
            onChange={event => setRating(Number(event.target.value))}
            disabled={isSaving}
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map(value => (
              <option key={value} value={value}>
                {value} / 10
              </option>
            ))}
          </select>

          <button
            onClick={handleSaveRating}
            disabled={isSaving}
            className={styles.button}
          >
            {isSaving
              ? 'Збереження...'
              : review
                ? 'Оновити оцінку'
                : 'Зберегти оцінку'}
          </button>

          {review && (
            <button
              onClick={handleDeleteRating}
              disabled={isSaving}
              className={styles.deleteButton}
            >
              Видалити оцінку
            </button>
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default WatchlistControl