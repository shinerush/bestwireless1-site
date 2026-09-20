/* Plans from data/plans.json. Renders into:
     [data-plans="monthly|prepaid|all"]  plan cards (optional data-cta-href)
     [data-plan-compare]                 side-by-side comparison table
     [data-plan-finder]                  4-question quiz that recommends a plan
     [data-plan-fineprint]               the shared plan disclaimer */

(function () {
  "use strict";

  var CONFIG = window.BW1_CONFIG || {};
  var STORES = (CONFIG.dataBase || "data/").replace(/data\/$/, "") + "stores.html";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function priceBlock(amount, per, note) {
    var wrap = el("div", "plan-price");
    var big = el("span", "amount", "$" + amount);
    var small = el("span", "per", per);
    wrap.appendChild(big);
    wrap.appendChild(small);
    var frag = document.createDocumentFragment();
    frag.appendChild(wrap);
    if (note) frag.appendChild(el("p", "plan-note", note));
    return frag;
  }

  function list(items) {
    var ul = el("ul", "feat");
    items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    return ul;
  }

  function monthlyCard(p, ctaHref) {
    var li = el("li", "plan");
    li.id = "plan-" + p.id;
    if (p.new_lines_only) li.appendChild(el("span", "tag tag-soft", "New lines only"));
    li.appendChild(el("h3", null, p.name));
    li.appendChild(priceBlock(p.autopay_price, "/mo.",
      "With AutoPay. $" + p.first_month + " first month."));
    li.appendChild(list(p.highlights));
    var a = el("a", "btn", "Get it in store");
    a.href = ctaHref || STORES;
    li.appendChild(a);
    return li;
  }

  function prepaidCard(p, ctaHref) {
    var li = el("li", "plan plan-prepaid");
    li.id = "plan-" + p.id;
    li.appendChild(el("span", "tag", "Pay upfront, save"));
    li.appendChild(el("h3", null, p.name));
    li.appendChild(priceBlock(p.per_month, "/mo.",
      "$" + p.total + " paid upfront for " + p.months + " months."));
    li.appendChild(list(p.highlights));
    var a = el("a", "btn", "Get it in store");
    a.href = ctaHref || STORES;
    li.appendChild(a);
    return li;
  }

  function renderCards(host, data) {
    var mode = host.getAttribute("data-plans") || "all";
    var cta = host.getAttribute("data-cta-href");
    var ul = el("ul", "plan-grid");
    if (mode !== "prepaid") data.monthly.forEach(function (p) { ul.appendChild(monthlyCard(p, cta)); });
    if (mode !== "monthly") data.prepaid.forEach(function (p) { ul.appendChild(prepaidCard(p, cta)); });
    host.innerHTML = "";
    host.appendChild(ul);
  }

  function renderCompare(host, data) {
    var rows = [
      ["Price with AutoPay", function (p) { return "$" + p.autopay_price + "/mo."; }],
      ["First month", function (p) { return "$" + p.first_month; }],
      ["High-speed data", function (p) { return p.compare.data; }],
      ["Mobile hotspot", function (p) { return p.compare.hotspot; }],
      ["Streaming", function (p) { return p.compare.streaming; }],
      ["Cloud storage", function (p) { return p.compare.cloud; }],
      ["International", function (p) { return p.compare.international; }],
      ["Who can get it", function (p) { return p.new_lines_only ? "New lines only" : "New and existing customers"; }]
    ];

    var scroller = el("div", "table-scroll");
    var table = el("table", "compare");
    var cap = el("caption", "skip", "Compare Cricket Wireless monthly plans");
    table.appendChild(cap);

    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", null, ""));
    data.monthly.forEach(function (p) {
      var th = el("th", null, p.name);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    rows.forEach(function (r) {
      var tr = el("tr");
      var th = el("th", null, r[0]);
      th.scope = "row";
      tr.appendChild(th);
      data.monthly.forEach(function (p) {
        var v = r[1](p);
        var td = el("td", null, v);
        if (v === "Not included") td.className = "muted";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroller.appendChild(table);
    host.innerHTML = "";
    host.appendChild(scroller);
  }

  /* ---------- Plan finder ---------- */

  var QUESTIONS = [
    { key: "usage", legend: "How do you use your phone most?", options: [
      ["light", "Calls, texts, some browsing"],
      ["everyday", "Social, music, maps every day"],
      ["heavy", "Streaming and gaming a lot"]
    ]},
    { key: "hotspot", legend: "Do you share your connection with a laptop or tablet?", options: [
      ["none", "Never"],
      ["some", "Sometimes"],
      ["lots", "All the time"]
    ]},
    { key: "intl", legend: "Do you call or text outside the U.S.?", options: [
      ["none", "No"],
      ["mxca", "Mexico or Canada"],
      ["world", "Other countries"]
    ]},
    { key: "pay", legend: "How would you like to pay?", options: [
      ["monthly", "Month to month"],
      ["upfront", "Pay upfront to save"]
    ]}
  ];

  function recommend(a, data) {
    var byId = {};
    data.monthly.concat(data.prepaid).forEach(function (p) { byId[p.id] = p; });
    var id, why = [];

    if (a.hotspot === "lots" || (a.usage === "heavy" && a.hotspot === "some")) {
      id = "supreme-unlimited";
      why.push("The biggest hotspot allowance for your laptop or tablet");
      why.push("Unlimited high-speed data for heavy streaming");
      why.push("HBO Max Basic with Ads is included");
    } else if (a.intl === "world" || a.hotspot === "some") {
      id = "smart-unlimited";
      if (a.intl === "world") why.push("Unlimited texts from the U.S. to 200+ countries");
      if (a.hotspot === "some") why.push("15GB of hotspot for when you need it");
      why.push("Unlimited data plus 100GB of cloud storage");
    } else if (a.pay === "upfront") {
      id = "twelve-month-unlimited";
      why.push("The lowest monthly cost when you pay for the year upfront");
      why.push("Unlimited data with no monthly bill to remember");
      why.push("Want a shorter commitment? Ask about the 3-month plan");
    } else if (a.usage === "light" && a.intl === "none") {
      id = "sensible-10gb";
      why.push("10GB covers calls, texts, browsing and light social");
      why.push("Our lowest-priced monthly plan");
    } else {
      id = "select-unlimited";
      why.push("Unlimited data at a low monthly price");
      if (a.intl === "mxca") why.push("Calls and texts to Mexico & Canada");
      why.push("Already a Cricket customer? Select is for new lines, so ask about Smart Unlimited");
    }

    if (a.pay === "upfront" && id.indexOf("month-unlimited") === -1) {
      why.push("Paying upfront? Ask in store whether a 3- or 12-month plan fits your needs");
    }
    return { plan: byId[id], why: why, prepaid: id.indexOf("month-unlimited") !== -1 };
  }

  function renderFinder(host, data) {
    var form = el("form", "quiz");
    form.noValidate = true;

    QUESTIONS.forEach(function (q, qi) {
      var fs = el("fieldset", "quiz-q");
      var lg = el("legend", null, (qi + 1) + ". " + q.legend);
      fs.appendChild(lg);
      var set = el("div", "pillset");
      q.options.forEach(function (o, oi) {
        var id = "pf-" + q.key + "-" + oi;
        var input = el("input");
        input.type = "radio";
        input.name = q.key;
        input.value = o[0];
        input.id = id;
        var label = el("label", "pill", o[1]);
        label.htmlFor = id;
        set.appendChild(input);
        set.appendChild(label);
      });
      fs.appendChild(set);
      form.appendChild(fs);
    });

    var submit = el("button", "btn", "Show my plan");
    submit.type = "submit";
    form.appendChild(submit);

    var msg = el("p", "quiz-msg");
    msg.setAttribute("role", "status");
    form.appendChild(msg);

    var result = el("div", "quiz-result");
    result.hidden = true;
    result.setAttribute("aria-live", "polite");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var answers = {}, missing = 0;
      QUESTIONS.forEach(function (q) {
        var picked = form.querySelector('input[name="' + q.key + '"]:checked');
        if (picked) answers[q.key] = picked.value; else missing++;
      });
      if (missing) {
        msg.textContent = "Answer all " + QUESTIONS.length + " questions to see your match.";
        return;
      }
      msg.textContent = "";

      var r = recommend(answers, data);
      result.innerHTML = "";
      result.appendChild(el("p", "eyebrow", "Your best match"));
      var ul = el("ul", "plan-grid plan-grid-single");
      ul.appendChild(r.prepaid ? prepaidCard(r.plan) : monthlyCard(r.plan));
      result.appendChild(ul);
      var whyBox = el("div", "quiz-why");
      whyBox.appendChild(el("h3", null, "Why this plan"));
      whyBox.appendChild(list(r.why));
      var more = el("a", null, "Compare every plan");
      more.href = STORES.replace("stores.html", "plans.html#compare");
      whyBox.appendChild(more);
      result.appendChild(whyBox);
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    host.innerHTML = "";
    var layout = el("div", "quiz-layout");
    layout.appendChild(form);
    layout.appendChild(result);
    host.appendChild(layout);
  }

  function init() {
    var cards = document.querySelectorAll("[data-plans]");
    var compare = document.querySelectorAll("[data-plan-compare]");
    var finder = document.querySelectorAll("[data-plan-finder]");
    var fine = document.querySelectorAll("[data-plan-fineprint]");
    if (!cards.length && !compare.length && !finder.length && !fine.length) return;

    fetch((CONFIG.dataBase || "data/") + "plans.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        cards.forEach(function (h) { renderCards(h, data); });
        compare.forEach(function (h) { renderCompare(h, data); });
        finder.forEach(function (h) { renderFinder(h, data); });
        fine.forEach(function (h) { h.textContent = data.fine_print; });
      })
      .catch(function () {
        [].concat([].slice.call(cards), [].slice.call(compare), [].slice.call(finder)).forEach(function (h) {
          h.innerHTML = "<p>Plans didn’t load. Call your nearest store for current plans.</p>";
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
