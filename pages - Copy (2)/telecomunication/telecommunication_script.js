// Configuration globale
const config = {
    jitsiDomain: 'meet.jit.si', // Domaine gratuit de Jitsi
    defaultRoomOptions: {
        width: '100%',
        height: 500,
        parentNode: document.querySelector('#jitsi-meet'),
        roomName: '', // Sera généré dynamiquement
        userInfo: {
            email: '', // Rempli dynamiquement
            displayName: '' // Rempli dynamiquement
        },
        interfaceConfigOverwrite: {
            // Personnalisation de l'interface Jitsi
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ],
        }
    }
};

// Variables d'état
let api = null;
let currentUser = {
    name: '',
    email: '',
    isDoctor: false
};

// Éléments DOM
const startBtn = document.getElementById('startConsultationBtn');
const endBtn = document.getElementById('endConsultationBtn');
const preConsultation = document.getElementById('preConsultation');
const jitsiContainer = document.getElementById('jitsiContainer');
const postConsultation = document.getElementById('postConsultation');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Ici, tu devrais récupérer les vraies données depuis ton backend
    // Pour l'exemple, on utilise des données simulées
    loadConsultationData();
    
    // Écouteurs d'événements
    startBtn.addEventListener('click', startConsultation);
    endBtn.addEventListener('click', endConsultation);
    document.getElementById('downloadPrescriptionBtn').addEventListener('click', downloadPrescription);
    document.getElementById('newAppointmentBtn').addEventListener('click', newAppointment);
});

/**
 * Charge les données de la consultation (à remplacer par un appel API réel)
 */
function loadConsultationData() {
    // En production, tu ferais un appel à ton backend :
    // fetch(`/api/consultation/${consultationId}`)...
    
    // Données simulées
    const consultationData = {
        doctor: "Dr. Jean Kaboré",
        patient: "Patient Test",
        date: "15/11/2023 14:00",
        duration: 30,
        roomId: generateRoomId(),
        patientEmail: "patient@example.com"
    };
    
    // Mise à jour de l'UI
    document.getElementById('doctorName').textContent = consultationData.doctor;
    document.getElementById('consultationTime').textContent = `${consultationData.date} (${consultationData.duration} min)`;
    
    // Configuration de l'utilisateur
    currentUser = {
        name: consultationData.patient,
        email: consultationData.patientEmail,
        isDoctor: false
    };
    
    // Configuration de la salle Jitsi
    config.defaultRoomOptions.roomName = consultationData.roomId;
    config.defaultRoomOptions.userInfo = {
        email: currentUser.email,
        displayName: currentUser.name
    };
}

/**
 * Génère un ID unique pour la salle de consultation
 * (À remplacer par une génération côté serveur en production)
 */
function generateRoomId() {
    return 'apmf-' + Math.random().toString(36).substring(2, 9) + 
           '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Lance la consultation en initialisant Jitsi
 */
function startConsultation() {
    // 1. Cacher la pré-consultation
    preConsultation.style.display = 'none';
    
    // 2. Afficher le container Jitsi
    jitsiContainer.style.display = 'block';
    
    // 3. Charger l'API Jitsi dynamiquement
    const script = document.createElement('script');
    script.src = `https://${config.jitsiDomain}/external_api.js`;
    script.onload = initializeJitsi;
    document.body.appendChild(script);
}

/**
 * Initialise l'interface Jitsi Meet
 */
function initializeJitsi() {
    api = new JitsiMeetExternalAPI(config.jitsiDomain, config.defaultRoomOptions);
    
    // Écouteurs d'événements Jitsi
    api.addListener('readyToClose', endConsultation);
    api.addListener('participantLeft', handleParticipantLeft);
    api.addListener('participantJoined', handleParticipantJoined);
}

/**
 * Gère la fin de la consultation
 */
function endConsultation() {
    if (api) {
        api.dispose();
    }
    
    jitsiContainer.style.display = 'none';
    postConsultation.style.display = 'block';
    
    // Ici, tu pourrais envoyer une notification au backend
    // fetch('/api/consultation/end', { method: 'POST', ... })
}

/**
 * Télécharge l'ordonnance (simulé)
 */
function downloadPrescription() {
    alert("En production, cela téléchargerait le PDF depuis ton serveur");
    // Exemple réel :
    // window.open('/api/prescription/download?id=123', '_blank');
}

/**
 * Redirige vers la prise de rendez-vous
 */
function newAppointment() {
    window.location.href = "/appointment.html";
}

/**
 * Gère quand un participant quitte
 */
function handleParticipantLeft(data) {
    console.log("Participant quitté:", data);
    if (data.id === api.getParticipantById(data.id)) {
        // Médecin parti ? Avertir le patient
        if (confirm("Le médecin a quitté la consultation. Voulez-vous terminer ?")) {
            endConsultation();
        }
    }
}

/**
 * Gère quand un participant rejoint
 */
function handleParticipantJoined(data) {
    console.log("Nouveau participant:", data);
    // Tu pourrais identifier le médecin ici
}