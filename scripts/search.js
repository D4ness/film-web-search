const API_KEY = '4a7965f18c6bd8ca506ff75e45baaefa';
const urlStart = 'https://api.themoviedb.org/3/'
const urlParams = `api_key=${API_KEY}&language=ru-RU`

function sendRequest(url) {
    return fetch(url)
        .then(response => response.json());
}

function showFilmInfo(elem, className, check) {
    if (check) {
        document.querySelector('.search__options').classList.add('hide');
        document.querySelector(`${className}`).classList.remove('hide');
    }
    const url = `${urlStart}movie/${elem.id}?${urlParams}`;
    sendRequest(url)
        .then(info => {
            if (check) document.querySelector('.search__input').value = info.title;
            const block = document.querySelector(`${className}`);
            block.classList.remove('hide');
            block.innerHTML = `
                <div class="film__title">${info.title}, ${info.release_date.slice(0, 4)} год</div>
                <div class="film__genre">Жанры: ${info.genres.map(genre => ` ${genre.name}`)}</div>
                <div class="film__description">${info['overview']}</div>
                <div class="film__popularity">Популярность: <b>${info['popularity']}</b></div>
                `;
            if (check) addFilmInStorage(info.title, info.id, info.release_date);
        })
}

function addFilmInStorage(title, id, date) {
    const newFilmList = JSON.parse(localStorage.getItem("film_list"));
    newFilmList[title] = {id: id, release_date: date, title: title};
    localStorage.setItem('film_list', JSON.stringify(newFilmList));
    const lastFilms = JSON.parse(localStorage.getItem("last_films"));
    lastFilms[lastFilmsCounter++ % 3] = {id, release_date: date, title};
    localStorage.setItem('last_films', JSON.stringify(lastFilms));
    changeLastFilms();
}

function makeFilmDivBlock(num, film, check) {
    document.querySelector('.search__options').classList.remove('hide');
    let block = document.querySelector(`.search__option_${num}`);
    block.id = film.id
    block.style = '';
    block.onclick = () => showFilmInfo(block, `.film`, true);
    block.textContent = `${film.title}, ${film.release_date.slice(0, 4)} г.`;
    if (check) block.style = 'color: #5291F8; text-decoration: underline';
}

function clearSearchList() {
    document.querySelectorAll('.search__option').forEach(block => {
        block.textContent = '';
    });
}

function compareTitle(storageFilms, query) {
    return storageFilms.some(title => title.toLowerCase().search(query) !== -1)
}

function makeListFromStorage(query) {
    let filmCount = 0;
    let usedFilms = [];
    const storage = JSON.parse(localStorage.getItem('film_list'));
    const storageFilms = Object.keys(storage);
    if (compareTitle(storageFilms, query)) {
        storageFilms.map(film => {
            if ((film.toLowerCase().search(query) !== -1) && (filmCount < 5)) {
                const id = storage[film];
                usedFilms.push(film);
                makeFilmDivBlock(filmCount + 1, storage[film], true);
                filmCount++;
            }
        })
    }
    return usedFilms
}

function showSearchList(films, query) {
    // Обертка для 2 функций: 1* составление списка из Storage
    // 2* составление остальной части списка из  общей базы данных
    document.querySelector('.film').classList.add('hide');
    document.querySelector('.search__options').classList.remove('hide')
    const usedFilms = makeListFromStorage(query);        // 1*
    let filmCount = usedFilms.length;
    for (let film of films) {
        if ((film['title'].toLowerCase().search(query) !== -1)) {
            if (filmCount++ < 10) {
                makeFilmDivBlock(filmCount, film, false); // 2*
            } else {
                break
            }
        }
    }
}

let emptyStorage = true;
let lastOptionIsHide = true;
try {
    let newList = JSON.parse(localStorage.getItem("film_list"));
    if (Object.keys(newList).length > 1) emptyStorage = false;
} catch (err) {
}
if (emptyStorage) {
    let filmList = {'$': {id: 123, release_date: 'some_date'}};
    localStorage.setItem('film_list', JSON.stringify(filmList));
    let lastFilms = {0: {id: 1, release_date: 'some_date', title: 'title'}};
    localStorage.setItem('last_films', JSON.stringify(lastFilms));
} else {
    changeLastFilms();
    document.querySelector('.last-options').classList.remove('hide');
    lastOptionIsHide = false;
}

let lastFilmsCounter = 0;

function changeLastFilms() {
    let blockIndex = 1;
    const lastFilms = JSON.parse(localStorage.getItem("last_films"));
    Object.values(lastFilms).map(film =>
        showFilmInfo(film, `.last-film_${blockIndex++}`, false));
    if (lastOptionIsHide) document.querySelector('.last-options').classList.remove('hide');
}

window.addEventListener('storage', () => changeLastFilms());

document.querySelector('.search__input').oninput = function () {    // Основная функция, на ввод символа
    const query = this.value.trim().toLowerCase();
    clearSearchList();
    if (query !== '') {
        let url = `${urlStart}search/movie?${urlParams}&query=${query}`;
        sendRequest(url)
            .then(response => {
                showSearchList(response.results, query);
            })
    } else {
        document.querySelector('.search__options').classList.add('hide');
    }
}
