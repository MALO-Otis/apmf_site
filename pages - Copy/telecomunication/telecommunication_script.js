document.addEventListener('DOMContentLoaded', function() {
    // Données simulées
    const teleDoctors = [
        {
            id: 1,
            name: "Dr. Aïcha Ouédraogo",
            specialty: "Médecine générale",
            price: "5 000 FCFA",
            image: "icons/doctor1.jpg",
            available: true
        },
        {
            id: 2,
            name: "Dr. Paul Zongo",
            specialty: "Pédiatrie",
            price: "7 000 FCFA",
            image: "icons/doctor2.jpg",
            available: true
        },
        {
            id: 3,
            name: "Dr. Fatimata Nikiéma",
            specialty: "Gynécologie",
            price: "8 000 FCFA",
            image: "icons/doctor3.jpg",
            available: true
        }
    ];

    // Variables
    let currentStep = 1;
    let selectedDoctor = null;
    let selectedDateTime = null;
    const meetingDomain = "meet.jit.si";

    // Éléments DOM
    const formSteps = document.querySelectorAll('.form-step');
    const steps = document.querySelectorAll('.tele-steps .step');
    const nextBtn = document.getElementById('teleNextBtn');
    const prevBtn = document.getElementById('telePrevBtn');
    const teleDoctorsContainer = document.getElementById('teleDoctors');
    const teleTimeSlots = document.getElementById('teleTimeSlots');
    const simulatePayBtn = document.getElementById('simulatePay');
    const startConsultationBtn = document.getElementById('startConsultation');
    const meetingLink = document.getElementById('meetingLink');
    const chatInput = document.getElementById('chatInput');

    // Initialisation Flatpickr
    const teleDatePicker = flatpickr("#teleDatePicker", {
        locale: "fr",
        minDate: "today",
        dateFormat: "d/m/Y",
        disable: [
            function(date) {
                return (date.getDay() === 0); // Désactiver dimanche
            }
        ]
    });

    // Afficher les médecins
    function displayTeleDoctors() {
        teleDoctorsContainer.innerHTML = '';
        teleDoctors.forEach(doctor => {
            if (!doctor.available) return;

            const card = document.createElement('div');
            card.className = 'doctor-card';
            card.innerHTML = `
                <img src="${doctor.image}" alt="${doctor.name}">
                <h3>${doctor.name}</h3>
                <p class="specialty">${doctor.specialty}</p>
                <p>${doctor.price}</p>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedDoctor = doctor;
                nextBtn.disabled = false;
            });
            teleDoctorsContainer.appendChild(card);
        });
    }

    // Générer les créneaux horaires
    function generateTeleTimeSlots() {
        teleTimeSlots.innerHTML = '';
        const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        
        slots.forEach(slot => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = slot;
            timeSlot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                selectedDateTime = `${teleDatePicker.selectedDates[0].toLocaleDateString()} à ${slot}`;
                nextBtn.disabled = false;
            });
            teleTimeSlots.appendChild(timeSlot);
        });
    }

    // Générer un lien Jitsi aléatoire
    function generateMeetingLink() {
        const randomId = Math.random().toString(36).substring(2, 8);
        const roomName = `APMF-${selectedDoctor.id}-${randomId}`;
        return `https://${meetingDomain}/${roomName}`;
    }

    // Navigation
    function updateTeleSteps() {
        formSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.textContent) <= currentStep) {
                step.classList.add('active');
            }
        });

        prevBtn.disabled = currentStep === 1;
        nextBtn.style.display = currentStep === 4 ? 'none' : 'block';
    }

    nextBtn.addEventListener('click', function() {
        // Validation
        if (currentStep === 1 && !selectedDoctor) {
            alert("Veuillez sélectionner un médecin");
            return;
        } else if (currentStep === 2 && !selectedDateTime) {
            alert("Veuillez sélectionner un créneau");
            return;
        }

        currentStep++;
        updateTeleSteps();

        if (currentStep === 2) {
            generateTeleTimeSlots();
        } else if (currentStep === 3) {
            document.getElementById('summaryDoctor').textContent = selectedDoctor.name;
            document.getElementById('summaryDate').textContent = selectedDateTime;
        } else if (currentStep === 4) {
            meetingLink.href = generateMeetingLink();
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep <= 1) return;
        currentStep--;
        updateTeleSteps();
    });

    // Simulation paiement
    simulatePayBtn.addEventListener('click', function() {
        currentStep++;
        updateTeleSteps();
    });

    // Démarrer la consultation (Jitsi)
    startConsultationBtn.addEventListener('click', function() {
        const domain = meetingDomain;
        const options = {
            roomName: meetingLink.href.split('/').pop(),
            width: '100%',
            height: 500,
            parentNode: document.querySelector('.consultation-info')
        };
        
        // Intégration Jitsi
        const api = new JitsiMeetExternalAPI(domain, options);
        
        // Masquer le bouton après démarrage
        this.style.display = 'none';
    });

    // Chat simple
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            const chatMessages = document.querySelector('.chat-messages');
            const message = document.createElement('div');
            message.textContent = `Vous: ${this.value}`;
            chatMessages.appendChild(message);
            this.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    // Initialisation
    displayTeleDoctors();
    updateTeleSteps();
    nextBtn.disabled = true;
});