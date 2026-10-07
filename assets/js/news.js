window.NEWS_CONFIG = window.NEWS_CONFIG || {
  apiKey: "pub_dec4d489467e4e04a6999a73222b4149",
  country: "in",
  language: "en",
  perCategory: 5,
  districts: [
    { q: "hyderabad", label: "Hyderabad District" },
    { q: "warangal", label: "Warangal District" },
    { q: "khammam", label: "Khammam District" },
    { q: "nizamabad", label: "Nizamabad District" }
  ]
};

(function () {
  var cfg = window.NEWS_CONFIG;
  var ENDPOINT = "https://newsdata.io/api/1/latest";

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function timeAgo(iso) {
    if (!iso) return "";
    var t = new Date(iso.replace(" ", "T"));
    if (isNaN(t.getTime())) return "";
    var mins = Math.round((Date.now() - t.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + " hr ago";
    var days = Math.round(hrs / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  function apiGet(qs, ttlSeconds) {
    ttlSeconds = ttlSeconds || 900;
    var key = "ftn_" + qs;
    var hit = null;
    try {
      hit = JSON.parse(sessionStorage.getItem(key) || "null");
    } catch (e) {
      hit = null;
    }
    if (hit && Date.now() - hit.t < ttlSeconds * 1000) {
      return Promise.resolve(hit.d);
    }
    return fetch(ENDPOINT + "?" + qs)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        try {
          sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d }));
        } catch (e) {}
        return d;
      });
  }

  function setStatus(col, msg) {
    var list = col.querySelector(".news-list");
    if (list) list.innerHTML = '<li class="news-status">' + esc(msg) + "</li>";
  }

  function render(col, items) {
    var list = col.querySelector(".news-list");
    if (!list) return;
    list.innerHTML = items
      .map(function (a) {
        return (
          "<li>" +
          '<a href="' + esc(a.link) + '" target="_blank" rel="noopener">' + esc(a.title) + "</a>" +
          "<time>" + esc(timeAgo(a.pubDate)) + (a.source_name ? " &middot; " + esc(a.source_name) : "") + "</time>" +
          "</li>"
        );
      })
      .join("");
  }

  function load(col) {
    if (!cfg.apiKey) {
      setStatus(col, "Headlines yahan live aayenge - API key set karte hi.");
      return;
    }
    var params = {};
    try {
      params = JSON.parse(col.getAttribute("data-params") || "{}");
    } catch (e) {
      params = {};
    }
    var qs = "apikey=" + encodeURIComponent(cfg.apiKey) +
      "&country=" + encodeURIComponent(cfg.country) +
      "&language=" + encodeURIComponent(cfg.language);
    Object.keys(params).forEach(function (k) {
      qs += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    });

    apiGet(qs)
      .then(function (d) {
        var items = (d.results || []).slice(0, cfg.perCategory);
        if (!items.length) throw new Error("empty");
        render(col, items);
      })
      .catch(function () {
        var stale = null;
        try { stale = JSON.parse(sessionStorage.getItem("ftn_" + qs) || "null"); } catch (e) { stale = null; }
        if (stale && stale.d && stale.d.results && stale.d.results.length) {
          render(col, stale.d.results.slice(0, cfg.perCategory));
        } else {
          setStatus(col, "Abhi headlines load nahi hue - thodi der baad page refresh karein.");
        }
      });
  }

  function loadTicker() {
    var box = document.querySelector(".ticker-content");
    if (!box || !cfg.apiKey) return;
    var qs = "apikey=" + encodeURIComponent(cfg.apiKey) +
      "&country=" + encodeURIComponent(cfg.country) +
      "&language=" + encodeURIComponent(cfg.language) +
      "&category=Top";
    apiGet(qs)
      .then(function (d) {
        var items = (d.results || []).slice(0, cfg.tickerCount || 10);
        if (!items.length) return;
        box.innerHTML = items
          .map(function (a) {
            return '<a href="' + esc(a.link) + '" target="_blank" rel="noopener"><span>' + esc(a.title) + "</span></a>";
          })
          .join("");
        box.style.animation = "none";
        void box.offsetWidth;
        box.style.animation = "";
      })
      .catch(function () {
        var stale = null;
        try { stale = JSON.parse(sessionStorage.getItem("ftn_" + qs) || "null"); } catch (e) { stale = null; }
        if (!stale || !stale.d || !stale.d.results || !stale.d.results.length) return;
        box.innerHTML = stale.d.results
          .slice(0, cfg.tickerCount || 10)
          .map(function (a) {
            return '<a href="' + esc(a.link) + '" target="_blank" rel="noopener"><span>' + esc(a.title) + "</span></a>";
          })
          .join("");
        box.style.animation = "none";
        void box.offsetWidth;
        box.style.animation = "";
      });
  }

  function loadCards() {
    var boxes = document.querySelectorAll("[data-news-cards]");
    if (!boxes.length || !cfg.apiKey) return;
    Array.prototype.forEach.call(boxes, function (box) {
      var params = {};
      try {
        params = JSON.parse(box.getAttribute("data-params") || "{}");
      } catch (e) {
        params = {};
      }
      var qs = "apikey=" + encodeURIComponent(cfg.apiKey) +
        "&country=" + encodeURIComponent(cfg.country) +
        "&language=" + encodeURIComponent(cfg.language);
      Object.keys(params).forEach(function (k) {
        qs += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      });

      apiGet(qs)
        .then(function (d) {
          var items = (d.results || []).slice(0, cfg.cardsCount || 8);
          if (!items.length) return;
          var grads = ["t1", "t2", "t3", "t4", "t5", "t6"];
          box.innerHTML = items
            .map(function (a, i) {
              var cat = (a.category && a.category[0]) || "News";
              var desc = String(a.description || a.title || "");
              if (desc.length > 110) desc = desc.slice(0, 110) + "...";
              return (
                '<article class="card">' +
                '<div class="thumb ' + grads[i % grads.length] + '">' + esc(cat) + "</div>" +
                '<div class="card-body">' +
                '<span class="card-cat">' + esc(a.source_name || cat) + "</span>" +
                '<h3><a href="' + esc(a.link) + '" target="_blank" rel="noopener">' + esc(a.title) + "</a></h3>" +
                "<p>" + esc(desc) + "</p>" +
                '<div class="story-meta"><time>' + esc(timeAgo(a.pubDate)) + "</time></div>" +
                "</div>" +
                "</article>"
              );
            })
            .join("");
        })
        .catch(function () {});
    });
  }

  function loadDistricts() {
    if (!cfg.apiKey) return;
    var dists = cfg.districts || [];
    if (!dists.length) return;
    if (!document.querySelector("[data-district]")) return;

    var queries = dists.map(function (d, idx) {
      return { key: d.q || d, idx: idx };
    });

    Promise.all(
      queries.map(function (q) {
        return apiGet(
          "apikey=" + encodeURIComponent(cfg.apiKey) +
            "&country=" + encodeURIComponent(cfg.country) +
            "&language=" + encodeURIComponent(cfg.language) +
            "&q=" + encodeURIComponent(q.key)
        )
          .then(function (res) {
            return { idx: q.idx, a: (res.results || [])[0] || null, done: true };
          })
          .catch(function () { return { idx: q.idx, a: null, done: false }; });
      })
    ).then(function (found) {
      found.forEach(function (f) {
        if (!f) return;
        var item = document.querySelector('[data-district="' + dists[f.idx].q + '"]');
        if (!item) return;
        var h3 = item.querySelector("h3 a");
        if (!f.a && f.done && h3) {
          h3.textContent = "Is district ki live headline abhi nahi mili - Search me try karein";
          return;
        }
        if (!f.a) return;
        var cat = item.querySelector(".card-cat");
        var p = item.querySelector("p");
        var meta = item.querySelector(".story-meta");
        var src = meta ? meta.querySelector(".cat") : null;
        var t = meta ? meta.querySelector("time") : null;
        if (cat) cat.textContent = (f.a.category && f.a.category[0]) || dists[f.idx].label || "District News";
        if (h3) {
          h3.href = f.a.link;
          h3.target = "_blank";
          h3.rel = "noopener";
          h3.textContent = f.a.title;
        }
        if (p) {
          var d = String(f.a.description || f.a.title || "");
          if (d.length > 110) d = d.slice(0, 110) + "...";
          p.textContent = d;
        }
        if (src) src.textContent = f.a.source_name || "Report";
        if (t) t.textContent = timeAgo(f.a.pubDate);
      });
    });
  }

  function loadSingles() {
    if (!cfg.apiKey) return;
    var els = document.querySelectorAll("[data-news-single]");
    if (!els.length) return;
    Array.prototype.forEach.call(els, function (el) {
      var q = el.getAttribute("data-single-q");
      if (!q) return;
      apiGet(
        "apikey=" + encodeURIComponent(cfg.apiKey) +
          "&country=" + encodeURIComponent(cfg.country) +
          "&language=" + encodeURIComponent(cfg.language) +
          "&q=" + encodeURIComponent(q)
      )
        .then(function (d) {
          var items = d.results || [];
          if (!items.length) return;
          var tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter(function (t) { return t.length > 3; });
          function matches(a) {
            if (!tokens.length) return true;
            var hay = (String(a.title || "") + " " + String(a.description || "")).toLowerCase();
            return tokens.every(function (t) { return hay.indexOf(t) !== -1; });
          }
          var a = items.filter(matches)[0] || items[0];
          var h3 = el.querySelector("h3 a");
          var p = el.querySelector("p");
          var time = el.querySelector("time");
          if (h3) {
            h3.href = a.link;
            h3.target = "_blank";
            h3.rel = "noopener";
            h3.textContent = a.title;
          }
          if (p) {
            var tx = String(a.description || a.title || "");
            if (tx.length > 110) tx = tx.slice(0, 110) + "...";
            p.textContent = tx;
          }
          if (time) time.textContent = timeAgo(a.pubDate);
        })
        .catch(function () {});
    });
  }

  var cols = document.querySelectorAll("[data-news]");
  Array.prototype.forEach.call(cols, load);
  loadTicker();
  loadCards();
  loadDistricts();
  loadSingles();
})();
