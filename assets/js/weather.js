window.WEATHER_CONFIG = window.WEATHER_CONFIG || {
  lat: 17.385,
  lon: 78.4867,
  city: "Hyderabad"
};

(function () {
  var box = document.querySelector("[data-weather]");
  if (!box) return;
  var cfg = window.WEATHER_CONFIG;

  var WMO = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow",
    80: "Light showers", 81: "Showers", 82: "Heavy showers",
    95: "Thunderstorm", 96: "Thunderstorm", 99: "Severe storm"
  };

  function cond(code) {
    return WMO[code] || "Unknown";
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function loading() {
    return (
      '<div class="side-head accent">' + (cfg.city || "") + ' Weather <span class="m-live">LIVE</span></div>' +
      '<div class="w-main"><span class="w-temp">--&deg;C</span><span class="w-cond">Loading...</span></div>' +
      '<div class="w-meta">' +
      '<span class="w-chip">Feels --</span>' +
      '<span class="w-chip">Humidity --</span>' +
      '<span class="w-chip">Wind --</span>' +
      "</div>"
    );
  }

  function render(d) {
    var c = d.current || {};
    var days = d.daily || {};
    var short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var rows = "";
    if (days.time) {
      rows = days.time
        .map(function (t, i) {
          var dt = new Date(t + "T00:00:00");
          var dn = short[dt.getDay()] || "--";
          var hi = Math.round(days.temperature_2m_max[i]);
          var lo = Math.round(days.temperature_2m_min[i]);
          return (
            '<div class="w-day">' +
            '<span class="w-dn">' + dn + "</span>" +
            '<span class="w-dc">' + esc(cond(days.weather_code[i])) + "</span>" +
            '<span class="w-dt"><b>' + hi + "&deg;</b> / " + lo + "&deg;</span>" +
            "</div>"
          );
        })
        .join("");
    }
    box.innerHTML =
      '<div class="side-head accent">' + (cfg.city || "") + ' Weather <span class="m-live">LIVE</span></div>' +
      '<div class="w-main">' +
      '<span class="w-temp">' + Math.round(c.temperature_2m) + '&deg;</span>' +
      '<span class="w-sub"><b>' + esc(cond(c.weather_code)) + "</b><span>as of " + (c.is_day === 1 ? "day" : "night") + "</span></span>" +
      "</div>" +
      '<div class="w-meta">' +
      '<span class="w-chip">Feels ' + Math.round(c.apparent_temperature) + "&deg;</span>" +
      '<span class="w-chip">Humidity ' + Math.round(c.relative_humidity_2m) + "%</span>" +
      '<span class="w-chip">Wind ' + Math.round(c.wind_speed_10m) + " km/h</span>" +
      "</div>" +
      '<div class="w-days">' + rows + "</div>" +
      '<div class="w-src">Source: Open-Meteo</div>';

    var card = document.querySelector("[data-weather-card]");
    if (card) {
      var a = card.querySelector("h3 a");
      var p = card.querySelector("p");
      var t = card.querySelector("time");
      if (a) {
        a.textContent =
          Math.round(c.temperature_2m) + "\u00B0C \u00B7 " + cond(c.weather_code) + " in " + (cfg.city || "Hyderabad");
      }
      if (p) {
        p.textContent =
          "Feels like " + Math.round(c.apparent_temperature) +
          "\u00B0C \u00B7 Humidity " + Math.round(c.relative_humidity_2m) +
          "% \u00B7 Wind " + Math.round(c.wind_speed_10m) + " km/h";
      }
      if (t) {
        var now = new Date();
        t.setAttribute("datetime", now.toISOString());
        t.textContent = "Updated " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      }
    }
  }

  var url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(cfg.lat) +
    "&longitude=" +
    encodeURIComponent(cfg.lon) +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=Asia%2FKolkata&forecast_days=5";

  box.innerHTML = loading();
  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.current && d.current.temperature_2m !== undefined) render(d);
    })
    .catch(function () {});
})();