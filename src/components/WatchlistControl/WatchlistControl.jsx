import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './WatchlistControl.module.css'

const statuses = [
  { value: 0, label: 'Заплановано', color: 'planned' },
  { value: 1, label: 'Переглядаю', color: 'watching' },
  { value: 2, label: 'Переглянуто', color: 'completed' },
  { value: 3, label: 'Закинуто', color: 'dropped' },
  { value: 4, label: 'На паузі', color: 'paused' }
]

function WatchlistControl({ media, mediaType }) {
  const { isAuthenticated, userId } = useAuth()

  const mediaName = mediaType === 1 ? media.title : media.name
  const mediaId = media.id

  const [watchlistItem, setWatchlistItem] = useState(null)
  const [review, setReview] = useState(null)
  const [rating, setRating] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const currentStatus = statuses.find(
    status => status.value === watchlistItem?.status
  )

  useEffect(() => {
    let isActive = true

    async function loadData() {
      if (!isAuthenticated || !userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
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
            setRating(existingReview?.rating ?? 0)
          }
        } else {
          setReview(null)
          setRating(0)
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
      setReview(null)
      setRating(0)
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

      if (review?.rating > 0) {
        const reviewResponse = await apiFetch(
          `/Reviews/${review.id}/rating`,
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
      setRating(0)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveRating(newRating) {
    if (!watchlistItem) return

    try {
      setIsSaving(true)
      setError('')

      if (newRating === 0) {
        if (!review || review.rating === 0) return

        const response = await apiFetch(
          `/Reviews/${review.id}/rating`,
          {
            method: 'DELETE'
          }
        )

        if (!response.ok) {
          throw new Error('Не вдалося видалити оцінку')
        }

        setReview(previous => ({
          ...previous,
          rating: 0
        }))

        return
      }

      const response = await apiFetch(
        review
          ? `/Reviews/${review.id}/rating`
          : `/Reviews/rating`,
        {
          method: review ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            review
              ? { rating: newRating }
              : {
                  tmdbId: mediaId,
                  type: mediaType,
                  rating: newRating
                }
          )
        }
      )

      if (!response.ok) {
        throw new Error('Не вдалося зберегти оцінку')
      }

      setReview(await response.json())
    } catch (error) {
      setError(error.message)
      setRating(review?.rating ?? 0)
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
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Завантаження...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {watchlistItem ? (
        <>
          <div className={styles.watchlistContainer}>
            <label htmlFor="watchStatus">
              Статус
            </label>

            <div className={styles.statusControl}>
              <select
                id="watchStatus"
                value={watchlistItem.status}
                onChange={handleStatusChange}
                disabled={isSaving}
                className={
                  currentStatus
                    ? styles[currentStatus.color]
                    : ''
                }
              >
                {statuses.map(status => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className={styles.removeButton}
                aria-label="Видалити зі списку"
                title="Видалити зі списку"
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles.ratingContainer}>
            <label htmlFor="mediaRating">
              Ваша оцінка
            </label>

            <div className={styles.ratingControl}>
              <select
                id="mediaRating"
                value={rating}
                onChange={event => {
                  const newRating = Number(event.target.value)
                  setRating(newRating)
                  handleSaveRating(newRating)
                }}
                disabled={isSaving}
              >
                <option value={0}>Без оцінки</option>

                {Array.from(
                  { length: 10 },
                  (_, index) => index + 1
                ).map(value => (
                  <option key={value} value={value}>
                    {value} / 10
                  </option>
                ))}
              </select>
            </div>
          </div>
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

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

export default WatchlistControl