import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { QRCodeCanvas } from "qrcode.react";
import questions from "./formulaire.json";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

// Configuration des couleurs des blocs du diagnostique
const SECTION_COLORS = {
  env: { 
    bg: "bg-gradient-to-br from-emerald-600 to-emerald-800",  
    progress: "bg-black/20" 
  },
  soc: { 
    bg: "bg-gradient-to-br from-pink-500 to-pink-700", 
    progress: "bg-black/20" 
  },
  eco: { 
    bg: "bg-gradient-to-br from-orange-500 to-orange-700", 
    progress: "bg-black/20" 
  }
};

const colorMap = {
  "rouge": "bg-red-700 text-white border-red-800 hover:bg-red-800",
  "orange": "bg-orange-600 text-white border-orange-700 hover:bg-orange-700",
  "jaune": "bg-yellow-600 text-white border-yellow-700 hover:bg-yellow-700",
  "vert clair": "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700",
  "vert foncé": "bg-green-800 text-white border-green-900 hover:bg-green-900",
  "blanc": "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
};

const oddIcons = {
  "ODD 1": "https://www.agenda-2030.fr/IMG/svg/odd1.svg?1614036680",
  "ODD 2": "https://www.agenda-2030.fr/IMG/svg/odd2.svg?1614036681",
  "ODD 3": "https://www.agenda-2030.fr/IMG/svg/odd3.svg?1614036681",
  "ODD 4": "https://www.agenda-2030.fr/IMG/svg/odd4.svg?1614036681",
  "ODD 5": "https://www.agenda-2030.fr/IMG/svg/odd5.svg?1614036682",
  "ODD 6": "https://www.agenda-2030.fr/IMG/svg/odd6.svg?1614036682",
  "ODD 7": "https://www.agenda-2030.fr/IMG/svg/odd7.svg?1614036682",
  "ODD 8": "https://www.agenda-2030.fr/IMG/svg/odd8.svg?1614036682",
  "ODD 9": "https://www.agenda-2030.fr/IMG/svg/odd9.svg?1614036682",
  "ODD 10": "https://www.agenda-2030.fr/IMG/svg/odd10.svg?1614036681",
  "ODD 11": "https://www.agenda-2030.fr/IMG/svg/odd11.svg?1614036681",
  "ODD 12": "https://www.agenda-2030.fr/IMG/svg/odd12.svg?1614036681",
  "ODD 13": "https://www.agenda-2030.fr/IMG/svg/odd13.svg?1614036681",
  "ODD 14": "https://www.agenda-2030.fr/IMG/svg/odd14.svg?1614036681",
  "ODD 15": "https://www.agenda-2030.fr/IMG/svg/odd15.svg?1614036681",
  "ODD 16": "https://www.agenda-2030.fr/IMG/svg/odd16.svg?1614036681",
  "ODD 17": "https://www.agenda-2030.fr/IMG/svg/odd17.svg?1614036681"
};

const oddDescriptions = {
  "ODD 1": "Mettre fin à la pauvreté sous toutes ses formes et partout.",
  "ODD 2": "Éliminer la faim, assurer la sécurité alimentaire et promouvoir une agriculture durable.",
  "ODD 3": "Permettre à tous de vivre en bonne santé et promouvoir le bien‑être à tout âge.",
  "ODD 4": "Assurer à tous une éducation inclusive, équitable et de qualité.",
  "ODD 5": "Parvenir à l'égalité des sexes et autonomiser toutes les femmes et les filles.",
  "ODD 6": "Garantir l'accès de tous à l'eau et à l'assainissement.",
  "ODD 7": "Garantir l'accès de tous à des services énergétiques fiables, durables et modernes.",
  "ODD 8": "Promouvoir une croissance économique durable et un travail décent pour tous.",
  "ODD 9": "Bâtir une infrastructure résiliente et encourager l'innovation.",
  "ODD 10": "Réduire les inégalités dans les pays et d'un pays à l'autre.",
  "ODD 11": "Faire en sorte que les villes soient sûres, résilientes et durables.",
  "ODD 12": "Instaurer des modes de consommation et de production durables.",
  "ODD 13": "Prendre d'urgence des mesures pour lutter contre les changements climatiques.",
  "ODD 14": "Conserver et exploiter de manière durable les ressources marines.",
  "ODD 15": "Préserver et restaurer les écosystèmes terrestres et la biodiversité.",
  "ODD 16": "Promouvoir l'avènement de sociétés pacifiques et l'accès à la justice pour tous.",
  "ODD 17": "Renforcer le Partenariat mondial pour le développement durable."
};

const getScoreVisuals = (score) => {
  if (score < 2) return { hex: "#dc2626", twBorder: "border-l-red-600", label: "Score Critique", twText: "text-red-600" };
  if (score < 3) return { hex: "#ea580c", twBorder: "border-l-orange-600", label: "Score à améliorer", twText: "text-orange-600" };
  if (score < 4) return { hex: "#ca8a04", twBorder: "border-l-yellow-600", label: "Score à améliorer", twText: "text-yellow-600" };
  if (score < 4.5) return { hex: "#16a34a", twBorder: "border-l-green-600", label: "Bon score", twText: "text-green-600" };
  return { hex: "#15803d", twBorder: "border-l-green-800", label: "Excellent score", twText: "text-green-800" };
};

const LOGO_URL = "https://programmes.polytechnique.edu/sites/default/files/2022-06/logo-polytechnique.svg";

