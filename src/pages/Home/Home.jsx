import { useEffect, useState } from "react";

import MediaCard from "../../components/MediaCard/MediaCard";

import styles from "./Home.module.css";

const MOVIES_API_URL = "http://localhost:5194/api/TmdbMovie/popular";
const TV_API_URL = "http://localhost:5194/api/TmdbTv/popular";

function Home() {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesResponse, tvResponse] = await Promise.all([
          fetch(`${MOVIES_API_URL}?page=1`),
          fetch(`${TV_API_URL}?page=1`)
        ]);

        if (!moviesResponse.ok || !tvResponse.ok) {
          throw new Error("Не вдалося завантажити дані");
        }

        const moviesData = await moviesResponse.json();
        const tvData = await tvResponse.json();

        setMovies(moviesData.results);
        setTvShows(tvData.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.message}>Завантаження...</div>;
  }

  if (error) {
    return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
  }

  return (
    <main className={styles.container}>

      <section className={styles.section}>
        <h1 className={styles.title}>Популярні фільми</h1>

        <div className={styles.moviesRow}>
          {movies.map((movie) => (
            <MediaCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              releaseDate={movie.release_date}
              voteAverage={Number(movie.vote_average || 0)}
              mediaType="movie"
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h1 className={styles.title}>Популярні серіали</h1>

        <div className={styles.moviesRow}>
          {tvShows.map((tvShow) => (
            <MediaCard
              key={tvShow.id}
              id={tvShow.id}
              title={tvShow.name}
              posterPath={tvShow.poster_path}
              releaseDate={tvShow.first_air_date}
              voteAverage={Number(tvShow.vote_average || 0)}
              mediaType="series"
            />
          ))}
        </div>
      </section>

    </main>
  );
}

export default Home;