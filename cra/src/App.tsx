import './App.css';
import React, { useEffect, useState, MouseEventHandler } from 'react';
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

  const handleExcludeCinemaButtonClick: MouseEventHandler<HTMLButtonElement> = event => {
    const _selectedCinemas = selectedCinemas.filter(c => c !== event.currentTarget.dataset.id);
    setSelectedCinemas(_selectedCinemas);
    localStorage.setItem('selected-cinemas', JSON.stringify(_selectedCinemas));
  };

  const handleIncludeCinemaButtonClick: MouseEventHandler<HTMLButtonElement> = event => {
    const _selectedCinemas = selectedCinemas.filter(c => c !== event.currentTarget.dataset.id);
    _selectedCinemas.push(event.currentTarget.dataset.id!);
    setSelectedCinemas(_selectedCinemas);
    localStorage.setItem('selected-cinemas', JSON.stringify(_selectedCinemas));
  };

  if (error) {
    return (
      <div>{error.toString()}</div>
    );
  }

  const selectedCinemaIndices = selectedCinemas.map(c => cinemas.indexOf(c));
  const includedCinemas = selectedCinemas;
  const excludedCinemas = cinemas.filter(c => !includedCinemas.includes(c));
  const badMovies = movies.filter(m => !m.cinemas);
  const goodMovies = movies.filter(m => !badMovies.includes(m));
  const filteredMovies = goodMovies.filter(m => m.cinemas.find(c => selectedCinemaIndices.includes(c)));
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
      {badMovies.length > 0 && (
        <div>Some movies weren't scraped correctly: {badMovies.map(m => `${m.name} (${m.year})`).join(', ')}</div>
      )}
      <div className="included">
        {includedCinemas.map(c => (
          <button key={c} data-id={c} onClick={handleExcludeCinemaButtonClick}>{c}</button>
        ))}
      </div>
      <div className="excluded">
        {excludedCinemas.map(c => (
          <button key={c} data-id={c} onClick={handleIncludeCinemaButtonClick}>{c}</button>
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
