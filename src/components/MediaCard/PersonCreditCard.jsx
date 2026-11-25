import { Link } from "react-router-dom";

import styles from "./PersonCreditCard.module.css";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function PersonCreditCard({
  id,
  title,
  posterPath,
  releaseDate,
  role,
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
            <img src={`${IMAGE_URL}${posterPath}`} alt={title} />
          ) : (
            <div className={styles.noPoster}>
              Немає постера
            </div>
          )}
        </div>

        <div className={styles.movieInfo}>
          <h3 title={title}>{title}</h3>

          <div className={styles.movieDetails}>
            {role && (
              <span className={styles.role} title={role}>
                {role}
              </span>
            )}

            <span className={styles.movieDate}>
              {releaseDate
                ? new Date(releaseDate).getFullYear()
                : "Невідомо"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PersonCreditCard;