(function () {
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

  var cfg = window.NEWS_CONFIG || {};
  var box = document.querySelector("[data-search-results]");
  var term = document.querySelector("[data-search-term]");
  var q = new URLSearchParams(window.location.search).get("q") || "";

  if (!box) return;

  var input = document.getElementById("q");
  if (input && q) input.value = q;
  if (term) term.textContent = q ? '"' + q + '"' : "kuch type karke search karein";

  if (!q) {
    box.innerHTML =
      '<p class="news-status">Koi search term nahi. Upar search box me district, city ya topic likhiye &mdash; jaise &ldquo;Hyderabad&rdquo;, &ldquo;metro&rdquo;, &ldquo;jobs&rdquo;.</p>';
    return;
  }

  if (!cfg.apiKey) {
    box.innerHTML = '<p class="news-status">Search abhi available nahi &mdash; API key missing.</p>';
    return;
  }

  var qs =
    "apikey=" + encodeURIComponent(cfg.apiKey) +
    "&country=" + encodeURIComponent(cfg.country || "in") +
    "&language=" + encodeURIComponent(cfg.language || "en") +
    "&q=" + encodeURIComponent(q);

  var grads = ["t1", "t2", "t3", "t4", "t5", "t6"];

  var cacheKey = "ftn_" + qs;
  var cached = null;
  try {
    cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
  } catch (e) {
    cached = null;
  }

  function show(d) {
    var items = d.results || [];
    if (!items.length) {
      box.innerHTML =
        '<p class="news-status">"' +
        esc(q) +
        '" ke liye koi result nahi mila. Koi aur term try karein.</p>';
      return;
    }
    box.innerHTML = items
      .map(function (a, i) {
        var cat = (a.category && a.category[0]) || "News";
        var desc = String(a.description || a.title || "");
        if (desc.length > 130) desc = desc.slice(0, 130) + "...";
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
  }

  if (cached && Date.now() - cached.t < 300000) {
    show(cached.d);
  } else {
    fetch("https://newsdata.io/api/1/latest?" + qs)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), d: d }));
        } catch (e) {}
        show(d);
      })
      .catch(function () {
        box.innerHTML =
          '<p class="news-status">Search load nahi hua &mdash; internet check karke dobara try karein.</p>';
      });
  }
})();