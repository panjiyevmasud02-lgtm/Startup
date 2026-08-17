/* -------------------------------------------------------------------
   TwinCare AI — Centralized Backend Database (100% Pure Uzbek)
   ------------------------------------------------------------------- */

const uzbekistanRegions = [
  {
    name: "Toshkent shahri",
    districts: ["Mirzo Ulug'bek tumani", "Yunusobod tumani", "Chilonzor tumani", "Yakkasaroy tumani", "Shayxontohur tumani", "Olmazor tumani", "Sergeli tumani", "Bektemir tumani", "Uchtepa tumani", "Mirobod tumani", "Yangihayot tumani"]
  },
  {
    name: "Toshkent viloyati",
    districts: ["Chirchiq shahri", "Angren shahri", "Olmaliq shahri", "Bekobod shahri", "Bo'stonliq tumani", "Zangiota tumani", "Qibray tumani", "Yangiyo'l tumani", "Oqqo'rg'on tumani", "Parkent tumani", "Pskent tumani", "Chinoz tumani"]
  },
  {
    name: "Samarqand viloyati",
    districts: ["Samarqand shahri", "Kattaqo'rg'on shahri", "Oqdaryo tumani", "Bulung'ur tumani", "Jomboy tumani", "Ishtixon tumani", "Payariq tumani", "Pastdarg'om tumani", "Urgut tumani", "Toyloq tumani"]
  },
  {
    name: "Farg'ona viloyati",
    districts: ["Farg'ona shahri", "Qo'qon shahri", "Marg'ilon shahri", "Quva tumani", "Rishton tumani", "Oltiariq tumani", "Bag'dod tumani", "Buvayda tumani", "Yozyovon tumani", "Beshariq tumani", "Uchko'prik tumani"]
  },
  {
    name: "Andijon viloyati",
    districts: ["Andijon shahri", "Asaka tumani", "Shahrixon tumani", "Xo'jaobod tumani", "Buloqboshi tumani", "Izboskan tumani", "Qo'rg'ontepa tumani", "Marhamat tumani", "Oltinko'l tumani", "Paxtaobod tumani"]
  },
  {
    name: "Namangan viloyati",
    districts: ["Namangan shahri", "Chortoq tumani", "Chust tumani", "Pop tumani", "Kosonsoy tumani", "To'raqo'rg'on tumani", "Uychi tumani", "Mingbuloq tumani", "Norin tumani", "Yangiqo'rg'on tumani"]
  },
  {
    name: "Buxoro viloyati",
    districts: ["Buxoro shahri", "Kogon shahri", "G'ijduvon tumani", "Vobkent tumani", "Romitan tumani", "Jondor tumani", "Peshku tumani", "Qorako'l tumani", "Olot tumani", "Shofirkon tumani"]
  },
  {
    name: "Qashqadaryo viloyati",
    districts: ["Qarshi shahri", "Shahrisabz shahri", "Kitob tumani", "Yakkabog' tumani", "Koson tumani", "Nishon tumani", "Muborak tumani", "G'uzor tumani", "Dehqonobod tumani", "Chiroqchi tumani", "Qamashi tumani"]
  },
  {
    name: "Surxondaryo viloyati",
    districts: ["Termiz shahri", "Denov tumani", "Sherobod tumani", "Jarqo'rg'on tumani", "Sho'rchi tumani", "Qumqo'rg'on tumani", "Oltinsoy tumani", "Sariosiyo tumani", "Muzrabot tumani", "Angor tumani"]
  },
  {
    name: "Xorazm viloyati",
    districts: ["Urganch shahri", "Xiva shahri", "Xonka tumani", "Yangiariq tumani", "Qo'shko'pir tumani", "Gurlan tumani", "Shovot tumani", "Hazorasp tumani", "Bog'ot tumani", "Yangibozor tumani"]
  },
  {
    name: "Navoiy viloyati",
    districts: ["Navoiy shahri", "Zarafshon shahri", "Karmana tumani", "Qiziltepa tumani", "Xatirchi tumani", "Nurota tumani", "Uchquduq tumani", "Konimex tumani", "Tomdi tumani"]
  },
  {
    name: "Jizzax viloyati",
    districts: ["Jizzax shahri", "Zomin tumani", "Baxmal tumani", "G'allaorol tumani", "Do'stlik tumani", "Mirzacho'l tumani", "Paxtakor tumani", "Sharof Rashidov tumani", "Forish tumani", "Arnasoy tumani"]
  },
  {
    name: "Sirdaryo viloyati",
    districts: ["Guliston shahri", "Yangiyer shahri", "Shirin shahri", "Boyovut tumani", "Guliston tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani", "Xovos tumani"]
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: ["Nukus shahri", "Qo'ng'irot tumani", "To'rtko'l tumani", "Beruniy tumani", "Amudaryo tumani", "Xo'jayli tumani", "Mo'ynoq tumani", "Taxtako'pir tumani", "Chimboy tumani", "Ellikqala tumani"]
  }
];

