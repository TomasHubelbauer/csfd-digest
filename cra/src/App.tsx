import './App.css';
import React, { Component, ChangeEventHandler } from 'react';
import TimeAgo from 'react-timeago';

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
  movies: Movie[];
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

export default class App extends Component<AppProps, AppState> {
  public readonly state: AppState = {
    data: { type: 'loading' },
    selectedCinemas: localStorage.getItem('selected-cinemas') ? JSON.parse(localStorage.getItem('selected-cinemas')!) : [],
  };

  private readonly handleCinemaSelectChange: ChangeEventHandler<HTMLSelectElement> = event => {
    const selectedCinemas = Array.from(event.currentTarget.options).filter(option => option.selected).map(option => option.value);
    localStorage.setItem('selected-cinemas', JSON.stringify(selectedCinemas));
    this.setState({ selectedCinemas });
  };

  public render() {
    if (this.state.data.type === 'loading') {
      return 'Loading…';
    }

    if (this.state.data.type === 'error') {
      return 'Error!';
    }

    const now = new Date();

    const midnightTonight = new Date();
    midnightTonight.setHours(23, 59, 59, 999);

    const screeningsTonight = this.state.data.data.movies
      .map(movie => {
        const screenings: any[] = [];

        for (const cinema of this.state.selectedCinemas) {
          if (!movie.screenings[cinema]) {
            continue;
          }

          for (const screening of movie.screenings[cinema].filter(dateAndTime => dateAndTime > now && dateAndTime < midnightTonight)) {
            screenings.push({ cinema, screening });
          }
        }

        if (screenings.length === 0) {
          return null;
        }

        return { movie, screenings };
      })
      .filter(screening => screening !== null);

    return (
      <div>
        <h1>Prague Cinema Tonight</h1>
        <p>
          Built by
          <img alt="" src="https://hubelbauer.net/favicon.ico" />
          <a href="https://hubelbauer.net" target="_blank" rel="noopener noreferrer">Tomas Hubelbauer</a>
          .
          <a href="https://github.com/TomasHubelbauer/puppeteer-csfd-scraper" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
        <p>{this.state.selectedCinemas.length} cinema{this.state.selectedCinemas.length > 1 ? 's' : ''} selected</p>
        <select multiple onChange={this.handleCinemaSelectChange} value={this.state.selectedCinemas}>
          {this.state.data.data.cinemas.map(cinema => <option key={cinema}>{cinema}</option>)}
        </select>
        <p>{screeningsTonight.length} movies tonight: (last updated&nbsp;<TimeAgo date={this.state.data.data.dateAndTime} />)</p>
        <ul>
          {screeningsTonight.map(screening => (
            <li key={screening!.movie.id}>
              <a href={'#' + screening!.movie.id}>{screening!.movie.name}</a>
            </li>
          ))}
        </ul>
        {screeningsTonight.map(screening => (
          <details key={screening!.movie.id} open>
            <summary>
              <h2 id={screening!.movie.id}>{screening!.movie.name}</h2>
            </summary>
            <img alt={`${screening!.movie.name} poster`} src={screening!.movie.posterUrl} />
            <p>{screening!.movie.content}</p>
            <ul>
              {screening!.screenings.map((screen, index) => <li key={index}>{screen.cinema} {screen.screening.toLocaleTimeString()}</li>)}
            </ul>
          </details>
        ))}
      </div>
    );
  }

  public async componentDidMount() {
    const response = await fetch('data.json');
    const data: Data = await response.json();
    data.dateAndTime = new Date(data.dateAndTime);
    for (const movie of data.movies) {
      for (const cinema of data.cinemas) {
        if (movie.screenings[cinema]) {
          movie.screenings[cinema] = movie.screenings[cinema].map(dateAndTime => new Date(dateAndTime));
        }
      }
    }

    this.setState({ data: { type: 'success', data } });
  }
};
