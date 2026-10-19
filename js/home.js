(function () {
  // Home index: on hover, each title fills with a mesh gradient built from the main colours
  // of one artwork in that gallery. Every hover uses the next artwork, so it is always different.
  // The image list is read from the gallery page itself, so it stays in sync with no upkeep.
  var list = document.querySelector(".index");
  if (!list || !window.matchMedia("(hover: hover)").matches) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function thumb(src) { return src.replace(/(\.[a-z0-9]+)$/i, "_t$1"); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function toHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, s = 0;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s, l];
  }

  // Dominant colours, ignoring white/near-white (so logos on white give their mark colours),
  // then capped in lightness so the letters always read on the white page.
  function palette(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        var W = 48, H = 48, c = document.createElement("canvas");
        c.width = W; c.height = H;
        var ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(im, 0, 0, W, H);
        var d = ctx.getImageData(0, 0, W, H).data, buckets = {};
        for (var i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          var r = d[i], g = d[i + 1], b = d[i + 2];
          if (r > 232 && g > 232 && b > 232) continue;
          var key = (r >> 5) + "," + (g >> 5) + "," + (b >> 5);
          var k = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
          k.n++; k.r += r; k.g += g; k.b += b;
        }
        // rank by area, weighted towards saturated colours so the vivid accents win over dull backgrounds
        var ranked = Object.keys(buckets).map(function (key) {
          var k = buckets[key], r = k.r / k.n, g = k.g / k.n, b = k.b / k.n;
          var sat = toHsl(r, g, b)[1];
          return [r, g, b, k.n * (0.2 + sat * sat * 3)];
        }).sort(function (a, b) { return b[3] - a[3]; });
        var picks = [];
        for (var j = 0; j < ranked.length && picks.length < 4; j++) {
          var c1 = ranked[j];
          var distinct = picks.every(function (p) {
            return Math.abs(p[0] - c1[0]) + Math.abs(p[1] - c1[1]) + Math.abs(p[2] - c1[2]) > 70;
          });
          if (distinct) picks.push(c1);
        }
        if (!picks.length) return resolve(null);
        resolve(picks.map(function (p) {
          var hsl = toHsl(p[0], p[1], p[2]);
          var s = Math.min(1, hsl[1] * 1.3), l = Math.max(0.16, Math.min(hsl[2], 0.5));
          return "hsl(" + hsl[0].toFixed(0) + " " + (s * 100).toFixed(0) + "% " + (l * 100).toFixed(0) + "%)";
        }));
      };
      im.onerror = function () { resolve(null); };
      im.src = src;
    });
  }

  function mesh(cs) {
    var c = [cs[0], cs[1] || cs[0], cs[2] || cs[1] || cs[0], cs[3] || cs[0]];
    var at = function () { return Math.round(Math.random() * 100) + "% " + Math.round(Math.random() * 100) + "%"; };
    return {
      color: c[0],
      image: "radial-gradient(at " + at() + ", " + c[1] + " 0, transparent 60%), " +
             "radial-gradient(at " + at() + ", " + c[2] + " 0, transparent 60%), " +
             "radial-gradient(at " + at() + ", " + c[3] + " 0, transparent 65%)"
    };
  }

  Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
    var fill = a.querySelector(".index__fill");
    var imgs = [a.getAttribute("data-img")], i = 0, ready = {};

    function colours(k) { return ready[k] || (ready[k] = palette(imgs[k])); }
    function apply() {
      colours(i).then(function (cs) {
        if (!cs) return;
        var m = mesh(cs);
        fill.style.backgroundColor = m.color;
        fill.style.backgroundImage = m.image;
      });
      colours((i + 1) % imgs.length); // prepare the next one before the next hover
    }
    function next() {
      if (imgs.length > 1) i = (i + 1) % imgs.length;
      apply();
    }

    apply();
    fetch(a.getAttribute("href"))
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var found = Array.prototype.map.call(doc.querySelectorAll(".stack a[data-idx]"), function (el) {
          return thumb(el.getAttribute("href"));
        });
        if (!found.length) return;
        imgs = shuffle(found); i = 0; ready = {}; // random start, so every visit differs
        apply();
      })
      .catch(function () {});

    // Swap only once the gradient has fully wiped back out, so the change is never visible.
    fill.addEventListener("transitionend", function (e) {
      if (e.propertyName === "clip-path" && !a.matches(":hover") && document.activeElement !== a) next();
    });
    if (reduced) {
      a.addEventListener("mouseleave", next);
      a.addEventListener("blur", next);
    }
  });
})();
