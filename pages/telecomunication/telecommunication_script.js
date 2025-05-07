/**
 * Téléconsultation APMF - Script principal
 * Gère le flux de réservation, la sélection des options et l'intégration Jitsi Meet
 */

document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // 1. CONFIGURATION INITIALE
    // =============================================
    
    const config = {
        // Configuration Jitsi
        jitsiDomain: 'meet.jit.si',
        defaultRoomOptions: {
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#jitsi-meet'),
            roomName: '',
            userInfo: {
                email: '',
                displayName: ''
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'hangup', 'profile', 'chat', 'recording', 'livestreaming',
                    'settings', 'raisehand', 'videoquality', 'filmstrip', 'invite',
                    'feedback', 'stats', 'shortcuts', 'tileview', 'help'
                ]
            }
        },
        
        // Données des médecins (simulées - à remplacer par un appel API en production)
        doctors: {
            "generaliste": [
                { 
                    id: 1,
    name: "Dr. Jean Kaboré",
    specialty: "Médecin généraliste",
    price: 5000,
    avatar: "img/doctors/doctor1.jpg",
    workingDays: [1, 2, 3, 4, 5], // Lundi=1 à Dimanche=7
    unavailableDates: ["2023-12-25", "2024-01-01"], // Dates spécifiques indisponibles
    bookedSlots: {
        "2023-11-15": ["08:00", "09:30", "14:00"],
        "2023-11-16": ["10:00", "15:00"]
    }
                },
                { 
                    id: 2,
    name: "Dr. Aïcha Zongo",
    specialty: "Médecin généraliste",
    price: 7000,
    avatar: "img/doctors/doctor1.jpg",
    workingDays: [1, 2, 3, 4, 5], // Lundi=1 à Dimanche=7
    unavailableDates: ["2023-12-25", "2024-01-01"], // Dates spécifiques indisponibles
    bookedSlots: {
        "2023-11-15": ["08:00", "09:30", "14:00"],
        "2023-11-16": ["10:00", "15:00"]
    }
                }
            ],
            "pediatrie": [
                { 
                    id: 3,
                    name: "Dr. Alimata Sanou",
                    specialty: "Pédiatre",
                    price: 5000,
                    avatar: "img/doctors/doctor1.jpg",
                    workingDays: [1, 2, 3, 4, 5], // Lundi=1 à Dimanche=7
                    unavailableDates: ["2023-12-25", "2024-01-01"], // Dates spécifiques indisponibles
                    bookedSlots: {
                        "2023-11-15": ["08:00", "09:30", "14:00"],
                        "2023-11-16": ["10:00", "15:00"]
                    }
                }
            ],
            "cardiologie": [
                { 
                    id: 4,
    name: "Dr. Jean Kaboré",
    specialty: "Cardiologue",
    price: 5000,
    avatar: "img/doctors/doctor1.jpg",
    workingDays: [1, 2, 3, 4, 5], // Lundi=1 à Dimanche=7
    unavailableDates: ["2023-12-25", "2024-01-01"], // Dates spécifiques indisponibles
    bookedSlots: {
        "2023-11-15": ["08:00", "09:30", "14:00"],
        "2023-11-16": ["10:00", "15:00"]
    }
                }
            ]
        },
        
        // Configuration des services
        services: {
            "generaliste": { name: "Médecine générale", duration: 30 },
            "pediatrie": { name: "Pédiatrie", duration: 30 },
            "cardiologie": { name: "Cardiologie", duration: 45 }
        },
        
        // Méthodes de paiement
        paymentMethods: {
            "orange": { name: "Orange Money", icon: "icons/orange-money.png" },
            "mtn": { name: "MTN MoMo", icon: "icons/mtn-momo.png" },
            "wave": { name: "Wave", icon: "icons/wave.png" },
            "card": { name: "Carte bancaire", icon: "far fa-credit-card" }
        },


        // Ajouter cette méthode pour générer les créneaux standards
    generateTimeSlots: function(startHour = 8, endHour = 22, interval = 30) {
        if (!state.selectedDoctor || !state.selectedDate) return;
        const slots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    }

    };
    

    // =============================================
// 3. NOUVELLES FONCTIONS UTILITAIRES
// =============================================

function isDoctorAvailable(doctor, dateStr) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay() + 1; // JS: Dimanche=0, on ajuste à Lundi=1
    
    // 1. Vérifier si c'est un jour de travail
    if (!doctor.workingDays.includes(dayOfWeek)) return false;
    
    // 2. Vérifier les dates spécifiques indisponibles
    return !(doctor.unavailableDates.includes(dateStr));
}

