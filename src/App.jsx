import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { QRCodeCanvas } from "qrcode.react";
import questions from "./formulaire.json";

// Configuration des couleurs style plateforme gouvernementale
const SECTION_COLORS = {
  env: { 
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-700", 
    hover: "hover:from-emerald-600 hover:to-emerald-800", 
    progress: "bg-white/20" 
  },
  soc: { 
    bg: "bg-gradient-to-br from-blue-600 to-blue-800", 
    hover: "hover:from-blue-700 hover:to-blue-900", 
    progress: "bg-white/20" 
  },
  eco: { 
    bg: "bg-gradient-to-br from-orange-500 to-orange-700", 
    hover: "hover:from-orange-600 hover:to-orange-800", 
    progress: "bg-white/20" 
  }
};

const colorMap = {
  "rouge": "bg-red-100 text-red-700 border-red-400 hover:bg-red-200",
  "orange": "bg-orange-100 text-orange-700 border-orange-400 hover:bg-orange-200",
  "jaune": "bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200",
  "vert clair": "bg-green-100 text-green-700 border-green-400 hover:bg-green-200",
  "vert foncé": "bg-green-200 text-green-800 border-green-500 hover:bg-green-300",
  "blanc": "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
  "ODD 5": "Parvenir à l’égalité des sexes et autonomiser toutes les femmes et les filles.",
  "ODD 6": "Garantir l’accès de tous à l’eau et à l’assainissement.",
  "ODD 7": "Garantir l’accès de tous à des services énergétiques fiables, durables et modernes.",
  "ODD 8": "Promouvoir une croissance économique durable et un travail décent pour tous.",
  "ODD 9": "Bâtir une infrastructure résiliente et encourager l’innovation.",
  "ODD 10": "Réduire les inégalités dans les pays et d’un pays à l’autre.",
  "ODD 11": "Faire en sorte que les villes soient sûres, résilientes et durables.",
  "ODD 12": "Instaurer des modes de consommation et de production durables.",
  "ODD 13": "Prendre d’urgence des mesures pour lutter contre les changements climatiques.",
  "ODD 14": "Conserver et exploiter de manière durable les ressources marines.",
  "ODD 15": "Préserver et restaurer les écosystèmes terrestres et la biodiversité.",
  "ODD 16": "Promouvoir l’avènement de sociétés pacifiques et l’accès à la justice pour tous.",
  "ODD 17": "Renforcer le Partenariat mondial pour le développement durable."
};

const getScoreVisuals = (score) => {
  if (score < 2) return { hex: "#dc2626", twBorder: "border-l-red-600", label: "Score Critique", twText: "text-red-600" };
  if (score < 3) return { hex: "#ea580c", twBorder: "border-l-orange-600", label: "Insuffisant", twText: "text-orange-600" };
  if (score < 4) return { hex: "#ca8a04", twBorder: "border-l-yellow-600", label: "En progression", twText: "text-yellow-600" };
  if (score < 4.5) return { hex: "#16a34a", twBorder: "border-l-green-600", label: "Bon score", twText: "text-green-600" };
  return { hex: "#15803d", twBorder: "border-l-green-800", label: "Excellent score", twText: "text-green-800" };
};

const LOGO_URL = "https://programmes.polytechnique.edu/sites/default/files/2022-06/logo-polytechnique.svg";

