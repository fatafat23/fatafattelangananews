window.FT_SITE_DATA = (function () {
  function readAdmin() {
    try {
      var s = JSON.parse(localStorage.getItem("ft_admin_v2") || "null");
      if (s) {
        var out = {
          locations: (window.FT_REPORTERS && window.FT_REPORTERS.locations) || {},
          people: Array.isArray(s.reporters) ? s.reporters : [],
          news: Array.isArray(s.news) ? s.news : []
        };
        if (out.people.length || out.news.length) return out;
      }
    } catch (e) {}
    return null;
  }
  return readAdmin() || window.FT_REPORTERS || { locations: {}, people: [], news: [] };
})();