let registeredUsers = [
  { username: 'botir_toshmatov', password: 'password123', firstName: 'Botir', lastName: 'Toshmatov', role: 'doctor', isRoleLocked: true, docId: 'DOC-UZ-101' },
  { username: 'nigora_rustamova', password: 'password123', firstName: 'Nigora', lastName: 'Rustamova', role: 'patient', isRoleLocked: true, patientId: 'TWIN-UZ-9042' },
  { username: 'alisher_tadqiqotchi', password: 'password123', firstName: 'Alisher', lastName: 'Qodirov', role: 'researcher', isRoleLocked: true },
  { username: 'dorixona_samarkand', password: 'password123', firstName: 'Sardor', lastName: 'Azimov', role: 'pharmacy', isRoleLocked: true },
  { username: 'admin', password: 'admin123', firstName: 'Tizim', lastName: 'Boshqaruvchisi', role: 'admin', isRoleLocked: true }
];

let syntheticPatients = [
  {
    id: "TWIN-UZ-9042",
    username: "nigora_rustamova",
    assignedDoctorId: "DOC-UZ-101",
    assignedDoctorName: "Dr. Botir Toshmatov",
    fullName: "Nigora Rustamova",
    age: 54,
    gender: "Ayol",
    region: "Qashqadaryo viloyati",
    city: "Qarshi shahri",
    dob: "1972-04-12",
    occupation: "O'qituvchi",
    lifestyle: "O'rtacha harakat, kam tuzli parhez, chekmaydi",
    allergies: "Penitsillin, Sulfanilamidlar",
    familyHistory: "Onasida 2-Tip Qandli Diabet, Otasida Gipertoniya bo'lgan",
    healthStatus: "O'rtacha Xavf Guruhi (Kardiorenal monitoring)",
    chronicDiseases: [
      {
        name: "2-Tip Qandli Diabet Mellitus",
        icd10: "E11.9",
        severity: "O'rtacha",
        diagnosisDate: "2018-06-15",
        status: "Suboptimal Nazoratda",
        progression: "Sekin Rivojlanish",
        complications: "Yengil Diabetik Nefropatiya",
        currentTreatment: "Metformin ER 1000mg kuniga 2 mahaldan, Glimepirid 2mg kuniga 1 mahal",
        previousTreatment: "Metformin 500mg",
        response: "Qisman samarali (HbA1c ~7.8%)"
      },
      {
        name: "Essenstial Arterial Gipertoniya",
        icd10: "I10",
        severity: "2-Bosqich",
        diagnosisDate: "2016-02-10",
        status: "Dori bilan nazoratda",
        progression: "Barqaror",
        complications: "Chap qorincha gipertrofiyasi (Yengil)",
        currentTreatment: "Enalapril 10mg, Amlodipin 5mg",
        previousTreatment: "Enalapril 5mg",
        response: "Yaxshi (Qon bosimi ~132/84 mmHg)"
      }
    ],
    biomarkersHistory: {
      dates: ["2024-03", "2024-09", "2025-03", "2025-09", "2026-03", "2026-08"],
      HbA1c: [8.4, 8.1, 7.9, 7.8, 7.6, 7.5],
      eGFR: [64, 62, 60, 58, 56, 55],
      systolicBP: [148, 142, 138, 134, 132, 130],
      creatinine: [98, 102, 106, 110, 114, 116]
    },
    medicationHistory: [
      { id: 1, name: "Metformin ER", dose: "1000 mg", frequency: "Kuniga 2 mahal", times: "08:00, 20:00", startDate: "2018-06-20", status: "Faol", adherence: 96, response: "Yaxshi", sideEffects: "Yengil oshqozon bezovtaligi" },
      { id: 2, name: "Enalapril", dose: "10 mg", frequency: "Ertalab 1 mahal", times: "08:00", startDate: "2016-02-15", status: "Faol", adherence: 94, response: "Qon bosimini yaxshi tushiradi", sideEffects: "Yo'q" }
    ],
    dailyAssistantLog: [
      { time: "08:00", task: "Metformin 1000 mg va Enalapril 10 mg qabul qilish", status: "Bajarildi", category: "Dori-darmon" },
      { time: "10:00", task: "500ml suv ichish va 15 minutlik ertalabki sayr", status: "Bajarildi", category: "Turmush tarzi" }
    ],
    trialsHistory: []
  }
];

let syntheticDoctors = [
  {
    id: "DOC-UZ-101",
    name: "Dr. Botir Toshmatov",
    specialty: "Endokrinolog & Diabetolog",
    region: "Toshkent shahri",
    district: "Yunusobod tumani",
    clinic: "Respublika Ixtisoslashtirilgan Endokrinologiya Markazi",
    experience: "16 yil",
    languages: "O'zbekcha",
    expertise: "2-Tip Qandli Diabet, Diabetik Nefropatiya, Digital Twin Modellashtirish",
    verificationStatus: "Tasdiqlangan Mutaxassis",
    rating: 4.9,
    reviewCount: 142,
    anonymousCount: 138,
    bio: "Markaziy Osiyoda metabolik kasalliklar bo'yicha Digital Twin texnologiyasini amaliyotga joriy etayotgan bosh mutaxassis.",
    education: "Toshkent Tibbiyot Akademiyasi (TTA MD, PhD)",
    feedbacks: [
      { rating: 5, category: "Diabet Nazorati", text: "Dr. Botir Toshmatov insulin dozasini juda to'g'ri va aniq moslashtirib berdi. Qand miqdori normallashdi!", date: "2026-07-28" }
    ]
  }
];

