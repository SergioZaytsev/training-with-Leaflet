"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
//const workout = document.querySelector(".workouts");

const typeWorking = {
    run: "Пробежка",
    cycling: "Велосипед",
};

// общий класс для тренировки
class Workoout {
    date = new Date();
    id = (Date.now() + "").slice(-10);
    constructor(duration, distance, coord) {
        this.duration = duration;
        this.distance = distance;
        this.coord = coord;
    }
    // Функция создает месяца и у объекта создает переменную Disription в которой содержаться сведения о строке с началом тренировки и вызывется уже непосредсренно при создании экземпляра джанного класса
    _distription() {
        const months = [
            "Января",
            "Февраля",
            "Марта",
            "Апреля",
            "Мая",
            "Июня",
            "Июля",
            "Августа",
            "Сентября",
            "Октября",
            "Ноября",
            "Декабря",
        ];
        // получаем дату и месяц
        const day = this.date.getDate();
        const month = months[this.date.getMonth()];
        this.disription = `${this.type === typeWorking.cycling ? "🚴‍♀️" : "🏃‍♂️"} ${this.type} ${day} ${month} `;
    }
}

//Подвид тренировки - бег
class Running extends Workoout {
    type = typeWorking.run;
    constructor(duration, distance, coord, temp) {
        super(duration, distance, coord);
        this.temp = temp;
        this.createRunning();
        this._distription();
        this.calcPace();
    }
    createRunning() {
        console.log("Тренировка бега создадась!");
    }
    calcPace() {
        this.pace = (this.duration / this.distance).toFixed(2);
        return this.pace;
    }
}

//Подпивд тренировки - Велосипед
class Cycling extends Workoout {
    type = typeWorking.cycling;
    constructor(duration, distance, coord, entrance) {
        super(duration, distance, coord);
        this.entrance = entrance;
        this.createCycling();
        this._distription();
        this.calcSpeed();
    }
    createCycling() {
        console.log("Тренировка велосипеда создадась!");
    }
    calcSpeed() {
        this.speed = (this.distance / (this.duration / 60)).toFixed(2);
        return this.speed;
    }
}

// основной класс приложения
class App {
    // держит в себе массив всех тренировок
    _workout = [];
    //содержит объект карты
    _map;
    //данные о конкретном месте куда  пользователь указал на карте
    _marker;

    //флаг для предотвращения нескольких кликов по карте
    _flagNewWorking = false;
    constructor() {
        this._chekNavigator();
        form.addEventListener("submit", this._formSubmit.bind(this));
        inputType.addEventListener("change", this._changeSelect.bind(this));
        containerWorkouts.addEventListener("click", this._workoutClick.bind(this));
        this._localStorageRead();
    }

    // клик  по эелементу Workout
    _workoutClick(element) {
        const elementCick = element.target;
        if (!elementCick.closest(".workout")) return;
        // получение данных от места клика (получаем id родителя)
        const id = element.target.closest(".workout").dataset.id;
        const work = this._workout.find((e) => e.id === id);

        if (elementCick.matches("button")) {
            // console.log("containerWorkouts");
            if (work) {
                this._delWorkout(work);
            }
        } else {
            this._map.setView(work.coord, 14, { animate: true, duration: 1 });
        }
    }

