(function () {
  // fade out before navigating to another page of the site
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a || a.target || a.hasAttribute("download")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (a.closest(".grid") || a.closest(".stack")) return; // lightbox handles these
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(function () { location.href = url.href; }, 180);
  });

  // restore when coming back via bfcache
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("leaving");
  });

  // header: frosted once scrolled, hides on scroll down, returns on scroll up (as on georgekovacs.me)
  var header = document.querySelector(".top");
  if (header) {
    var lastY = window.scrollY;
    var setHeight = function () {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    };
    var onScroll = function () {
      var y = Math.max(0, window.scrollY);
      var dy = y - lastY;
      header.classList.toggle("is-scrolled", y > 8);
      if (dy > 4 && y > header.offsetHeight) header.classList.add("is-hidden");
      else if (dy < -4 || y <= header.offsetHeight) header.classList.remove("is-hidden");
      lastY = y;
    };
    setHeight();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setHeight, { passive: true });
  }

  // copy email to clipboard (footer button), fall back to mailto
  function legacyCopy(value) {
    var f = document.createElement("textarea");
    f.value = value; f.setAttribute("readonly", "");
    f.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(f); f.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    f.remove();
    return ok;
  }
  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).then(function () { return true; }, function () { return legacyCopy(value); });
    }
    return Promise.resolve(legacyCopy(value));
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var timer;
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      copyText(value).then(function (ok) {
        if (!ok) { location.href = "mailto:" + value; return; }
        btn.classList.add("is-copied");
        clearTimeout(timer);
        timer = setTimeout(function () { btn.classList.remove("is-copied"); }, 2000);
      });
    });
  });

  // fade images in and out as they scroll through the viewport
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle("inview", en.isIntersecting);
      });
    }, { threshold: 0.08 });
    var imgs = document.querySelectorAll(".card img, .signature img");
    Array.prototype.forEach.call(imgs, function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }
})();
