import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MediaCard from "../../components/MediaCard/MediaCard";

import styles from "./Series.module.css";

const API_URL = "http://localhost:5194/api/TmdbTv/discover";

const genres = [
  { id: 10759, name: "Бойовик і пригоди" },
  { id: 16, name: "Анімація" },
  { id: 35, name: "Комедія" },
  { id: 80, name: "Кримінал" },
  { id: 99, name: "Документальний" },
  { id: 18, name: "Драма" },
  { id: 10751, name: "Сімейний" },
  { id: 10762, name: "Дитячий" },
  { id: 9648, name: "Детектив" },
  { id: 10763, name: "Новини" },
  { id: 10764, name: "Реаліті-шоу" },
  { id: 10765, name: "Фантастика і фентезі" },
  { id: 10766, name: "Мильна опера" },
  { id: 10767, name: "Ток-шоу" },
  { id: 10768, name: "Війна і політика" },
  { id: 37, name: "Вестерн" },
];

const sortOptions = [
  { value: "popularity.desc", label: "За популярністю (спочатку популярні)" },
  { value: "popularity.asc", label: "За популярністю (спочатку непопулярні)" },

  { value: "first_air_date.desc", label: "За датою виходу (новіші)" },
  { value: "first_air_date.asc", label: "За датою виходу (старіші)" },

  { value: "vote_average.desc", label: "За рейтингом (від більшого)" },
  { value: "vote_average.asc", label: "За рейтингом (від меншого)" },

  { value: "vote_count.desc", label: "За кількістю голосів (від більшого)" },
  { value: "vote_count.asc", label: "За кількістю голосів (від меншого)" },

  { value: "original_name.asc", label: "За оригінальною назвою (А-Я)" },
  { value: "original_name.desc", label: "За оригінальною назвою (Я-А)" },

  { value: "name.asc", label: "За назвою (А-Я)" },
  { value: "name.desc", label: "За назвою (Я-А)" },
];

function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters = useMemo(() => ({
    sortBy: searchParams.get("sortBy") || "popularity.desc",
    genres: searchParams.get("genres")
      ? searchParams.get("genres").split(",").map(Number)
      : [],
    year: searchParams.get("year") || "",
    ratingMin: searchParams.get("ratingMin") || "",
    ratingMax: searchParams.get("ratingMax") || "",
    votesMin: searchParams.get("votesMin") || "",
    runtimeMin: searchParams.get("runtimeMin") || "",
    runtimeMax: searchParams.get("runtimeMax") || "",
  }), [searchParams]);

  const updateFilter = (name, value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      params.delete("page");

      return params;
    }, {
      replace: ["year", "ratingMin", "ratingMax", "votesMin", "runtimeMin", "runtimeMax"].includes(name),
    });
  };

  const toggleGenre = (genreId) => {
    const selectedGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (selectedGenres.length > 0) {
        params.set("genres", selectedGenres.join(","));
      } else {
        params.delete("genres");
      }

      params.delete("page");

      return params;
    });
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const updatePage = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage);
      }

      return params;
    });
  };

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.append("Page", page);
        params.append("SortBy", filters.sortBy);
        params.append("Language", "uk-UA");

        if (filters.genres.length > 0) {
          params.append("WithGenres", filters.genres.join(","));
        }

        if (filters.year) {
          params.append("FirstAirDateYear", filters.year);
        }

        if (filters.ratingMin) {
          params.append("VoteAverageGte", filters.ratingMin);
        }

        if (filters.ratingMax) {
          params.append("VoteAverageLte", filters.ratingMax);
        }

        if (filters.votesMin) {
          params.append("VoteCountGte", filters.votesMin);
        }

        if (filters.runtimeMin) {
          params.append("WithRuntimeGte", filters.runtimeMin);
        }

        if (filters.runtimeMax) {
          params.append("WithRuntimeLte", filters.runtimeMax);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Не вдалося завантажити серіали");
        }

        const data = await response.json();

        setSeries(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (err) {
        setError(err.message);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [page, filters]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Каталог серіалів</h1>

      <div className={styles.catalog}>
        <main className={styles.content}>
          <div className={styles.resultsHeader}>
            <span>Серіали</span>
            <span>Сторінка {page} з {totalPages}</span>
          </div>

          {loading ? (
            <div className={styles.message}>
              Завантаження серіалів...
            </div>
          ) : error ? (
            <div className={styles.message}>
              {error}
            </div>
          ) : series.length === 0 ? (
            <div className={styles.message}>
              Серіалів за заданими параметрами не знайдено.
            </div>
          ) : (
            <div className={styles.moviesGrid}>
              {series.map((item) => (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  posterPath={item.poster_path}
                  releaseDate={item.first_air_date}
                  voteAverage={Number(item.vote_average || 0)}
                  mediaType="series"
                />
              ))}
            </div>
          )}

          {!loading && !error && series.length > 0 && (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => updatePage(page - 1)}
              >
                Попередня
              </button>

              <span>{page}</span>

              <button
                disabled={page >= totalPages}
                onClick={() => updatePage(page + 1)}
              >
                Наступна
              </button>
            </div>
          )}
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.filterHeader}>
            <h2>Фільтри</h2>

            <button
              className={styles.resetButton}
              onClick={resetFilters}
            >
              Скинути
            </button>
          </div>

          <div className={styles.filterGroup}>
            <label>Сортування</label>

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Жанри</label>

            <div className={styles.genres}>
              {genres.map((genre) => (
                <label key={genre.id} className={styles.genreOption}>
                  <input
                    type="checkbox"
                    checked={filters.genres.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                  />

                  <span>{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Рік виходу</label>

            <input
              type="number"
              placeholder="Наприклад, 2024"
              min="1900"
              max="2100"
              value={filters.year}
              onChange={(e) => updateFilter("year", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Рейтинг TMDB</label>

            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="Від"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingMin}
                onChange={(e) => updateFilter("ratingMin", e.target.value)}
              />

              <input
                type="number"
                placeholder="До"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingMax}
                onChange={(e) => updateFilter("ratingMax", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Мінімум голосів</label>

            <input
              type="number"
              min="0"
              placeholder="Наприклад, 100"
              value={filters.votesMin}
              onChange={(e) => updateFilter("votesMin", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Тривалість епізоду (хв)</label>

            <div className={styles.rangeInputs}>
              <input
                type="number"
                min="0"
                placeholder="Від"
                value={filters.runtimeMin}
                onChange={(e) => updateFilter("runtimeMin", e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="До"
                value={filters.runtimeMax}
                onChange={(e) => updateFilter("runtimeMax", e.target.value)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Series;