    // Проверка доступности навигатора
    _chekNavigator() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._addPositionMap.bind(this), this._errorMap);
        }
    }

    // функция вывода карты с нашей геолокацией
    _addPositionMap(position) {
        // console.log("запущена функция positionMap OK", position);
        const { latitude, longitude } = position.coords;
        const coord = [latitude, longitude];

        // вставили карту со стороннего API
        this._map = L.map("map").setView(coord, 14);
        //console.log("!!!!!!!!!!", this._map);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this._map);

        // вызов функциии _showform при клике на карту
        this._map.on("click", this._showForm.bind(this));

        // рендерим всех маркеров
        this.showMarkerforLocalSorage(this._workout);
    }

    //все маркреры из массива (из памяти локал сторадж) и выводим их на карту
    showMarkerforLocalSorage(works) {
        works.forEach((work) => {
            // console.log("рендер", work);
            const { lat, lng } = work.coord;
            this._marker = L.marker([lat, lng]);
            this.renderMarker(work);
        });
    }

    //Функция оторажающая эелементы формы при клике на карту
    _showForm(e) {
        if (this._flagNewWorking) return;
        const { lat, lng } = e.latlng;

        form.classList.remove("hidden");
        inputDistance.focus();
        this._marker = L.marker([lat, lng]);
        this._marker
            .addTo(this._map)
            .bindPopup(`New`, {
                className: "mark-popup",
                closeOnClick: false,
                autoClose: false,
            })
            .openPopup();
        this._flagNewWorking = true;
    }

    // Обработчик ошибки загрузки карты на сайт
    _errorMap() {
        console.log("Позиция не определена сработала ошибка");
    }

    // удаление тренировки

    _delWorkout(currWork) {
        // добавить объект в массив workout

        this._workout = this._workout.filter((elem) => elem.id != currWork.id);
        // this._renderWorkout(currWork);

        //Ренденр маркера тренировки на карте
        // this.renderMarker(currWork);

        //очистка форм ввода
        // hideForm();

        //Сохранение даных в Локальное храниелище
        this._localStorageSave(this._workout);
        // this._localStorageRead();
        location.reload();
        this._flagNewWorking = false;
    }

    // Функция отправки формы
    _formSubmit(e) {
        let currWork;
        e.preventDefault();

        //проверка валидность на числа
        function checkNumberInputs(...el) {
            const res = el.every((e) => Number.isInteger(e));

            return res;
        }
        //функция валидности на положительные числа
        function checkPositiveInputs(...el) {
            const res = el.every((e) => e > 0);
            //console.log("позитивные числа? ", res);
            return res;
        }
        const hideForm = function () {
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
            form.classList.add("hidden");
        };
        //Данные из форм
        const type = inputType.value;
        const duration = +inputDuration.value;
        const distance = +inputDistance.value;

        // console.log(typeWorking.run);
        // если пробежка создать объект пробежка
        if (type === typeWorking.run) {
            const temp = +inputCadence.value;

            if (
                !checkNumberInputs(duration, distance, temp) ||
                !checkPositiveInputs(duration, distance, temp)
            ) {
                alert("Вы ввели не числовые значения или Ваши числа равны 0");
                return;
            }

            currWork = new Running(duration, distance, this._marker._latlng, temp);
        }

        // если велопсипед создать объект велосипед
        if (type === typeWorking.cycling) {
            const elevaltion = +inputElevation.value;
            if (
                !checkNumberInputs(duration, distance, elevaltion) ||
                !checkPositiveInputs(duration, distance)
            ) {
                alert("Вы ввели не числовые значения или Ваши числа равны 0");
                return;
            }
            // prettier-ignore
            currWork = new Cycling(duration,distance,this._marker._latlng,elevaltion);
        }
        // добавить объект в массив workout

        this._workout.push(currWork);
        this._renderWorkout(currWork);

        //Ренденр маркера тренировки на карте
        this.renderMarker(currWork);

        //очистка форм ввода
        hideForm();

        //Сохранение даных в Локальное храниелище
        this._localStorageSave(this._workout);
        this._flagNewWorking = false;
    }
    _isValidNumber(...inputs) {
        crossOriginIsolated.log(inputs);
        inputs.some((e) => Number.isFinite(e));
    }

    // Функция переключающая тип ходьбы или велосипеда при нажатии и выбора меню в выпадающем списке
    _changeSelect(e) {
        e.preventDefault();

        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    }

    // renderMarkerToClickMap() {}

    // ставим маркер на  тренировки
    renderMarker(work) {
        this._marker
            .addTo(this._map)
            .bindPopup(`${work.disription}`, {
                className: "mark-popup",
                closeOnClick: false,
                autoClose: false,
            })
            .openPopup();
    }
    _renderWorkout(workout) {
        const type = workout.type[0].toLowerCase() + workout.type.slice(1);

        const icon = type.toLowerCase() === typeWorking.cycling.toLocaleLowerCase() ? "🚴‍♀️" : "🏃‍♂️";
        let html = `<li class="workout workout" data-id="${workout.id}">
    <h2 class="workout__title">${workout.disription} <button data-btn = 'del' >удалить</button></h2>    
         
    
    
    <div class="workout__details">
      <span class="workout__icon">${icon}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">км</span>
      
    </div>`;

        if (type.toLowerCase() === typeWorking.cycling.toLocaleLowerCase()) {
            html += `<div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">мин</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.speed}</span>
  <span class="workout__unit">км/час</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⛰</span>
  <span class="workout__value">${workout.entrance}</span>
  <span class="workout__unit">м</span>
</div>
</li>`;
        } else {
            html += `<div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">мин</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">мин/км</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.temp}</span>
      <span class="workout__unit">шаг</span>
    </div>
  </li>`;
        }

        form.insertAdjacentHTML("afterend", html);

        // const element = containerWorkouts?.querySelector(`[data-id='${workout.id}']`);
        console.log(containerWorkouts);
        // if (!element) return;
        // const buttonEl = element.target.querySelector("[data-btn='del']");

        // console.log(buttonEl);
        // if (!buttonEl) return;

        // buttonEl.addEventListener("click", () => {
        //     console.log("click");
        // });
    }

    //Блок работы с локальных хранилием
    _localStorageSave(workout) {
        localStorage.setItem("workout", JSON.stringify(workout));
    }

    _localStorageRead() {
        if (!localStorage.length) return;
        this._workout = JSON.parse(localStorage.getItem("workout"));

        this._workout.forEach((work) => {
            this._renderWorkout(work);
        });
    }
}

const app = new App();
