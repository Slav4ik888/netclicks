"use strict";

const func = (callback) => {
    console.log('func');
    callback(1, 2);
}

const bar = () => {
    console.log('bar');
}
func((a, b)=> console.log('bar', a, b));



// Начальный путь к картинкам
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';




const 
    // Menu
    leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    dropdown = document.querySelectorAll('.dropdown'),

    // Заголовок "Вывод результатов поиска"  
    tvShowsHead = document.querySelector('.tv-shows__head'),
    
    // Модальное окно
    modal = document.querySelector('.modal'),
    tvCardImg = document.querySelector('.tv-card__img'),


    // Список карточек    
    tvShowsList = document.querySelector('.tv-shows__list'),

    // Описание в модальном окне  
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),

    modalContent = document.querySelector('.modal__content'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    trailer = document.getElementById('trailer'),
    headTrailer  = document.getElementById('head-trailer'),

    

    // Пагинация
    pagination = document.querySelector('.pagination'),
    
    // Прелоудер    
    tvShows = document.querySelector('.tv-shows'),
    loading = document.createElement('div');
    
loading.className = 'loading';    
// прелоудер для модалки
// const preloader = document.querySelector('.preloader');


/*------------------------------------*/
/*        Класс чтения из BD          */
/*------------------------------------*/

class DBService {

    constructor() {
        this.API_KEY = 'bc6d9f050d812e474b84e682e2f3c0a6';
        this.SERVER = `https://api.themoviedb.org/3`; 
    }
    getData = async (url) => {
        const res =  await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }
    
    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = async () => {
        return this.getData('card.json');
    }

    getSearchResult = query => { 
        this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        console.log('page', page);
        return this.getData(this.temp + '&page=' + page);
    }

    getTVShow = id => {
        
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=en-RU`);
    }


    getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=en-RU`);

    getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=en-RU`);

    getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=en-RU`);
    
    getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=en-RU`);

    getVideo = id => {
        return this.getData(`${this.SERVER}/tv/${id}/videos?api_key=${this.API_KEY}&language=en-RU`)
    }
}


const dbservice = new DBService();



/*------------------------------------*/
/*                ПОИСК               */
/*------------------------------------*/

const 
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'); 


// console.log(dbservice.getSearchResult('Няня') );
searchForm.addEventListener('submit', event => {
    event.preventDefault();

    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        
        tvShows.append(loading);
        dbservice.getSearchResult(value).then( 
            renderCard 
        );
    }

});


/*------------------------------------*/
/*        Создаём карточки            */
/*------------------------------------*/

const renderCard = (res, target) => {

    console.log('res: ', res);
    tvShowsList.textContent = '';


    if (res.total_results) {

        tvShowsHead.textContent = target ? target.textContent : "Результат поиска";

        res.results.forEach(item => {

            const { 
                backdrop_path: backdrop,
                name: title, 
                poster_path: poster, 
                vote_average: vote,
                id } = item;

            const posterImg = poster ? IMG_URL+poster : 'img/no-poster.jpg';
            const backDropImg = backdrop ? IMG_URL + backdrop : '';
            const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

            const card = document.createElement('li');
            card.classList.add('tv-shows__item');

            const itemCart = `
                <a href="#" id="${id}" class="tv-card">
                    ${voteElem}
                    <img class="tv-card__img"
                            src="${posterImg}"
                            data-backdrop="${backDropImg}"
                            alt="${title}">
                    <h4 class="tv-card__head">${title}</h4>
                </a>
            `;
            card.insertAdjacentHTML('afterbegin', itemCart);
        
            loading.remove(); // отключаем пролоадер
            tvShowsList.append(card);
        })
    } else {
        console.log('По вашему запросу ничего не найдено');
        loading.remove(); // отключаем пролоадер
        tvShowsList.textContent = 'По вашему запросу ничего не найдено';
        // tvShowsList.style.cssText = 'color: red; font-size: 18px;'
    }

    pagination.textContent = '';

    if (!target && res.total_pages > 1) {
        for (let i = 1; i <= res.total_pages; i++ ){
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }

};

pagination.addEventListener('click', event => {
    event.preventDefault();

    const target = event.target;

    if (target.classList.contains('pages')) { // значит кликнули по страничке 
        console.log('Кликнули по страничке');
        tvShows.append(loading);
        dbservice.getNextPage( target.textContent ).then( renderCard )
    }

});


// Инициализируем чтение с BD и рендерим карточки
{
    tvShows.append(loading);
    dbservice.getTestData().then( 
        renderCard 
    );
}



/*------------------------------------*/
/*              СЛУШАТЕЛИ             */
/*------------------------------------*/

// закрывает active в dropdown, это влевом меню
const closeDropDown = () => {
    dropdown.forEach( item => {
        item.classList.remove('active');
    })
}

// открытие закрытие меню
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropDown();
});


// закрывает меню при нажатии на область документа
document.addEventListener('click', event => {
    const target = event.target;

    if (!target.closest('.left-menu')) { //поднимается вверх и ищет ближайший указанный класс
        // console.log('Клик не в меню');
        hamburger.classList.remove('open');
        leftMenu.classList.remove('openMenu');
        closeDropDown();

    }

});

// Делегирование
leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;

    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
 
    if (target.closest('#top-rated')) {
        tvShowsHead.append(loading);
        dbservice.getTopRated().then( res =>  renderCard( res, target) );
    }
    if (target.closest('#popular')) {
        tvShowsHead.append(loading);
        dbservice.getPopular().then( res =>  renderCard( res, target) );
    }
    if (target.closest('#today')) {
        tvShowsHead.append(loading);
        dbservice.getToday().then( res =>  renderCard( res, target) );
    }
    if (target.closest('#week')) {
        tvShowsHead.append(loading);
        dbservice.getWeek().then( res =>  renderCard( res, target) );
    }

    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';


    }
    loading.remove();
});



/*------------------------------------*/
/*          МОДАЛЬНОЕ ОКНО            */
/*------------------------------------*/
// открытие модального окна
tvShowsList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const tvCard = target.closest('.tv-card'); // ищем ближайший класс 

    if (tvCard) {

        // вывестии прелоудер
        // preloader.style.display = 'block';
        tvCard.append(loading);

        dbservice.getTVShow(tvCard.id)
            .then( ({ poster_path: posterPath, 
                    name: title,   
                    vote_average: voteAverage,
                    overview,
                    genres,
                    homepage,
                    id
            }) => {
                if (posterPath) {
                    tvCardImg.src = IMG_URL + posterPath;
                    tvCardImg.alt = title;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';

                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '45px';

                }

                modalTitle.textContent = title;
                // genresList.innerHTML = res.genres.reduce( (acc, item) => `${acc}<li>${item.name}</li>`, '');
                genresList.textContent = '';
                genres.forEach( item => genresList.innerHTML += `<li>${item.name}</li>`)    ;
                
                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;

                return id 
            })
            .then(dbservice.getVideo)

            .then( response => {
                console.log('response: ', response);
                headTrailer.classList.add('hide');
                trailer.textContent = '';

                if (response.results.length) {
                    headTrailer.classList.remove('hide');
                    response.results.forEach( item => {
                        const trailerItem = document.createElement('li');
                        trailerItem.innerHTML = `
                            <h4>${item.name}</h4>
                            <iframe
                                width="400"
                                height="300"
                                src="https://www.youtube.com/embed/${item.key}"
                                frameborder="0"
                                allowfullscreen>
                            </iframe>
                        `

                        trailer.append(trailerItem);
                    })
                }
                
            })
            .then( ()=> {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
            })
            .finally( () => {
                // preloader.style.display = '';
                loading.remove(); // отключаем пролоадер
            })
    }

    
})



// закрыть модалку
modal.addEventListener('click', event => {
    const target = event.target;

    // if (target.classList.contains('modal')) {
    //     console.log('Кликнул мимо окна');

    // } else {
    //     console.log('Кликнул в окно');

    // }

    if ( target.closest('.cross') || // есть ли класс у элемента
         target.classList.contains('modal') ) { // если кликнули мимо окна
        // console.log('cross: ');
        document.body.style.overflow = '';
        modal.classList.add('hide');


    }
})



/*------------------------------------*/
/*      Смена картинки у карточки     */
/*------------------------------------*/

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    //event.target.matches('.tv-card__img');// Возвращает true или false если событие 
    //происходит на этом конкретном элементе

    if (card){
        const img = card.querySelector('.tv-card__img');

        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }

    }; 
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);




