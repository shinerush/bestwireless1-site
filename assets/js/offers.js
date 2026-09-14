/* Renders live offers from data/offers.json into any [data-offers] container.
   Date-filtered automatically. Channel controls presentation:
     in_store / both -> promoted with a store CTA
     online_only     -> shown for transparency, links to cricketwireless.com,
                        never paired with a "visit our store" call to action. */

(function () {
  "use strict";

  var CONFIG = window.BW1_CONFIG || {};

  var LABEL = {
    in_store: "Available in our stores",
    both: "In store or online",
    online_only: "Online only at cricketwireless.com"
  };

  function active(o, today) {
    var s = o.start ? new Date(o.start + "T00:00:00") : null;
    var e = o.end ? new Date(o.end + "T23:59:59") : null;
    if (s && today < s) return false;
    if (e && today > e) return false;
    return true;
  }

  function card(o, storeCtaHref, storeCtaLabel) {
    var li = document.createElement("li");
    li.className = "offer";
    li.setAttribute("data-channel", o.channel);

    var tag = document.createElement("span");
    tag.className = "tag";
    tag.setAttribute("data-channel", o.channel);
    tag.textContent = LABEL[o.channel] || o.channel;

    var h3 = document.createElement("h3");
    h3.textContent = o.headline;

    var p = document.createElement("p");
    p.textContent = o.detail;

    var terms = document.createElement("p");
    terms.className = "terms";
    terms.textContent = o.terms_short || "";

    li.appendChild(tag);
    li.appendChild(h3);
    li.appendChild(p);
    if (o.terms_short) li.appendChild(terms);

    if (o.channel !== "online_only" && storeCtaHref) {
      var a = document.createElement("a");
      a.className = "btn btn-amber";
      a.href = storeCtaHref;
      a.style.alignSelf = "flex-start";
      a.style.marginTop = "0.4rem";
      a.textContent = storeCtaLabel || "Find your store";
      li.appendChild(a);
    }

    if (o.disclaimer) {
      var det = document.createElement("details");
      det.className = "disclose";
      var sum = document.createElement("summary");
      sum.textContent = "Offer details and restrictions";
      var dp = document.createElement("p");
      dp.textContent = o.disclaimer;
      det.appendChild(sum);
      det.appendChild(dp);
      li.appendChild(det);
    }

    return li;
  }

  function init() {
    var hosts = document.querySelectorAll("[data-offers]");
    if (!hosts.length) return;

    fetch((CONFIG.dataBase || "data/") + "offers.json")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var today = new Date();
        var live = (d.offers || [])
          .filter(function (o) { return active(o, today); })
          .sort(function (a, b) { return (a.priority || 99) - (b.priority || 99); });

        hosts.forEach(function (host) {
          var mode = host.getAttribute("data-offers"); // "all" | "instore"
          var ctaHref = host.getAttribute("data-cta-href");
          var ctaLabel = host.getAttribute("data-cta-label");

          var set = mode === "instore"
            ? live.filter(function (o) { return o.channel !== "online_only"; })
            : live;

          var ul = document.createElement("ul");
          ul.className = "offer-grid";
          set.forEach(function (o) { ul.appendChild(card(o, ctaHref, ctaLabel)); });

          host.innerHTML = "";
          if (!set.length) {
            var empty = document.createElement("p");
            empty.textContent = "No offers running right now. Call your nearest store for current pricing.";
            host.appendChild(empty);
          } else {
            host.appendChild(ul);
          }
        });
      })
      .catch(function () {
        hosts.forEach(function (h) {
          h.innerHTML = "<p>Offers didn\u2019t load. Call your nearest store for current pricing.</p>";
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