const identityFields = {
  "Informations générales sur la commune": [
    "Nom de la commune",
    "Autres noms (ancien nom, nom en langue régionale, s'il y a lieu)",
    "Code Postal",
    "Code Insee",
    "Département",
    "Région administrative",
    "Arrondissement (s'il existe)",
    "Canton d'appartenance",
    "Intercommunalité (EPCI)"
  ],
  "Démographie": [
    "Population municipale (dernier recensement connu)",
    "Densité de population (hab./km²)",
    "Tranche d'âge dominante",
    "Évolution démographique récente (tendance ou chiffres si disponibles)"
  ],
  "Localisation géographique": [
    "Coordonnées GPS (latitude / longitude)",
    "Altitude minimale et maximale",
    "Superficie totale (en km²)"
  ],
  "Autres données": [
    "Nombre d'entreprises",
    "Taux de chômage (%)",
    "Nombre d'écoles"
  ],
  "Informations sur la mairie": [
    "Nom du maire",
    "Prénom du maire",
    "Date de naissance du maire (facultatif)",
    "Genre du maire (facultatif)",
    "Année de début et de fin du mandat actuel",
    "Étiquette politique (facultatif)",
    "Adresse complète de la mairie",
    "Téléphone",
    "Courriel officiel",
    "Site internet de la mairie (s'il existe)",
    "Horaires d'ouverture au public"
  ]
};

const allRequiredFields = Object.values(identityFields).flat();

