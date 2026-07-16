/* ---------- CATEGORY → SUBCATEGORY MAP ---------- */

const categoryMap = {
  wildlife: ["birds", "fish","insects", "spiders"],
  landscape: ["flowers", "lakes", "mountains", "temples", "waterfall"],
  japanlife: ["home", "neighbourhood", "street"],
  architecture: ["churches", "daibutsu", "houses", "roads","towers"],
  martialarts: ["katana", "sumo"],
  all: []
};


/* =========================
   BASELINE GALLERY + LIGHTBOX
   ========================= */

/* ---------- CATEGORY FILTER ---------- */

const navButtons = document.querySelectorAll(".nav-btn");
const groups = document.querySelectorAll(".photo-group");
const subBar = document.querySelector(".subcategory-bar");
const aboutBtn = document.getElementById("aboutBtn");
const aboutSection = document.getElementById("about");

let HEADER_HEIGHT = 200;

function updateHeaderHeight() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const height = header.offsetHeight;
  document.documentElement.style.setProperty(
    "--header-height",
    height + "px"
  );

  HEADER_HEIGHT = height;
}

/* Run once on load */
updateHeaderHeight();

/* Run on resize & orientation change (mobile!) */
window.addEventListener("resize", updateHeaderHeight);
window.addEventListener("orientationchange", updateHeaderHeight);


function showSubBar() {
  subBar.style.display = "flex";
}

function hideSubBar() {
  subBar.style.display = "none";
  subBar.innerHTML = "";
}

function scrollToGalleryTop() {
  const hero = document.querySelector(".hero-section");
  if (!hero) return;
  const y = hero.offsetTop - HEADER_HEIGHT;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function highlightThumbnail(img) {
  if (!img) return;

  const photoItem = img.closest(".photo-item");

  if (!photoItem) return;

  photoItem.classList.remove("return-highlight");

  // Restart the animation
  void photoItem.offsetWidth;

  photoItem.classList.add("return-highlight");

  setTimeout(() => {
    photoItem.classList.remove("return-highlight");
  }, 4000);
}

/* Initial state */
hideSubBar();
groups.forEach(g => g.style.display = "");

const allButton = document.querySelector('.nav-btn[data-category="all"]');
allButton.classList.add("active");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;

    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    hideSubBar();

if (cat === "all") {
  groups.forEach(g => g.style.display = "");

  if (
    returnFromAboutThumb &&
    returnFromAboutCategory === "all"
  ) {

    returnFromAboutThumb.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    highlightThumbnail(returnFromAboutThumb);

    returnFromAboutThumb = null;
    returnFromAboutCategory = null;

  } else {

    scrollToGalleryTop();

  }

  return;
}

    groups.forEach(g => {
      g.style.display = g.classList.contains(cat) ? "" : "none";
    });

    const subcats = categoryMap[cat] || [];
    if (subcats.length) {
      showSubBar();

      subcats.forEach(sub => {
        const b = document.createElement("button");
        b.className = "sub-btn";
        b.textContent = sub[0].toUpperCase() + sub.slice(1);
        b.setAttribute("aria-label",`Show ${sub} photographs`);


        b.addEventListener("click", () => {
          document.querySelectorAll(".sub-btn").forEach(x => x.classList.remove("active"));
          b.classList.add("active");

          groups.forEach(g => {
            g.style.display =
              g.classList.contains(cat) && g.classList.contains(sub)
                ? ""
                : "none";
          });

          scrollToGalleryTop();
        });

        subBar.appendChild(b);
      });
    }

if (returnFromAboutThumb) {

  if (returnFromAboutCategory === btn.dataset.category) {

    returnFromAboutThumb.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    highlightThumbnail(returnFromAboutThumb);

  } else {

    scrollToGalleryTop();

  }

  // We've now used the remembered location,
  // so clear it regardless of which button was clicked.
  returnFromAboutThumb = null;
  returnFromAboutCategory = null;

} else {

  scrollToGalleryTop();

}
  });
});

/* ---------- LIGHTBOX (BASELINE) ---------- */
function refreshVisibleImages() {
  visibleImages = Array.from(
    document.querySelectorAll(".photo-item img")
  ).filter(img => img.offsetParent !== null);
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxAnnouncer = document.getElementById("lightbox-announcer");

function announce(message) {
  if (!lightboxAnnouncer) return;

  // Clear first to force re-announcement
  lightboxAnnouncer.textContent = "";

  setTimeout(() => {
    lightboxAnnouncer.textContent = message;
  }, 50);
}

const closeBtn = lightbox.querySelector(".close");

const focusableSelectors = `button, [role="button"], a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])`;

let focusableElements = [];
let firstFocusable = null;
let lastFocusable = null;

function trapFocusSetup() {
  focusableElements = Array.from(
    lightbox.querySelectorAll(focusableSelectors)
  ).filter(el => !el.hasAttribute("disabled"));

  firstFocusable = focusableElements[0];
  lastFocusable = focusableElements[focusableElements.length - 1];

  // Force screen readers into focus mode
  lightbox.setAttribute("tabindex", "-1");
  lightbox.focus();

  announce("Image viewer opened. Use arrow keys to navigate. Press Z to zoom.");
}


/* Click to zoom image */

let isZoomed = false;

lightboxImg.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleLightboxZoom();
});

