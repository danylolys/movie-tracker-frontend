import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import WatchlistControl from "../../components/WatchlistControl/WatchlistControl";
import Trailer from "../../components/Trailer/Trailer";
import Media from "../../components/Media/Media";
import PersonCard from "../../components/PersonCard/PersonCard";
import Reviews from "../../components/Reviews/Reviews";

import styles from "../MovieDetails/Media.module.css";

const API_URL = "http://localhost:5194/api/TmdbTv/tv";
const IMAGE_URL = "https://image.tmdb.org/t/p";

function TvDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tv, setTv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTv = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Не вдалося завантажити інформацію про серіал");
        }

        const data = await response.json();
        setTv(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTv();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Невідомо";

    return new Date(date).toLocaleDateString("uk-UA");
  };

  const formatStatus = (status) => {
    const statuses = {
      "Returning Series": "Виходить",
      "Ended": "Завершений",
      "Canceled": "Скасований",
      "In Production": "У виробництві",
      "Planned": "Запланований",
      "Pilot": "Пілот"
    };

    return statuses[status] || status || "Невідомо";
  };

  if (loading) {
    return (
      <div className={styles.message}>
        Завантаження інформації про серіал...
      </div>
    );
  }

  if (error || !tv) {
    return (
      <div className={styles.message}>
        {error || "Серіал не знайдено"}
      </div>
    );
  }

  const cast = tv.credits?.cast?.slice(0, 10) || [];
  const seasons = tv.seasons || [];
  const networks = tv.networks || [];

  const releaseYear = tv.first_air_date
    ? new Date(tv.first_air_date).getFullYear()
    : "Рік невідомий";

  return (
    <main className={styles.container}>
      <section
        className={styles.hero}
        style={{
          backgroundImage: tv.backdrop_path
            ? `linear-gradient(
                90deg,
                rgba(0, 0, 6, 0.97) 0%,
                rgba(0, 0, 6, 0.88) 50%,
                rgba(0, 0, 6, 0.55) 100%
              ), url(${IMAGE_URL}/original${tv.backdrop_path})`
            : "none"
        }}
      >
        <div className={styles.heroContent}>
          <div className={styles.movieInfo}>
            <h1>
              {tv.name}
              <span className={styles.releaseYear}>
                ({releaseYear})
              </span>
            </h1>

            {tv.original_name !== tv.name && (
              <p className={styles.originalTitle}>
                {tv.original_name}
              </p>
            )}

            <div className={styles.meta}>
              {tv.first_air_date && (
                <span>{formatDate(tv.first_air_date)}</span>
              )}

              {tv.number_of_seasons > 0 && (
                <span>{tv.number_of_seasons} сезонів</span>
              )}

              {tv.number_of_episodes > 0 && (
                <span>{tv.number_of_episodes} епізодів</span>
              )}

              {tv.status && (
                <span>{formatStatus(tv.status)}</span>
              )}
            </div>

            <div className={styles.rating}>
              <span className={styles.star}>★</span>

              <strong>
                {Number(tv.vote_average || 0).toFixed(1)}
              </strong>

              <span className={styles.tmdb}>TMDB</span>
            </div>

            {tv.genres?.length > 0 && (
              <div className={styles.genres}>
                {tv.genres.map((genre) => (
                  <span key={genre.id}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {tv.overview && (
              <div className={styles.overview}>
                <h2>Опис</h2>
                <p>{tv.overview}</p>
              </div>
            )}
          </div>

          <div className={styles.posterColumn}>
            <div className={styles.poster}>
              {tv.poster_path ? (
                <img
                  src={`${IMAGE_URL}/w500${tv.poster_path}`}
                  alt={tv.name}
                />
              ) : (
                <div className={styles.noPoster}>
                  Немає постера
                </div>
              )}
            </div>

            <WatchlistControl
              media={tv}
              mediaType={2}
            />
          </div>
        </div>
      </section>

      <Media
        tmdbId={id}
        type={2}
      />

      <section className={styles.content}>
        <div className={styles.movieFacts}>
          <h2>Інформація про серіал</h2>

          <div className={styles.factsGrid}>
            <div className={styles.fact}>
              <span>Оригінальна назва</span>
              <strong>{tv.original_name || "Невідомо"}</strong>
            </div>

            <div className={styles.fact}>
              <span>Дата першого ефіру</span>
              <strong>{formatDate(tv.first_air_date)}</strong>
            </div>

            <div className={styles.fact}>
              <span>Дата останнього ефіру</span>
              <strong>{formatDate(tv.last_air_date)}</strong>
            </div>

            <div className={styles.fact}>
              <span>Статус</span>
              <strong>{formatStatus(tv.status)}</strong>
            </div>

            <div className={styles.fact}>
              <span>Кількість сезонів</span>
              <strong>{tv.number_of_seasons ?? "Невідомо"}</strong>
            </div>

            <div className={styles.fact}>
              <span>Кількість епізодів</span>
              <strong>{tv.number_of_episodes ?? "Невідомо"}</strong>
            </div>

            <div className={styles.fact}>
              <span>Мова оригіналу</span>
              <strong>
                {tv.original_language?.toUpperCase() || "Невідомо"}
              </strong>
            </div>

            <div className={styles.fact}>
              <span>Країна</span>
              <strong>
                {tv.origin_country?.join(", ") || "Невідомо"}
              </strong>
            </div>

            <div className={styles.fact}>
              <span>Телеканали</span>
              <strong>
                {networks.map((network) => network.name).join(", ") || "Невідомо"}
              </strong>
            </div>

            <div className={styles.fact}>
              <span>У виробництві</span>
              <strong>{tv.in_production ? "Так" : "Ні"}</strong>
            </div>

            {tv.homepage && (
              <div className={styles.fact}>
                <span>Офіційний сайт</span>
                <strong>
                  <a
                    href={tv.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Відвідати
                  </a>
                </strong>
              </div>
            )}
          </div>
        </div>

        <Trailer
          mediaId={id}
          mediaType={2}
        />

        {seasons.length > 0 && (
          <section className={styles.castSection}>
            <h2>Сезони</h2>

            <div className={styles.seasonsGrid}>
              {seasons.map((season) => (
                <article
                  key={season.id}
                  className={styles.seasonCard}
                >
                  <div className={styles.castPhoto}>
                    {season.poster_path ? (
                      <img
                        src={`${IMAGE_URL}/w185${season.poster_path}`}
                        alt={season.name}
                      />
                    ) : (
                      <div className={styles.noPhoto}>
                        Немає постера
                      </div>
                    )}
                  </div>

                  <div className={styles.castInfo}>
                    <strong>{season.name}</strong>

                    <span>
                      {season.episode_count} епізодів
                    </span>

                    <span>
                      {season.air_date
                        ? new Date(season.air_date).getFullYear()
                        : "Рік невідомий"}
                    </span>

                    {Number(season.vote_average) > 0 && (
                      <span>
                        TMDB {Number(season.vote_average).toFixed(1)}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tv.last_episode_to_air && (
          <section className={styles.castSection}>
            <h2>Останній епізод</h2>

            <div className={styles.factsGrid}>
              <div className={styles.fact}>
                <span>Назва</span>
                <strong>
                  {tv.last_episode_to_air.name || "Невідомо"}
                </strong>
              </div>

              <div className={styles.fact}>
                <span>Сезон</span>
                <strong>
                  {tv.last_episode_to_air.season_number}
                </strong>
              </div>

              <div className={styles.fact}>
                <span>Епізод</span>
                <strong>
                  {tv.last_episode_to_air.episode_number}
                </strong>
              </div>

              <div className={styles.fact}>
                <span>Дата виходу</span>
                <strong>
                  {formatDate(tv.last_episode_to_air.air_date)}
                </strong>
              </div>
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className={styles.castSection}>
            <div className={styles.sectionHeader}>
              <h2>Акторський склад</h2>

              <button
                className={styles.crewButton}
                onClick={() =>
                  navigate("/media-crew", {
                    state: {
                      title: tv.name,
                      backUrl: `/series/${id}`,
                      cast: tv.credits?.cast || [],
                      crew: tv.credits?.crew || []
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
          type={2}
        />

      </section>
    </main>
  );
}

export default TvDetails;