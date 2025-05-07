
  
  //menu btn
  document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menu-btn");
    const navMenu = document.getElementById("nav-menu");
  
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });


    document.getElementById("contactForm").addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Votre message a été envoyé avec succès !");
      this.reset();
    });
  });