function toggleLightboxZoom() {
  if (!lightbox.classList.contains("show")) return;

  isZoomed = !isZoomed;
  lightboxImg.classList.toggle("zoomed", isZoomed);

  // ARIA announcement
announce(isZoomed ? "Zoomed in" : "Zoomed out");
}

// Lightbox navigation state
let currentIndex = 0;
let visibleImages = [];
let lastFocusedThumb = null;
let currentImageElement = null;
let returnFromAboutThumb = null;
let returnFromAboutCategory = null;

document.querySelectorAll(".photo-item img").forEach(img => {

  // Make thumbnails focusable
  img.setAttribute("tabindex", "0");

  function openLightboxFromThumb() {
    lastFocusedThumb = img;
    currentImageElement = img;

    refreshVisibleImages();
    currentIndex = visibleImages.indexOf(img);

    lightboxImg.src = img.src;
    lightboxCaption.textContent =
      img.nextElementSibling?.textContent || "";

    lightbox.classList.add("show");
    document.body.classList.add("lightbox-open");
    trapFocusSetup();
  }

  // Mouse click
  img.addEventListener("click", openLightboxFromThumb);

  // Keyboard activation
  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // stop page scroll on Space
      openLightboxFromThumb();
    }
  });

});


closeBtn.addEventListener("click", closeLightbox);

/* Keyboard navigation */

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("show")) return;

  /* ENTER = activate focused lightbox control */
  if (e.key === "Enter" || e.key === " ") {
  const active = document.activeElement;

  if (
    active &&
    active.closest(".lightbox") &&
    active.getAttribute("role") === "button"
  ) {
    e.preventDefault(); // prevent page scroll on Space
    active.click();
  }
}


  /* Focus trap: keep Tab inside lightbox */
  if (e.key === "Tab") {
    if (focusableElements.length === 0) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  if (e.key === "ArrowRight") {
    showNext();
  }

  if (e.key === "ArrowLeft") {
    showPrev();
  }

  /* Z or + = toggle zoom */
  if (e.key === "z" || e.key === "Z" || e.key === "+") {
    e.preventDefault();
    toggleLightboxZoom();
  }

  if (e.key === "Escape") {
    closeLightbox();
  }
});



function showNext() {
  if (!visibleImages.length) return;
  currentIndex = (currentIndex + 1) % visibleImages.length;
  openAtCurrentIndex();
}

function showPrev() {
  if (!visibleImages.length) return;
  currentIndex =
    (currentIndex - 1 + visibleImages.length) % visibleImages.length;
  openAtCurrentIndex();
}

function openAtCurrentIndex() {
  const img = visibleImages[currentIndex];

  currentImageElement = img;

  isZoomed = false;
  lightboxImg.classList.remove("zoomed");

  lightboxImg.src = img.src;
  lightboxCaption.textContent =
    img.nextElementSibling?.textContent || "";

  // ARIA live announcement
announce(`Image ${currentIndex + 1} of ${visibleImages.length}`);
}

const nextBtn = lightbox.querySelector(".lightbox-next");
const prevBtn = lightbox.querySelector(".lightbox-prev");

/* Swipe support (tablet & mobile) */

let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener("touchstart", (e) => {
  if (!lightbox.classList.contains("show")) return;
  if (isZoomed) return; // don't swipe when zoomed

  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
  if (!lightbox.classList.contains("show")) return;
  if (isZoomed) return;

  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;

  // require intentional swipe
  if (Math.abs(swipeDistance) < 50) return;

  if (swipeDistance < 0) {
    showNext();
  } else {
    showPrev();
  }
}

function closeLightbox() {
  isZoomed = false;
  lightboxImg.classList.remove("zoomed");
  lightbox.classList.remove("show");

  document.body.classList.remove("lightbox-open");
  
if (currentImageElement) {

  returnFromAboutThumb = currentImageElement;

  const activeButton = document.querySelector(".nav-btn.active");
  returnFromAboutCategory =
    activeButton ? activeButton.dataset.category : "all";

  const photoItem = currentImageElement.closest(".photo-item");

  photoItem.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  document.querySelectorAll(".return-highlight").forEach(item => {
   item.classList.remove("return-highlight");
  });

  photoItem.classList.add("return-highlight");

  setTimeout(() => {
  photoItem.classList.remove("return-highlight");
  }, 4000);

}

  if (lastFocusedThumb) {
    lastFocusedThumb.focus();
    lastFocusedThumb = null;
  }
currentImageElement = null;
}



nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  showNext();
});

prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  showPrev();
});


lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

lightbox.addEventListener("mousedown", (e) => {
  if (e.target.matches('[role="button"]')) {
    e.preventDefault();
  }
});


window.addEventListener("load", () => {

  updateHeaderHeight();

  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

});

aboutBtn.addEventListener("click", () => {

  aboutSection.scrollIntoView({
    behavior: "auto",
    block: "start"
  });

});
