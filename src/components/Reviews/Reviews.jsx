import { useCallback, useEffect, useState } from 'react'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './Reviews.module.css'

function Reviews({ tmdbId, type }) {
  const { userId, isAdmin, isAuthenticated } = useAuth()

  const [reviews, setReviews] = useState([])
  const [comment, setComment] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reactionLoadingId, setReactionLoadingId] = useState(null)
  const [error, setError] = useState('')

  const loadReviews = useCallback(async () => {
    const params = new URLSearchParams({
      tmdbId: String(tmdbId),
      type: String(type)
    })

    const response = await apiFetch(`/Reviews?${params}`)

    if (!response.ok) {
      throw new Error('Не вдалося завантажити коментарі')
    }

    const data = await response.json()

    return Array.isArray(data)
      ? data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      : []
  }, [tmdbId, type])

  const refreshReviews = useCallback(async () => {
    const data = await loadReviews()
    setReviews(data)
  }, [loadReviews])

  useEffect(() => {
    let cancelled = false

    async function fetchReviews() {
      try {
        const data = await loadReviews()

        if (!cancelled) {
          setReviews(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchReviews()

    return () => {
      cancelled = true
    }
  }, [loadReviews])

  const isOwner = (review) =>
    userId != null &&
    String(review.userId) === String(userId)

  const ownComment = reviews.find(
    (review) => isOwner(review) && review.comment?.trim()
  )

  const resetForm = () => {
    setComment('')
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated || !userId) {
      return
    }

    if (!comment.trim()) {
      setError('Напишіть текст коментаря')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const endpoint = editingId
        ? `/Reviews/${editingId}/comment`
        : '/Reviews/comment'

      const body = editingId
        ? { comment: comment.trim() }
        : {
          tmdbId: Number(tmdbId),
          type: Number(type),
          comment: comment.trim()
        }

      const response = await apiFetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
          data.error ||
          'Не вдалося зберегти коментар'
        )
      }

      resetForm()
      await refreshReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setComment(review.comment || '')
    setError('')

    const form = document.querySelector(`.${styles.form}`)

    if (form) {
      window.scrollTo({
        top: form.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth'
      })
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити коментар?')) {
      return
    }

    try {
      setError('')

      const response = await apiFetch(
        `/Reviews/${reviewId}/comment`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Не вдалося видалити коментар')
      }

      if (editingId === reviewId) {
        resetForm()
      }

      await refreshReviews()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReaction = async (review, isLike) => {
    if (!isAuthenticated || reactionLoadingId === review.id) {
      return
    }

    try {
      setReactionLoadingId(review.id)
      setError('')

      const currentReaction = review.reactions?.currentUserReaction

      if (currentReaction === isLike) {
        const response = await apiFetch(
          `/Reviews/${review.id}/reaction`,
          { method: 'DELETE' }
        )

        if (!response.ok) {
          throw new Error('Не вдалося видалити реакцію')
        }
      } else {
        const response = await apiFetch(
          `/Reviews/${review.id}/reaction`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isLike })
          }
        )

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))

          throw new Error(
            data.message ||
            data.error ||
            'Не вдалося зберегти реакцію'
          )
        }
      }

      await refreshReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setReactionLoadingId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getAuthorName = (review) =>
    review.userName ||
    review.username ||
    `Користувач #${review.userId}`

  if (loading) {
    return (
      <section className={styles.container}>
        <p className={styles.message}>Завантаження коментарів...</p>
      </section>
    )
  }

  const commentReviews = reviews.filter(
    (review) => review.comment?.trim()
  )

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Коментарі</h2>

        <span className={styles.count}>
          {commentReviews.length}
        </span>
      </div>

      {isAuthenticated && (!ownComment || editingId) && (
        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <h3 className={styles.formTitle}>
            {editingId ? 'Редагування коментаря' : 'Залишити коментар'}
          </h3>

          <div className={styles.commentField}>
            <label htmlFor="review-comment">
              Коментар
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поділіться своїми враженнями..."
              rows={4}
              maxLength={2000}
            />
          </div>

          {error && (
            <p className={styles.error}>{error}</p>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting
                ? 'Збереження...'
                : editingId
                  ? 'Зберегти зміни'
                  : 'Опублікувати'}
            </button>

            {editingId && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
      )}

      {isAuthenticated && ownComment && !editingId && (
        <p className={styles.authMessage}>
          Ви вже залишили коментар про цей фільм або серіал.
          Щоб змінити його, скористайтеся кнопкою «Редагувати».
        </p>
      )}

      {!isAuthenticated && (
        <p className={styles.authMessage}>
          Увійдіть в обліковий запис, щоб залишити коментар або реакцію.
        </p>
      )}

      <div className={styles.list}>
        {commentReviews.length === 0 ? (
          <p className={styles.message}>
            Поки що коментарів немає. Будьте першим!
          </p>
        ) : (
          commentReviews.map((review) => {
            const owner = isOwner(review)

            const canEdit = isAuthenticated && owner
            const canDelete = isAuthenticated && (owner || isAdmin)

            const reactions = review.reactions || {}
            const currentReaction = reactions.currentUserReaction

            const totalRating =
              (reactions.likeCount || 0) -
              (reactions.dislikeCount || 0)

            const authorName = getAuthorName(review)

            return (
              <article
                key={review.id}
                className={styles.review}
              >
                <div className={styles.reviewHeader}>
                  <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                      <span>{authorName}</span>

                      {owner && (
                        <span className={styles.youLabel}>
                          Ви
                        </span>
                      )}

                      <span className={styles.date}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewHeaderRight}>
                    {(canEdit || canDelete) && (
                      <div className={styles.reviewActions}>
                        {canEdit && (
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleEdit(review)}
                          >
                            Редагувати
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDelete(review.id)}
                          >
                            Видалити
                          </button>
                        )}
                      </div>
                    )}

                    {review.rating != null && (
                      <div className={styles.rating}>
                        <span>{review.rating}</span>
                        <span className={styles.ratingMax}>/ 10</span>
                      </div>
                    )}
                  </div>
                </div>

                <p
                  className={`${styles.comment} ${
                    totalRating < 0 ? styles.negativeComment : ''
                  }`}
                >
                  {review.comment}
                </p>

                <div className={styles.reactionActions}>
                  <button
                    type="button"
                    className={`${styles.reactionButton} ${
                      currentReaction === true ? styles.activeLike : ''
                    }`}
                    onClick={() => handleReaction(review, true)}
                    disabled={!isAuthenticated || reactionLoadingId === review.id}
                    aria-label="Позитивна оцінка"
                    aria-pressed={currentReaction === true}
                  >
                    +
                  </button>

                  <span className={styles.totalRating}>
                    {totalRating}
                  </span>

                  <button
                    type="button"
                    className={`${styles.reactionButton} ${
                      currentReaction === false ? styles.activeDislike : ''
                    }`}
                    onClick={() => handleReaction(review, false)}
                    disabled={!isAuthenticated || reactionLoadingId === review.id}
                    aria-label="Негативна оцінка"
                    aria-pressed={currentReaction === false}
                  >
                    −
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}
    </section>
  )
}

export default Reviews