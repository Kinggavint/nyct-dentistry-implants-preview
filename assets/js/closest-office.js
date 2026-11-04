/* Which office is closest to me? Geocodes the typed address with OpenStreetMap Nominatim
   and gets drive times from the public OSRM router. Nothing is stored. */
(function () {
  var OFFICES = [
    { id: "stamford", name: "Stamford, CT", addr: "800 E Main St, Stamford, CT 06902", lat: 41.0554070, lon: -73.5295140, tel: "203-883-4451" },
    { id: "kent", name: "Kent, CT", addr: "70 Maple St, Kent, CT 06757", lat: 41.7182155, lon: -73.4733096, tel: "860-927-3577" },
    { id: "mount-kisco", name: "Mount Kisco, NY", addr: "39 Smith Ave, Rear LL, Mount Kisco, NY 10549", lat: 41.2002217, lon: -73.7272889, tel: "914-666-5225" }
  ];
  var T = {
    en: { busy: "Checking drive times...", empty: "Please enter your address or ZIP code.", nf: "We could not find that address. Try adding a city and state, or a ZIP code. You can still use the directions links below.", fail: "Drive times are not available right now. Use the directions links below for live times.", closest: "Closest", min: "min drive", mi: "mi", dir: "Get directions", call: "Call" },
    es: { busy: "Calculando tiempos de manejo...", empty: "Escriba su dirección o código postal.", nf: "No encontramos esa dirección. Agregue ciudad y estado, o un código postal. Puede usar los enlaces de direcciones abajo.", fail: "Los tiempos de manejo no están disponibles ahora. Use los enlaces de direcciones abajo para ver tiempos en vivo.", closest: "Más cercano", min: "min en auto", mi: "mi", dir: "Cómo llegar", call: "Llame" }
  };
  function dirUrl(origin, o) {
    return "https://www.google.com/maps/dir/?api=1&travelmode=driving" + (origin ? "&origin=" + encodeURIComponent(origin) : "") + "&destination=" + encodeURIComponent(o.addr);
  }
  function render(box, t, origin, times) {
    var list = box.querySelector("[data-co-results]");
    var rows = OFFICES.map(function (o, i) { return { o: o, d: times ? times[i] : null }; });
    if (times) rows.sort(function (a, b) { return (a.d ? a.d.s : 1e12) - (b.d ? b.d.s : 1e12); });
    list.innerHTML = "";
    rows.forEach(function (r, i) {
      var li = document.createElement("li");
      li.className = "co-row" + (times && i === 0 && r.d ? " is-closest" : "");
      var time = r.d ? '<span class="co-time">' + Math.max(1, Math.round(r.d.s / 60)) + " " + t.min + (r.d.m ? " &middot; " + (r.d.m / 1609.34).toFixed(1) + " " + t.mi : "") + "</span>" : "";
      li.innerHTML = '<div class="co-office"><strong>' + r.o.name + "</strong>" + (times && i === 0 && r.d ? ' <span class="co-badge">' + t.closest + "</span>" : "") + "<span>" + r.o.addr + "</span>" + time + "</div>" +
        '<div class="co-actions"><a class="button button-small" href="' + dirUrl(origin, r.o) + '" target="_blank" rel="noopener">' + t.dir + '</a><a class="button button-small button-ghost" href="tel:' + r.o.tel.replace(/-/g, "") + '">' + t.call + " " + r.o.tel + "</a></div>";
      list.appendChild(li);
    });
  }
  var STATES = {AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"};
  function norm(q) {
    return q.replace(/[,\s]+(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\.?(\s+\d{5}(-\d{4})?)?\s*$/i, function (m, st, zip) {
      return ", " + STATES[st.toUpperCase()] + (zip || "");
    });
  }
  function near(lat, lon) {
    var R = 3958.8, k = Math.PI / 180;
    return OFFICES.some(function (o) {
      var dLa = (o.lat - lat) * k, dLo = (o.lon - lon) * k;
      var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(lat * k) * Math.cos(o.lat * k) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
      return 2 * R * Math.asin(Math.sqrt(a)) <= 100;
    });
  }
  function init(box) {
    var lang = (document.documentElement.lang || "en").slice(0, 2) === "es" ? "es" : "en";
    var t = T[lang], form = box.querySelector("form"), input = box.querySelector("input"), status = box.querySelector("[data-co-status]");
    render(box, t, "", null);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (input.value || "").trim();
      if (!q) { status.textContent = t.empty; input.focus(); return; }
      status.textContent = t.busy;
      render(box, t, q, null);
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
      var opt = { referrerPolicy: "origin", credentials: "omit" };
      if (ctl) opt.signal = ctl.signal;
      fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&viewbox=-74.3,42.1,-71.7,40.5&bounded=1&accept-language=" + lang + "&q=" + encodeURIComponent(norm(q)), opt)
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (g) {
          if (!g || !g.length || !near(+g[0].lat, +g[0].lon)) { status.textContent = t.nf; render(box, t, "", null); return null; }
          var pts = [g[0].lon + "," + g[0].lat].concat(OFFICES.map(function (o) { return o.lon + "," + o.lat; })).join(";");
          return fetch("https://router.project-osrm.org/table/v1/driving/" + pts + "?sources=0&annotations=duration,distance", opt)
            .then(function (r) { if (!r.ok) throw 0; return r.json(); })
            .then(function (d) {
              if (d.code !== "Ok") throw 0;
              var times = OFFICES.map(function (o, i) { var s = d.durations[0][i + 1]; return s == null ? null : { s: s, m: d.distances ? d.distances[0][i + 1] : null }; });
              if (times.every(function (x) { return !x; })) throw 0;
              status.textContent = "";
              render(box, t, q, times);
            });
        })
        .catch(function () { status.textContent = t.fail; })
        .then(function () { clearTimeout(timer); });
    });
  }
  function go() { Array.prototype.forEach.call(document.querySelectorAll("[data-closest-office]"), init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
