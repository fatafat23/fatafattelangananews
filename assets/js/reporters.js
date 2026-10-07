(function () {
  var data = window.FT_SITE_DATA || window.FT_REPORTERS || { locations: {}, people: [] };

  var stateSel = document.getElementById("rptState");
  var distSel = document.getElementById("rptDistrict");
  var searchBox = document.getElementById("rptSearch");
  var tbody = document.getElementById("rptBody");
  var statusLine = document.getElementById("rptStatus");
  if (!stateSel || !tbody) return;

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var states = Object.keys(data.locations || {}).sort();

  states.forEach(function (s) {
    var o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    stateSel.appendChild(o);
  });

  function fillDistricts() {
    var s = stateSel.value;
    distSel.innerHTML = '<option value="">All Districts</option>';
    (data.locations[s] || []).forEach(function (d) {
      var o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      distSel.appendChild(o);
    });
  }

  stateSel.addEventListener("change", function () {
    fillDistricts();
    render();
  });
  distSel.addEventListener("change", render);
  searchBox.addEventListener("input", render);

  function render() {
    var s = stateSel.value;
    var d = distSel.value;
    var q = (searchBox.value || "").trim().toLowerCase();

    var rows = data.people.filter(function (p) {
      if (s && p.state !== s) return false;
      if (d && p.district !== d) return false;
      if (q) {
        var hay = (p.id + " " + p.name).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (statusLine) {
      statusLine.textContent = rows.length + " reporter" + (rows.length === 1 ? "" : "s");
    }

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="7"><p class="news-status">Koi reporter nahi mila - filters change karke try karein.</p></td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (p) {
        var badge =
          '<span class="rpt-badge ' + (p.active ? "on" : "off") + '">' +
          (p.active ? "Active" : "Inactive") +
          "</span>";
        return (
          "<tr>" +
          "<td><b>" + esc(p.id) + "</b></td>" +
          "<td>" + esc(p.mobile || "-") + "</td>" +
          "<td>" + esc(p.name) + "</td>" +
          "<td>" + esc(p.designation || "-") + "</td>" +
          "<td>" + esc(p.state) + "</td>" +
          "<td>" + esc(p.district) + "</td>" +
          "<td>" + badge + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  fillDistricts();
  render();
})();