function getAvailableSlots(doctor, dateStr) {
    if (!isDoctorAvailable(doctor, dateStr)) return [];
    
    // Générer tous les créneaux possibles
    const allSlots = config.generateTimeSlots();
    
    // Récupérer les créneaux déjà réservés
    const bookedSlots = doctor.bookedSlots[dateStr] || [];
    
    // Filtrer pour garder seulement les disponibles
    return allSlots.filter(slot => !bookedSlots.includes(slot));
};

    // =============================================
    // 2. ÉTAT DE L'APPLICATION
    // =============================================
    
    let state = {
        currentStep: 1,
        selectedService: null,
        selectedDoctor: null,
        selectedDate: null,
        selectedTime: null,
        paymentMethod: "orange",
        jitsiApi: null,
        meetingLink: "",
        patientInfo: {
            name: "",
            phone: "",
            email: ""
        }
    };

    // =============================================
    // 3. RÉFÉRENCES AUX ÉLÉMENTS DOM
    // =============================================
    
    const elements = {
        // Conteneurs d'étapes
        stepContainers: document.querySelectorAll('.step-container'),
        
        // Boutons de navigation
        nextButtons: document.querySelectorAll('.next-btn'),
        prevButtons: document.querySelectorAll('.prev-btn'),
        confirmBtn: document.getElementById('confirmPaymentBtn'),
        launchBtn: document.getElementById('launchConsultationBtn'),
        endBtn: document.getElementById('endConsultationBtn'),
        copyLinkBtn: document.getElementById('copyLinkBtn'),
        
        // Sélection de service
        serviceCards: document.querySelectorAll('.service-card'),
        
        // Sélection de médecin
        doctorGrid: document.getElementById('doctorGrid'),
        doctorSearch: document.querySelector('.search-box input'),
        availabilityFilter: document.querySelector('.availability-filter input'),
        
        // Sélection de créneau
        datePicker: document.getElementById('datePicker'),
        timeSlotsGrid: document.getElementById('timeSlotsGrid'),
        selectedDateDisplay: document.getElementById('selectedDateDisplay'),
        
        // Récapitulatif
        summaryService: document.getElementById('summaryService'),
        summaryDoctor: document.getElementById('summaryDoctor'),
        summaryDate: document.getElementById('summaryDate'),
        summaryPrice: document.getElementById('summaryPrice'),
        
        // Informations patient
        patientName: document.getElementById('patientName'),
        patientPhone: document.getElementById('patientPhone'),
        patientEmail: document.getElementById('patientEmail'),
        
        // Paiement
        paymentOptions: document.querySelectorAll('.payment-option'),
        paymentDetails: document.getElementById('orangeDetails'),
        
        // Confirmation
        confirmationEmail: document.getElementById('confirmationEmail'),
        meetingLinkDisplay: document.getElementById('meetingLink'),
        
        // Interface Jitsi
        jitsiContainer: document.getElementById('jitsiMeetingContainer'),
        preConsultation: document.getElementById('preConsultation'),
        postConsultation: document.getElementById('postConsultation')
    };

    // =============================================
    // 4. INITIALISATION DE L'APPLICATION
    // =============================================
    
    function initApp() {
        // Initialiser Flatpickr pour le sélecteur de date
        flatpickr(elements.datePicker, {
            locale: "fr",
            minDate: "today",
            disable: [
                function(date) {
                    // Désactiver les dimanches
                    return (date.getDay() === 0);
                }
            ],
            onChange: handleDateSelection
        });
        
        // Écouteurs d'événements
        setupEventListeners();
        
        // Afficher la première étape
        showStep(1);
    }

    // =============================================
    // 5. GESTION DES ÉTAPES
    // =============================================
    
    function showStep(stepNumber) {
        // Masquer toutes les étapes
        elements.stepContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        // Afficher l'étape courante
        const currentStep = document.querySelector(`.step-container[data-step="${stepNumber}"]`);
        if (currentStep) {
            currentStep.style.display = 'block';
            state.currentStep = stepNumber;
            
            // Mettre à jour les indicateurs de progression
            updateProgressIndicators(stepNumber);
            
            // Désactiver les boutons "Suivant" par défaut
            toggleNextButton(false);
            
            // Actions spécifiques à chaque étape
            switch(stepNumber) {
                case 2:
                    if (state.selectedService) {
                        loadDoctors(state.selectedService);
                    }
                    break;
                case 3:
                    if (state.selectedDoctor) {
                        updateSelectedDateDisplay();
                    }
                    break;
                case 4:
                    updateSummary();
                    break;
            }
        }
    }
    
    function updateProgressIndicators(currentStep) {
        const indicators = document.querySelectorAll('.indicator, .indicator-line');
        
        indicators.forEach(indicator => {
            const step = parseInt(indicator.textContent) || parseInt(indicator.dataset.step);
            
            if (step < currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (step === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
    }
    
    function goToNextStep() {
        if (state.currentStep < 5) {
            showStep(state.currentStep + 1);
        }
    }
    
    function goToPrevStep() {
        if (state.currentStep > 1) {
            showStep(state.currentStep - 1);
        }
    }

    // =============================================
    // 6. SÉLECTION DU SERVICE
    // =============================================
    
    function setupServiceSelection() {
        elements.serviceCards.forEach(card => {
            card.addEventListener('click', function() {
                // Désélectionner toutes les cartes
                elements.serviceCards.forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Sélectionner la carte cliquée
                this.classList.add('selected');
                state.selectedService = this.dataset.service;
                
                // Activer le bouton "Suivant"
                toggleNextButton(true);
            });
        });
    }

    // =============================================
    // 7. SÉLECTION DU MÉDECIN
    // =============================================
    
    function loadDoctors(service) {
        // Effacer la grille actuelle
        elements.doctorGrid.innerHTML = '';
        
        // Filtrer les médecins disponibles
        const availableDoctors = config.doctors[service].filter(doctor => {
            // Filtrer par disponibilité si le filtre est activé
            if (elements.availabilityFilter.checked) {
                const today = new Date().toISOString().split('T')[0];
                return getAvailableSlots(doctor, today).length > 0;
            }
            return true;
        });
        
        // Filtrer par recherche textuelle
        const searchTerm = elements.doctorSearch.value.toLowerCase();
        const filteredDoctors = searchTerm 
            ? availableDoctors.filter(doctor => 
                doctor.name.toLowerCase().includes(searchTerm) || 
                doctor.specialty.toLowerCase().includes(searchTerm))
            : availableDoctors;
        
        // Afficher les médecins
        if (filteredDoctors.length === 0) {
            elements.doctorGrid.innerHTML = `
                <div class="no-doctors">
                    <i class="fas fa-user-md"></i>
                    <p>Aucun médecin disponible pour les critères sélectionnés</p>
                </div>
            `;
            return;
        }
        
        filteredDoctors.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';
            doctorCard.innerHTML = `
                <img src="${doctor.avatar}" alt="${doctor.name}" class="doctor-avatar">
                <div class="doctor-info">
                    <h4>${doctor.name}</h4>
                    <p class="doctor-specialty">${doctor.specialty}</p>
                    <p class="doctor-price">${doctor.price.toLocaleString()} FCFA</p>
                    <p class="doctor-availability">
                        <i class="fas fa-check-circle"></i> Disponible aujourd'hui
                    </p>
                </div>
            `;
            
            doctorCard.addEventListener('click', () => {
                // Désélectionner toutes les cartes
                document.querySelectorAll('.doctor-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Sélectionner ce médecin
                doctorCard.classList.add('selected');
                state.selectedDoctor = doctor;
                
                // Activer le bouton "Suivant"
                toggleNextButton(true);
            });
            
            elements.doctorGrid.appendChild(doctorCard);
        });
    }
    
    function setupDoctorFilters() {
        
        // Recherche de médecin
        elements.doctorSearch.addEventListener('input', () => {
            if (state.selectedService) {
                loadDoctors(state.selectedService);
            }
        });
        
        // Filtre de disponibilité
        elements.availabilityFilter.addEventListener('change', () => {
            if (state.selectedService) {
                loadDoctors(state.selectedService);
            }
        });

        let searchTimeout;
elements.doctorSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (state.selectedService) loadDoctors(state.selectedService);
    }, 300);
});
    }

    // =============================================
    // 8. SÉLECTION DU CRÉNEAU HORAIRE
    // =============================================
    
    // function handleDateSelection(selectedDates, dateStr) {
    //     state.selectedDate = dateStr;
    //     updateSelectedDateDisplay();
    //     generateTimeSlots();
    // }
    
    // function updateSelectedDateDisplay() {
    //     if (state.selectedDate && state.selectedDoctor) {
    //         const dateObj = new Date(state.selectedDate);
    //         const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    //         const formattedDate = dateObj.toLocaleDateString('fr-FR', options);
            
    //         elements.selectedDateDisplay.textContent = `Disponibilités pour le ${formattedDate}`;
    //     }
    // }
    
    // function generateTimeSlots() {
    //     elements.timeSlotsGrid.innerHTML = '';
        
    //     if (!state.selectedDate || !state.selectedDoctor) return;
        
    //     const availableSlots = state.selectedDoctor.schedule[state.selectedDate] || [];
        
    //     if (availableSlots.length === 0) {
    //         elements.timeSlotsGrid.innerHTML = `
    //             <div class="no-slots">
    //                 <i class="far fa-calendar-times"></i>
    //                 <p>Aucun créneau disponible pour cette date</p>
    //             </div>
    //         `;
    //         toggleNextButton(false);
    //         return;
    //     }
        
    //     availableSlots.forEach(slot => {
    //         const timeSlot = document.createElement('div');
    //         timeSlot.className = 'time-slot';
    //         timeSlot.textContent = slot;
            
    //         timeSlot.addEventListener('click', () => {
    //             // Désélectionner tous les créneaux
    //             document.querySelectorAll('.time-slot').forEach(s => {
    //                 s.classList.remove('selected');
    //             });
                
    //             // Sélectionner ce créneau
    //             timeSlot.classList.add('selected');
    //             state.selectedTime = slot;
                
    //             // Activer le bouton "Suivant"
    //             toggleNextButton(true);
    //         });
            
    //         elements.timeSlotsGrid.appendChild(timeSlot);
    //     });
    // }

    // =============================================
