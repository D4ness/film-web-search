const API_KEY = '4a7965f18c6bd8ca506ff75e45baaefa';
const urlStart = 'https://api.themoviedb.org/3/'
const urlParams = `api_key=${API_KEY}&language=ru-RU`

function sendRequest(url) {
    return fetch(url)
        .then(response => response.json())
}

function showFilmInfo(elem) {
    console.log(elem)
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
    let newList = JSON.parse(localStorage.getItem("film_list"));
    newList[title] = id;
    localStorage.setItem('film_list', JSON.stringify(newList));
}

function makeFilmBlock(num, film, check) {
    let block = document.querySelector(`.search__options_${num}`);
    block.classList.remove('hide');
    block.id = film['id']
    block.style = '';
    // block.onclick = showFilmInfo;  // Не смог понять, можно ли здесь использовать bind()
    block.onclick = () => showFilmInfo(block);  // Не смог понять, можно ли здесь использовать bind()
    block.textContent = `${film['title']}, ${film['release_date'].slice(0, 4)} г.`;
    if (check) block.style = 'color: red;'
}

function makeStorageList(text) {
    let filmCount = 0;
    let usedFilms = [];
    const storage = JSON.parse(localStorage.getItem('film_list'));
    const storageFilms = Object.keys(storage);
    if ((filmCount < 5) && (storageFilms.some(title => title.toLowerCase().search(text.toLowerCase()) !== -1))) {
        filmCount++;
        storageFilms.map(film => {
            if (film.toLowerCase().search(text.toLowerCase()) !== -1) {
                const id = storage[film];
                const url = `${urlStart}movie/${id}?${urlParams}`;
                usedFilms.push(film);
                sendRequest(url)
                    .then(info => {
                        makeFilmBlock(filmCount, info, true);
                        filmCount++;
                    })
            }
        })
    } else {
        console.log('non')
    }
    return usedFilms
}

function showSearchList(films, text) {
    // Обертка для 2 функций: 1* составление списка из Storage
    // 2* составление остальной части списка из  общей базы данных
    let BreakException = {};
    document.querySelector('.film').classList.add('hide');
    document.querySelector('.search__options').classList.remove('hide')
    const usedFilms = makeStorageList(text);        // 1*
    let filmCount = usedFilms.length;
    try { // Вместо break, которого нет для forEach, чтобы не перебирать список фильмов после 10 в списке
        films.forEach(film => {
            if ((film['title'].toLowerCase().search(text.toLowerCase()) !== -1)
                && !(usedFilms.some(item => item === film['title']))) {
                if (filmCount++ < 10) {
                    makeFilmBlock(filmCount, film, false); // 2*
                } else {
                    throw BreakException;
                }
            }
        })
    } catch (err) {
        if (err !== BreakException) throw err;
    }
}

let emptyStorage = true;
try {
    let newList = JSON.parse(localStorage.getItem("film_list"));
    if (newList) emptyStorage = false;
} catch (err) {
}
if (emptyStorage) {
    let filmList = {'Example': 123}
    localStorage.setItem('film_list', JSON.stringify(filmList));
}
document.querySelector('.search__input').oninput = function () {    // Основная функция, на ввод символа
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
