document.addEventListener("DOMContentLoaded", function () {
  // SLIDER HERO AUTOMATIQUE
  const slides = document.querySelectorAll(".fade-slide");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === index) slide.classList.add("active");
    });
  }

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 4000); // toutes les 4 secondes

  // Animation d'apparition au scroll
  const scrollElements = document.querySelectorAll(".scroll-fade");

  const elementInView = (el, offset = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop <= window.innerHeight - offset;
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el)) {
        el.classList.add("scrolled");
      } else {
        el.classList.remove("scrolled");
      }
    });
  };

  window.addEventListener("scroll", handleScrollAnimation);
  window.addEventListener("load", handleScrollAnimation); // pour détecter les éléments visibles dès le chargement

  // Hover button animation (optionnel)
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.classList.add("hovered");
    });
    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("hovered");
    });
  });

  // LOGIQUE DU MENU BURGER (responsive mobile)
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-menu");

menuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});



});