// 4. MODIFICATION DE LA GESTION DES CRÉNEAUX
// =============================================

function handleDateSelection(selectedDates, dateStr) {
    state.selectedDate = dateStr;
    updateSelectedDateDisplay();
    generateTimeSlots();
}

function updateSelectedDateDisplay() {
    if (state.selectedDate && state.selectedDoctor) {
        const dateObj = new Date(state.selectedDate);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('fr-FR', options);
        
        elements.selectedDateDisplay.textContent = `Disponibilités pour le ${formattedDate}`;
        
        // Activer/désactiver les boutons de date rapide
        document.querySelectorAll('.date-option-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.offset === "0" && isToday(state.selectedDate)) {
                btn.classList.add('active');
            } else if (btn.dataset.offset === "1" && isTomorrow(state.selectedDate)) {
                btn.classList.add('active');
            }
        });
    }
}

function isToday(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
}

function isTomorrow(dateStr) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === tomorrow.toISOString().split('T')[0];
}

function generateTimeSlots() {
    elements.timeSlotsGrid.innerHTML = '';
    
    if (!state.selectedDate || !state.selectedDoctor) return;
    
    // Vérifier si le médecin est disponible ce jour-là
    if (!isDoctorAvailable(state.selectedDoctor, state.selectedDate)) {
        elements.timeSlotsGrid.innerHTML = `
            <div class="no-slots">
                <i class="far fa-calendar-times"></i>
                <p>Le médecin n'est pas disponible cette journée</p>
            </div>
        `;
        toggleNextButton(false);
        return;
    }
    
    // Générer les créneaux disponibles
    const availableSlots = getAvailableSlots(state.selectedDoctor, state.selectedDate);
    
    if (availableSlots.length === 0) {
        elements.timeSlotsGrid.innerHTML = `
            <div class="no-slots">
                <i class="fas fa-calendar-day"></i>
                <p>Tous les créneaux sont réservés pour cette date</p>
            </div>
        `;
        toggleNextButton(false);
        return;
    }
    
    // Afficher tous les créneaux (disponibles et réservés)
    const allSlots = config.generateTimeSlots();
    const bookedSlots = state.selectedDoctor.bookedSlots[state.selectedDate] || [];
    
    allSlots.forEach(slot => {
        const isBooked = bookedSlots.includes(slot);
        const isAvailable = availableSlots.includes(slot);
        
        const timeSlot = document.createElement('div');
        timeSlot.className = `time-slot ${isBooked ? 'booked' : ''} ${isAvailable ? 'available' : ''}`;
        timeSlot.textContent = slot;
        
        if (isAvailable) {
            timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, slot));
        } else {
            timeSlot.title = "Créneau déjà réservé";
        }
        
        elements.timeSlotsGrid.appendChild(timeSlot);
    });
}

