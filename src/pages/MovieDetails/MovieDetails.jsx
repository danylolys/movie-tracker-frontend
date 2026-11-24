import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WatchlistControl from "../../components/WatchlistControl/WatchlistControl";

import styles from "./MovieDetails.module.css";

const API_URL = "http://localhost:5194/api/TmdbMovie";
const IMAGE_URL = "https://image.tmdb.org/t/p";

function MovieDetails() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Не вдалося завантажити інформацію про фільм");
        }

        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const formatMoney = (value) => {
    if (!value) return "Невідомо";

    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className={styles.message}>
        Завантаження інформації про фільм...
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.message}>
        {error || "Фільм не знайдено"}
      </div>
    );
  }

  const director = movie.credits?.crew?.find(
    (person) => person.job === "Director"
  );

  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div className={styles.container}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: movie.backdrop_path
            ? `linear-gradient(to right, rgba(15, 15, 15, 0.95), rgba(15, 15, 15, 0.5)), url(${IMAGE_URL}/original${movie.backdrop_path})`
            : "none"
        }}
      >
        <div className={styles.movieHeader}>
          <div className={styles.poster}>
            {movie.poster_path ? (
              <img
                src={`${IMAGE_URL}/w500${movie.poster_path}`}
                alt={movie.title}
              />
            ) : (
              <div className={styles.noPoster}>
                Немає постера
              </div>
            )}
          </div>

          <div className={styles.movieInfo}>
            <h1>{movie.title}</h1>

            {movie.original_title !== movie.title && (
              <p className={styles.originalTitle}>
                {movie.original_title}
              </p>
            )}

            <div className={styles.details}>
              <span>
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "Рік невідомий"}
              </span>

              {movie.runtime > 0 && (
                <span>{movie.runtime} хв.</span>
              )}

              {movie.status && (
                <span>{movie.status}</span>
              )}
            </div>

            <div className={styles.rating}>
              <strong>
                {Number(movie.vote_average || 0).toFixed(1)}
              </strong>
              <span>/ 10 TMDB</span>
              <span>
                ({movie.vote_count || 0} голосів)
              </span>
            </div>

            {movie.genres?.length > 0 && (
              <div className={styles.genres}>
                {movie.genres.map((genre) => (
                  <span key={genre.id}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <div className={styles.overview}>
                <h2>Опис</h2>
                <p>{movie.overview}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <WatchlistControl
        media={movie}
        mediaType={1}
      />

      <section className={styles.content}>
        <div className={styles.movieFacts}>
          <h2>Інформація про фільм</h2>

          <div className={styles.fact}>
            <span>Оригінальна назва</span>
            <strong>{movie.original_title || "Невідомо"}</strong>
          </div>

          <div className={styles.fact}>
            <span>Дата виходу</span>
            <strong>{movie.release_date || "Невідомо"}</strong>
          </div>

          <div className={styles.fact}>
            <span>Режисер</span>
            <strong>{director?.name || "Невідомо"}</strong>
          </div>

          <div className={styles.fact}>
            <span>Мова оригіналу</span>
            <strong>
              {movie.original_language?.toUpperCase() || "Невідомо"}
            </strong>
          </div>

          <div className={styles.fact}>
            <span>Бюджет</span>
            <strong>{formatMoney(movie.budget)}</strong>
          </div>

          <div className={styles.fact}>
            <span>Касові збори</span>
            <strong>{formatMoney(movie.revenue)}</strong>
          </div>
        </div>

        {cast.length > 0 && (
          <div className={styles.castSection}>
            <h2>Акторський склад</h2>

            <div className={styles.castGrid}>
              {cast.map((person) => (
                <article
                  key={person.id}
                  className={styles.castCard}
                >
                  <div className={styles.castPhoto}>
                    {person.profile_path ? (
                      <img
                        src={`${IMAGE_URL}/w185${person.profile_path}`}
                        alt={person.name}
                      />
                    ) : (
                      <div className={styles.noPhoto}>
                        Немає фото
                      </div>
                    )}
                  </div>

                  <div className={styles.castInfo}>
                    <strong>{person.name}</strong>
                    <span>
                      {person.character || "Невідома роль"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default MovieDetails;