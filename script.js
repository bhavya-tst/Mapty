"use strict";


const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;
  #workouts=[];
  constructor() {

    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    inputType.addEventListener("change", this._toggleElevationField);
    form.addEventListener("submit", this._newWorkout.bind(this));
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }
  
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Unable to get your current position.");
        }
      );
    }
  }
  
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);
    // console.log(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    
    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach(work=>{
      this.renderWorkoutMarker(work);
    });
  }
  
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  
  _toggleElevationField() {
    inputElevation.parentElement.classList.toggle("form__row--hidden");
    inputCadence.parentElement.classList.toggle("form__row--hidden");
  }
  
  _newWorkout(e) {
    e.preventDefault();
    const vaildInputs = (...inputs) => {
      return inputs.every((inp) => Number.isFinite(inp));
    };
    const allPositive = (...inputs) => {
      return inputs.every((inp) => inp > 0);
    };
    const { lat, lng } = this.#mapEvent.latlng;
    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // Check data valid or not.
    // If workout cycling ,create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !vaildInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Input should be positive number.");
      }
      
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // If workout running ,create running object
    if (type === "running") {
      const candence = +inputCadence.value;
      if (
        !vaildInputs(distance, duration, candence) ||
        !allPositive(distance, duration, candence)
      ) {
        return alert("Input should be positive number.");
      }
      
      workout = new Running([lat, lng], distance, duration, candence);
      
    }
    
    
    // Add new object to workout
    this.#workouts.push(workout);
    
    // Render workout on map as marker
    this.renderWorkoutMarker(workout);
    
    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input field
    this._hideForm();
    
  }
  
  renderWorkoutMarker(workout){
    L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${workout.type}-popup`
    })).setPopupContent(`${workout.type==="running"?"🏃‍♂️‍➡️":"🚴‍♀️"} ${workout.description}`).openPopup();
  }
  
  _renderWorkout(workout){
    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">Running on April 14</h2>
    <div class="workout__details">
    <span class="workout__icon">${
      workout.type === "running" ? "🏃‍♂️" : "🚴‍♂️"
    }</span>
    <span class="workout__value">${workout.distance}</span>
    <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${workout.duration}</span>
    <span class="workout__unit">min</span>
    </div>
    ${
      workout.type === "running"
      ? `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
      <span class="workout__icon">🦶</span>
      <span class="workout__value">${workout.candence}</span>
      <span class="workout__unit">spm</span>
      </div>`
      : `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
      </div>`
    }`;

    form.insertAdjacentHTML("afterend", html);
    this._setLocalStorage();
  }

  _moveToPopup(e){
    const workoutEl = e.target.closest(".workout");
    if(!workoutEl) return;
    const workout = this.#workouts.find(work=>work.id===workoutEl.dataset.id);
    this.#map.setView(workout.coords,13,{
      animate:true,
      pan:{
        duration:1
      }
    });
  }

  _setLocalStorage(){
    localStorage.setItem("workouts",JSON.stringify(this.#workouts));
  }

  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem("workouts"));
    if(!data) return;
    this.#workouts=data;
    this.#workouts.forEach(work=>{
      this._renderWorkout(work);
    });
  }

 clear(){
   localStorage.removeItem("workouts");
   location.reload();
 }
}

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(distance, duration, coords) {
    //Km
    this.distance = distance;
    //min
    this.duration = duration;
    this.coords = coords;
  }
  _setDescriptions(){
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description= `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, candence) {
    super(distance, duration, coords);
    this.candence = candence;
    this._setDescriptions();
    this.calcPace();
  }
  
  calcPace() {
    // min/Km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescriptions();
  }

  calcSpeed() {
    // Km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const app = new App();

