window.addEventListener('load', async () => {
  const cinemasDiv = document.getElementById('cinemasDiv');
  const moviesDiv = document.getElementById('moviesDiv');
  const popupDiv = document.getElementById('popupDiv');
  const posterImg = document.querySelector('#popupDiv img');
  const nameH2 = document.querySelector('#popupDiv h2');
  const contentDiv = document.getElementById('contentDiv');
  const trailerIframe = document.getElementById('trailerIframe');
  const tagDiv = document.getElementById('tagDiv');
  const screeningsDiv = document.getElementById('screeningsDiv');

  const response = await fetch('data.json');
  const data = await response.json();

  // TODO: Iterate local storage and delete keys which do not have a corresponding value in `data.movies`
  // to clear data for movies that are no longer in cinemas

  let cinemas = localStorage.getItem('cinemas') ? JSON.parse(localStorage.getItem('cinemas')) : data.cinemas;

  function renderCinemas() {
    const fragment = document.createDocumentFragment();
    for (const cinema of data.cinemas) {
      const selected = cinemas.includes(cinema);

      const cinemaInput = document.createElement('input');
      cinemaInput.type = 'checkbox';
      cinemaInput.checked = selected;
      cinemaInput.id = cinema;
      cinemaInput.dataset.cinema = cinema;
      cinemaInput.addEventListener('change', handleCinemaInputChange);

      const cinemaLabel = document.createElement('label');
      cinemaLabel.textContent = cinema;
      cinemaLabel.htmlFor = cinema;

      fragment.append(cinemaInput, cinemaLabel);
    }

    // TODO: Add a select all button and a unselect all button depending on state

    cinemasDiv.innerHTML = '';
    cinemasDiv.append(fragment);
  }

  function renderMovies() {
    const fragment = document.createDocumentFragment();

    // TODO: Hook up "show watched/deleted" filter when exists between maybies and untagged
    const probablies = data.movies.filter(m => localStorage.getItem(m.id) === 'probably');
    const maybies = data.movies.filter(m => localStorage.getItem(m.id) === 'maybe');
    const untagged = data.movies.filter(m => localStorage.getItem(m.id) === null);

    for (const movie of [...probablies, ...maybies, ...untagged]) {
      const movieCinemas = Object.keys(movie.screenings);

      // Skip movies with no screenings for the selected cinemas
      if (!movieCinemas.find(c => cinemas.includes(c))) {
        continue;
      }

      const movieDiv = document.createElement('div');

      const tag = localStorage.getItem(movie.id);
      if (tag) {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'badge';
        switch (tag) {
          case 'probably': {
            badgeDiv.textContent = 'Will watch';
            break;
          }
          case 'maybe': {
            badgeDiv.textContent = 'Might watch';
            break;
          }
          case 'watched': {
            badgeDiv.textContent = 'Already watched';
            break;
          }
          case 'deleted': {
            badgeDiv.textContent = 'Won\'t watch';
            break;
          }
          default: {
            throw new Error('Invalid tag');
          }
        }

        movieDiv.append(badgeDiv);
      }

      const posterA = document.createElement('a');
      posterA.href = '#' + movie.id;

      const posterImg = document.createElement('img');
      posterImg.dataset.src = movie.posterUrl + '?h360';
      posterImg.dataset.id = movie.id;
      posterImg.addEventListener('error', handlePosterImgError);

      posterA.append(posterImg);

      const nameA = document.createElement('a');
      nameA.textContent = movie.name;
      nameA.href = '#' + movie.id;

      const yearSpan = document.createElement('span');
      yearSpan.textContent = movie.year;

      movieDiv.append(posterA, nameA, yearSpan);
      fragment.append(movieDiv);
    }

    moviesDiv.innerHTML = '';
    moviesDiv.append(fragment);
    loadImages();
  }

  function renderMovie() {
    const popup = location.hash && location.hash !== '#_';
    popupDiv.classList.toggle('popup', popup);
    if (!popup) {
      return;
    }

    const id = location.hash.slice(1);
    const movie = data.movies.find(m => m.id === id);
    const tag = localStorage.getItem(movie.id);

    posterImg.src = movie.posterUrl + '?h180';
    nameH2.textContent = movie.name;

    const paragraphs = movie.content.split('\n').map(paragraph => {
      const paragraphP = document.createElement('p');
      paragraphP.textContent = paragraph;
      return paragraphP;
    });

    contentDiv.innerHTML = '';
    contentDiv.append(...paragraphs);

    trailerIframe.src = movie.trailerUrl.replace('watch?v=', 'embed/');

    tagDiv.innerHTML = '';
    switch (tag) {
      case 'probably': {
        const tagSpan = document.createElement('span');
        tagSpan.textContent = `You said you will watch ${movie.name}. Changed your mind?`;

        const untagButton = document.createElement('button');
        untagButton.dataset.id = id;
        untagButton.textContent = 'Reset';
        untagButton.addEventListener('click', handleUntagButtonClick);

        tagDiv.append(tagSpan, untagButton);
        break;
      }
      case 'maybe': {
        const tagSpan = document.createElement('span');
        tagSpan.textContent = `You said you might watch ${movie.name}. Changed your mind?`;

        const untagButton = document.createElement('button');
        untagButton.dataset.id = id;
        untagButton.textContent = 'Reset';
        untagButton.addEventListener('click', handleUntagButtonClick);

        tagDiv.append(tagSpan, untagButton);
        break;
      }
      case 'watched': {
        const tagSpan = document.createElement('span');
        tagSpan.textContent = `You already watched ${movie.name}. Is this a mistake?`;

        const untagButton = document.createElement('button');
        untagButton.dataset.id = id;
        untagButton.textContent = 'Reset';
        untagButton.addEventListener('click', handleUntagButtonClick);

        tagDiv.append(tagSpan, untagButton);
        break;
      }
      case 'deleted': {
        const tagSpan = document.createElement('span');
        tagSpan.textContent = `You said you weren't gonna watch ${movie.name}. Changed your mind?`;

        const untagButton = document.createElement('button');
        untagButton.dataset.id = id;
        untagButton.textContent = 'Reset';
        untagButton.addEventListener('click', handleUntagButtonClick);

        tagDiv.append(tagSpan, untagButton);
        break;
      }
      default: {
        const questionP = document.createElement('p');
        questionP.textContent = `Are you gonna watch ${movie.name}?`;

        const tagAsProbablyButton = document.createElement('button');
        tagAsProbablyButton.dataset.tag = 'probably';
        tagAsProbablyButton.dataset.id = id;
        tagAsProbablyButton.textContent = 'I will';
        tagAsProbablyButton.addEventListener('click', handleTagButtonClick);

        const tagAsMaybeButton = document.createElement('button');
        tagAsMaybeButton.dataset.tag = 'maybe';
        tagAsMaybeButton.dataset.id = id;
        tagAsMaybeButton.textContent = 'I might';
        tagAsMaybeButton.addEventListener('click', handleTagButtonClick);

        const tagAsWatchedButton = document.createElement('button');
        tagAsWatchedButton.dataset.tag = 'watched';
        tagAsWatchedButton.dataset.id = id;
        tagAsWatchedButton.textContent = 'I already did';
        tagAsWatchedButton.addEventListener('click', handleTagButtonClick);

        const tagAsDeletedButton = document.createElement('button');
        tagAsDeletedButton.dataset.tag = 'deleted';
        tagAsDeletedButton.dataset.id = id;
        tagAsDeletedButton.textContent = 'I won\'t';
        tagAsDeletedButton.addEventListener('click', handleTagButtonClick);

        tagDiv.append(questionP, tagAsProbablyButton, tagAsMaybeButton, tagAsWatchedButton, tagAsDeletedButton);
      }
    }

    const fragment = document.createDocumentFragment();
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

    screeningsDiv.innerHTML = '';
    screeningsDiv.append(fragment);

    // Attach this this way so that the initial scroll done by the browser on refresh doesn't trigger it
    window.setTimeout(window.addEventListener, 0, 'scroll', dismissPopup, { passive: true });
  }

  renderCinemas();
  renderMovies();
  renderMovie();

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

  function handlePosterImgError(event) {
    event.currentTarget.src = 'no-poster.png';
  }

  function handleTagButtonClick(event) {
    const id = event.currentTarget.dataset.id;
    const tag = event.currentTarget.dataset.tag;
    localStorage.setItem(id, tag);
    renderMovies();
    location.hash = '#_';
  }

  function handleUntagButtonClick(event) {
    const id = event.currentTarget.dataset.id;
    localStorage.removeItem(id);
    renderMovies();
    renderMovie();
  }

  function dismissPopup() {
    if (event.target !== document && event.target !== popupDiv) {
      // Ignore clicks within the popup
      return;
    }

    // Prevent scrolling up by not using an empty hash here
    location.hash = '_';
    window.removeEventListener('scroll', dismissPopup, { passive: true });
  }

  popupDiv.addEventListener('click', dismissPopup);

  window.addEventListener('hashchange', renderMovie);

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