function App() {
  const [activeTab, setActiveTab] = useState("Accueil");
  const [profiles, setProfiles] = useState(() => JSON.parse(localStorage.getItem("oddx_profiles_list") || "[]"));
  const [muralInfo, setMuralInfo] = useState(() => JSON.parse(localStorage.getItem("oddx_current_identite") || "{}"));
  const [citizenIdeas, setCitizenIdeas] = useState(() => JSON.parse(localStorage.getItem("oddx_ideas") || "[]"));
  const [selectedOddForm, setSelectedOddForm] = useState("");
  const [activeDiagnosticSection, setActiveDiagnosticSection] = useState(null);

  const storageKey = useMemo(() => {
    const name = muralInfo["Nom de la commune"];
    return name ? `oddx_answers_${name.replace(/\s+/g, '_').toLowerCase()}` : "oddx_answers_default";
  }, [muralInfo]);

  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "{}"));

  useEffect(() => {
    const savedAnswers = localStorage.getItem(storageKey);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
  }, [storageKey]);

  useEffect(() => {
    const name = muralInfo["Nom de la commune"];
    localStorage.setItem("oddx_current_identite", JSON.stringify(muralInfo));
    localStorage.setItem(storageKey, JSON.stringify(answers));
    localStorage.setItem("oddx_ideas", JSON.stringify(citizenIdeas));

    if (name && name.trim() !== "") {
      if (!profiles.includes(name)) {
        const newProfiles = [...profiles, name];
        setProfiles(newProfiles);
        localStorage.setItem("oddx_profiles_list", JSON.stringify(newProfiles));
      }
      const allIdentities = JSON.parse(localStorage.getItem("oddx_all_identities") || "{}");
      allIdentities[name] = muralInfo;
      localStorage.setItem("oddx_all_identities", JSON.stringify(allIdentities));
    }
  }, [answers, muralInfo, citizenIdeas, storageKey, profiles]);

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

  const handleSwitchProfile = (profileName) => {
    if (!profileName) { setMuralInfo({}); setAnswers({}); return; }
    const allIdentities = JSON.parse(localStorage.getItem("oddx_all_identities") || "{}");
    if (allIdentities[profileName]) setMuralInfo(allIdentities[profileName]);
  };

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 overflow-x-hidden">
      {/* NAVIGATION RESPONSIVE */}
      <nav className="border-b border-slate-200 px-4 md:px-8 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("Accueil")}>
            <div className="w-10 h-8 md:w-12 md:h-10 flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-blue-600 uppercase">ODD-X</span>
          </div>
          <div className="flex gap-3 md:gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar justify-center">
            {["Accueil", "À Propos", "Diagnostic", "Résultats", "Priorités", "Partenaires", "Citoyens", "Contact"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); window.scrollTo(0,0); }} className={`${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-blue-500"} pb-1 transition-all whitespace-nowrap uppercase tracking-tighter`}>
                {tab === "Partenaires" ? "Institutions" : tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        
        {/* ACCUEIL */}
        {activeTab === "Accueil" && (
          <div className="text-center py-10 md:py-20 space-y-6 md:space-y-8 animate-in fade-in duration-1000">
            <div className="flex justify-center mb-4">
              <div className="w-40 h-24 md:w-64 md:h-40 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 md:p-6 border border-slate-100">
                <img src={LOGO_URL} alt="Polytechnique" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none text-slate-900 px-2">ODD-X</h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-light italic px-4">Le diagnostic de durabilité pour les collectivités territoriales.</p>
            <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <div className="bg-white p-4 md:p-6 rounded-[30px] shadow-2xl border border-slate-100 transition-transform hover:scale-105">
                <QRCodeCanvas value={window.location.href} size={140} bgColor="#ffffff" fgColor="#0f172a" level="H" includeMargin={true} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scannez pour accéder au diagnostic</p>
            </div>
            <div className="pt-6">
              <button onClick={() => setActiveTab("Diagnostic")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-base md:text-lg transition-all hover:scale-105 shadow-xl shadow-blue-200 uppercase tracking-widest">DÉMARRER LE DIAGNOSTIC</button>
            </div>
          </div>
        )}

        {/* DIAGNOSTIC (IDENTITÉ) */}
        {activeTab === "Diagnostic" && (
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center md:items-end gap-4 w-full md:w-auto">
                <div className="w-full md:w-auto">
                  <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-widest text-center md:text-left">Sélectionner une Mairie</h3>
                  <select onChange={(e) => handleSwitchProfile(e.target.value)} value={muralInfo["Nom de la commune"] || ""} className="bg-slate-50 border border-slate-200 p-2 mt-2 rounded-lg text-sm font-bold w-full md:w-64 outline-none focus:border-blue-500 text-slate-700">
                    <option value="">-- Sélectionner --</option>
                    {profiles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {muralInfo["Nom de la commune"] && (
                  <button onClick={() => { if(window.confirm("Supprimer ?")) { /* logic here */ } }} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all w-full md:w-auto">Supprimer</button>
                )}
              </div>
              <button onClick={() => { setMuralInfo({}); setAnswers({}); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 w-full md:w-auto">➕ Nouvelle Mairie</button>
            </div>
            {/* Champs d'identité (simplifié pour le code) */}
            <div className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-200 shadow-sm">
                <h3 className="text-blue-600 font-black uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 text-sm italic">Informations de la Commune</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Nom de la commune", "Code Insee", "Email officiel", "Région"].map(field => (
                        <div key={field} className="flex flex-col">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-2">{field}</label>
                            <input value={muralInfo[field] || ""} onChange={(e) => setMuralInfo({...muralInfo, [field]: e.target.value})} className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none text-sm font-bold" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center pt-8">
              <button onClick={() => setActiveTab("Questionnaire")} className="w-full md:w-auto px-12 py-5 rounded-2xl font-black uppercase transition-all shadow-2xl bg-blue-600 text-white scale-105 shadow-blue-200">Suivant</button>
            </div>
          </div>
        )}

        {/* QUESTIONNAIRE COLORÉ */}
        {activeTab === "Questionnaire" && (
           <div className="space-y-8 md:space-y-12 animate-in fade-in">
              <div className="bg-white border border-slate-200 p-4 md:p-6 rounded-3xl mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg sticky top-20 md:top-24 z-40">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {activeDiagnosticSection && (
                    <button onClick={() => setActiveDiagnosticSection(null)} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-md shrink-0">← Menu</button>
                  )}
                  <p className="text-xs md:text-sm font-black uppercase text-slate-800 italic truncate">Diagnostic : <span className="text-blue-600">{muralInfo["Nom de la commune"] || "En cours..."}</span></p>
                </div>
              </div>

              {!activeDiagnosticSection ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-4 md:py-10">
                  {groupedQuestions.map((group) => {
                    const progress = getGroupProgress(group.questions);
                    const theme = SECTION_COLORS[group.id];
                    return (
                      <button key={group.id} onClick={() => { setActiveDiagnosticSection(group.id); window.scrollTo(0,0); }} className={`relative min-h-[300px] md:aspect-[3/4] ${theme.bg} rounded-[30px] shadow-2xl p-8 md:p-10 flex flex-col justify-center items-center text-center group hover:scale-[1.03] ${theme.hover} transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-white/20`}>
                        <div className={`absolute bottom-0 left-0 w-full ${theme.progress} transition-all duration-1000`} style={{ height: `${progress.percent}%` }}></div>
                        <h3 className="relative z-10 text-white text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight mb-4">{group.title.split(' - ')[0]}<br/><span className="text-white/40 text-lg italic">—</span><br/>{group.title.split(' - ')[1]}</h3>
                        <div className="relative z-10 mt-4 md:mt-6">
                           <div className="text-3xl md:text-4xl font-black text-white">{progress.percent}%</div>
                           <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">{progress.count} / {progress.total} RÉPONSES</div>
                        </div>
                        <div className="relative z-10 mt-8 md:mt-10 bg-white text-slate-900 px-8 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest group-hover:scale-110 transition-transform shadow-lg">COMMENCER</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-10">
                  {/* Questions du questionnaire */}
                  {groupedQuestions.filter(g => g.id === activeDiagnosticSection).map((group) => (
                    <div key={group.id} className="space-y-6">
                        <h3 className="text-xl md:text-4xl font-black text-slate-900 italic uppercase leading-tight border-b-4 border-blue-600 pb-4">{group.title}</h3>
                        {group.questions.map((q) => (
                          <div key={q.id} className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-200 shadow-sm">
                            <p className="text-lg md:text-xl font-black mb-6 text-slate-800">Q{q.id}. {q.question.replace(/^Q\d+\s?[-–]\s?/, "")}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt, idx) => {
                                const pts = idx === 5 ? 0 : idx + 1; 
                                const sel = answers[q.id] === pts;
                                return (
                                  <button key={idx} onClick={() => setAnswers({...answers, [q.id]: pts})} className={`p-4 rounded-xl border text-left transition-all font-bold uppercase text-[10px] md:text-[11px] flex items-center gap-3 ${sel ? "ring-4 ring-blue-100 border-blue-400 scale-[1.01]" : "opacity-90"} ${colorMap[opt.color] || "bg-slate-50"}`}>
                                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center bg-white">{sel && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}</div>
                                    <span className="leading-tight">{opt.text}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-10 pb-20">
                    <button onClick={() => setActiveDiagnosticSection(null)} className="w-full md:flex-1 bg-slate-800 text-white p-5 rounded-2xl font-black uppercase hover:bg-slate-900 transition-all shadow-xl">← Retour</button>
                    <button onClick={() => setActiveTab("Résultats")} className="w-full md:flex-1 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Résultats</button>
                  </div>
                </div>
              )}
           </div>
        )}

        {/* RÉSULTATS (RESTAURÉ) */}
        {activeTab === "Résultats" && (
          <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-4 border-blue-600 pb-8 gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                <div className="w-24 h-16 md:w-32 md:h-20 bg-white rounded-xl shadow-sm border border-slate-100 p-2 shrink-0">
                  <img src={LOGO_URL} alt="Polytechnique" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase leading-tight text-slate-900">Rapport Final</h2>
                  <p className="text-blue-600 font-black text-lg md:text-xl uppercase tracking-widest">{muralInfo["Nom de la commune"] || "Collectivité"}</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg print:hidden">Imprimer / PDF</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-blue-600 p-10 md:p-16 rounded-[40px] md:rounded-[50px] flex flex-col items-center justify-center border border-white/20 shadow-2xl text-center text-white relative overflow-hidden min-h-[300px]">
                {/* Image filigrane restaurée */}
                <img src={LOGO_URL} alt="" className="absolute w-64 h-64 opacity-10 -bottom-10 -right-10 rotate-12 pointer-events-none grayscale invert" />
                <div className="relative z-10">
                  <div className="text-7xl md:text-9xl font-black leading-none">{globalScore}</div>
                  <span className="text-xl md:text-2xl font-bold uppercase mt-4 block">Score Global / 5.0</span>
                  <div className="mt-4 bg-white/20 px-4 py-1 rounded-full text-[10px] uppercase font-bold">{getScoreVisuals(globalScore).label}</div>
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-[40px] md:rounded-[50px] p-4 md:p-8 border border-slate-200 shadow-sm flex items-center justify-center overflow-x-auto min-h-[500px]">
                <div className="min-w-[300px] w-full">
                  <ReactECharts option={chartOption} style={{ height: "500px", width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CITOYENS (FONCTIONS DE SUPPRESSION RESTAURÉES) */}
        {activeTab === "Citoyens" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 animate-in fade-in">
             <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-200 h-fit shadow-lg sticky top-24">
                <h3 className="text-lg md:text-xl font-black mb-6 uppercase tracking-widest text-blue-600">Proposer une idée</h3>
                <form onSubmit={handleAddIdea} className="space-y-4">
                  <select value={selectedOddForm} onChange={(e) => setSelectedOddForm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" required>
                    <option value="">Choisir un ODD...</option>
                    {Object.keys(oddDescriptions).map(odd => <option key={odd} value={odd}>{odd}</option>)}
                  </select>
                  <textarea name="ideaText" placeholder="Votre proposition pour la commune..." rows="6" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" required></textarea>
                  <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase shadow-lg hover:bg-blue-700 transition-all">Publier l'idée</button>
                </form>
             </div>
             <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl md:text-2xl font-black uppercase italic border-b border-slate-200 pb-4 text-slate-900">Boîte à idées citoyenne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citizenIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group relative transition-all hover:border-blue-200">
                      {/* BOUTON SUPPRIMER RESTAURÉ */}
                      <button onClick={() => handleDeleteIdea(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-600">✕</button>
                      <div className="flex gap-4 mb-4">
                         <img src={oddIcons[idea.odd]} alt="" className="w-10 h-10 rounded-md shrink-0 shadow-sm" />
                         <p className="text-sm font-bold italic text-slate-700 leading-tight">"{idea.text}"</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase">{idea.odd}</span>
                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter">Le {idea.date}</span>
                      </div>
                    </div>
                  ))}
                  {citizenIdeas.length === 0 && <p className="text-slate-400 italic text-sm p-10 text-center col-span-2">Aucune idée publiée pour le moment.</p>}
                </div>
             </div>
          </div>
        )}

        {/* ... Autres onglets (À Propos, Priorités, Partenaires, Contact) restent identiques ... */}
        {activeTab === "Priorités" && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase underline decoration-blue-500 text-slate-900 leading-tight">Priorités stratégiques</h2>
              <div className="grid gap-4">
                {lowPerformingODDs.map(item => (
                  <div key={item.odd} className={`bg-white p-6 rounded-3xl border-l-[12px] ${getScoreVisuals(item.value).twBorder} shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100`}>
                    <div className="flex items-center gap-4">
                      <img src={oddIcons[item.odd]} alt="" className="w-16 h-16 rounded-xl" />
                      <div>
                        <h4 className={`text-2xl font-black ${getScoreVisuals(item.value).twText}`}>{item.odd}</h4>
                        <p className="text-sm font-bold text-slate-500">{oddDescriptions[item.odd]}</p>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{item.value}/5</div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {activeTab === "Contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12 items-center animate-in fade-in">
            <div className="space-y-6 text-slate-600 text-lg md:text-xl font-light text-center md:text-left px-4">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic underline decoration-blue-500 leading-tight text-slate-900">Contact</h2>
              <p>📍 Paris, France</p>
              <p>✉️ <a href="mailto:info@odd-x.com" className="font-bold text-blue-600 hover:underline">info@odd-x.com</a></p>
            </div>
            <form action="https://formspree.io/f/xwvnldkr" method="POST" className="bg-white p-6 md:p-12 rounded-[40px] border border-slate-200 space-y-4 shadow-xl mx-4">
              <input type="text" name="name" placeholder="NOM" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold" required />
              <input type="email" name="email" placeholder="EMAIL" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold" required />
              <textarea name="message" placeholder="MESSAGE..." rows="5" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold" required></textarea>
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Envoyer</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;