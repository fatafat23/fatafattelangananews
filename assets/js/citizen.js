window.FT_SHARE = window.FT_SHARE || {
  email: "fatafattelangananews@gmail.com",
  wa: "9779743971097",
  site: "https://www.fatafattelangananews.com/"
};

(function () {
  var cfg = window.FT_SHARE;
  var form = document.getElementById("tipForm");
  if (!form) return;

  var status = document.getElementById("tipStatus");

  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.className = "tip-status " + (ok ? "ok" : "err");
  }

  function body() {
    return (
      "News Tip for Fatafat Telangana News" +
      "\n\nIs link se custom message bhej sakte hain khud: " +
      cfg.site +
      " (Apni khabar type karke bhejo — hum verify karke publish karenge.)"
    );
  }

  function sendWhatsApp() {
    if (!/^(91|977)\d{10}$/.test(cfg.wa)) {
      setStatus("WhatsApp number abhi set nahi hua hai - email use karein.", false);
      return;
    }
    var url = "https://wa.me/" + cfg.wa + "?text=" + encodeURIComponent(body());
    window.open(url, "_blank", "noopener");
    setStatus("WhatsApp khul gaya, send karein. Thank you!", true);
  }

  function sendEmail() {
    var subject = "Fatafat Telangana News - News Tip";
    window.location.href =
      "mailto:" + cfg.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body());
    setStatus("Email app khul gaya, send karein. Thank you!", true);
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  var by = form.querySelectorAll("[data-send]");
  Array.prototype.forEach.call(by, function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-send");
      if (kind === "whatsapp") sendWhatsApp();
      else if (kind === "email") sendEmail();
    });
  });
})();