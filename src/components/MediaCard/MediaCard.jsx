import styles from "./MediaCard.module.css";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function MediaCard({ title, posterPath, releaseDate, voteAverage }) {
  return (
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
            TMDB {voteAverage.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default MediaCard;