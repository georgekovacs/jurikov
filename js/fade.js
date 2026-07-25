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
