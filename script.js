const apiKey = "fb776950c5428c8ff3fb8f6db80cecd7";
let chart;
let map;
let lightningInterval;

// enter key
function handleKey(e) {
  if (e.key === "Enter") getWeather();
}

// auto location
window.onload = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    loadWeather(pos.coords.latitude, pos.coords.longitude);
  });
};

// search
async function getWeather() {
  const city = document.getElementById("city").value;

  const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  const geoData = await geo.json();

  if (geoData.length === 0) {
    alert("City not found");
    return;
  }

  loadWeather(geoData[0].lat, geoData[0].lon);
}

// location
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    loadWeather(pos.coords.latitude, pos.coords.longitude);
  });
}

// load data
async function loadWeather(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await res.json();

  const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const forecastData = await forecastRes.json();

  showWeather(data);
  showForecast(forecastData);
  showChart(forecastData);
  showMap(lat, lon);
  setAnimation(data);
}

// weather UI
function showWeather(data) {
  document.getElementById("result").innerHTML = `
    <h2>${data.name}</h2>
    <div class="temp">${Math.round(data.main.temp)}°C</div>
    <p>${data.weather[0].main}</p>
  `;
}

// forecast
function showForecast(data) {
  const daily = data.list.filter(i => i.dt_txt.includes("12:00:00"));

  document.getElementById("forecast").innerHTML =
    daily.map(day => `
      <div class="card">
        <p>${new Date(day.dt_txt).toDateString().slice(0,10)}</p>
        <p>${Math.round(day.main.temp)}°C</p>
      </div>
    `).join("");
}

// chart
function showChart(data) {
  const temps = data.list.slice(0, 8).map(i => i.main.temp);
  const labels = data.list.slice(0, 8).map(i => i.dt_txt.split(" ")[1]);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temp °C",
        data: temps,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });
}

// map
function showMap(lat, lon) {
  if (map) map.remove();

  map = L.map('map').setView([lat, lon], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

  L.marker([lat, lon]).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

// 🌧 + ⚡ animation
function setAnimation(data) {
  const container = document.getElementById("animation");
  const lightning = document.getElementById("lightning");

  container.innerHTML = "";

  if (lightningInterval) clearInterval(lightningInterval);

  const weather = data.weather[0].main;

  if (
    weather === "Rain" ||
    weather === "Drizzle" ||
    weather === "Thunderstorm"
  ) {
    // rain
    for (let i = 0; i < 25; i++) {
      const drop = document.createElement("div");
      drop.className = "rain";
      drop.style.left = Math.random() * 100 + "vw";
      drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + "s";
      container.appendChild(drop);
    }

    // lightning only for thunderstorm
    if (weather === "Thunderstorm") {
      lightningInterval = setInterval(() => {
        lightning.classList.add("flash");

        setTimeout(() => {
          lightning.classList.remove("flash");
        }, 300);

      }, Math.random() * 4000 + 2000);
    }
  }
}