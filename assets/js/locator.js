/* Store locator: geolocation -> distance-sorted list, ZIP/city text fallback.
   No API key required for the core experience. Google Geocoding is used only
   if a key is present in BW1_CONFIG (see assets/js/config.js). */

(function () {
  "use strict";

  var CONFIG = window.BW1_CONFIG || {};
  var stores = [];
  var defaults = null;
  var origin = null;

  var els = {};

  function $(sel) { return document.querySelector(sel); }

  function haversine(a, b) {
    var R = 3958.8; // miles
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLng = (b.lng - a.lng) * Math.PI / 180;
    var la1 = a.lat * Math.PI / 180;
    var la2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(la1) * Math.cos(la2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function status(msg, state) {
    if (!els.status) return;
    els.status.textContent = msg || "";
    if (state) { els.status.setAttribute("data-state", state); }
    else { els.status.removeAttribute("data-state"); }
  }

  function directionsUrl(s) {
    if (s.place_id) {
      return "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(s.street + ", " + s.city + ", " + s.state) +
        "&destination_place_id=" + encodeURIComponent(s.place_id);
    }
    return "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(s.street + ", " + s.city + ", " + s.state + " " + (s.zip || ""));
  }

  function telHref(phone) {
    return "tel:+1" + String(phone).replace(/\D/g, "");
  }

  function row(s) {
    var li = document.createElement("li");
    li.className = "store-row";

    var dist = document.createElement("div");
    dist.className = "store-dist";
    if (typeof s._dist === "number") {
      dist.innerHTML = s._dist.toFixed(1) + "<small>miles</small>";
    } else {
      dist.setAttribute("data-empty", "true");
      dist.innerHTML = "&mdash;";
    }

    var meta = document.createElement("div");
    meta.className = "store-meta";
    var h3 = document.createElement("h3");
    var a = document.createElement("a");
    a.href = (CONFIG.storeBase || "stores/") + s.slug + ".html";
    a.textContent = "Cricket Wireless " + s.city + " \u2014 " + s.name;
    h3.appendChild(a);
    var p = document.createElement("p");
    p.textContent = s.street + ", " + s.city + ", " + s.state + (s.zip ? " " + s.zip : "");
    meta.appendChild(h3);
    meta.appendChild(p);

    // Open now / closed, from this store's hours (promo.js supplies the rule).
    var hrs = s.hours || defaults;
    if (hrs && window.BW1_openState) {
      var state = window.BW1_openState(hrs.mon_sat, hrs.sun);
      if (state) {
        var chip = document.createElement("span");
        chip.className = "openchip";
        chip.setAttribute("data-open", String(state.open));
        chip.textContent = state.text;
        meta.appendChild(chip);
      }
    }

    var actions = document.createElement("div");
    actions.className = "store-actions";

    var call = document.createElement("a");
    call.className = "iconlink";
    call.href = telHref(s.phone);
    call.setAttribute("aria-label", "Call the " + s.city + " store at " + s.phone);
    call.textContent = "\u260E";

    var dir = document.createElement("a");
    dir.className = "iconlink";
    dir.href = directionsUrl(s);
    dir.target = "_blank";
    dir.rel = "noopener";
    dir.setAttribute("aria-label", "Directions to the " + s.city + " store");
    dir.textContent = "\u27A4";

    actions.appendChild(call);
    actions.appendChild(dir);

    li.appendChild(dist);
    li.appendChild(meta);
    li.appendChild(actions);
    return li;
  }

  function render(list, limit) {
    var ul = els.list;
    ul.innerHTML = "";
    var shown = limit ? list.slice(0, limit) : list;
    shown.forEach(function (s) { ul.appendChild(row(s)); });
    if (els.count) {
      els.count.textContent = origin
        ? shown.length + " of " + list.length + " stores, closest first"
        : (shown.length < list.length ? shown.length + " of " : "") + list.length + " stores";
    }
  }

  function located(s) { return typeof s.lat === "number" && typeof s.lng === "number"; }

  function sortByDistance() {
    if (!origin) return stores.slice();
    var withDist = stores.map(function (s) {
      s._dist = located(s) ? haversine(origin, { lat: s.lat, lng: s.lng }) : null;
      return s;
    });
    // Stores without coordinates keep their place at the end of the list.
    withDist.sort(function (a, b) {
      if (a._dist === null) return b._dist === null ? 0 : 1;
      if (b._dist === null) return -1;
      return a._dist - b._dist;
    });
    return withDist;
  }

  function showNearest() {
    render(sortByDistance(), 8);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      status("This browser can't share your location. Enter a ZIP code instead.", "error");
      return;
    }
    status("Finding your location\u2026");
    navigator.geolocation.getCurrentPosition(function (pos) {
      origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      status("Showing the stores closest to you.");
      showNearest();
      els.list.scrollIntoView({ behavior: "smooth", block: "start" });
    }, function () {
      status("Location access is off. Enter a ZIP code or city instead.", "error");
      if (els.input) els.input.focus();
    }, { timeout: 10000, maximumAge: 300000 });
  }

  // Text search. Matches city/ZIP against our own data first (no API needed).
  // Falls back to Google Geocoding when a key is configured, so any address works.
  function searchText(q) {
    q = (q || "").trim();
    if (!q) { status("Enter a ZIP code, city, or address."); return; }

    var needle = q.toLowerCase();
    var local = stores.filter(function (s) {
      return s.city.toLowerCase().indexOf(needle) === 0 ||
             (s.zip && s.zip.indexOf(needle) === 0);
    });

    if (local.length) {
      var anchor = local.filter(located)[0];
      if (anchor) {
        origin = { lat: anchor.lat, lng: anchor.lng };
        status("Showing stores near " + anchor.city + ".");
        showNearest();
      } else {
        // No coordinates for the match, so show the matching stores as they are.
        status("Showing stores in " + local[0].city + ".");
        render(local);
      }
      return;
    }

    if (CONFIG.googleMapsKey) {
      status("Looking up \u201C" + q + "\u201D\u2026");
      var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        encodeURIComponent(q) + "&components=country:US&key=" + CONFIG.googleMapsKey;
      fetch(url).then(function (r) { return r.json(); }).then(function (d) {
        if (d.status === "OK" && d.results.length) {
          var loc = d.results[0].geometry.location;
          origin = { lat: loc.lat, lng: loc.lng };
          status("Showing stores near " + d.results[0].formatted_address + ".");
          showNearest();
        } else {
          status("No match for \u201C" + q + "\u201D. Try a ZIP code.", "error");
        }
      }).catch(function () {
        status("Lookup failed. Try a ZIP code or use your location.", "error");
      });
      return;
    }

    status("No match for \u201C" + q + "\u201D. Try a city name or use your location.", "error");
  }

  function init() {
    els.list = $("#store-list");
    els.count = $("#store-count");
    els.status = $("#finder-status");
    els.input = $("#finder-input");

    if (!els.list) return;

    var base = CONFIG.dataBase || "data/";
    // stores.json holds the addresses; geo.json holds the map coordinates for
    // them (see tools/geocode.mjs). Missing coordinates only cost the distance
    // sort, so a failed geo.json still leaves a working store list.
    Promise.all([
      fetch(base + "stores.json").then(function (r) { return r.json(); }),
      fetch(base + "geo.json").then(function (r) { return r.json(); }).catch(function () { return {}; })
    ])
      .then(function (res) {
        var d = res[0], coords = (res[1] && res[1].coords) || {};
        defaults = (d._defaults && d._defaults.hours) || null;
        stores = (d.stores || []).filter(function (s) { return s.advertised; });
        stores.forEach(function (s) {
          var c = coords[s.slug];
          if (c && (s.lat == null || s.lng == null)) { s.lat = c.lat; s.lng = c.lng; }
        });
        // stores.html keeps its "closest to you" band empty until the visitor
        // searches; every other page shows the list straight away.
        if (els.list.getAttribute("data-initial") !== "none") {
          render(stores, parseInt(els.list.getAttribute("data-limit"), 10) || 0);
        }

        var geoBtn = $("#use-location");
        if (geoBtn) geoBtn.addEventListener("click", useMyLocation);

        var form = $("#finder-form");
        if (form) {
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            searchText(els.input.value);
          });
        }

        // Store detail pages pre-seed an origin so "nearby" works immediately.
        if (window.BW1_ORIGIN) {
          origin = window.BW1_ORIGIN;
          var near = sortByDistance().filter(function (s) { return s.slug !== window.BW1_SLUG; });
          render(near, 4);
        }
      })
      .catch(function () {
        status("Store list didn't load. Refresh the page.", "error");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
