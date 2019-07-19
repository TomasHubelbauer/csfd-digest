window.addEventListener('load', async () => {
  const cinemasDiv = document.getElementById('cinemasDiv');
  const moviesDiv = document.getElementById('moviesDiv');

  const response = await fetch('data.json');
  const data = await response.json();

  let cinemas = localStorage.getItem('cinemas') ? JSON.parse(localStorage.getItem('cinemas')) : data.cinemas;

  function renderCinemas() {
    const fragment = document.createDocumentFragment();
    for (const cinema of data.cinemas) {
      const selected = cinemas.includes(cinema);

      const cinemaDiv = document.createElement('div');
      cinemaDiv.className = 'cinema';
      cinemaDiv.classList.toggle('selected', selected);

      const cinemaInput = document.createElement('input');
      cinemaInput.type = 'checkbox';
      cinemaInput.checked = selected;
      cinemaInput.id = cinema;
      cinemaInput.dataset.cinema = cinema;
      cinemaInput.addEventListener('change', handleCinemaInputChange);

      const cinemaLabel = document.createElement('label');
      cinemaLabel.textContent = cinema;
      cinemaLabel.htmlFor = cinema;

      cinemaDiv.append(cinemaInput, cinemaLabel);
      fragment.append(cinemaDiv);
    }

    // TODO: Add a select all button and a unselect all button depending on state

    cinemasDiv.innerHTML = '';
    cinemasDiv.append(fragment);
  }

  function renderMovies() {
    const fragment = document.createDocumentFragment();
    if (location.hash) {
      const id = location.hash.slice(1);
      const movie = data.movies.find(m => m.id === id);

      const backA = document.createElement('a');
      backA.textContent = 'Go back';
      backA.href = '#';

      const posterImg = document.createElement('img');
      posterImg.src = movie.posterUrl + '?h360';

      const nameH2 = document.createElement('h2');
      nameH2.textContent = movie.name;

      const contentP = document.createElement('p');
      contentP.textContent = movie.content;

      fragment.append(backA, document.createElement('br'), posterImg, nameH2, contentP);

      for (const screening of Object.keys(movie.screenings)) {
        if (!cinemas.includes(screening)) {
          continue;
        }

        const screeningH3 = document.createElement('h3');
        screeningH3.textContent = screening;
        fragment.append(screeningH3);

        for (const [year, month, day, hour, minute] of movie.screenings[screening]) {
          const dateAndTimeSpan = document.createElement('span');
          dateAndTimeSpan.textContent = `${year}/${month}/${day} ${hour}:${minute}`;
          dateAndTimeSpan.className = 'screening';
          fragment.append(dateAndTimeSpan);
        }
      }
    } else {
      for (const movie of data.movies) {
        const movieCinemas = Object.keys(movie.screenings);
        if (!movieCinemas.find(c => cinemas.includes(c))) {
          continue;
        }

        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie';

        const posterImg = document.createElement('img');
        posterImg.dataset.src = movie.posterUrl + '?h360';
        posterImg.dataset.id = movie.id;
        posterImg.addEventListener('click', handlePosterImgClick);
        posterImg.addEventListener('error', handlePosterImgError);

        const nameA = document.createElement('a');
        nameA.textContent = movie.name;
        nameA.href = '#' + movie.id;

        const yearSpan = document.createElement('span');
        yearSpan.textContent = movie.year;

        movieDiv.append(posterImg, nameA, yearSpan);
        fragment.append(movieDiv);
      }
    }

    moviesDiv.innerHTML = '';
    moviesDiv.append(fragment);
    loadImages();
  }

  renderCinemas();
  renderMovies();

  function handleCinemaInputChange(event) {
    const cinema = event.currentTarget.dataset.cinema;
    if (event.currentTarget.checked) {
      cinemas.push(cinema);
    } else {
      cinemas = cinemas.filter(c => c !== cinema);
    }

    localStorage.setItem('cinemas', JSON.stringify(cinemas));
    renderCinemas();
    renderMovies();
  }

  function handlePosterImgClick(event) {
    location.hash = event.currentTarget.dataset.id;
  }

  function handlePosterImgError(event) {
    // Fallback to the lower resolution image if we do not have a higher one
    event.currentTarget.src = 'no-poster.png';
  }

  window.addEventListener('hashchange', renderMovies);

  function loadImages() {
    for (const img of document.querySelectorAll('img')) {
      const { bottom, top } = img.getBoundingClientRect();
      if (bottom >= 0 && top <= window.innerHeight && !img.src) {
        img.src = img.dataset.src;
      }
    }
  }

  window.addEventListener('scroll', loadImages, { passive: true });
  loadImages();
});
