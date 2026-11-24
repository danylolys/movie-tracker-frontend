import { Link } from "react-router-dom";

import styles from "./MediaCard.module.css";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function MediaCard({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  mediaType = "movie"
}) {
  return (
    <Link
      to={`/${mediaType === "movie" ? "movies" : "series"}/${id}`}
      className={styles.link}
    >
      <article className={styles.card}>
        <div className={styles.poster}>
          {posterPath ? (
            <img
              src={`${IMAGE_URL}${posterPath}`}
              alt={title}
            />
          ) : (
            <div className={styles.noPoster}>
              Немає постера
            </div>
          )}
        </div>

        <div className={styles.movieInfo}>
          <h2 title={title}>{title}</h2>

          <div className={styles.movieDetails}>
            <span className={styles.movieDate}>
              {releaseDate
                ? new Date(releaseDate).getFullYear()
                : "Невідомо"}
            </span>

            <span className={styles.rating}>
              TMDB {Number(voteAverage || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default MediaCard;