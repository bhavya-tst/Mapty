"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  constructor() {
    this._getPosition();
    inputType.addEventListener("change", this._toggleElevationField);
    form.addEventListener("submit", this._newWorkout.bind(this)) ;
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
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
      form.classList.remove("hidden");
      inputDistance.focus();
    };
  

  _toggleElevationField() {
    inputElevation.parentElement.classList.toggle("form__row--hidden");
    inputCadence.parentElement.classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = inputDistance.value;
    const candence = inputCadence.value;
    const duration = inputDuration.value;
    const elevation = inputElevation.value;
    if (distance <= 0) {
      alert("Distance should be positive.");
    } else if (duration <= 0) {
      alert("Duration should be positive.");
    } else if (type === "running" && candence <= 0) {
      alert("Candence should be positive.");
    } else if (type === "cycling" && elevation <= 0) {
      alert("Elevation should be positive.");
    } else {
      L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "running-popup",
          })
        )
        .setPopupContent("Workout")
        .openPopup();
    }
  }
}

class Workouts{

  constructor(distance,duration,coords){
      this.distance=distance;
      this.duration=duration;
      this.coords=coords;
  }
}
const app = new App();