function App() {
  const [activeTab, setActiveTab] = useState("Accueil");
  const [profiles, setProfiles] = useState(() => JSON.parse(localStorage.getItem("oddx_profiles_list") || "[]"));
  const [muralInfo, setMuralInfo] = useState(() => JSON.parse(localStorage.getItem("oddx_current_identite") || "{}"));
  const [citizenIdeas, setCitizenIdeas] = useState(() => JSON.parse(localStorage.getItem("oddx_ideas") || "[]"));
  const [selectedOddForm, setSelectedOddForm] = useState("");
  const [activeDiagnosticSection, setActiveDiagnosticSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false)
  const syncWithCloud = async (communeName, dataAnswers, dataIdentity, dataIdeas) => {
    if (!communeName || communeName.trim() === "") return;
    const docId = communeName.trim().toLowerCase().replace(/\s+/g, '_');
    
    // NETTOYAGE : Supprimer les valeurs undefined pour éviter les erreurs Firebase
    const cleanAnswers = Object.fromEntries(
      Object.entries(dataAnswers).filter(([_, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, "diagnostics", docId), {
        identite: dataIdentity,
        reponses: cleanAnswers, // On utilise les réponses nettoyées
        idees: dataIdeas,
        derniereMiseAJour: new Date().toISOString()
      }, { merge: true });
      console.log("Synchronisation Cloud réussie");
    } catch (e) {
      console.error("Erreur de synchronisation :", e);
      throw e;
    }
  };


  // ✅ Manual save button logic (SEPARATE FUNCTION)
  const handleManualSave = async () => {
    const name = muralInfo["Nom de la commune"];

    if (!name || name.trim() === "") {
      alert("Veuillez renseigner le nom de la commune avant de sauvegarder.");
      return;
    }

    setIsSaving(true);

    try {
      await syncWithCloud(name, answers, muralInfo, citizenIdeas);
      alert("✅ Sauvegarde Cloud réussie !");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur lors de la sauvegarde cloud.");
    } finally {
      setIsSaving(false);
    }

    const cleanName = name.trim();

    if (!profiles.some(p => p.toLowerCase() === cleanName.toLowerCase())) {
      const newProfiles = [...profiles, cleanName];
      setProfiles(newProfiles);
      localStorage.setItem("oddx_profiles_list", JSON.stringify(newProfiles));
    }

  };

  const loadFromCloud = async (communeName) => {
    if (!communeName) return;

    setIsLoadingCloud(true)
    
    const docId = communeName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    try {
      const ref = doc(db, "diagnostics", docId);
      const docSnap = await getDoc(ref);

      if (docSnap.exists()) {
        const data = docSnap.data();

        console.log("DATA FIRESTORE:", data); // 👈 IMPORTANT DEBUG

        // ✅ IDENTITÉ
        if (data.identite) {
          setMuralInfo(data.identite);
          localStorage.setItem(
            "oddx_current_identite",
            JSON.stringify(data.identite)
          );
        }

        // ✅ RÉPONSES (LE POINT CRITIQUE)
        if (data.reponses) {
          setAnswers({ ...data.reponses });
          localStorage.setItem(
            storageKey,
            JSON.stringify(data.reponses)
          );
        }

        // ✅ IDÉES
        if (data.idees) {
          setCitizenIdeas(data.idees);
          localStorage.setItem(
            "oddx_ideas",
            JSON.stringify(data.idees)
          );
        }

        setActiveTab("Questionnaire");

      } else {
        alert("Aucun diagnostic trouvé.");
      }
    } catch (e) {
      console.error("Erreur chargement cloud:", e);
    }
    setTimeout(() => setIsLoadingCloud(false), 50);

  };

  const storageKey = useMemo(() => {
    const name = muralInfo["Nom de la commune"];
    return name ? `oddx_answers_${name.replace(/\s+/g, '_').toLowerCase()}` : "oddx_answers_default";
  }, [muralInfo]);

  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "{}"));

  useEffect(() => {
    if (isLoadingCloud) return;

    const savedAnswers = localStorage.getItem(storageKey);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
  }, [storageKey, isLoadingCloud]);

  useEffect(() => {
    const name = muralInfo["Nom de la commune"];
    
    // 1. Sauvegarde locale (système actuel)
    localStorage.setItem("oddx_current_identite", JSON.stringify(muralInfo));
    localStorage.setItem(storageKey, JSON.stringify(answers));
    localStorage.setItem("oddx_ideas", JSON.stringify(citizenIdeas));


  }, [answers, muralInfo, citizenIdeas, storageKey]);
  
  const groupedQuestions = useMemo(() => [
    { id: 'env', title: "PARTIE 1 - ENVIRONNEMENT", questions: questions.filter(q => q.id >= 1 && q.id <= 17) },
    { id: 'soc', title: "PARTIE 2 - SOCIAL & GOUVERNANCE", questions: questions.filter(q => q.id >= 18 && q.id <= 33) },
    { id: 'eco', title: "PARTIE 3 - ÉCONOMIE & AMÉNAGEMENT DURABLE", questions: questions.filter(q => q.id >= 34 && q.id <= 50) }
  ], []);

  const getGroupProgress = (groupQuestions) => {
    const count = groupQuestions.filter(q => answers[q.id] !== undefined).length;
    return {
      count,
      total: groupQuestions.length,
      percent: Math.round((count / groupQuestions.length) * 100)
    };
  };

  const cleanQuestionText = (text) => {
    let cleaned = text.replace(/^Q\d+\s?[-–]\s?/, "");
    cleaned = cleaned.replace(/\s?\(ODD[^)]*\)/gi, "");
    return cleaned;
  };

  const handleSwitchProfile = async (profileName) => {
    if (!profileName) { 
      setMuralInfo({}); 
      setAnswers({}); 
      setCitizenIdeas([]);
      return; 
    }
    
    // 1. On charge le local pour l'immédiateté
    const allIdentities = JSON.parse(localStorage.getItem("oddx_all_identities") || "{}");
    if (allIdentities[profileName]) {
      setMuralInfo(allIdentities[profileName]);
    }

    // 2. FORCE la récupération Cloud
    await loadFromCloud(profileName);
  };
  
  const handleNewProfile = () => { if (window.confirm("Créer un nouveau profil vierge ?")) { setMuralInfo({}); setAnswers({}); } };

  const handleDeleteCurrentProfile = () => {
    const name = muralInfo["Nom de la commune"];
    if (!name) return;
    if (window.confirm(`Supprimer définitivement le profil de "${name}" ?`)) {
      const newProfiles = profiles.filter(p => p !== name);
      setProfiles(newProfiles);
      localStorage.setItem("oddx_profiles_list", JSON.stringify(newProfiles));
      const allIdentities = JSON.parse(localStorage.getItem("oddx_all_identities") || "{}");
      delete allIdentities[name];
      localStorage.setItem("oddx_all_identities", JSON.stringify(allIdentities));
      localStorage.removeItem(storageKey);
      setMuralInfo({}); setAnswers({});
    }
  };

  const fetchCloudCommunes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "diagnostics"));

      const communes = [];

      querySnapshot.forEach((doc) => {
        if (doc.data()?.identite?.["Nom de la commune"]) {
          communes.push(doc.data().identite["Nom de la commune"]);
        }
      });

      if (communes.length === 0) {
        alert("Aucune commune trouvée dans le cloud.");
        return;
      }

      setProfiles(communes);
      localStorage.setItem(
        "oddx_profiles_list",
        JSON.stringify(communes)
      );

      alert(`✅ ${communes.length} communes chargées depuis Firebase`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors du chargement Firebase.");
    }
  };

  const isFullyIdentified = useMemo(() => allRequiredFields.every(field => muralInfo[field] && muralInfo[field].toString().trim() !== ""), [muralInfo]);

  const { oddAverages, globalScore, lowPerformingODDs } = useMemo(() => {
    const scores = {}; const counts = {};
    questions.forEach((q) => {
      const val = answers[q.id];
      if (val !== undefined && val !== null && val > 0) {
        q.odds.forEach((odd) => { scores[odd] = (scores[odd] || 0) + val; counts[odd] = (counts[odd] || 0) + 1; });
      }
    });
    const averages = Object.keys(scores).map((odd) => ({ odd: `ODD ${odd}`, value: Number((scores[odd] / counts[odd]).toFixed(2)) }));
    return {
      oddAverages: averages.sort((a, b) => a.odd.localeCompare(b.odd, undefined, {numeric: true})),
      globalScore: averages.length > 0 ? (averages.reduce((acc, item) => acc + item.value, 0) / averages.length).toFixed(2) : 0,
      lowPerformingODDs: averages.filter(item => item.value < 4.0).sort((a, b) => a.value - b.value)
    };
  }, [answers]);

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      padding: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1e293b' },
      formatter: (params) => {
        const desc = oddDescriptions[params.name] || "";
        const icon = oddIcons[params.name] || "";
        return `
          <div style="max-width:280px; white-space:normal; display:flex; gap:12px; align-items:flex-start;">
            <img src="${icon}" style="width:50px; height:50px; border-radius:6px; border:1px solid #f1f5f9;" />
            <div style="flex:1;">
              <div style="font-weight:900; color:#2563eb; margin-bottom:2px; font-size:14px;">${params.name}</div>
              <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">Score : ${params.value} / 5</div>
              <div style="font-style:italic; font-size:11px; line-height:1.4; color:#64748b;">${desc}</div>
            </div>
          </div>
        `;
      }
    },
    series: [{
      type: "pie", radius: [40, 150], roseType: "area",
      itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
      label: { show: true, color: "#1e293b", fontSize: 10, fontWeight: 'bold' },
      data: oddAverages.map((item) => ({ value: item.value, name: item.odd, itemStyle: { color: getScoreVisuals(item.value).hex } })),
    }],
  };

  const oddScores = chartOption?.series?.[0]?.data?.map(item => ({
    label: item.name,
    score: item.value
  })) || [];

  const handleAddIdea = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setCitizenIdeas([{ odd: selectedOddForm, text: formData.get("ideaText"), date: new Date().toLocaleDateString() }, ...citizenIdeas]);
    e.target.reset();
    setSelectedOddForm("");
  };

  const handleDeleteIdea = (index) => {
    if (window.confirm("Supprimer cette idée citoyenne ?")) {
      const updatedIdeas = citizenIdeas.filter((_, i) => i !== index);
      setCitizenIdeas(updatedIdeas);
    }
  };

  const generatePDF = async () => {

    const input = document.getElementById("pdf-report");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      width: input.scrollWidth,
      height: input.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const imgWidth = 297;
    const pageHeight = 210;

    let imgHeight = canvas.height * imgWidth / canvas.width;

    if (imgHeight > pageHeight - 20) {
      imgHeight = pageHeight - 20;
    }

    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);

    // PAGE 2
    pdf.addPage();

    pdf.setFontSize(22);
    pdf.text("TABLEAU DES RÉSULTATS PAR ODD", 148, 20, { align: "center" });

    const tableData = oddScores.map(item => {

      let niveau = "Intermédiaire";

      if (item.score >= 4.2) niveau = "Très avancé";
      else if (item.score >= 3.4) niveau = "Avancé";

      return [
        item.label,
        item.score.toFixed(2),
        niveau
      ];
    });

    // Séparer les données
    const leftTable = tableData.slice(0, 8);
    const rightTable = tableData.slice(8);

    // TABLE GAUCHE
    autoTable(pdf, {
      startY: 40,
      margin: { left: 20 },
      tableWidth: 120,
      head: [["ODD", "Score", "Niveau"]],
      body: leftTable,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "center"
      },

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold"
      }
    });

    // TABLE DROITE
    autoTable(pdf, {
      startY: 40,
      margin: { left: 157 },
      tableWidth: 120,
      head: [["ODD", "Score", "Niveau"]],
      body: rightTable,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "center"
      },

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold"
      }
    });

    pdf.save(`Diagnostic_${muralInfo["Nom de la commune"] || "Collectivite"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <nav className="border-b border-slate-200 px-8 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("Accueil")}>
            <div className="w-12 h-10 flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-blue-600">ODD-X</span>
          </div>          
          <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
            {["Accueil", "À Propos", "Diagnostic", "Résultats", "Priorités", "Partenaires", "Citoyens", "Contact"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-blue-500"} pb-1 transition-all`}>
                {tab === "Partenaires" ? "Institutions" : tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {activeTab === "Accueil" && (
          <div className="text-center py-20 space-y-8 animate-in fade-in duration-1000">
            <div className="flex justify-center mb-4">
              {/* Modification ici : suppression du fond blanc, de l'ombre et agrandissement de la taille */}
              <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center p-2">
                <img 
                  src="https://www.walhain.be/ma-commune/administration-communale/media/odd-roue-1.png/@@images/ba86ee5b-8379-4d97-bfbf-08acbae0a49a.png" 
                  alt="ODD Logo"
                  className="w-full h-full object-contain" // Assure que l'image occupe tout l'espace proprement
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none text-blue-600">ODD-X</h1>
            <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-light italic">Le diagnostic de durabilité pour les collectivités territoriales.</p>
            
            <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="bg-white p-6 rounded-[45px] shadow-2xl border border-slate-100 transition-transform hover:scale-105">
                <QRCodeCanvas
                  value={window.location.href}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Scannez pour accéder au diagnostic depuis un autre appareil.
              </p>
            </div>

            <div className="pt-6">
              <button onClick={() => setActiveTab("Diagnostic")} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-full font-black text-lg transition-all hover:scale-105 shadow-xl shadow-blue-200">DÉMARRER LE DIAGNOSTIC</button>
            </div>
          </div>
        )}

        {activeTab === "Diagnostic" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
          <h2 className="text-5xl font-black italic uppercase underline decoration-blue-500 text-slate-900">Bienvenu(e)</h2>
          <p className="text-slate-500 text-lg max-w-7xl leading-relaxed whitespace-pre-line">
            {`Bonjour, dans cette section, vous devez remplir tous les champs avec les informations relatives à votre commune.
              Si vous ne disposez pas de toutes les données pour le moment, vous pouvez également écrire « NA » et revenir plus tard pour les mettre à jour. Ensuite, vous pouvez cocher la case « Passer au questionnaire ».`}
          </p>
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div>
                  <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-widest">Sélectionner une Mairie</h3>
                  <select onChange={(e) => handleSwitchProfile(e.target.value)} value={muralInfo["Nom de la commune"] || ""} className="bg-slate-50 border border-slate-200 p-2 mt-2 rounded-lg text-sm font-bold w-64 outline-none focus:border-blue-500 text-slate-700">
                    <option value="">-- Sélectionner --</option>
                    {profiles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {muralInfo["Nom de la commune"] && <button onClick={handleDeleteCurrentProfile} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Supprimer</button>}
              </div>
              <button onClick={handleNewProfile} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">➕ Nouvelle Mairie</button>
              <button
                onClick={fetchCloudCommunes}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-lg"
              >
                ☁️ Charger depuis Cloud
              </button>
            </div>
            {Object.entries(identityFields).map(([category, fields]) => (
              <div key={category} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-blue-600 font-black uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 text-sm">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map(field => (
                    <div key={field} className="flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-2">{field}</label>
                      <input value={muralInfo[field] || ""} onChange={(e) => setMuralInfo({...muralInfo, [field]: e.target.value})} className={`bg-slate-50 border p-3 rounded-xl focus:border-blue-500 outline-none text-sm font-bold transition-all ${muralInfo[field] ? "border-green-200 bg-green-50/30 text-slate-800" : "border-slate-200 text-slate-600"}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-center pt-8">
              <button disabled={!isFullyIdentified} onClick={() => setActiveTab("Questionnaire")} className={`px-12 py-5 rounded-2xl font-black uppercase transition-all shadow-2xl ${isFullyIdentified ? "bg-blue-600 text-white scale-105 shadow-blue-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>{isFullyIdentified ? "Passer au Questionnaire" : "Remplir tous les champs"}</button>
            </div>
          </div>
        )}

{activeTab === "Questionnaire" && (
  <div className="space-y-12 animate-in fade-in">
    <div className="bg-white border border-slate-200 p-6 rounded-3xl mb-8 flex justify-between items-center shadow-lg sticky top-24 z-40">
      <div className="flex items-center gap-4">
        {activeDiagnosticSection && (
          <button 
            onClick={() => setActiveDiagnosticSection(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-blue-700 transition-all shadow-md"
          >
            ← Menu des sections
          </button>
        )}
        <p className="text-sm font-black uppercase text-slate-800 italic">
          Diagnostic : <span className="text-blue-600">{muralInfo["Nom de la commune"]}</span>
        </p>
      </div>
      
      <div className="flex gap-3">
        <p className="text-blue-600 font-black uppercase text-xs tracking-widest underline decoration-2 underline-offset-4">
        {`N'oubliez pas d'enregistrer vos progrès dès le début et régulièrement !`}
        </p>
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
        >
          {isSaving ? "Sauvegarde..." : "💾 Sauvegarder Cloud"}
        </button>
      </div>
    </div>

    {!activeDiagnosticSection ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-10">
        {groupedQuestions.map((group) => {
          const progress = getGroupProgress(group.questions);
          const theme = SECTION_COLORS[group.id];
          return (
            <button
              key={group.id}
              onClick={() => { setActiveDiagnosticSection(group.id); window.scrollTo(0,0); }}
              className={`relative aspect-[4/5] md:aspect-[3/4] ${theme.bg} rounded-[30px] shadow-2xl p-10 flex flex-col justify-center items-center text-center group hover:scale-[1.03] ${theme.hover} transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-white/20`}
            >
              <div 
                className={`absolute bottom-0 left-0 w-full ${theme.progress} transition-all duration-1000`} 
                style={{ height: `${progress.percent}%` }}
              ></div>
              <h3 className="relative z-10 text-white text-2xl font-black uppercase tracking-tighter leading-tight mb-4">
                {group.title.split(' - ')[0]}<br/>
                <span className="text-white/40 text-lg italic">—</span><br/>
                {group.title.split(' - ')[1]}
              </h3>
              <div className="relative z-10 mt-6">
                 <div className="text-4xl font-black text-white">{progress.percent}%</div>
                 <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">
                   {progress.count} / {progress.total} RÉPONSES
                 </div>
              </div>
              <div className="relative z-10 mt-10 bg-white text-slate-900 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest group-hover:scale-110 transition-transform">
                {progress.percent === 100 ? "Modifier" : "Commencer"}
              </div>
            </button>
          );
        })}
        <div className="col-span-1 md:col-span-3 flex justify-center pt-8">
          <button
            onClick={() => {
              window.scrollTo(0,0);
              setActiveTab("Résultats");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:scale-105"
          >
            Voir les résultats finaux
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-8 animate-in slide-in-from-right-10">
        {groupedQuestions
          .filter(g => g.id === activeDiagnosticSection)
          .map((group) => (
            <div key={group.id} className="space-y-8">
              <div className="flex justify-between items-end border-b-4 border-blue-600 pb-4">
                <h3 className="text-4xl font-black text-slate-900 italic uppercase leading-none">
                  {group.title}
                </h3>
                <span className="text-blue-600 font-black tracking-widest uppercase text-sm">
                  {getGroupProgress(group.questions).percent}% Complété
                </span>
              </div>
              
              {group.questions.map((q) => {
                // LOGIQUE NA : On vérifie si la question est marquée comme non applicable
                const isNotApplicable = answers[`${q.id}_na`] === true;
                // On choisit la question à afficher
                const currentQuestion = (isNotApplicable && q.replacementQuestion) ? q.replacementQuestion : q;

                return (
                  <div key={q.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        {currentQuestion.odds.map(o => (
                          <span key={o} className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black">ODD {o}</span>
                        ))}
                        {isNotApplicable && (
                          <span className="text-[9px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-black uppercase">Question Remplacée</span>
                        )}
                      </div>

                      {/* BOUTON NA : Visible seulement pour 10, 22*/}
                      {[10, 22].includes(q.id) && (
                        <button 
                          onClick={() => {
                            const newNAState = !isNotApplicable;
                            setAnswers(prev => ({
                              ...prev,
                              [`${q.id}_na`]: newNAState,
                              [q.id]: undefined
                            }));
                          }}
                          className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border transition-all ${
                            isNotApplicable 
                              ? 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100' 
                              : 'bg-orange-600 text-white border-orange-600'
                          }`}
                        >
                          {isNotApplicable ? "✓ Pas applicable" : "Pas applicable ?"}
                        </button>
                      )}
                    </div>

                    <p className="text-xl mb-6 text-slate-800">
                      <span className="font-black">{currentQuestion.id}. </span>
                      {(() => {
                        const fullText = cleanQuestionText(currentQuestion.question);
                        const dotIndex = fullText.indexOf('.');
                        if (dotIndex !== -1) {
                          const title = fullText.substring(0, dotIndex + 1);
                          const description = fullText.substring(dotIndex + 1);
                          return (
                            <>
                              <span className="font-black">{title}</span>
                              <span className="font-medium text-slate-600"> {description}</span>
                            </>
                          );
                        }
                        return <span className="font-black">{fullText}</span>;
                      })()}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        const pts = idx === 5 ? 0 : idx + 1; 
                        
                        // On utilise TOUJOURS l'ID de la question parente (q.id) pour stocker la réponse
                        // ainsi, qu'on soit en question originale ou remplacement, le score va au même endroit
                        const sel = answers[q.id] === pts; 
                        
                        return (
                          <button 
                            key={idx} 
                            onClick={() =>
                              setAnswers(prev => ({
                                ...prev,
                                [q.id]: pts
                              }))
                            } 
                            className={`p-4 rounded-xl border text-left font-bold uppercase text-[11px]
                            flex items-center gap-3 transition-all duration-200
                            ${sel
                              ? "ring-4 ring-white/40 border-white scale-[1.02] shadow-lg"
                              : "opacity-90 hover:opacity-100"}
                            ${colorMap[opt.color] || "bg-slate-700 text-white"}
                            `}
                          >
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center bg-white">
                              {sel && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                            </div>
                            {opt.text.replace(/^X\s/, "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        <div className="flex flex-col md:flex-row gap-6 pt-10 pb-20">

          {/* Retour menu */}
          <button
            onClick={() => {
              setActiveDiagnosticSection(null);
              window.scrollTo(0,0);
            }}
            className="flex-1 bg-slate-800 text-white p-6 rounded-3xl font-black uppercase hover:bg-slate-900 transition-all shadow-xl"
          >
            ← Menu des sections
          </button>

          {/* Navigation dynamique entre parties */}
          {["env","soc","eco"]
            .filter(section => section !== activeDiagnosticSection)
            .map(section => {

              const labels = {
                env: "Aller à la partie Environnement",
                soc: "Aller à la partie Social",
                eco: "Aller à la partie Économie"
              };

              const colors = {
                env: "bg-emerald-600 hover:bg-emerald-700",
                soc: "bg-pink-600 hover:bg-pink-700",
                eco: "bg-orange-600 hover:bg-orange-700"
              };

              return (
                <button
                  key={section}
                  onClick={() => {
                    setActiveDiagnosticSection(section);
                    window.scrollTo(0,0);
                  }}
                  className={`flex-1 text-white p-6 rounded-3xl font-black uppercase shadow-xl transition-all ${colors[section]}`}
                >
                  {labels[section]}
                </button>
              );
            })}
        </div>
      </div>
    )}
  </div>
  
)}

        {activeTab === "Résultats" && (
          <div id="pdf-report" className="space-y-12 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-4 border-blue-600 pb-8 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-20 bg-white rounded-xl shadow-sm border border-slate-100 p-2 shrink-0">
                  <img src={LOGO_URL} alt="Polytechnique" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-5xl font-black italic uppercase leading-tight text-slate-900">Rapport de Diagnostic</h2>
                  <p className="text-blue-600 font-black text-xl uppercase tracking-widest">{muralInfo["Nom de la commune"] || "Collectivité"}</p>
                </div>
              </div>
              <button onClick={generatePDF} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 print:hidden">Imprimer / Export PDF</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 bg-blue-600 p-8 md:p-12 rounded-[30px] md:rounded-[50px] text-white flex flex-col justify-center relative overflow-hidden">
                
                <div className="relative z-10 space-y-6">
                  {/* Score principal */}
                  <div>
                    <div className="text-9xl font-black leading-none">{globalScore}</div>
                    <span className="text-xl font-bold uppercase block">
                      Score Global / 5.0
                    </span>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/20">
                    {/* 1. Taux de complétion */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                        Taux de complétion
                      </div>
                      <div className="text-3xl font-black italic">
                        {Math.round((Object.keys(answers).filter(k => !k.endsWith('_na')).length / questions.length) * 100)}%
                      </div>
                    </div>

                    {/* 2. Somme des questions "Aucune donnée disponible" */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                        Données non disponibles
                      </div>
                      <div className="text-3xl font-black italic">
                        {Object.values(answers).filter(v => v === 0).length} <span className="text-sm not-italic opacity-80">questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-[50px] p-8 border border-slate-200 shadow-sm flex items-center justify-center print:rounded-none print:shadow-none print:border-none break-inside-avoid">
                <ReactECharts 
                  option={chartOption} 
                  style={{ height: "600px", width: "100%" }} 
                  className="print:h-[500px]"
                />
              </div>
            </div>
            <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 break-inside-avoid">
              <h3 className="text-2xl font-black uppercase mb-6">
                Tableau des résultats par ODD
              </h3>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-xs">
                    <th className="p-3 text-left">ODD</th>
                    <th className="p-3 text-left">Score</th>
                    <th className="p-3 text-left">Niveau</th>
                  </tr>
                </thead>
                <tbody>
                  {oddScores.map((odd, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-bold">{odd.label}</td>
                      <td className="p-3">{odd.score.toFixed(2)}</td>
                      <td className="p-3">
                        {odd.score >= 4 && "Très avancé"}
                        {odd.score >= 3 && odd.score < 4 && "Avancé"}
                        {odd.score >= 2 && odd.score < 3 && "Intermédiaire"}
                        {odd.score < 2 && "À renforcer"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mt-12 pt-10 border-t border-slate-200 print:hidden">
            <button 
              onClick={() => {
                window.scrollTo(0, 0);
                setActiveTab("Questionnaire");
              }} 
              className="flex-1 bg-white text-slate-900 border-2 border-slate-200 p-6 rounded-3xl font-black uppercase hover:bg-slate-50 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">←</span> 
              Modifier les réponses
            </button>

            <button 
              onClick={() => {
                window.scrollTo(0, 0);
                setActiveTab("Priorités"); 
              }} 
              className="flex-1 bg-blue-600 text-white p-6 rounded-3xl font-black uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              Identifier les priorités
              <span className="text-2xl">→</span>
            </button>
            </div>
          </div>
          
        )}

        {activeTab === "Priorités" && (
          <div className="space-y-8 animate-in fade-in pb-20">
            <div className="space-y-4">
              <h2 className="text-5xl font-black italic uppercase underline decoration-blue-500 text-slate-900">Priorités stratégiques</h2>
              <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">
                Ici nous vous présentons les priorités stratégiques identifiées à partir des résultats du questionnaire, elles sont organisées en fonction des ODD les plus faiblement performants.
              </p>
            </div>
            
            <div className="grid gap-6">
              {lowPerformingODDs.map(item => {
                const visuals = getScoreVisuals(item.value);
                
                // Logique de message ajustée selon vos nouveaux seuils
                let genericMessage = "";
                if (item.value < 2) {
                  // Rouge
                  genericMessage = "Cet indicateur nécessite des mesures urgentes.";
                } else if (item.value < 3) {
                  // Orange
                  genericMessage = "Cet indicateur nécessite un plan d'action à moyen terme.";
                } else if (item.value < 4) {
                  // Jaune
                  genericMessage = "Cet indicateur peut être amélioré à long terme.";
                } else {
                  // Vert (pour les scores >= 4 si affichés)
                  genericMessage = "Cet indicateur présente une performance satisfaisante.";
                }

                return (
                  <div key={item.odd} className={`bg-white p-8 rounded-[30px] border-l-[20px] ${visuals.twBorder} flex justify-between items-center shadow-md border border-slate-200 hover:translate-x-2 transition-transform`}>
                    <div className="flex items-center gap-8">
                      <img src={oddIcons[item.odd]} alt={item.odd} className="w-20 h-20 rounded-xl shadow-sm" />
                      <div>
                        <div className={`text-5xl font-black ${visuals.twText} italic uppercase leading-none mb-2`}>
                          {item.odd}
                        </div>
                        <p className="text-lg font-bold text-slate-700 italic">
                          {genericMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-slate-900">
                        {item.value} <span className="text-sm text-slate-400">/ 5</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ... Autres onglets (À Propos, Partenaires, Citoyens, Contact) identiques à la version précédente ... */}
        
        {activeTab === "À Propos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center py-12 animate-in">
            <div className="space-y-8">
              <h2 className="text-6xl font-black italic underline decoration-blue-500 decoration-8 underline-offset-8 uppercase leading-tight text-slate-900">Notre Engagement</h2>
              <p className="text-xl text-slate-600 leading-relaxed font-light">ODD-X transforme les données communales en leviers d'action. En alignant votre stratégie sur les Objectifs de Développement Durable, nous créons ensemble des territoires résilients.</p>
            </div>
            <div className="rounded-[40px] overflow-hidden border border-slate-200 shadow-2xl">
              <img src="https://educatif.eedf.fr/wp-content/uploads/sites/157/2021/02/ODD.jpg" alt="ODD Logo"/>
            </div>
          </div>
        )}

        {activeTab === "Partenaires" && (
          <div className="space-y-16 animate-in fade-in pb-20">
            <div className="space-y-4">
              <h2 className="text-5xl font-black italic uppercase underline decoration-blue-500 text-slate-900">Institutions spécialisées</h2>
              <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">Ces organismes publics et réseaux d'experts accompagnent les collectivités dans leurs stratégies de transition durable et de résilience.</p>
            </div>

            {[
              {
                title: "Environnement & Climat",
                color: "decoration-emerald-500",
                badgeColor: "bg-emerald-600", // Vert pour l'environnement
                institutions: [
                  { name: "ADEME", full: "Agence de la transition écologique", desc: "Expertise technique et financements pour la transition énergétique, le climat, l'économie circulaire et la planification territoriale.", link: "https://www.ademe.fr/" },
                  { name: "Cerema", full: "Centre d’expertise sur les risques, l’environnement et la mobilité", desc: "Appui en ingénierie territoriale, adaptation au changement climatique, prévention des risques et aménagement résilient.", link: "https://www.cerema.fr/" },
                  { name: "OFB", full: "Office français de la biodiversité", desc: "Soutien technique et financier pour la protection des milieux naturels, la gestion de l’eau et la biodiversité locale.", link: "https://ofb.gouv.fr/" },
                  { name: "BRGM", full: "Bureau de recherches géologiques et minières", desc: "Expertise sur les sols, les risques naturels, la gestion des ressources en eau et l’adaptation au changement climatique.", link: "https://www.brgm.fr/" },
                  { name: "INRAE", full: "Recherche pour l’agriculture, l’alimentation et l’environnement", desc: "Expertise sur l'agriculture durable, les systèmes alimentaires territoriaux et la gestion des ressources naturelles.", link: "https://www.inrae.fr/" },
                  { name: "Club DD", full: "Le club développement durable", desc: "Réseau d'échange pour les établissements et entreprises publics sur les enjeux de responsabilité sociétale et durable.", link: "https://www.ecologie.gouv.fr/politiques-publiques/club-developpement-durable-etablissements-entreprises-publics" }
                ]
              },
              {
                title: "Social & Cohésion",
                color: "decoration-pink-500",
                badgeColor: "bg-pink-600", // Rose pour le social
                institutions: [
                  { name: "ANCT", full: "Agence nationale de la cohésion des territoires", desc: "Accompagnement des collectivités dans les projets de revitalisation, inclusion sociale et services publics de proximité.", link: "https://anct.gouv.fr/" },
                  { name: "DREES", full: "Direction de la recherche, des études et des statistiques", desc: "Données et analyses sur la pauvreté, la santé, la protection sociale et les inégalités territoriales.", link: "https://drees.solidarites-sante.gouv.fr/" },
                  { name: "INSEE", full: "Institut national de la statistique et des études économiques", desc: "Indicateurs territoriaux (emploi, revenus, démographie) pour le diagnostic social et le suivi des ODD à l’échelle locale.", link: "https://www.insee.fr/" },
                  { name: "FVD", full: "France Villes et Territoires Durables", desc: "Association regroupant l'État, les collectivités et les experts pour accélérer le déploiement des ODD à l'échelle locale.", link: "https://francevilledurable.fr/" }
                ]
              },
              {
                title: "Économie, Innovation & Recherche",
                color: "decoration-orange-500",
                badgeColor: "bg-orange-500", // Orange pour l'économie
                institutions: [
                  { name: "Banque des Territoires", full: "Groupe Caisse des Dépôts", desc: "Financement et ingénierie de projets locaux : infrastructures, transition énergétique et revitalisation urbaine.", link: "https://www.banquedesterritoires.fr/" },
                  { name: "CEA", full: "Commissariat à l’énergie atomique et aux énergies alternatives", desc: "Recherche et innovation sur l’efficacité énergétique, l’hydrogène et les technologies bas carbone.", link: "https://www.cea.fr/" },
                  { name: "ANR", full: "Agence nationale de la recherche", desc: "Financement de projets de recherche et d’innovation associant collectivités et chercheurs sur les transitions durables.", link: "https://anr.fr/" },
                  { name: "CNRS", full: "Centre national de la recherche scientifique", desc: "Recherche pluridisciplinaire mobilisable pour accompagner les stratégies territoriales complexes et durables.", link: "https://www.cnrs.fr/fr" }
                ]
              }
            ].map((section, sIdx) => (
              <div key={sIdx} className="space-y-8">
                <h3 className={`text-2xl font-black uppercase italic underline decoration-4 underline-offset-8 ${section.color} text-slate-800`}>
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.institutions.map((inst, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full">
                      {/* Le badge utilise maintenant section.badgeColor */}
                      <span className={`${section.badgeColor} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 self-start`}>
                        {inst.name}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 uppercase mb-3 leading-tight">
                        {inst.full}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow">
                        {inst.desc}
                      </p>
                      <a 
                        href={inst.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-blue-100 hover:border-blue-600 transition-all inline-block w-fit"
                      >
                        Consulter les ressources
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Citoyens" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in">
             <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-200 h-fit shadow-lg sticky top-24">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-blue-600">Proposer une idée</h3>
                {selectedOddForm && (
                  <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl animate-in zoom-in-95">
                    <img src={oddIcons[selectedOddForm]} alt="" className="w-16 h-16 rounded-lg" />
                    <p className="text-xs font-bold text-slate-600">{oddDescriptions[selectedOddForm]}</p>
                  </div>
                )}
                <form onSubmit={handleAddIdea} className="space-y-4">
                  <select
                    value={selectedOddForm}
                    onChange={(e) => setSelectedOddForm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  >
                    <option value="">Choisir un ODD...</option>
                    {Object.keys(oddDescriptions).map(odd => (
                      <option key={odd} value={odd}>
                        {odd} - {oddDescriptions[odd].substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                  <textarea name="ideaText" placeholder="Votre proposition..." rows="6" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" required></textarea>
                  <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Publier l'idée</button>
                </form>
             </div>
             <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-black uppercase italic border-b border-slate-200 pb-4 text-slate-900">Boîte à idées citoyenne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citizenIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group relative transition-all hover:border-blue-200">
                      <button 
                        onClick={() => handleDeleteIdea(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                        title="Supprimer cette idée"
                      >
                        ✕
                      </button>
                      <div className="flex gap-4 mb-4">
                         <img src={oddIcons[idea.odd]} alt="" className="w-10 h-10 rounded-md shrink-0" />
                         <p className="font-bold italic text-slate-700 leading-tight">"{idea.text}"</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{idea.odd}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Le {idea.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === "Contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-12 items-center animate-in fade-in">
            <div className="space-y-8 text-slate-600 text-xl font-light">
              <h2 className="text-7xl font-black uppercase italic underline decoration-blue-500 leading-tight text-slate-900">Contact</h2>
              <p>📍 Paris, France</p>
              <p>✉️ <a href="mailto:info@odd-x.com" className="font-bold text-blue-600 hover:underline">info@odd-x.com</a></p>
            </div>
            <form action="https://formspree.io/f/xwvnldkr" method="POST" className="bg-white p-12 rounded-[50px] border border-slate-200 space-y-4 shadow-xl">
              <input type="text" name="name" placeholder="NOM" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold" required />
              <input type="email" name="email" placeholder="EMAIL" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold" required />
              <textarea name="message" placeholder="MESSAGE..." rows="5" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-bold" required></textarea>
              <button type="submit" className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Envoyer</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;