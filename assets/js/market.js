window.MARKET_CONFIG = window.MARKET_CONFIG || {
  apiKey: "c1805d48837d44678821029ed8a53bf5",
  ttl: 600000,
  symbols: [
    { s: "USD/INR", label: "USD / INR" },
    { s: "EUR/INR", label: "EUR / INR" },
    { s: "GBP/INR", label: "GBP / INR" },
    { s: "XAU/USD", label: "Gold" },
    { s: "BTC/USD", label: "Bitcoin" }
  ]
};

(function () {
  var cfg = window.MARKET_CONFIG;
  var list = document.querySelector("[data-market]");
  if (!list || !cfg.apiKey) return;

  var CACHE_KEY = "ft_market_v1";

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function fmtPrice(v) {
    var n = Number(v);
    if (!isFinite(n)) return "--";
    if (n >= 1000) return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    return n.toFixed(2);
  }

  function fmtChange(p) {
    var n = Number(p);
    if (!isFinite(n)) return "--";
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  }

  function render(rows) {
    list.innerHTML = rows
      .map(function (r) {
        var q = r.q;
        var ok = q && q.status !== "error" && (q.close || q.last || q.percent_change !== undefined);
        var up = ok && Number(q.percent_change) >= 0;
        return (
          '<li>' +
          '<span class="m-name">' + esc(r.label) + "</span>" +
          '<span class="m-block">' +
          '<span class="m-val">' + (ok ? fmtPrice(q.close || q.last) : "--") + "</span>" +
          '<span class="m-chg ' + (ok ? (up ? "up" : "down") : "") + '">' +
          (ok ? fmtChange(q.percent_change) : "--") +
          "</span>" +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  try {
    var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && cached.data && Date.now() - cached.ts < cfg.ttl) render(cached.data);
  } catch (e) {}

  Promise.all(
    cfg.symbols.map(function (s) {
      return fetch(
        "https://api.twelvedata.com/quote?symbol=" +
          encodeURIComponent(s.s) +
          "&apikey=" +
          encodeURIComponent(cfg.apiKey)
      )
        .then(function (r) { return r.json(); })
        .then(function (q) { return { label: s.label, q: q }; })
        .catch(function () { return { label: s.label, q: null }; });
    })
  ).then(function (rows) {
    var okCount = rows.filter(function (r) {
      return r.q && r.q.status !== "error";
    }).length;
    if (!okCount) return;
    render(rows);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: rows }));
    } catch (e) {}
  });
})();
