import { useEffect, useState } from 'react'

import { apiFetch } from '../../services/api'

import styles from './Trailer.module.css'

function Trailer({ mediaId, mediaType }) {
  const [video, setVideo] = useState(null)

  const endpoint =
    mediaType === 1 || mediaType === 'movie'
      ? `/TmdbMovie/${mediaId}/videos`
      : mediaType === 2 || mediaType === 'tv' || mediaType === 'series'
        ? `/TmdbTv/tv/${mediaId}/videos`
        : null

  useEffect(() => {
    if (!mediaId || !endpoint) return

    const controller = new AbortController()

    async function fetchTrailer() {
      try {
        setVideo(null)

        const response = await apiFetch(endpoint, {
          signal: controller.signal
        })

        if (!response.ok) return

        const data = await response.json()

        const trailers = (data.results || []).filter(
          video =>
            video.site === 'YouTube' &&
            video.type === 'Trailer' &&
            video.key
        )

        const selectedTrailer =
          trailers.find(video => video.official) || trailers[0]

        setVideo(selectedTrailer || null)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch trailer:', error)
        }
      }
    }

    fetchTrailer()

    return () => controller.abort()
  }, [mediaId, endpoint])

  if (!video) return null

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Трейлер</h2>

      <div className={styles.videoWrapper}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.key}`}
          title={video.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  )
}

export default Trailer