let syntheticProtocols = [
  {
    id: "PROT-UZ-01",
    title: "O'zbekiston Klinik Protokoli: 2-Tip Qandli Diabet Mellitusni Davolash (2025-Yil Yangilanishi)",
    icd10: "E11",
    category: "Endokrinologiya",
    summary: "Qondagi qand miqdorining maqsadli darajasi (HbA1c < 7.0%), Surunkali buyrak kasalligi bo'lgan bemorlarga ertachi SGLT2 ingibitorlarini buyurish milli standarti.",
    recommendations: [
      "Birinchi liniya terapiyasi: Metformin ER (eGFR > 30 mL/min bo'lganda).",
      "Buyrak yetishmovchiligi xavfi bo'lganda SGLT2 ingibitori (Dapagliflozin 10mg) qo'shish."
    ]
  }
];

const base22PharmacyMedicines = [
  { name: "Metformin ER 1000 mg", category: "Diabet Terapiyasi" },
  { name: "Dapagliflozin 10 mg (SGLT2i)", category: "Nefro & Diabet Protektsiya" },
  { name: "Enalapril 10 mg (APF Ingibitori)", category: "Gipertoniya" },
  { name: "Amlodipin 5 mg", category: "Kaltsey Antagonisti" },
  { name: "Valsartan 160 mg", category: "Arterial Bosim" },
  { name: "Atorvastatin 20 mg", category: "Xolesterin & Lipidologiya" },
  { name: "Lozartan 50 mg", category: "Gipertoniya" },
  { name: "Bisoprolol 5 mg", category: "Beta-Blokator" },
  { name: "Klopidogrel 75 mg", category: "Qon Suyultiruvchi" },
  { name: "Empagliflozin 10 mg", category: "SGLT2 Ingibitori" },
  { name: "Rozuvastatin 10 mg", category: "Lipid Pasaytiruvchi" },
  { name: "Glimepirid 2 mg", category: "Diabet Terapiyasi" },
  { name: "Gliklazid MR 60 mg", category: "Diabet" },
  { name: "Spironolakton 25 mg", category: "Diyuretik" },
  { name: "Gidrochlorotiazid 12.5 mg", category: "Diyuretik" },
  { name: "Levotiroksin 75 mcg", category: "Qalqonsimon Bez" },
  { name: "Furosemid 40 mg", category: "Diyuretik" },
  { name: "Karvedilol 6.25 mg", category: "Kardiologiya" },
  { name: "Insulin Glargin (Lantus) 100 TV/ml", category: "Insulin Terapiyasi" },
  { name: "Aspirin Kardio 100 mg", category: "Antiagregant" },
  { name: "Telmisartan 40 mg", category: "Gipertoniya" },
  { name: "Nebivolol 5 mg", category: "Kardioprotektor" }
];

// Dynamic pharmacy forecast generator swapping medicine order & percentages based on region and district
function getDynamicPharmacyForecasts(region, district) {
  const str = `${region || ''}-${district || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const cloned = [...base22PharmacyMedicines];
  // Fisher-Yates shuffle using deterministic hash seed
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = (seed + i * 17) % (i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  return cloned.map((m, index) => {
    const growthVal = Math.floor(12 + ((seed + index * 13) % 36));
    const stockDaysVal = Math.floor(20 + ((seed + index * 9) % 45));
    const statusText = growthVal > 32 ? "Yuqori Talab (Shoshilinch Zaxira)" :
                       growthVal > 22 ? "Kutilayotgan Sotuv O'sishi" : "Barqaror Talab";

    return {
      name: m.name,
      category: m.category,
      growthPercent: `+${growthVal}%`,
      stockDays: stockDaysVal,
      status: statusText
    };
  });
}

let syntheticResearchCohorts = [
  {
    id: "DS-UZ-2026-T2D",
    name: "Qashqadaryo & Surxondaryo Diabet Epidemiologiyasi Dataseti",
    sampleSize: 14250,
    timeframe: "2024–2026",
    disease: "2-Tip Qandli Diabet",
    region: "Qashqadaryo viloyati",
    district: "Qarshi shahri",
    ageRange: "40–60 yosh",
    gender: "Aralash",
    metricsSummary: "O'rtacha HbA1c: 7.7%, SGLT2i qo'llanish foizi: 28.4%, O'rtacha eGFR: 68.2 mL/min."
  }
];

let syntheticAuditLogs = [];

module.exports = {
  uzbekistanRegions,
  registeredUsers,
  syntheticPatients,
  syntheticDoctors,
  syntheticProtocols,
  getDynamicPharmacyForecasts,
  syntheticResearchCohorts,
  syntheticAuditLogs
};
