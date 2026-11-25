import { Link, useLocation } from "react-router-dom";
import PersonCard from "../../components/PersonCard/PersonCard.jsx";

import styles from "./MediaCrew.module.css";

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
      <main className={styles.container}>
        <div className={styles.emptyState}>
          <p>
            Інформація про акторський склад та знімальну команду відсутня.
          </p>

          <Link to="/" className={styles.backLink}>
            ← На головну
          </Link>
        </div>
      </main>
    );
  }

  const departments = crew.reduce((groups, person) => {
    const department = person.department || "Crew";

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

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link
          to={backUrl || "/"}
          className={styles.backLink}
        >
          <span>←</span>
          Назад до фільму
        </Link>

        <h1>
          Команда: <span>{title || "Невідомо"}</span>
        </h1>
      </header>

      {cast.length > 0 && (
        <section className={styles.section}>
          <h2>
            Акторський склад
            <span className={styles.count}>{cast.length}</span>
          </h2>

          <div className={styles.peopleGrid}>
            {cast.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                role={person.character || "Невідома роль"}
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
            <span className={styles.count}>{people.length}</span>
          </h2>

          <div className={styles.peopleGrid}>
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                role={person.job || "Невідома посада"}
              />
            ))}
          </div>
        </section>
      ))}

      {cast.length === 0 && crew.length === 0 && (
        <div className={styles.emptyState}>
          <p>
            Інформація про акторський склад та знімальну команду відсутня.
          </p>

          <Link
            to={backUrl || "/"}
            className={styles.backLink}
          >
            ← Назад до фільму
          </Link>
        </div>
      )}
    </main>
  );
}

export default MediaCrew;