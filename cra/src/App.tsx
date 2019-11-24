import './App.css';
import React, { ChangeEventHandler, useEffect, useState, Fragment } from 'react';
import TimeAgo from 'react-timeago';

type IndexMovie = {
  id: string;
  url: string;
  name: string;
  year: number;
  posterUrl: string;
  cinemas: number[];
  screenings: number;
};

type Movie = {
  id: string;
  url: string;
  name: string;
  year: number;
  screenings: {
    [cinema: string]: Date[];
  };
  content: string;
  imdbUrl: string;
  posterUrl: string;
  trailerUrl: string;
};

type Data = {
  dateAndTime: Date;
  cinemas: string[];
  movies: IndexMovie[];
};

type AppProps = {};

type AppState = {
  data:
  | { type: 'loading' }
  | { type: 'success', data: Data }
  | { type: 'error', error: Error }
  ;
  selectedCinemas: string[];
};

export default function App() {
  // TODO: Add a loading state
  const [dateAndTime, setDateAndTime] = useState<Date>(new Date());
  const [cinemas, setCinemas] = useState<string[]>([]);
  const [selectedCinemas, setSelectedCinemas] = useState<string[]>(localStorage.getItem('selected-cinemas') ? JSON.parse(localStorage.getItem('selected-cinemas')!) : []);
  const [movies, setMovies] = useState<IndexMovie[]>([]);
  const [error, setError] = useState<Error>();
  useEffect(() => {
    void async function () {
      try {
        const response = await fetch(process.env.NODE_ENV === 'development' ? 'data/index.json' : '../data/index.json');
        const { dateAndTime, cinemas, movies }: Data = await response.json();

        // Sort movies by the number of screenings as a proxy for popularity
        movies.sort((a, b) => b.screenings - a.screenings)

        setDateAndTime(new Date(dateAndTime));
        setCinemas(cinemas);
        setMovies(movies);
      } catch (error) {
        setError(error);
      }
    }()
  }, []);

  const handleCinemaInputChange: ChangeEventHandler<HTMLInputElement> = event => {
    let newSelectedCinemas = selectedCinemas.filter(c => c !== event.currentTarget.id);
    if (event.currentTarget.checked) {
      newSelectedCinemas.push(event.currentTarget.id);
    }

    setSelectedCinemas(newSelectedCinemas);
    localStorage.setItem('selected-cinemas', JSON.stringify(newSelectedCinemas));
  };

  if (error) {
    return (
      <div>{error.toString()}</div>
    );
  }

  const selectedCinemaIndices = selectedCinemas.map(c => cinemas.indexOf(c));
  const filteredMovies = movies.filter(m => m.cinemas.find(c => selectedCinemaIndices.includes(c)));
  return (
    <div>
      <h1>Prague Cinema</h1>
      <p>
        Built by
        <img alt="" src="https://hubelbauer.net/favicon.ico" />
        <a href="https://hubelbauer.net" target="_blank" rel="noopener noreferrer">Tomas Hubelbauer</a>
        .
        <a href="https://github.com/TomasHubelbauer/puppeteer-csfd-scraper" target="_blank" rel="noopener noreferrer">GitHub</a>
      </p>
      <div>
        {cinemas.map(c => (
          <Fragment key={c}>
            <input type="checkbox" checked={selectedCinemas.includes(c)} id={c} onChange={handleCinemaInputChange} />
            <label htmlFor={c}>{c}</label>
          </Fragment>
        ))}
      </div>
      <p>{selectedCinemas.length} cinema{selectedCinemas.length > 1 ? 's' : ''} selected</p>
      <p>{filteredMovies.length} ({movies.length}) movies: (last updated&nbsp;<TimeAgo date={dateAndTime} />)</p>
      {filteredMovies.map(movie => (
        <div className="cinema" key={movie.id}>
          <img alt={`${movie.name} poster`} src={movie.posterUrl + '?h360'} />
          {movie.name}
        </div>
      ))}
    </div>
  );
}
