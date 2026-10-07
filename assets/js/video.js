(function () {
  function thumbUrl(id) {
    return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
  }
  function embedUrl(id) {
    return "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
  }

  var media = document.querySelectorAll("[data-yt]");
  Array.prototype.forEach.call(media, function (el) {
    var id = el.getAttribute("data-yt");
    if (!id) return;
    el.style.backgroundImage = "url('" + thumbUrl(id) + "')";
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var f = document.createElement("iframe");
      f.className = "vframe";
      f.src = embedUrl(id);
      f.title = "YouTube video player";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      el.appendChild(f);
    });
  });

  var igs = document.querySelectorAll("[data-ig]");
  Array.prototype.forEach.call(igs, function (el) {
    var u = el.getAttribute("data-ig");
    if (!u) {
      if (el.getAttribute("data-href") && el.tagName === "A") {
        el.href = el.getAttribute("data-href");
      }
      return;
    }
    if (el.tagName === "A") {
      el.href = u;
      el.target = "_blank";
      el.rel = "noopener";
      return;
    }
    var tries = 0;
    var tick = function () {
      if (window.instgrm && window.instgrm.Embed) {
        window.instgrm.Embed.process();
      } else if (tries++ < 25) {
        setTimeout(tick, 400);
      }
    };
    tick();
  });

  var watch = document.querySelectorAll(".watch-btn");
  Array.prototype.forEach.call(watch, function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      if (!id) {
        window.location.href = btn.getAttribute("data-href") || "videos.html";
        return;
      }
      var lead = btn.closest(".lead-story");
      if (!lead) return;
      var f = document.createElement("iframe");
      f.className = "hero-frame";
      f.src = embedUrl(id);
      f.title = "YouTube video player";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      lead.appendChild(f);
    });
  });

  var chan = document.querySelectorAll("[data-uploads]");
  Array.prototype.forEach.call(chan, function (box) {
    var chUrl = box.getAttribute("data-channel");
    var list = (window.FT_FEED && window.FT_FEED.youtube) || [];
    var vid = (box.getAttribute("data-video") || list[0]) || "";
    if (!vid) {
      var link = box.querySelector("[data-channel-link]");
      if (link && chUrl) {
        link.href = chUrl;
        link.target = "_blank";
        link.rel = "noopener";
      }
      return;
    }
    var f = document.createElement("iframe");
    f.className = "vframe-lg";
    f.src =
      "https://www.youtube-nocookie.com/embed/" +
      vid +
      "?rel=0&modestbranding=1&color=white";
    f.title = "Latest video report";
    f.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.allowFullscreen = true;
    box.innerHTML = "";
    box.appendChild(f);
  });

  var players = document.querySelectorAll(".video-player");
  Array.prototype.forEach.call(players, function (box) {
    var v = box.querySelector("video");
    var b = box.querySelector(".vp-play");
    if (!v || !b) return;
    b.addEventListener("click", function () {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener("play", function () {
      b.classList.add("is-hidden");
    });
    v.addEventListener("ended", function () {
      b.classList.remove("is-hidden");
    });
    v.addEventListener("error", function () {
      b.classList.add("is-hidden");
      var tag = box.querySelector(".vp-tag");
      if (tag) tag.textContent = "Unavailable";
    });
  });
})();