function selectTimeSlot(element, slot) {
    // Désélectionner tous les créneaux
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });
    
    // Sélectionner ce créneau
    element.classList.add('selected');
    state.selectedTime = slot;
    
    // Activer le bouton "Suivant"
    toggleNextButton(true);
}

    // =============================================
    // 9. PAIEMENT ET CONFIRMATION
    // =============================================
    
    function setupPaymentMethods() {
        elements.paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Désélectionner toutes les options
                elements.paymentOptions.forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Sélectionner cette option
                option.classList.add('selected');
                state.paymentMethod = option.dataset.method;
                
                // Afficher les détails de paiement correspondants
                showPaymentDetails(state.paymentMethod);
            });
        });
    }
    
    function showPaymentDetails(method) {
        // Masquer tous les détails
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.style.display = 'none';
        });
        
        // Afficher les détails correspondants
        const detailsId = `${method}Details`;
        const detailsElement = document.getElementById(detailsId);
        if (detailsElement) {
            detailsElement.style.display = 'block';
        }
    }
    
    function updateSummary() {
        if (state.selectedService && state.selectedDoctor && state.selectedDate && state.selectedTime) {
            // Formater la date
            const dateObj = new Date(state.selectedDate);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            
            // Mettre à jour le récapitulatif
            elements.summaryService.textContent = config.services[state.selectedService].name;
            elements.summaryDoctor.textContent = state.selectedDoctor.name;
            elements.summaryDate.textContent = `${formattedDate} à ${state.selectedTime}`;
            elements.summaryPrice.textContent = `${state.selectedDoctor.price.toLocaleString()} FCFA`;
            
            // Mettre à jour les informations du patient
            state.patientInfo = {
                name: elements.patientName.value,
                phone: elements.patientPhone.value,
                email: elements.patientEmail.value
            };
            
            // Vérifier si le formulaire est complet
            const isFormComplete = elements.patientName.value && 
                                 elements.patientPhone.value && 
                                 document.getElementById('acceptTerms').checked;
            
            // Activer/désactiver le bouton de confirmation
            elements.confirmBtn.disabled = !isFormComplete;
        }
    }
    
    function confirmAppointment() {
        // Générer un ID unique pour la consultation
        const consultationId = generateConsultationId();
        
        // Créer le lien Jitsi
        state.meetingLink = `https://${config.jitsiDomain}/${consultationId}`;
        
        // Mettre à jour l'affichage
        elements.meetingLinkDisplay.textContent = state.meetingLink;
        elements.confirmationEmail.textContent = state.patientInfo.email || "aucun email fourni";
        
        // Envoyer les données au backend (simulé)
        sendAppointmentData({
            consultationId,
            service: state.selectedService,
            doctor: state.selectedDoctor.id,
            date: state.selectedDate,
            time: state.selectedTime,
            patient: state.patientInfo,
            paymentMethod: state.paymentMethod,
            meetingLink: state.meetingLink
        });
        
        // Passer à l'étape de confirmation
        showStep(5);
    }
    
    function generateConsultationId() {
        // Générer un ID unique (à remplacer par un ID généré côté serveur en production)
        const prefix = 'apmf-consult-';
        const randomString = Math.random().toString(36).substring(2, 8);
        return prefix + randomString;
    }
    
    function sendAppointmentData(data) {
        // Simuler l'envoi au backend
        console.log("Données envoyées au backend:", data);
        
        // En production, tu utiliserais fetch() :
        /*
        fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        */
    }

    // =============================================
    // 10. INTÉGRATION JITSI MEET
    // =============================================
    
    function launchConsultation() {
        // Masquer l'interface de confirmation
        elements.preConsultation.style.display = 'none';
        elements.postConsultation.style.display = 'none';
        
        // Afficher le conteneur Jitsi
        elements.jitsiContainer.style.display = 'flex';
        
        // Charger l'API Jitsi dynamiquement
        const script = document.createElement('script');
        script.src = `https://${config.jitsiDomain}/external_api.js`;
        script.onload = initializeJitsi;
        document.body.appendChild(script);
    }
    
    function initializeJitsi() {
        // Configurer les options de la salle
        const options = {
            ...config.defaultRoomOptions,
            roomName: state.meetingLink.split('/').pop(),
            userInfo: {
                email: state.patientInfo.email,
                displayName: state.patientInfo.name
            }
        };
        
        // Initialiser l'API Jitsi
        state.jitsiApi = new JitsiMeetExternalAPI(config.jitsiDomain, options);
        
        // Écouteurs d'événements
        state.jitsiApi.addListener('readyToClose', endConsultation);
        state.jitsiApi.addListener('participantLeft', handleParticipantLeft);
    }
    
    function endConsultation() {
        if (state.jitsiApi) {
            state.jitsiApi.dispose();
            state.jitsiApi = null;
        }
        
        // Afficher l'interface post-consultation
        elements.jitsiContainer.style.display = 'none';
        elements.postConsultation.style.display = 'block';
        
        // Envoyer un rapport de fin de consultation au backend
        sendConsultationEndReport();
    }
    
    function handleParticipantLeft(data) {
        console.log("Participant quitté:", data);
        // Si le médecin quitte, proposer de terminer la consultation
        if (data.id === state.jitsiApi.getParticipantById(data.id)) {
            if (confirm("Le médecin a quitté la consultation. Voulez-vous terminer ?")) {
                endConsultation();
            }
        }
    }
    
    function sendConsultationEndReport() {
        // Simuler l'envoi au backend
        console.log("Rapport de fin de consultation envoyé");
    }

    // =============================================
    // 11. FONCTIONS UTILITAIRES
    // =============================================
    
    function toggleNextButton(enabled) {
        elements.nextButtons.forEach(btn => {
            btn.disabled = !enabled;
        });
    }
    
    function setupEventListeners() {
        // Navigation
        elements.nextButtons.forEach(btn => {
            btn.addEventListener('click', goToNextStep);
        });
        
        elements.prevButtons.forEach(btn => {
            btn.addEventListener('click', goToPrevStep);
        });
        
        // Sélection de service
        setupServiceSelection();
        
        // Filtres médecins
        setupDoctorFilters();
        
        // Paiement
        setupPaymentMethods();
        
        // Validation du formulaire patient
        elements.patientName.addEventListener('input', updateSummary);
        elements.patientPhone.addEventListener('input', updateSummary);
        elements.patientEmail.addEventListener('input', updateSummary);
        document.getElementById('acceptTerms').addEventListener('change', updateSummary);
        
        // Bouton de confirmation
        elements.confirmBtn.addEventListener('click', confirmAppointment);
        
        // Bouton de lancement de la consultation
        elements.launchBtn.addEventListener('click', launchConsultation);
        
        // Bouton de fin de consultation
        elements.endBtn.addEventListener('click', endConsultation);
        
        // Bouton de copie du lien
        elements.copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(state.meetingLink)
                .then(() => {
                    const originalText = elements.copyLinkBtn.innerHTML;
                    elements.copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Lien copié !';
                    setTimeout(() => {
                        elements.copyLinkBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Erreur lors de la copie:', err);
                });
        });
    }

    // =============================================
