/* The green promo strip that sits above everything on every page.
   Shows the top offer your stores can honor, straight from data/offers.json,
   so it changes with the deals and never advertises an online-only price. */

(function () {
  "use strict";

  var CONFIG = window.BW1_CONFIG || {};
  var ROOT = (CONFIG.dataBase || "data/").replace(/data\/$/, "");

  function active(o, today) {
    var s = o.start ? new Date(o.start + "T00:00:00") : null;
    var e = o.end ? new Date(o.end + "T23:59:59") : null;
    if (s && today < s) return false;
    if (e && today > e) return false;
    return true;
  }

  function render(o) {
    var bar = document.createElement("div");
    bar.className = "promo";

    var wrap = document.createElement("div");
    wrap.className = "wrap";

    var head = document.createElement("strong");
    head.textContent = o.headline;

    var detail = document.createElement("span");
    detail.textContent = o.terms_short || o.detail || "";

    var link = document.createElement("a");
    link.href = ROOT + "deals.html";
    link.textContent = "See the deal";

    wrap.appendChild(head);
    if (detail.textContent) wrap.appendChild(detail);
    wrap.appendChild(link);
    bar.appendChild(wrap);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function init() {
    if (document.querySelector(".promo")) return;
    fetch((CONFIG.dataBase || "data/") + "offers.json")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var today = new Date();
        var top = (d.offers || [])
          .filter(function (o) { return o.channel !== "online_only" && active(o, today); })
          .sort(function (a, b) { return (a.priority || 99) - (b.priority || 99); })[0];
        if (top) render(top);
      })
      .catch(function () { /* no bar is better than a broken bar */ });
  }

  /* "Open now" / "Closed" from a store's own opening hours. */
  function minutes(t) {
    var m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    var h = Number(m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h * 60 + Number(m[2]);
  }

  window.BW1_openState = function (monSat, sun, now) {
    now = now || new Date();
    var span = (now.getDay() === 0 ? sun : monSat) || "";
    var parts = span.split(" - ");
    var open = minutes(parts[0]), close = minutes(parts[1]);
    if (open === null || close === null) return null;
    var mins = now.getHours() * 60 + now.getMinutes();
    if (mins < open) return { open: false, text: "Opens at " + parts[0] };
    if (mins >= close) return { open: false, text: "Closed now" };
    return { open: true, text: "Open until " + parts[1] };
  };

  function chips() {
    var list = document.querySelectorAll(".openchip[data-hours]");
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var s = window.BW1_openState(el.getAttribute("data-hours"), el.getAttribute("data-hours-sun"));
      if (!s) { el.remove(); continue; }
      el.textContent = s.text;
      el.setAttribute("data-open", String(s.open));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); chips(); });
  } else { init(); chips(); }
})();
