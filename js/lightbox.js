(function () {
  var lb = document.querySelector(".lightbox");
  if (!lb) return;
  var img = lb.querySelector("img");
  var cap = lb.querySelector("figcaption");
  var links = Array.prototype.slice.call(document.querySelectorAll(".grid a[data-idx], .stack a[data-idx]"));
  var idx = 0;
  var hideTimer = null;

  function setImage(a) {
    img.src = a.getAttribute("href");
    img.alt = a.getAttribute("data-caption") || "";
    cap.textContent = a.getAttribute("data-caption") || "";
  }

  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    clearTimeout(hideTimer);
    if (lb.hidden) {
      setImage(a);
      lb.hidden = false;
      setTimeout(function () { lb.classList.add("open"); }, 20);
    } else {
      // step between works: fade the image out, swap, fade back in
      img.style.opacity = "0";
      setTimeout(function () {
        setImage(a);
        var shown = false;
        var reveal = function () {
          if (shown) return;
          shown = true;
          img.onload = null;
          img.style.opacity = "1";
        };
        if (img.complete) {
          reveal();
        } else {
          img.onload = reveal;
          setTimeout(reveal, 400); // never leave the dialog stuck transparent
        }
      }, 150);
    }
    document.body.style.overflow = "hidden";
  }

  function hide() {
    lb.classList.remove("open");
    hideTimer = setTimeout(function () {
      lb.hidden = true;
      img.removeAttribute("src");
      img.style.opacity = "";
    }, 200);
    document.body.style.overflow = "";
  }

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      show(i);
    });
  });

  lb.querySelector(".lb-close").addEventListener("click", hide);
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) hide();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
})();
