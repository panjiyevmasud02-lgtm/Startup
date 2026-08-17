/* -------------------------------------------------------------------
   TwinCare AI — 100% Sof O'zbek Tili Tizimi
   ------------------------------------------------------------------- */

let currentLang = 'uz';

const translations = {
  uz: {
    brandName: "TwinCare AI",
    demoBanner: "SINTETIK DEMO REJIM — SHAXSIY TIBBIY MA'LUMOTLAR EMAS — O'ZBEKISTON",
    searchPlaceholder: "Bemorlar, shifokorlar, protokollar va dorilarni qidirish...",
    roleDoctor: "Shifokor",
    rolePatient: "Bemor",
    roleResearcher: "Tadqiqotchi",
    rolePharmacy: "Dorixona Egasi",
    roleAdmin: "Boshqaruvchi / Admin",
    
    // Sidebar
    navPlatformModules: "Platforma Modullari",
    navDashboard: "Boshqaruv Paneli",
    navPatients: "Bemorlar Katalogi",
    navDigitalTwins: "Digital Twin Maydoni",
    navDoctors: "Shifokorlar Katalogi",
    navAiAssistant: "AI Konsultatsiya Yozuvchisi",
    navMyFeedbacks: "Mening Fikrlarim",
    navKnowledgeIntel: "Bilim va Intellekt",
    navKnowledge: "Tibbiy Bilimlar Bazasi",
    navResearch: "Tadqiqot Platformasi",
    navPharmacy: "Dorixona Prognozlari",
    navDmed: "DMED Integratsiyasi",
    navAdminPanel: "Admin Panel",
    
    safetyNotice: "DIQQAT: Tizim qarorlarni qo'llab-quvvatlash uchun biologik modellashtirish hisoblarini taqdim etadi. Yakuniy tibbiy qaror shifokor zimmasidadir.",
    
    dashTitle: "Sog'liqni Saqlash AI Boshqaruv Markazi",
    dashSubtitle: "Digital Twinlar va klinik intellektning real vaqtdagi umumiy ko'rinishi.",
    openTwinWorkspace: "Twin Maydonini Ochish",
    featuredTwins: "Tanlangan Bemor Digital Twinlari",
    viewAll: "Barchasini Ko'rish",
    realtimeAlerts: "Real-Vaqt Klinik Ogohlantirishlar",

    patientDirSubtitle: "Klinik profillar, lab tahlillar tarixi va Digital Twin modellariga kirish.",
    twinTitle: "Bemor Digital Twin Maydoni",
    twinSubtitle: "Kelajakdagi traektoriyalar, biomarkerlar tendensiyasi va virtual muolaja simulyatsiyalari.",
    selectPatient: "Bemor Twinini Tanlang:",

    stepPatientData: "Bemor Ma'lumotlari",
    stepClinicalData: "Klinik Tahlillar",
    stepDigitalTwin: "Digital Twin Modeli",
    stepDiseaseTrajectory: "Kasallik Traektoriyasi",
    stepTreatmentScenarios: "Muolaja Ssenariylari",

    twinOverview: "Bemor Umumiy Ma'lumotlari",
    clinicalProfile: "Klinik & Tahlillar Profili",
    medHistory: "Dori-Darmon Tarixi",
    lifestyleProfile: "Turmush Tarzi & Kasalliklar",
    virtualSimulation: "Muolajani Sinash",

    biomarkerTrendTitle: "Biomarker Tarixi va Hozirgi Holati",
    diseaseTherapyTitle: "Surunkali Kasalliklar va Terapiya Profili",
    medTimelineTitle: "Dori-Darmon Tarixi va Qabul Qilish Xaritasi",
    virtualSimTitle: "Virtual Muolaja Sinovi va Traektoriya Solishtiruvi",
    dailyAssistantTitle: "Kunlik Bemor Yordamchisi va Eslatmalar",

    doctorsTitle: "Shifokorlar Katalogi",
    doctorsSubtitle: "O'zbekiston bo'yicha tasdiqlangan mutaxassislar va anonim fikrlar tizimi.",
    
    aiTitle: "AI Konsultatsiya Yozuvchisi & Avto-Tashxis",
    aiSubtitle: "Ovozli muloqotni real vaqtda matnga o'girish va darhol klinik tashxis qo'yish.",
    clickToRecord: "Konsultatsiyani Yozib Olishni Boshlash Uchun Boshing",
    micPlaceholder: "Ovozli yozib olish boshlangach muloqot bu yerda ko'rinadi...",

    myFeedbacksTab: "Mening Anonim Fikrlarim",
    doctorFeedbacksTitle: "Bemorlardan kelib tushgan barcha anonim baholar.",

    protocolsTitle: "O'zbekiston Tibbiy Bilimlar Bazasi",
    protocolsSubtitle: "Rasmiy davolash ko'rsatmalari va XKB-10 klinik kodlari.",

    researchTitle: "Tadqiqot Datasetlari va Intellekt",
    researchSubtitle: "Universitetlar va PhD tadqiqotchilar uchun anonimlashtirilgan ma'lumotlar.",
    filterDisease: "Kasallik Turi",
    filterRegion: "Viloyat",

    pharmacyTitle: "Dorixona Talabi Prognozlari",
    pharmacySubtitle: "Hududiy dori vositalari zaxirasini oldindan bashorat qilish.",

    dmedTitle: "DMED Tizimi Integratsiyasi",
    dmedSubtitle: "O'zbekiston DMED tibbiy ma'lumotlar integratsiya ko'prigi.",
    dmedStatus: "DMED Holati: Ulanmagan (Rasmiy API kutilmoqda)",

    adminPanelTitle: "Tizim Admin Paneli",
    adminPanelSubtitle: "Yuqori darajali tizim nazorati va audit.",

    authTitle: "Tizimga Kirish va Ro'yxatdan O'tish",
    loginTab: "Kirish",
    registerTab: "Ro'yxatdan O'tish",
    password: "Parol",
    loginBtn: "Kirish",
    registerBtn: "Ro'yxatdan O'tish",
    writeReview: "Anonim Fikr Qoldirish"
  }
};

function setAppLanguage(lang = 'uz') {
  currentLang = 'uz'; // Enforce 100% Uzbek language
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations['uz'] && translations['uz'][key]) {
      el.textContent = translations['uz'][key];
    }
  });

  const searchInp = document.getElementById('globalSearchInput');
  if (searchInp) {
    searchInp.placeholder = translations['uz']['searchPlaceholder'];
  }
}
