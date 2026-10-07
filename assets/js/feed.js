(function () {
  window.FT_FEED = window.FT_FEED || {
    youtube: [
      "eZEL4ibUL3o",
      "R2W-N3Cp0Js",
      "CTXEzehbz1A",
      "FOpG54Y29zQ"
    ],
    instagram: [
      "https://www.instagram.com/reel/DeGtzTVzra5/",
      "https://www.instagram.com/reel/DeLapMHszuT/",
      "https://www.instagram.com/reel/DeLZQ-AMgzt/"
    ]
  };

  var YT_WATCH = "https://www.youtube.com/watch?v=";
  var GRADIENTS = ["g2", "g3", "g5", "g4", "g6", ""];

  function ytCard(id) {
    return (
      '<article class="vcard">' +
      '<a class="vmedia ' + GRADIENTS[0] + '" data-yt="' + id + '" href="' + YT_WATCH + id + '">' +
      '<span class="vbadge yt">YouTube</span>' +
      '<span class="vplay">&#9658;</span>' +
      "</a>" +
      '<div class="vbody">' +
      '<h3><a class="yt-title" href="' + YT_WATCH + id + '" target="_blank" rel="noopener">YouTube video</a></h3>' +
      '<div class="story-meta"><span>YouTube</span></div>' +
      "</div>" +
      "</article>"
    );
  }

  function igCard(url) {
    return (
      '<article class="vcard">' +
      '<div class="vmedia ig-media embed" data-ig="' + url + '">' +
      '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '" data-instgrm-version="14"></blockquote>' +
      "</div>" +
      '<div class="vbody">' +
      '<span class="card-cat" style="color:#d6249f;">Instagram Reel</span>' +
      '<h3><a href="' + url + '" target="_blank" rel="noopener">Watch on Instagram</a></h3>' +
      '<div class="story-meta"><span>Fatafat Telangana News</span></div>' +
      "</div>" +
      "</article>"
    );
  }

  function fetchTitle(id, anchor) {
    var url = YT_WATCH + id;
    fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.title) anchor.textContent = d.title;
      })
      .catch(function () {});
  }

  function processInstagram() {
    var tries = 0;
    var tick = function () {
      if (window.instgrm && window.instgrm.Embed) {
        window.instgrm.Embed.process();
      } else if (tries++ < 25) {
        setTimeout(tick, 400);
      }
    };
    tick();
  }

  function render() {
    var boxes = document.querySelectorAll("[data-feed]");
    Array.prototype.forEach.call(boxes, function (box) {
      var kind = box.getAttribute("data-feed");
      var limit = parseInt(box.getAttribute("data-limit"), 10) || 6;
      var list = (window.FT_FEED[kind] || []).slice(0, limit);
      if (!list.length) return;
      var html = "";
      if (kind === "youtube") {
        html = list.map(ytCard).join("");
      } else if (kind === "instagram") {
        html = list.map(igCard).join("");
      } else {
        return;
      }
      box.innerHTML = html;
      if (kind === "youtube") {
        var cards = box.querySelectorAll("[data-yt]");
        Array.prototype.forEach.call(cards, function (el) {
          var id = el.getAttribute("data-yt");
          el.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')";
          var title = el.parentNode.querySelector(".yt-title");
          if (title) fetchTitle(id, title);
        });
      } else {
        processInstagram();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
