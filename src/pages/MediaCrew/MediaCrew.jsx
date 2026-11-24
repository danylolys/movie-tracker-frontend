import { Link, useLocation } from "react-router-dom";

import styles from "./MediaCrew.module.css";

const IMAGE_URL = "https://image.tmdb.org/t/p";

function MediaCrew() {
  const location = useLocation();

  const {
    title,
    backUrl,
    cast = [],
    crew = []
  } = location.state || {};

  if (!location.state) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>
          Інформація про акторський склад та знімальну команду відсутня.
        </p>

        <Link to="/" className={styles.backLink}>
          ← На головну
        </Link>
      </div>
    );
  }

  const departments = crew.reduce((groups, person) => {
    const department = person.department || "Інші";

    if (!groups[department]) {
      groups[department] = [];
    }

    if (!groups[department].some((item) => item.id === person.id)) {
      groups[department].push(person);
    }

    return groups;
  }, {});

  const departmentNames = {
    Directing: "Режисура",
    Writing: "Сценарій",
    Production: "Продюсування",
    Camera: "Операторська робота",
    Editing: "Монтаж",
    Sound: "Звук",
    Art: "Художнє оформлення",
    CostumeMakeup: "Костюми та грим",
    VisualEffects: "Візуальні ефекти",
    Crew: "Інша команда"
  };

  const PersonCard = ({ person, isCast = false }) => (
    <Link
      to={`/people/${person.id}`}
      key={person.id}
      className={styles.personCard}
    >
      <div className={styles.personPhoto}>
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

      <div className={styles.personInfo}>
        <strong>{person.name}</strong>

        <span>
          {isCast
            ? person.character || "Невідома роль"
            : person.job || "Невідома посада"}
        </span>
      </div>
    </Link>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link
          to={backUrl || "/"}
          className={styles.backLink}
        >
          ← Назад до фільму
        </Link>

        <h1>Команда: {title || "Невідомо"}</h1>
      </header>

      {cast.length > 0 && (
        <section className={styles.section}>
          <h2>Акторський склад ({cast.length})</h2>

          <div className={styles.peopleGrid}>
            {cast.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                isCast
              />
            ))}
          </div>
        </section>
      )}

      {Object.entries(departments).map(([department, people]) => (
        <section
          key={department}
          className={styles.section}
        >
          <h2>
            {departmentNames[department] || department}
            {" "}({people.length})
          </h2>

          <div className={styles.peopleGrid}>
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
              />
            ))}
          </div>
        </section>
      ))}

      {cast.length === 0 && crew.length === 0 && (
        <p className={styles.empty}>
          Інформація про акторський склад та знімальну команду відсутня.
        </p>
      )}
    </div>
  );
}

export default MediaCrew;