// 5. GESTION DES DATES RAPIDES (AUJOURD'HUI/DEMAIN)
// =============================================

function setupQuickDateButtons() {
    document.querySelectorAll('.date-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const offset = parseInt(this.dataset.offset);
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const dateStr = date.toISOString().split('T')[0];
            
            // Mettre à jour le datepicker
            elements.datePicker._flatpickr.setDate(dateStr);
            
            // Générer les créneaux
            generateTimeSlots();
        });
    });
}

// =============================================
// 6. CONFIGURATION DU DATEPICKER
// =============================================

function initDatePicker() {
    flatpickr(elements.datePicker, {
        locale: "fr",
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Désactiver les jours non travaillés du médecin
                if (!state.selectedDoctor) return true;
                
                const dayOfWeek = date.getDay() + 1; // Lundi=1 à Dimanche=7
                return !state.selectedDoctor.workingDays.includes(dayOfWeek);
            },
            function(date) {
                // Désactiver les dates spécifiques indisponibles
                if (!state.selectedDoctor) return false;
                
                const dateStr = date.toISOString().split('T')[0];
                return state.selectedDoctor.unavailableDates.includes(dateStr);
            }
        ],
        onChange: handleDateSelection
    });
}


// =============================================
// 7. MODIFICATION DE L'INITIALISATION
// =============================================

function initApp() {
    initDatePicker();
    setupQuickDateButtons();
    setupEventListeners();
    showStep(1);
}

    // =============================================
    // 12. LANCEMENT DE L'APPLICATION
    // =============================================
    
    initApp();

    // LOGIQUE DU MENU BURGER (responsive mobile)
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-menu");

menuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});


});