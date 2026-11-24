import { useEffect, useState } from 'react'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './Media.module.css'

function getYouTubeId(url) {
  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1).split('/')[0]
    }

    if (
      parsedUrl.hostname === 'youtube.com' ||
      parsedUrl.hostname === 'www.youtube.com' ||
      parsedUrl.hostname === 'm.youtube.com'
    ) {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v')
      }

      const match = parsedUrl.pathname.match(
        /^\/(embed|shorts)\/([^/]+)/
      )

      return match?.[2] || null
    }

    return null
  } catch {
    return null
  }
}

function Media({ tmdbId, type }) {
  const { isAdmin } = useAuth()

  const [media, setMedia] = useState(null)
  const [links, setLinks] = useState([])

  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newLink, setNewLink] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiFetch(
          `/Media/tmdb/${tmdbId}?type=${type}`
        )

        if (response.status === 404) {
          setMedia(null)
          setLinks([])
          return
        }

        if (!response.ok) {
          throw new Error('Не вдалося завантажити посилання')
        }

        const data = await response.json()

        setMedia(data)
        setLinks(data.ostLinks || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (tmdbId && type) {
      fetchMedia()
    }
  }, [tmdbId, type])

  const addLink = () => {
    const value = newLink.trim()

    if (!value) return

    setLinks((prev) => [...prev, value])
    setNewLink('')
  }

  const updateLink = (index, value) => {
    setLinks((prev) =>
      prev.map((link, i) => i === index ? value : link)
    )
  }

  const removeLink = (index) => {
    setLinks((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  const saveChanges = async () => {
    setSaving(true)
    setError('')

    const updatedLinks = links
      .map((link) => link.trim())
      .filter(Boolean)

    try {
      let response

      if (media) {
        response = await apiFetch(`/Media/${media.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ostLinks: updatedLinks
          })
        })
      } else {
        response = await apiFetch('/Media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tmdbId: Number(tmdbId),
            type: Number(type)
          })
        })

        if (response.ok) {
          const createdMedia = await response.json()

          response = await apiFetch(`/Media/${createdMedia.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ostLinks: updatedLinks
            })
          })
        }
      }

      if (!response.ok) {
        throw new Error('Не вдалося зберегти зміни')
      }

      if (!media) {
        const refreshResponse = await apiFetch(
          `/Media/tmdb/${tmdbId}?type=${type}`
        )

        if (!refreshResponse.ok) {
          throw new Error('Не вдалося оновити інформацію')
        }

        const data = await refreshResponse.json()
        setMedia(data)
        setLinks(data.ostLinks || [])
      } else {
        setLinks(updatedLinks)
        setMedia({
          ...media,
          ostLinks: updatedLinks
        })
      }

      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setLinks(media?.ostLinks || [])
    setNewLink('')
    setEditing(false)
    setError('')
  }

  if (loading) return null

  if (error && !isAdmin) return null

  if (!isAdmin && (!media || links.length === 0)) {
    return null
  }

  if (error && isAdmin && !media) {
    return (
      <section className={styles.container}>
        <h2>Музика та посилання</h2>
        <p className={styles.error}>{error}</p>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Музика та посилання</h2>

        {isAdmin && !editing && (
          <button
            className={styles.editButton}
            onClick={() => setEditing(true)}
          >
            Змінити
          </button>
        )}
      </div>

      {editing ? (
        <div className={styles.editor}>
          {links.map((link, index) => (
            <div key={index} className={styles.editItem}>
              <input
                type="url"
                value={link}
                onChange={(e) =>
                  updateLink(index, e.target.value)
                }
                placeholder="Введіть посилання"
              />

              <button
                className={styles.deleteButton}
                onClick={() => removeLink(index)}
                title="Видалити"
              >
                Видалити
              </button>
            </div>
          ))}

          <div className={styles.addItem}>
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLink()
                }
              }}
              placeholder="Нове посилання"
            />

            <button
              className={styles.addButton}
              onClick={addLink}
            >
              Додати
            </button>
          </div>

          {error && (
            <p className={styles.error}>{error}</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.saveButton}
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>

            <button
              className={styles.cancelButton}
              onClick={cancelEditing}
              disabled={saving}
            >
              Скасувати
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.links}>
          {links.map((link, index) => {
            const videoId = getYouTubeId(link)

            if (videoId) {
              return (
                <div
                  key={`${link}-${index}`}
                  className={styles.video}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`}
                    title={`YouTube video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            }

            return (
              <a
                key={`${link}-${index}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
                title={link}
              >
                <span className={styles.linkIcon}>↗</span>
                <span>Відкрити</span>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Media