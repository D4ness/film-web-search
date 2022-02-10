const API_KEY = '4a7965f18c6bd8ca506ff75e45baaefa';
const urlStart = 'https://api.themoviedb.org/3/'
const urlParams = `api_key=${API_KEY}&language=ru-RU`

function sendRequest(url) {
    return fetch(url)
        .then(response => {
            return response.json()
        })
}

function showFilmInfo(elem) {
    document.querySelectorAll('.search__options div').forEach(block => block.classList.add('hide'));
    const url = `${urlStart}movie/${elem.id}?${urlParams}`;
    sendRequest(url)
        .then(info => {
            document.querySelector('.search__input').value = info['title'];
            const block = document.querySelector('.film');
            block.classList.remove('hide');
            block.innerHTML =
                `
                <div class="film__tittle">${info['title']}, ${info['release_date'].slice(0, 4)} год</div>
                <div class="film__genre">Жанры: ${info['genres'].map(genre => ` ${genre.name}`)}</div>
                <div class="film__description">${info['overview']}</div>
                <div class="film__popularity">Популярность: ${info['popularity']}</div>
                `;
            addFilmInStorage(info['title'], info['id']);
        })
}

function addFilmInStorage(title, id) {
    let new_list = JSON.parse(localStorage.getItem("film_list"));
    new_list[title] = id;
    localStorage.setItem('film_list', JSON.stringify(new_list));
}

function makeFilmBlock(num, film, check) {
    let block = document.querySelector(`.search__options_${num}`);
    // console.log(block);
    block.classList.remove('hide');
    block.id = film['id']
    block.style = '';
    block.onclick = function () {
        showFilmInfo(block);
    };
    block.textContent = `${film['title']}, ${film['release_date'].slice(0, 4)} г.`;
    if (check) block.style = 'color: red;'
}

function makeStorageList(text) {
    let film_count = 0;
    let usedFilms = [];
    const storage = JSON.parse(localStorage.getItem('film_list'));
    const storageFilms = Object.keys(storage);
    if ((film_count < 5) && (storageFilms.some(title => title.toLowerCase().search(text.toLowerCase()) !== -1))) {
        film_count++;
        storageFilms.map(film => {
            if (film.toLowerCase().search(text.toLowerCase()) !== -1) {
                const id = storage[film];
                const url = `${urlStart}movie/${id}?${urlParams}`;
                usedFilms.push(film);
                sendRequest(url)
                    .then(info => {
                        makeFilmBlock(film_count, info, true);
                        film_count++;
                    })
            }
        })

        // console.log('up', film_count);
    } else {
        console.log('non')
    }
    return usedFilms
}

function showSearchList(films, text) {
    let BreakException = {};
    document.querySelector('.film').classList.add('hide');
    document.querySelector('.search__options').classList.remove('hide')

    const usedFilms = makeStorageList(text);
    let film_count = usedFilms.length;
        console.log(film_count, usedFilms[0],usedFilms)
    try { // Вместо break, которого нет для forEach, чтобы не перебирать список фильмов после 10 в списке
        films.forEach(film => {
            // usedFilms.some(item => {
            //     console.log('z',item); return item === film['title']})
            usedFilms.forEach(item => console.log(item));

            if ((film['title'].toLowerCase().search(text.toLowerCase()) !== -1) && !(usedFilms.some(item => item === film['title']))) {

                // console.log('yes', film_count, film)
                // let block = document.createElement("div");
                if (film_count++ < 10) {
                    makeFilmBlock(film_count, film, false);
                } else {
                    throw BreakException;
                }
            }
        })
    } catch (err) {
        if (err !== BreakException) throw err;
    }
}

document.querySelector('.search__input').oninput = function () {
    const text = this.value.trim();
    if (text !== '') {
        let url = `${urlStart}search/movie?${urlParams}&query=${text}`;
        sendRequest(url)
            .then(response => {
                showSearchList(response.results, text);
            })
    } else {
        document.querySelector('.search__options').classList.add('hide')
    }
}
