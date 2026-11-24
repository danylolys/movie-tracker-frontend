import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { apiFetch } from '../../services/api'
import MediaCard from '../../components/MediaCard/MediaCard'

import styles from './PersonDetails.module.css'

const IMAGE_URL = 'https://image.tmdb.org/t/p'

const DEPARTMENTS = {
  Acting: 'Акторська діяльність',
  Directing: 'Режисура',
  Writing: 'Сценарна робота',
  Production: 'Продюсування',
  Editing: 'Монтаж',
  Camera: 'Операторська робота',
  Sound: 'Звук',
  Art: 'Художнє оформлення',
  Creator: 'Створення'
}

function formatDate(date) {
  if (!date) return 'Невідомо'

  return new Date(`${date}T00:00:00`).toLocaleDateString('uk-UA')
}

function calculateAge(birthday, deathday) {
  if (!birthday) return null

  const birth = new Date(birthday)
  const end = deathday ? new Date(deathday) : new Date()

  let age = end.getFullYear() - birth.getFullYear()

  const monthDifference = end.getMonth() - birth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && end.getDate() < birth.getDate())
  ) {
    age--
  }

  return age
}

function PersonCreditSection({ title, credits, mediaType, roleType }) {
  if (!credits?.length) return null

  return (
    <section className={styles.creditsSection}>
      <h2>{title}</h2>

      <div className={styles.creditsGrid}>
        {credits.map((item) => {
          const releaseDate = mediaType === 'movie'
            ? item.release_date
            : item.first_air_date

          const mediaTitle = mediaType === 'movie'
            ? item.title
            : item.name

          const role = roleType === 'cast'
            ? item.character
            : item.job

          return (
            <div
              className={styles.creditCard}
              key={`${mediaType}-${item.id}-${item.credit_id}`}
            >
              <MediaCard
                id={item.id}
                title={mediaTitle}
                posterPath={item.poster_path}
                releaseDate={releaseDate}
                mediaType={mediaType}
              />

              {role && (
                <p className={styles.creditRole}>
                  {roleType === 'cast' ? 'Роль: ' : 'Посада: '}
                  {role}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PersonDetails() {
  const { id } = useParams()

  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch(`/TmdbPerson/${id}`)

        if (!response.ok) {
          throw new Error('Не вдалося завантажити інформацію про людину')
        }

        const data = await response.json()
        setPerson(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPerson()
  }, [id])

  if (loading) {
    return <div className={styles.message}>Завантаження...</div>
  }

  if (error || !person) {
    return (
      <div className={styles.message}>
        {error || 'Інформацію не знайдено'}
      </div>
    )
  }

  const movieCredits = person.movie_credits || {}
  const tvCredits = person.tv_credits || {}

  const age = calculateAge(person.birthday, person.deathday)

  return (
    <main className={styles.page}>
      <section className={styles.personHeader}>
        <div className={styles.profile}>
          {person.profile_path ? (
            <img
              className={styles.profileImage}
              src={`${IMAGE_URL}/h632${person.profile_path}`}
              alt={person.name}
            />
          ) : (
            <div className={styles.noImage}>
              Немає фото
            </div>
          )}
        </div>

        <div className={styles.personInfo}>
          <h1>{person.name}</h1>

          {person.known_for_department && (
            <p className={styles.department}>
              {DEPARTMENTS[person.known_for_department] ||
                person.known_for_department}
            </p>
          )}

          <div className={styles.facts}>
            {person.birthday && (
              <div className={styles.fact}>
                <span>Дата народження</span>
                <strong>{formatDate(person.birthday)}</strong>
              </div>
            )}

            {person.deathday && (
              <div className={styles.fact}>
                <span>Дата смерті</span>
                <strong>{formatDate(person.deathday)}</strong>
              </div>
            )}

            {age !== null && (
              <div className={styles.fact}>
                <span>{person.deathday ? 'Вік' : 'Вік'}</span>
                <strong>{age} років</strong>
              </div>
            )}

            {person.place_of_birth && (
              <div className={styles.fact}>
                <span>Місце народження</span>
                <strong>{person.place_of_birth}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {person.biography && (
        <section className={styles.biography}>
          <h2>Біографія</h2>
          <p>{person.biography}</p>
        </section>
      )}

      {person.also_known_as?.length > 0 && (
        <section className={styles.aliases}>
          <h2>Також відомий як</h2>

          <div className={styles.aliasList}>
            {person.also_known_as.map((name, index) => (
              <span key={`${name}-${index}`}>{name.trim()}</span>
            ))}
          </div>
        </section>
      )}

      <div className={styles.filmography}>
        <h2>Фільмографія</h2>

        <PersonCreditSection
          title="Фільми — акторські ролі"
          credits={movieCredits.cast}
          mediaType="movie"
          roleType="cast"
        />

        <PersonCreditSection
          title="Фільми — робота за кадром"
          credits={movieCredits.crew}
          mediaType="movie"
          roleType="crew"
        />

        <PersonCreditSection
          title="Серіали — акторські ролі"
          credits={tvCredits.cast}
          mediaType="tv"
          roleType="cast"
        />

        <PersonCreditSection
          title="Серіали — робота за кадром"
          credits={tvCredits.crew}
          mediaType="tv"
          roleType="crew"
        />

        {!movieCredits.cast?.length &&
          !movieCredits.crew?.length &&
          !tvCredits.cast?.length &&
          !tvCredits.crew?.length && (
            <p className={styles.empty}>
              Інформація про фільмографію відсутня.
            </p>
          )}
      </div>
    </main>
  )
}

export default PersonDetails