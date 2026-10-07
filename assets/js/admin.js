(function () {
  var cfg = window.ADMIN_CONFIG || { password: "fatafat@2026", siteName: "Fatafat Telangana News" };

  var state = {
    loggedIn: false,
    news: [],
    youtube: [],
    instagram: [],
    reporters: []
  };

  var modalMode = "news";

  var loginBox = document.getElementById("loginBox");
  var app = document.getElementById("app");
  var loginBtn = document.getElementById("loginBtn");
  var passInput = document.getElementById("passInput");
  var loginErr = document.getElementById("loginErr");

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var toastTimer = null;
  function showToast(msg, isErr) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.background = isErr ? "#b91c1c" : "#16a34a";
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2400);
  }

  function loadSaved() {
    try {
      var s = JSON.parse(localStorage.getItem("ft_admin_v2") || "null");
      if (s) state = Object.assign(state, s);
    } catch (e) {}
    if (!state.youtube.length && window.FT_FEED && window.FT_FEED.youtube) {
      state.youtube = window.FT_FEED.youtube.slice();
    }
    if (!state.instagram.length && window.FT_FEED && window.FT_FEED.instagram) {
      state.instagram = window.FT_FEED.instagram.slice();
    }
    if (!state.reporters.length && window.FT_REPORTERS && window.FT_REPORTERS.people) {
      state.reporters = window.FT_REPORTERS.people.slice();
    }
  }

  function save() {
    try {
      localStorage.setItem(
        "ft_admin_v2",
        JSON.stringify({
          news: state.news,
          youtube: state.youtube,
          instagram: state.instagram,
          reporters: state.reporters,
          loggedIn: state.loggedIn
        })
      );
    } catch (e) {
      showToast("Save nahi hua! Browser storage block hai.", true);
    }
  }

  function enter() {
    state.loggedIn = true;
    loginBox.style.display = "none";
    app.style.display = "block";
    renderAll();
    save();
  }

  loginBtn.addEventListener("click", function () {
    if (passInput.value === cfg.password) {
      loginErr.style.display = "none";
      enter();
    } else {
      loginErr.style.display = "block";
    }
  });
  passInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") loginBtn.click();
  });

  loadSaved();
  if (state.loggedIn) enter();

  var tabs = document.querySelectorAll(".adm-nav button");
  function switchTab(name) {
    document.querySelectorAll(".adm-nav button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.tab === name);
      var sec = document.getElementById("tab-" + b.dataset.tab);
      if (sec) sec.style.display = b.dataset.tab === name ? "block" : "none";
    });
  }
  tabs.forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.dataset.tab); });
  });

  var currentVtab = "yt";
  document.querySelectorAll(".adm-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".adm-tabs button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      currentVtab = b.dataset.vtab;
      renderVideos();
    });
  });

  function row(title, meta, badge, actions) {
    return (
      '<div class="adm-row">' +
      "<div><b>" + esc(title) + "</b><br><small>" + esc(meta) + "</small></div>" +
      badge +
      '<div class="adm-row-actions">' + actions + "</div>" +
      "</div>"
    );
  }

  // ============ NEWS ============
  function renderNews() {
    var list = document.getElementById("newsList");
    if (!state.news.length) {
      list.innerHTML = '<div class="adm-empty">Abhi koi breaking story nahi. "+ Add Story" se pehli story add karein.</div>';
      return;
    }
    list.innerHTML = state.news
      .map(function (n, i) {
        return row(
          n.title,
          (n.category || "News") + " &middot; " + (n.link || "no link"),
          '<span class="' + (n.live ? "adm-badge-on" : "adm-badge-off") + '">' + (n.live ? "&#9679; LIVE" : "Standby") + "</span>",
          '<button class="adm-btn small ghost" data-edit="' + i + '">Edit</button>' +
          '<button class="adm-btn small ghost" data-del="' + i + '">Del</button>'
        );
      })
      .join("");
  }

  // ============ VIDEOS ============
  function renderVideos() {
    var list = document.getElementById("videoList");
    var items = currentVtab === "yt" ? state.youtube : state.instagram;
    if (!items.length) {
      list.innerHTML =
        '<div class="adm-empty">' +
        (currentVtab === "yt" ? 'Khali hai. "+ Add" se YouTube video ID daalein.' : 'Khali hai. "+ Add" se Instagram reel URL daalein.') +
        "</div>";
      return;
    }
    list.innerHTML = items
      .map(function (v, i) {
        return row(v, "position " + (i + 1), "", '<button class="adm-btn small ghost" data-vdel="' + i + '">Del</button>');
      })
      .join("");
  }

  // ============ REPORTERS ============
  var locations = (window.FT_REPORTERS && window.FT_REPORTERS.locations) || { Telangana: ["Hyderabad"] };

  function stateSelect() {
    var sel = document.getElementById("fRstate");
    sel.innerHTML = '<option value="">Select State</option>';
    Object.keys(locations).forEach(function (s) {
      var o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      sel.appendChild(o);
    });
  }

  function fillDistricts(state) {
    var sel = document.getElementById("fRdistrict");
    sel.innerHTML = '<option value="">Select District</option>';
    (locations[state] || []).forEach(function (d) {
      var o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      sel.appendChild(o);
    });
  }

  function nextReporterId() {
    var max = 0;
    state.reporters.forEach(function (r) {
      var m = String(r.id || "").match(/FT-R-(\d+)/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return "FT-R-" + String(max + 1).padStart(3, "0");
  }

  function renderReporters() {
    var list = document.getElementById("reporterList");
    if (!state.reporters.length) {
      list.innerHTML = '<div class="adm-empty">Koi reporter nahi. "+ Add Reporter" se pehla reporter add karein.</div>';
      return;
    }
    list.innerHTML = state.reporters
      .map(function (r, i) {
        var badge = '<span class="' + (r.active ? "adm-badge-on" : "adm-badge-off") + '">' + (r.active ? "&#9679; ACTIVE" : "Inactive") + "</span>";
        return row(
          r.name,
          (r.id || "-") + " &middot; " + (r.mobile || "-") + " &middot; " + (r.designation || "-") + " &middot; " + r.state + " / " + r.district,
          badge,
          '<button class="adm-btn small" data-idcard="' + i + '">ID Card</button>' +
          '<button class="adm-btn small ghost" data-redit="' + i + '">Edit</button>' +
          '<button class="adm-btn small ghost" data-rdel="' + i + '">Remove</button>'
        );
      })
      .join("");
  }

  // ============ MODAL ============
  var modal = document.getElementById("modal");
  var form = document.getElementById("modalForm");

  function openNewsModal(idx) {
    modalMode = "news";
    document.getElementById("modalTitle").textContent = idx === -1 ? "Add Breaking Story" : "Edit Story";
    document.getElementById("newsFields").style.display = "block";
    document.getElementById("reporterFields").style.display = "none";
    var n = idx === -1 ? {} : state.news[idx];
    document.getElementById("fIndex").value = idx;
    document.getElementById("fTitle").value = n.title || "";
    document.getElementById("fLink").value = n.link || "";
    document.getElementById("fCat").value = n.category || "";
    document.getElementById("fLive").checked = !!n.live;
    modal.classList.add("open");
  }

  function openReporterModal(idx) {
    modalMode = "reporter";
    document.getElementById("modalTitle").textContent = idx === -1 ? "Add Reporter" : "Edit Reporter";
    document.getElementById("newsFields").style.display = "none";
    document.getElementById("reporterFields").style.display = "block";
    var r = idx === -1 ? {} : state.reporters[idx];
    stateSelect();
    document.getElementById("fIndex").value = idx;
    document.getElementById("fRid").value = r.id || (idx === -1 ? nextReporterId() : "");
    document.getElementById("fRname").value = r.name || "";
    document.getElementById("fRmobile").value = r.mobile || "";
    document.getElementById("fRdesig").value = r.designation || "";
    document.getElementById("fRactive").checked = r.active !== false;
    fillDistricts(r.state || "");
    document.getElementById("fRstate").value = r.state || "";
    document.getElementById("fRdistrict").value = r.district || "";
    modal.classList.add("open");
  }

  document.getElementById("fRstate").addEventListener("change", function () {
    fillDistricts(this.value);
  });

  document.getElementById("addNewsBtn").addEventListener("click", function () { openNewsModal(-1); });
  document.getElementById("addReporterBtn").addEventListener("click", function () { openReporterModal(-1); });
  document.getElementById("modalCancel").addEventListener("click", function () { modal.classList.remove("open"); });
  document.getElementById("modalX").addEventListener("click", function () { modal.classList.remove("open"); });
  modal.addEventListener("click", function (e) { if (e.target === this) modal.classList.remove("open"); });

  function submitModal() {
    try {
      var idx = parseInt(document.getElementById("fIndex").value, 10);
      if (modalMode === "reporter") {
      var stateVal = document.getElementById("fRstate").value;
      var distVal = document.getElementById("fRdistrict").value;
      if (!stateVal) { showToast("State select karna zaroori hai.", true); document.getElementById("fRstate").focus(); return; }
      if (!distVal) { showToast("District select karna zaroori hai.", true); document.getElementById("fRdistrict").focus(); return; }
      var r = {
        id: (document.getElementById("fRid").value || nextReporterId()).trim(),
        name: document.getElementById("fRname").value.trim(),
        mobile: document.getElementById("fRmobile").value.trim(),
        designation: document.getElementById("fRdesig").value.trim(),
        state: stateVal,
        district: distVal,
        active: document.getElementById("fRactive").checked
      };
      if (!r.name) { showToast("Full Name bharo.", true); document.getElementById("fRname").focus(); return; }
      if (idx === -1) state.reporters.push(r);
      else state.reporters[idx] = r;
      modal.classList.remove("open");
      renderReporters();
      save();
      showToast("Reporter saved: " + r.id + " (" + r.name + ")");
    } else {
      var obj = {
        title: document.getElementById("fTitle").value.trim(),
        link: document.getElementById("fLink").value.trim(),
        category: document.getElementById("fCat").value.trim(),
        live: document.getElementById("fLive").checked
      };
      if (!obj.title) { showToast("Headline bharo.", true); document.getElementById("fTitle").focus(); return; }
      if (idx === -1) state.news.unshift(obj);
      else state.news[idx] = obj;
      modal.classList.remove("open");
      renderNews();
      save();
      showToast("Story saved");
      }
    } catch (err) {
      showToast("SAVE ERROR: " + (err && err.message ? err.message : err), true);
      console.error(err);
    }
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); submitModal(); });
  document.getElementById("modalSaveBtn").addEventListener("click", submitModal);

  document.getElementById("newsList").addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.edit !== undefined) openNewsModal(parseInt(t.dataset.edit, 10));
    if (t.dataset.del !== undefined) {
      state.news.splice(parseInt(t.dataset.del, 10), 1);
      renderNews();
      save();
    }
  });

  document.getElementById("videoList").addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.vdel !== undefined) {
      var arr = currentVtab === "yt" ? state.youtube : state.instagram;
      arr.splice(parseInt(t.dataset.vdel, 10), 1);
      renderVideos();
      save();
      showToast("Entry delete ho gayi");
    }
  });

  document.getElementById("reporterList").addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.idcard !== undefined) openIdCard(parseInt(t.dataset.idcard, 10));
    if (t.dataset.redit !== undefined) openReporterModal(parseInt(t.dataset.redit, 10));
    if (t.dataset.rdel !== undefined) {
      var r = state.reporters[parseInt(t.dataset.rdel, 10)];
      if (r && confirm('"' + r.name + '" ko remove karein?')) {
        state.reporters.splice(parseInt(t.dataset.rdel, 10), 1);
        renderReporters();
        save();
        showToast("Reporter hata diya");
      }
    }
  });

  document.getElementById("addVideoBtn").addEventListener("click", function () {
    var val = prompt(currentVtab === "yt" ? "YouTube video ID daalein (11 chars)" : "Instagram reel URL daalein");
    if (!val || !val.trim()) return;
    val = val.trim();
    if (currentVtab === "yt") {
      var m = val.match(/[?&]v=([\w-]{11})/);
      if (m) val = m[1];
      if (!/^[\w-]{11}$/.test(val)) { alert("Ya YouTube ID galat hai, ya URL se ID nikali nahi."); return; }
      state.youtube.push(val);
    } else {
      state.instagram.push(val);
    }
    renderVideos();
    save();
  });

  // ============ REPORT ID CARD ============
  var idModal = document.getElementById("idModal");
  var idHolder = document.getElementById("idCardHolder");
  var idPhotoInput = document.getElementById("idPhoto");
  var idValidityInput = document.getElementById("idValidity");
  var idReporter = null;

  function cardInitials(name) {
    return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  function fmtDate(iso) {
    if (!iso) return "â€”";
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return p[2] + " " + months[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  // PVC CR80 portrait: 54mm x 85.6mm at 300 DPI = 638 x 1013 px
  var CARD_W = 638;
  var CARD_H = 1013;
  var SITE_URL = "https://www.fatafattelangananews.com";
  var LOGO = window.FT_LOGO_DATA || "";
  var idSide = "front";

  function brandHeader(color, bandH) {
    var cx = CARD_W / 2;
    var logoText = LOGO
      ? '<image x="' + (cx - 52) + '" y="26" width="104" height="104" preserveAspectRatio="xMidYMid meet" href="' + LOGO + '"/>'
      : '<circle cx="' + cx + '" cy="78" r="50" fill="#ffffff"/>' +
        '<text x="' + cx + '" y="88" text-anchor="middle" font-size="30" font-weight="bold" fill="' + color + '">FT</text>';
    return (
      '<rect width="' + CARD_W + '" height="' + bandH + '" fill="' + color + '"/>' +
      '<rect width="' + CARD_W + '" height="7" fill="#111111"/>' +
      logoText +
      '<text x="' + cx + '" y="168" text-anchor="middle" font-size="21" font-weight="bold" letter-spacing="1" fill="#ffffff">FATAFAT TELANGANA NEWS</text>' +
      '<text x="' + cx + '" y="194" text-anchor="middle" font-size="16" font-weight="bold" letter-spacing="5" fill="#ffffff">DIGITAL MEDIA</text>'
    );
  }

  function qrTag(text, x, y, target) {
    if (!window.qrcode) return "";
    try {
      var qr = window.qrcode(0, "L");
      qr.addData(text);
      qr.make();
      var mods = qr.getModuleCount();
      var quiet = 4;
      var cell = target / (mods + quiet * 2);
      var ov = 0.06;
      var out = "";
      for (var r = 0; r < mods; r++) {
        for (var c = 0; c < mods; c++) {
          if (qr.isDark(r, c)) {
            out +=
              '<rect x="' + (x + (c + quiet) * cell).toFixed(2) +
              '" y="' + (y + (r + quiet) * cell).toFixed(2) +
              '" width="' + (cell + ov).toFixed(2) +
              '" height="' + (cell + ov).toFixed(2) + '"/>';
          }
        }
      }
      return out;
    } catch (e) {
      return "";
    }
  }

  function qrUrl(r, valid) {
    var v = String(valid || "").trim();
    return (
      SITE_URL + "/verify?eid=" +
      encodeURIComponent(r.id || "") +
      (v ? "&v=" + encodeURIComponent(v) : "")
    );
  }

  function qrText(r, valid) {
    return (
      "FATAFAT TELANGANA NEWS - REPORTER VERIFICATION\n" +
      "Name: " + (r.name || "-") + "\n" +
      "Emp ID: " + (r.id || "-") + "\n" +
      "Designation: " + (r.designation || "-") + "\n" +
      "Mobile: " + (r.mobile || "-") + "\n" +
      "State: " + (r.state || "-") + "\n" +
      "District: " + (r.district || "-") + "\n" +
      "Status: " + (r.active ? "ACTIVE" : "INACTIVE") + "\n" +
      "Valid Upto: " + (valid || "-") + "\n" +
      "Contact: fatafattelangananews@gmail.com"
    );
  }

  function cardSVG(r, photo, valid) {
    var inits = cardInitials(r.name);
    var cx = CARD_W / 2;
    var NAVY = "#0a1f44";
    var RED = "#d42027";
    var GOLD = "#c9a227";
    var photoSvg = photo
      ? '<image x="' + (cx - 104) + '" y="222" width="208" height="208" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph)" href="' + photo + '"/>'
      : '<circle cx="' + cx + '" cy="326" r="100" fill="#e3e9f3"/>' +
        '<text x="' + cx + '" y="359" text-anchor="middle" font-size="56" font-weight="bold" fill="' + NAVY + '">' + esc(inits) + "</text>";
    var diamond =
      '<rect x="' + (cx - 6) + '" y="596" width="12" height="12" transform="rotate(45 ' + cx + ' ' + 602 + ')" fill="' + GOLD + '"/>';
    var socials =
      '<g font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">' +
      '<rect x="452" y="972" width="22" height="22" rx="6" fill="#ffffff" fill-opacity="0.18"/><text x="463" y="987" text-anchor="middle" fill="' + NAVY + '">f</text>' +
      '<rect x="482" y="972" width="22" height="22" rx="6" fill="#ffffff" fill-opacity="0.18"/><text x="493" y="988" text-anchor="middle">&#9654;</text>' +
      '<rect x="512" y="972" width="22" height="22" rx="6" fill="#ffffff" fill-opacity="0.18"/><text x="523" y="987" text-anchor="middle">IG</text>' +
      "</g>";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + CARD_W + '" height="' + CARD_H + '" viewBox="0 0 ' + CARD_W + " " + CARD_H + '" font-family="Arial, sans-serif">' +
      "<defs><clipPath id=\"ph\"><circle cx=\"" + cx + '" cy="326" r="104"/></clipPath></defs>' +
      '<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="#ffffff"/>' +
      '<rect width="' + CARD_W + '" height="196" fill="' + NAVY + '"/>' +
      '<rect x="0" y="190" width="' + CARD_W + '" height="6" fill="' + RED + '"/>' +
      '<rect x="34" y="42" width="118" height="118" rx="16" fill="#ffffff"/>' +
      '<image x="43" y="53" width="100" height="100" preserveAspectRatio="xMidYMid meet" href="' + LOGO + '"/>' +
      '<text x="186" y="86" font-size="30" font-weight="bold" fill="#ffffff">FATAFAT TELANGANA</text>' +
      '<text x="186" y="124" font-size="36" font-weight="bold" fill="#f43f4f">NEWS</text>' +
      '<text x="187" y="150" font-size="10" letter-spacing="4" fill="#aeb9d6">DIGITAL MEDIA</text>' +
      '<g transform="translate(556,50) scale(1.1)" stroke="#ffffff" stroke-opacity="0.4" fill="none" stroke-width="2" stroke-linejoin="round">' +
      '<line x1="0" y1="54" x2="4" y2="54"/><line x1="16" y1="54" x2="20" y2="54"/>' +
      '<path d="M8 54 V62 A4 4 0 0 0 16 62 V54"/>' +
      '<rect x="5" y="20" width="3" height="26"/><rect x="16" y="20" width="3" height="26"/><rect x="11" y="32" width="5" height="22"/>' +
      '<path d="M4 20 Q11 10 18 20"/>' +
      "</g>" +
      photoSvg +
      '<circle cx="' + cx + '" cy="326" r="110" fill="none" stroke="' + NAVY + '" stroke-width="4"/>' +
      '<circle cx="' + cx + '" cy="326" r="117" fill="none" stroke="' + GOLD + '" stroke-width="2"/>' +
      '<text x="' + cx + '" y="512" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="35" font-weight="800" fill="' + NAVY + '">' + esc(r.name || "-") + "</text>" +
      '<text x="' + cx + '" y="556" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="21" font-weight="bold" letter-spacing="2" fill="' + RED + '">' + esc((r.designation || "Reporter").toUpperCase()) + "</text>" +
      '<line x1="190" y1="590" x2="448" y2="590" stroke="#e2e8f2"/>' +
      diamond +
      qrTag(qrUrl(r, valid), 150, 600, 320) +
      '<rect x="120" y="580" width="398" height="344" rx="14" fill="none" stroke="' + NAVY + '" stroke-width="3" stroke-dasharray="10 7"/>' +
      '<text x="299" y="949" text-anchor="middle" font-size="10" letter-spacing="2" fill="#7c89a3">SCAN TO VERIFY &middot; DETAILS PAGE KHULEGI</text>' +
      '<circle cx="530" cy="856" r="58" fill="#ffffff" stroke="' + NAVY + '" stroke-width="4"/>' +
      '<circle cx="530" cy="856" r="52" fill="none" stroke="' + NAVY + '" stroke-width="1.5"/>' +
      '<path id="sealArcTop" d="M 478 856 A 52 52 0 0 0 582 856" fill="none"/>' +
      '<text font-size="10" font-weight="bold" letter-spacing="1" fill="' + NAVY + '"><textPath href="#sealArcTop" startOffset="50%" text-anchor="middle">FATAFAT TELANGANA NEWS</textPath></text>' +
      '<circle cx="530" cy="864" r="34" fill="#16a34a"/>' +
      '<path d="M 514 862 l 10 12 l 22 -24" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="530" y="928" text-anchor="middle" font-size="13" font-weight="bold" letter-spacing="3" fill="#16a34a">VERIFIED</text>' +
      '<rect y="956" width="' + CARD_W + '" height="5" fill="' + RED + '"/>' +
      '<rect y="961" width="' + CARD_W + '" height="52" fill="' + NAVY + '"/>' +
      socials +
      '<text x="' + cx + '" y="996" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="19" font-weight="bold" letter-spacing="5" fill="#c9a227">DIGITAL MEDIA</text>' +
      "</svg>"
    );
  }

  function backCardSVG(r, valid) {
    var cx = CARD_W / 2;
    var NAVY = "#0a1f44";
    var RED = "#d42027";
    var EMAIL = "fatafattelangananews@gmail.com";
    var texts = [
      "This ID card is the property of Fatafat Telangana News.",
      "Issued only for authorized professional/media purposes.",
      "Must not be misused, transferred, lent, or used by any other person.",
      "The holder must not use this card for any illegal, personal, financial, political, or unauthorized purpose.",
      "The card holder must follow applicable laws and professional journalistic standards.",
      "The management reserves the right to cancel or withdraw this ID card at any time.",
      "If found, please return this card to Fatafat Telangana News.",
      "Lost or stolen cards must be reported to the management immediately.",
      "Holding this ID card does not grant any special legal, government, or police authority, or unrestricted access to restricted premises."
    ];
    function wrapLines(t, max) {
      var words = String(t).split(/\s+/);
      var lines = [];
      var cur = "";
      words.forEach(function (w) {
        var test = cur ? cur + " " + w : w;
        if (test.length <= max) { cur = test; }
        else { if (cur) lines.push(cur); cur = w; }
      });
      if (cur) lines.push(cur);
      return lines;
    }
    var y = 322;
    var rows = "";
    texts.forEach(function (t) {
      var ls = wrapLines(t, 76);
      ls.forEach(function (l, i) {
        if (i === 0) {
          rows += '<text x="70" y="' + y + '" font-size="15" font-weight="bold" fill="' + RED + '">&#8226;</text>';
        }
        rows += '<text x="92" y="' + y + '" font-size="12.5" fill="#334155">' + esc(l) + "</text>";
        y += 22;
      });
      y += 3;
    });
    var divY = y + 4;
    var qrTop = y + 22;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + CARD_W + '" height="' + CARD_H + '" viewBox="0 0 ' + CARD_W + " " + CARD_H + '" font-family="Arial, sans-serif">' +
      '<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="#ffffff"/>' +
      '<rect width="' + CARD_W + '" height="196" fill="' + NAVY + '"/>' +
      '<rect x="0" y="190" width="' + CARD_W + '" height="6" fill="' + RED + '"/>' +
      '<rect x="34" y="42" width="118" height="118" rx="16" fill="#ffffff"/>' +
      '<image x="43" y="53" width="100" height="100" preserveAspectRatio="xMidYMid meet" href="' + LOGO + '"/>' +
      '<text x="186" y="86" font-size="30" font-weight="bold" fill="#ffffff">FATAFAT TELANGANA</text>' +
      '<text x="186" y="124" font-size="36" font-weight="bold" fill="#f43f4f">NEWS</text>' +
      '<text x="187" y="150" font-size="10" letter-spacing="4" fill="#aeb9d6">DIGITAL MEDIA</text>' +
      '<text x="' + cx + '" y="252" text-anchor="middle" font-size="22" font-weight="bold" letter-spacing="1" fill="' + NAVY + '">TERMS &amp; CONDITIONS OF USE</text>' +
      '<text x="' + cx + '" y="278" text-anchor="middle" font-size="10" letter-spacing="4" fill="#7c89a3">OFFICIAL MEDIA ID CARD &middot; RETURN IF FOUND</text>' +
      '<line x1="170" y1="296" x2="468" y2="296" stroke="#e2e8f2"/>' +
      rows +
      '<line x1="170" y1="' + divY + '" x2="468" y2="' + divY + '" stroke="#e2e8f2"/>' +
      '<rect x="149" y="' + qrTop + '" width="340" height="150" rx="12" fill="#f8fafc" stroke="' + NAVY + '" stroke-width="2"/>' +
      '<text x="169" y="' + (qrTop + 32) + '" font-size="12" font-weight="bold" letter-spacing="2" fill="' + NAVY + '">CONTACT / RETURN TO</text>' +
      '<text x="169" y="' + (qrTop + 66) + '" font-size="17" font-weight="bold" fill="' + RED + '">' + esc(EMAIL) + "</text>" +
      '<text x="169" y="' + (qrTop + 100) + '" font-size="12" fill="#64748b">Official ID card - property of</text>' +
      '<text x="169" y="' + (qrTop + 122) + '" font-size="14" font-weight="bold" fill="' + NAVY + '">Fatafat Telangana News</text>' +
      '<text x="169" y="' + (qrTop + 148) + '" font-size="11" fill="#94a3b8">Emp ID: ' + esc(r.id || "-") + "</text>" +
      '<rect y="956" width="' + CARD_W + '" height="5" fill="' + RED + '"/>' +
      '<rect y="961" width="' + CARD_W + '" height="52" fill="' + NAVY + '"/>' +
      '<text x="' + cx + '" y="998" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="23" font-weight="bold" letter-spacing="7" fill="#c9a227">DIGITAL MEDIA</text>' +
      "</svg>"
    );
  }

  function idPhotoKey(r) {
    return "ft_idphoto_" + (r.id || "rep");
  }

  function renderIdCard() {
    var photo = null;
    try { photo = localStorage.getItem(idPhotoKey(idReporter)) || null; } catch (e) {}
    idHolder.innerHTML = idSide === "back" ? backCardSVG(idReporter, idValidityInput.value) : cardSVG(idReporter, photo, idValidityInput.value);
  }

  function openIdCard(idx) {
    idReporter = state.reporters[idx];
    if (!idReporter) return;
    idSide = "front";
    document.getElementById("sideFrontBtn").classList.add("on");
    document.getElementById("sideBackBtn").classList.remove("on");
    document.getElementById("frontOptions").style.display = "block";
    document.getElementById("backOptions").style.display = "none";
    var d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    idValidityInput.value = d.toISOString().split("T")[0];
    idPhotoInput.value = "";
    renderIdCard();
    idModal.classList.add("open");
  }

  document.getElementById("sideFrontBtn").addEventListener("click", function () {
    idSide = "front";
    this.classList.add("on");
    document.getElementById("sideBackBtn").classList.remove("on");
    document.getElementById("frontOptions").style.display = "block";
    document.getElementById("backOptions").style.display = "none";
    renderIdCard();
  });

  document.getElementById("sideBackBtn").addEventListener("click", function () {
    idSide = "back";
    this.classList.add("on");
    document.getElementById("sideFrontBtn").classList.remove("on");
    document.getElementById("frontOptions").style.display = "none";
    document.getElementById("backOptions").style.display = "block";
    renderIdCard();
  });

  idPhotoInput.addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement("canvas");
        var s = 220;
        c.width = s; c.height = s;
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, s, s);
        var scale = Math.max(s / img.width, s / img.height);
        var w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
        try { localStorage.setItem(idPhotoKey(idReporter), c.toDataURL("image/jpeg", 0.8)); } catch (e) {}
        renderIdCard();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  });

  idValidityInput.addEventListener("change", renderIdCard);

  document.getElementById("idPngBtn").addEventListener("click", function () {
    var photo = null;
    try { photo = localStorage.getItem(idPhotoKey(idReporter)) || null; } catch (e) {}
    var svg = idSide === "back" ? backCardSVG(idReporter, idValidityInput.value) : cardSVG(idReporter, photo, idValidityInput.value);
    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = CARD_W; c.height = CARD_H;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, CARD_W, CARD_H);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      var a = document.createElement("a");
      a.download = (idReporter.id || "reporter") + "-" + (idSide === "back" ? "Back" : "ID-Card") + ".png";
      a.href = c.toDataURL("image/png");
      a.click();
    };
    img.onerror = function () { alert("PNG banane me problem aayi - Print / PDF try karein."); };
    img.src = url;
  });

  document.getElementById("idPrintBtn").addEventListener("click", function () {
    var photo = null;
    try { photo = localStorage.getItem(idPhotoKey(idReporter)) || null; } catch (e) {}
    var svg = idSide === "back" ? backCardSVG(idReporter, idValidityInput.value) : cardSVG(idReporter, photo, idValidityInput.value);
    var w = window.open("", "_blank");
    if (!w) { alert("Popup blocked - browser ko allow karein."); return; }
    w.document.write(
      '<html><head><title>' + esc(idReporter.id) + ' ID Card</title>' +
      "<style>" +
      "@page { size: 53.98mm 85.6mm; margin: 0; }" +
      "html,body{margin:0;padding:0;text-align:center;font-family:Arial,sans-serif;background:#fff}" +
      "svg{width:54mm;height:85.7mm;display:block;margin:0 auto;box-shadow:0 0 0 1px #ddd}" +
      "</style></head><body>" +
      svg +
      '<script>window.onload=function(){window.print();}<\/script></body></html>'
    );
    w.document.close();
  });

  document.getElementById("idCloseBtn").addEventListener("click", function () { idModal.classList.remove("open"); });
  document.getElementById("idX").addEventListener("click", function () { idModal.classList.remove("open"); });
  idModal.addEventListener("click", function (e) { if (e.target === this) idModal.classList.remove("open"); });

  // ============ EXPORT ============
  function showOut(id) {
    document.querySelectorAll(".adm-hint").forEach(function (x) { x.style.display = "none"; });
    document.getElementById(id).style.display = "block";
  }

  document.getElementById("copyNewsBtn").addEventListener("click", function () {
    var out = "window.FT_STORIES = [\n";
    state.news.forEach(function (n) {
      out += '  { "title": ' + JSON.stringify(n.title) + ", \"link\": " + JSON.stringify(n.link || "") + ", \"category\": " + JSON.stringify(n.category || "") + ', "live": ' + (n.live ? "true" : "false") + " },\n";
    });
    out += "];";
    document.getElementById("newsOut").textContent = out;
    showOut("newsOut");
  });

  document.getElementById("copyVideoBtn").addEventListener("click", function () {
    var out = "window.FT_FEED = window.FT_FEED || {\n";
    out += "  youtube: [\n" + state.youtube.map(function (v) { return '    "' + v + '"'; }).join(",\n") + "\n  ],\n";
    out += "  instagram: [\n" + state.instagram.map(function (v) { return '    "' + v + '"'; }).join(",\n") + "\n  ]\n";
    out += "};";
    document.getElementById("videoOut").textContent = out;
    showOut("videoOut");
  });

  document.getElementById("copyReporterBtn").addEventListener("click", function () {
    var out = '"people": [\n';
    state.reporters.forEach(function (r) {
      out +=
        '  { "id": ' + JSON.stringify(r.id) + ', "name": ' + JSON.stringify(r.name) +
        ', "mobile": ' + JSON.stringify(r.mobile || "") + ', "designation": ' + JSON.stringify(r.designation || "") +
        ', "state": ' + JSON.stringify(r.state) + ', "district": ' + JSON.stringify(r.district) +
        ', "active": ' + (r.active ? "true" : "false") + " },\n";
    });
    out += "]";
    document.getElementById("reporterOut").textContent = out;
    showOut("reporterOut");
  });

  function renderAll() {
    renderNews();
    renderVideos();
    renderReporters();
  }

  document.getElementById("testSaveBtn").addEventListener("click", function () {
    try {
      var t = { id: "FT-R-TEST", name: "Test Reporter", mobile: "0000000000", designation: "TEST", state: "Telangana", district: "Hyderabad", active: true };
      var orig = JSON.stringify({ news: state.news, youtube: state.youtube, instagram: state.instagram, reporters: state.reporters });
      localStorage.setItem("ft_admin_v2", JSON.stringify({ news: state.news, youtube: state.youtube, instagram: state.instagram, reporters: state.reporters.concat([t]) }));
      var back = "";
      try { back = localStorage.getItem("ft_admin_v2") || ""; } catch (e) {}
      if (back.indexOf("FT-R-TEST") !== -1) {
        try { localStorage.setItem("ft_admin_v2", orig); } catch (e) {}
        showToast("Test SAVE: OK - storage bilkul sahi chal raha hai");
      } else {
        showToast("Test SAVE: FAILED - data wapas nahi mila", true);
      }
    } catch (e) {
      showToast("Test SAVE: STORAGE BLOCKED - " + (e && e.message ? e.message : e), true);
    }
  });

  document.getElementById("resetDataBtn").addEventListener("click", function () {
    if (!confirm("Saara saved admin data (stories, videos, reporters, photos) is browser se clear hoga. Continue?")) return;
    try { localStorage.removeItem("ft_admin_v1"); } catch (e) {}
    try { localStorage.removeItem("ft_admin_v2"); } catch (e) {}
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("ft_idphoto_") === 0) keys.push(k);
      }
      keys.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    location.reload();
  });

  renderAll();
})();