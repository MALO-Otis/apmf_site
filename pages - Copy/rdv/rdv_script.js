document.addEventListener('DOMContentLoaded', function() {
  // Données simulées (remplacer par un appel API réel)
  const doctors = {
      "generaliste": [
          { id: 1, name: "Dr. Jean Kaboré", specialty: "Médecin généraliste", price: "5 000 FCFA", image: "./../assets/images/doctor_female_home2.png", available: true },
          { id: 2, name: "Dr. Aïcha Ouédraogo", specialty: "Médecin généraliste", price: "5 000 FCFA", image: "./../assets/images/doctor_female_home.png", available: true }
      ],
      "pediatrie": [
          { id: 3, name: "Dr. Paul Zongo", specialty: "Pédiatre", price: "7 000 FCFA", image: "icons/doctor3.jpg", available: true }
      ],
      "gynecologie": [
          { id: 4, name: "Dr. Fatimata Nikiéma", specialty: "Gynécologue", price: "8 000 FCFA", image: "./../assets/images/doctor_female_home.png", available: false },
          { id: 5, name: "Dr. Aminata Sawadogo", specialty: "Gynécologue", price: "8 000 FCFA", image: "./../assets/images/doctor_female_home.png2", available: true }
      ]
  };

  // Variables globales
  let currentStep = 1;
  let selectedService = null;
  let selectedDoctor = null;
  let selectedDateTime = null;

  // Éléments DOM
  const formSteps = document.querySelectorAll('.form-step');
  const steps = document.querySelectorAll('.step');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const submitBtn = document.getElementById('submitBtn');
  const doctorList = document.getElementById('doctorList');
  const appointmentSummary = document.getElementById('appointmentSummary');
  const timeSlots = document.getElementById('timeSlots');

  // Flatpickr (calendrier)
  const dateTimePicker = flatpickr("#dateTimePicker", {
      enableTime: true,
      dateFormat: "d/m/Y H:i",
      minDate: "today",
      locale: "fr",
      time_24hr: true,
      disable: [
          function(date) {
              // Désactiver les dimanches
              return (date.getDay() === 0);
          }
      ]
  });

  // Gestion des étapes
  function updateFormSteps() {
      formSteps.forEach(step => {
          step.classList.remove('active');
          if (parseInt(step.dataset.step) === currentStep) {
              step.classList.add('active');
          }
      });

      steps.forEach(step => {
          step.classList.remove('active');
          if (parseInt(step.dataset.step) <= currentStep) {
              step.classList.add('active');
          }
      });

      prevBtn.disabled = currentStep === 1;
      nextBtn.style.display = currentStep === 4 ? 'none' : 'block';
      submitBtn.style.display = currentStep === 4 ? 'block' : 'none';
  }

  // Sélection du service
  document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', function() {
          document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          selectedService = this.dataset.service;
          nextBtn.disabled = false;
      });
  });

  // Afficher les médecins
  function displayDoctors() {
      if (!selectedService) return;

      doctorList.innerHTML = '';
      const availableDoctors = doctors[selectedService].filter(d => d.available);

      if (availableDoctors.length === 0) {
          doctorList.innerHTML = '<p class="no-doctor">Aucun médecin disponible pour ce service actuellement.</p>';
          nextBtn.disabled = true;
          return;
      }

      availableDoctors.forEach(doctor => {
          const doctorCard = document.createElement('div');
          doctorCard.className = 'doctor-card';
          doctorCard.innerHTML = `
              <img src="${doctor.image}" alt="${doctor.name}">
              <div class="doctor-info">
                  <h3>${doctor.name}</h3>
                  <p>${doctor.specialty} - ${doctor.price}</p>
              </div>
          `;
          doctorCard.addEventListener('click', function() {
              document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
              this.classList.add('selected');
              selectedDoctor = doctor;
              nextBtn.disabled = false;
          });
          doctorList.appendChild(doctorCard);
      });
  }

  // Générateur de créneaux horaires
  function generateTimeSlots() {
      timeSlots.innerHTML = '';
      const hours = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      
      hours.forEach(time => {
          const slot = document.createElement('div');
          slot.className = 'time-slot';
          slot.textContent = time;
          slot.addEventListener('click', function() {
              document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
              this.classList.add('selected');
              selectedDateTime = `${dateTimePicker.selectedDates[0].toLocaleDateString()} à ${time}`;
              updateSummary();
              nextBtn.disabled = false;
          });
          timeSlots.appendChild(slot);
      });
  }

  // Mise à jour du récapitulatif
  function updateSummary() {
      if (!selectedService || !selectedDoctor || !selectedDateTime) return;

      appointmentSummary.innerHTML = `
          <h3>Récapitulatif du rendez-vous</h3>
          <p><strong>Service:</strong> ${document.querySelector(`.service-card[data-service="${selectedService}"] h3`).textContent}</p>
          <p><strong>Médecin:</strong> ${selectedDoctor.name} (${selectedDoctor.specialty})</p>
          <p><strong>Date/heure:</strong> ${selectedDateTime}</p>
          <p><strong>Prix:</strong> ${selectedDoctor.price}</p>
      `;
  }

  // Navigation
  nextBtn.addEventListener('click', function() {
      if (currentStep >= 4) return;

      // Validation par étape
      if (currentStep === 1 && !selectedService) {
          alert("Veuillez sélectionner un service");
          return;
      } else if (currentStep === 2 && !selectedDoctor) {
          alert("Veuillez sélectionner un médecin");
          return;
      } else if (currentStep === 3 && !selectedDateTime) {
          alert("Veuillez sélectionner une date et heure");
          return;
      }

      currentStep++;
      updateFormSteps();

      if (currentStep === 2) {
          displayDoctors();
      } else if (currentStep === 3) {
          generateTimeSlots();
      } else if (currentStep === 4) {
          updateSummary();
      }
  });

  prevBtn.addEventListener('click', function() {
      if (currentStep <= 1) return;
      currentStep--;
      updateFormSteps();
  });

  // Soumission du formulaire
  document.getElementById('appointmentForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Ici, tu pourrais ajouter un appel AJAX pour envoyer les données au serveur
      alert("Rendez-vous confirmé ! Un email de confirmation vous sera envoyé.");
      
      // Réinitialiser le formulaire
      this.reset();
      currentStep = 1;
      updateFormSteps();
      selectedService = selectedDoctor = selectedDateTime = null;
  });

  // Initialisation
  updateFormSteps();
  nextBtn.disabled = true;

  // LOGIQUE DU MENU BURGER (responsive mobile)
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-menu");

menuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});


});