const createGenre = genre => {
  return `
      <small>${genre}</small>
      `;
};

const createReview = review => {
  const { author, content } = review || {};
  return `
            <div class="col-md-12 review">
              <div class="row">
                  <h5>${author}</h5>
                  <p>${content}</p>
              </div>
            </div>
        `;
};

const createTrailer = trailer => {
  const { key } = trailer;
  return `
          <div class="col-md-4 trailer">
              <div class="embed-responsive embed-responsive-16by9">
                  <iframe 
                    class="embed-responsive-item"
                    id="ytplayer"
                    type="text/html"
                    src="https://www.youtube.com/embed/${key}"></iframe>
              </div>
        </div>
      `;
};

const createCast = cast => {
  const { character, name, profile } = cast || {};
  return `
        <div class="media cast">
            <div class="media-left media-middle">
                <div>
                    <a href="javascript:void()">
                        <img class="media-object" src="${profile}" width="64">
                    </a>
                </div>
            </div>
            <div class="media-body">
                <h5 class="media-heading">${name}</h5>
                <p>as ${character}</p>
            </div>
        </div>
        `;
};

const emptyData = (text, classList = '') => {
  return `
      <div class='${classList}'>There are no ${text} available</div>
    `;
};

const _hero = document.querySelector('.hero');
const _release_date = document.querySelector('.release_date');
const _movieTitle = document.querySelector('.movie_title');
const _moviePoster = document.querySelector('.movie_poster');
const _sypnosis = document.querySelector('.sypnosis');
const _genres = document.querySelector('.genres');
const _reviews = document.querySelector('.reviews_container');
const _trailers = document.querySelector('.trailers_container');
const _cast = document.querySelector('.casts');

(() => {
  const id = window.location.pathname
    .trim()
    .split('/')[3]
    .trim();

  fetch(`/api/movie/${id}`)
    .then(response => response.json())
    .then(movie => {
      const {
        release_date,
        original_title,
        title,
        poster,
        backdrop,
        overview,
        genres,
        cast,
        reviews,
        trailers
      } = movie;

      _release_date.textContent = 'Released: ' + release_date;
      _movieTitle.textContent = original_title || title;

      const genreHtml = genres
        .map((value, index) => {
          if (index + 1 === genres.length) return createGenre(value.name);
          return createGenre(value.name + ' &raquo; ');
        })
        .join('')
        .trim();
      _genres.innerHTML = 'Genres: ' + genreHtml;

      _hero.setAttribute('style', `background-image: url(${backdrop})`);

      _moviePoster.setAttribute('src', poster);
      _sypnosis.textContent = overview;

      _reviews.innerHTML = reviews.length
        ? reviews
            .map(value => createReview(value))
            .join('')
            .trim()
        : emptyData('reviews');

      _trailers.innerHTML = trailers.length
        ? trailers
            .map(value => createTrailer(value))
            .join('')
            .trim()
        : emptyData('trailer');

      const castNode = document.createElement('div');

      castNode.innerHTML = cast.length
        ? cast
            .map(cast => createCast(cast))
            .join('')
            .trim()
        : emptyData('cast');

      _cast.appendChild(castNode);
    });
})();