/* Phones from data/phones.json. Renders into [data-phones].
     data-limit="4"      show only the first N (by priority)
     data-controls="on"  show brand filter chips and a sort menu
   Online-only deals link to cricketwireless.com and never get a store CTA. */

(function () {
  "use strict";

  var CONFIG = window.BW1_CONFIG || {};
  var ROOT = (CONFIG.dataBase || "data/").replace(/data\/$/, "");

  var FILTERS = [
    ["all", "All"],
    ["Apple", "Apple"],
    ["Samsung", "Samsung"],
    ["Motorola", "Motorola"],
    ["watch", "Watches"]
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function card(p) {
    var li = el("li", "phone");
    li.setAttribute("data-brand", p.brand);
    li.setAttribute("data-type", p.type);

    var dev = el("div", "device");
    dev.setAttribute("data-type", p.type);
    dev.setAttribute("aria-hidden", "true");
    dev.appendChild(el("span", null, p.brand));
    li.appendChild(dev);

    li.appendChild(el("p", "phone-brand", p.brand));
    li.appendChild(el("h3", null, p.name));

    if (p.price != null) {
      li.appendChild(el("p", "phone-price", money(p.price)));
    } else if (!p.deal) {
      li.appendChild(el("p", "phone-price phone-price-ask", "Ask in store for pricing"));
    }

    if (p.deal) {
      var d = el("div", "phone-deal");
      d.setAttribute("data-channel", p.deal.channel);
      var tag = el("span", "tag", p.deal.channel === "online_only" ? "Online only" : "In store deal");
      tag.setAttribute("data-channel", p.deal.channel);
      d.appendChild(tag);
      d.appendChild(el("p", null, p.deal.text));
      li.appendChild(d);
    }

    var a;
    if (p.deal && p.deal.channel === "online_only") {
      a = el("a", "btn btn-outline", "See deal on cricketwireless.com");
      a.href = "https://www.cricketwireless.com/shop/all-devices";
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a = el("a", "btn", "Check stock at a store");
      a.href = ROOT + "stores.html";
    }
    li.appendChild(a);
    return li;
  }

  function render(host, phones) {
    var limit = parseInt(host.getAttribute("data-limit"), 10) || 0;
    var controls = host.getAttribute("data-controls") === "on";
    var state = { filter: "all", sort: "featured" };

    host.innerHTML = "";

    var grid = el("ul", "phone-grid");
    var count = el("p", "results-count");
    count.setAttribute("role", "status");

    function draw() {
      var list = phones.filter(function (p) {
        if (state.filter === "all") return true;
        if (state.filter === "watch") return p.type === "watch";
        return p.brand === state.filter;
      });
      list.sort(function (a, b) {
        if (state.sort === "featured") return (a.priority || 99) - (b.priority || 99);
        var pa = a.price == null ? Infinity : a.price;
        var pb = b.price == null ? Infinity : b.price;
        if (pa === pb) return (a.priority || 99) - (b.priority || 99);
        return state.sort === "low" ? pa - pb : (pb === Infinity ? -1 : pa === Infinity ? 1 : pb - pa);
      });
      if (limit) list = list.slice(0, limit);
      grid.innerHTML = "";
      list.forEach(function (p) { grid.appendChild(card(p)); });
      count.textContent = list.length === 1 ? "1 device" : list.length + " devices";
    }

    if (controls) {
      var bar = el("div", "filterbar");
      var chips = el("div", "chips");
      chips.setAttribute("role", "group");
      chips.setAttribute("aria-label", "Filter by brand");
      FILTERS.forEach(function (f) {
        var b = el("button", "chip", f[1]);
        b.type = "button";
        b.setAttribute("aria-pressed", f[0] === state.filter ? "true" : "false");
        b.addEventListener("click", function () {
          state.filter = f[0];
          chips.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          draw();
        });
        chips.appendChild(b);
      });

      var sortWrap = el("label", "sort");
      sortWrap.appendChild(document.createTextNode("Sort "));
      var sel = el("select");
      [["featured", "Featured"], ["low", "Price: low to high"], ["high", "Price: high to low"]].forEach(function (o) {
        var opt = el("option", null, o[1]);
        opt.value = o[0];
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () { state.sort = sel.value; draw(); });
      sortWrap.appendChild(sel);

      bar.appendChild(chips);
      bar.appendChild(sortWrap);
      host.appendChild(bar);
      host.appendChild(count);
    }

    host.appendChild(grid);
    draw();
  }

  function init() {
    var hosts = document.querySelectorAll("[data-phones]");
    if (!hosts.length) return;
    fetch((CONFIG.dataBase || "data/") + "phones.json")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        hosts.forEach(function (h) { render(h, d.phones || []); });
      })
      .catch(function () {
        hosts.forEach(function (h) {
          h.innerHTML = "<p>Phones didn’t load. Call your nearest store to ask what’s in stock.</p>";
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
