import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import WatchlistControl from "../../components/WatchlistControl/WatchlistControl";
import Trailer from "../../components/Trailer/Trailer";
import Media from "../../components/Media/Media";
import PersonCard from "../../components/PersonCard/PersonCard";
import Reviews from "../../components/Reviews/Reviews";

import styles from "./media.module.css";

const API_URL = "http://localhost:5194/api/TmdbMovie";
const IMAGE_URL = "https://image.tmdb.org/t/p";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const formatDate = (date) => {
    if (!date) return "Невідомо";

    return new Date(date).toLocaleDateString("uk-UA");
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

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Рік невідомий";

  return (
    <main className={styles.container}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: movie.backdrop_path
            ? `linear-gradient(
                90deg,
                rgba(0, 0, 6, 0.97) 0%,
                rgba(0, 0, 6, 0.88) 50%,
                rgba(0, 0, 6, 0.55) 100%
              ), url(${IMAGE_URL}/original${movie.backdrop_path})`
            : "none"
        }}
      >
        <div className={styles.heroContent}>
          <div className={styles.movieInfo}>
            <h1>
              {movie.title}
              <span className={styles.releaseYear}>
                ({releaseYear})
              </span>
            </h1>

            {movie.original_title !== movie.title && (
              <p className={styles.originalTitle}>
                {movie.original_title}
              </p>
            )}

            <div className={styles.meta}>
              {movie.release_date && (
                <span>{formatDate(movie.release_date)}</span>
              )}

              {movie.runtime > 0 && (
                <span>{movie.runtime} хв.</span>
              )}

              {movie.status && (
                <span>{movie.status}</span>
              )}
            </div>

            <div className={styles.rating}>
              <span className={styles.star}>★</span>

              <strong>
                {Number(movie.vote_average || 0).toFixed(1)}
              </strong>

              <span className={styles.tmdb}>TMDB</span>
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

          <div className={styles.posterColumn}>
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

            <WatchlistControl
              media={movie}
              mediaType={1}
            />
          </div>
        </div>
      </section>

      <Media
        tmdbId={id}
        type={1}
      />

      <section className={styles.content}>
        <div className={styles.movieFacts}>
          <h2>Інформація про фільм</h2>

          <div className={styles.factsGrid}>
            <div className={styles.fact}>
              <span>Оригінальна назва</span>
              <strong>
                {movie.original_title || "Невідомо"}
              </strong>
            </div>

            <div className={styles.fact}>
              <span>Дата виходу</span>
              <strong>
                {formatDate(movie.release_date)}
              </strong>
            </div>

            <div className={styles.fact}>
              <span>Режисер</span>
              <strong>
                {director?.name || "Невідомо"}
              </strong>
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
        </div>

        <Trailer
          mediaId={id}
          mediaType={1}
        />

        {cast.length > 0 && (
          <section className={styles.castSection}>
            <div className={styles.sectionHeader}>
              <h2>Акторський склад</h2>

              <button
                className={styles.crewButton}
                onClick={() =>
                  navigate("/media-crew", {
                    state: {
                      title: movie.title,
                      backUrl: `/movies/${id}`,
                      cast: movie.credits?.cast || [],
                      crew: movie.credits?.crew || []
                    }
                  })
                }
              >
                Переглянути всю команду
                <span>→</span>
              </button>
            </div>

            <div className={styles.castGrid}>
              {cast.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                />
              ))}
            </div>
          </section>
        )}

        <Reviews
          tmdbId={id}
          type={1}
        />
      </section>
    </main>
  );
}

export default MovieDetails;