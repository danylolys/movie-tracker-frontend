import { Link } from "react-router-dom";
import styles from "./PersonCard.module.css";

const IMAGE_URL = "https://image.tmdb.org/t/p/w185";

function PersonCard({ person, role }) {
  const firstLetter = person.name?.charAt(0).toUpperCase() || "?";

  return (
    <Link
      to={`/people/${person.id}`}
      className={styles.card}
    >
      <div className={styles.photo}>
        {person.profile_path ? (
          <img
            src={`${IMAGE_URL}${person.profile_path}`}
            alt={person.name}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPhoto}>
            {firstLetter}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <strong>{person.name}</strong>
        <span>{role || person.character || "Невідома роль"}</span>
      </div>
    </Link>
  );
}

export default PersonCard;