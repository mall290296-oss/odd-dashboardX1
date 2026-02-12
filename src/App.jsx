import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import questions from "./formulaire.json";

function App() {
  const [activeTab, setActiveTab] = useState("accueil");
  const [muralInfo, setMuralInfo] = useState(() => {
    const saved = localStorage.getItem("sdgx_identite");
    return saved ? JSON.parse(saved) : {};
  });
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("oddAnswers");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("sdgx_identite", JSON.stringify(muralInfo));
    localStorage.setItem("oddAnswers", JSON.stringify(answers));
  }, [muralInfo, answers]);

  // 1. FONCTION POUR TOUT EFFACER
  const resetAllData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données et recommencer ?")) {
      setAnswers({});
      setMuralInfo({});
      localStorage.removeItem("oddAnswers");
      localStorage.removeItem("sdgx_identite");
      setActiveTab("accueil");
    }
  };

  // 2. FONCTION POUR IMPRIMER EN PDF
  const printToPDF = () => {
    window.print();
  };

  const isIdentified = muralInfo.nomCommune && muralInfo.emailOfficiel;

  const { oddAverages, globalScore } = useMemo(() => {
    const scores = {};
    const counts = {};
    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer && answer !== 0) {
        q.odds.forEach((odd) => {
          scores[odd] = (scores[odd] || 0) + answer;
          counts[odd] = (counts[odd] || 0) + 1;
        });
      }
    });
    const averages = Object.keys(scores).map((odd) => ({
      odd: `ODD ${odd}`,
      value: Number((scores[odd] / counts[odd]).toFixed(2)),
    }));
    return {
      oddAverages: averages.sort((a, b) => a.odd.localeCompare(b.odd, undefined, {numeric: true})),
      globalScore: averages.length > 0 ? (averages.reduce((acc, item) => acc + item.value, 0) / averages.length).toFixed(2) : 0,
    };
  }, [answers]);

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "<strong>{b}</strong><br/>Score : {c} / 4" },
    series: [{
      type: "pie", radius: [40, 150], roseType: "area",
      itemStyle: { borderRadius: 4, borderColor: "#000", borderWidth: 2 },
      label: { show: true, color: "#fff", fontSize: 10 },
      data: oddAverages.map((item) => {
        let color = "#ef4444";
        if (item.value > 1.5) color = "#f97316";
        if (item.value > 2.5) color = "#eab308";
        if (item.value > 3.5) color = "#22c55e";
        return { value: item.value, name: item.odd, itemStyle: { color } };
      }),
    }],
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* NAVIGATION AMÉLIORÉE (Point 3 : Toujours accessible pour revenir en arrière) */}
      <nav className="border-b border-white/10 px-8 py-4 sticky top-0 bg-black/90 backdrop-blur-md z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter text-blue-500 cursor-pointer" onClick={() => setActiveTab("accueil")}>SDG-X</span>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest">
            <button onClick={() => setActiveTab("accueil")} className={activeTab === "accueil" ? "text-blue-500" : "hover:text-blue-400"}>Accueil</button>
            <button onClick={() => setActiveTab("identite")} className={activeTab === "identite" ? "text-blue-500" : "hover:text-blue-400"}>Diagnostic</button>
            <button 
                onClick={() => isIdentified ? setActiveTab("resultats") : alert("Veuillez d'abord remplir l'identité")} 
                className={activeTab === "resultats" ? "text-blue-500" : "hover:text-blue-400 disabled:opacity-30"}
            >
                Résultats
            </button>
            <button onClick={() => setActiveTab("contact")} className={activeTab === "contact" ? "text-blue-500" : "hover:text-blue-400"}>Contact</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* PAGE D'ACCUEIL */}
        {activeTab === "accueil" && (
          <div className="text-center py-24 space-y-8 animate-in fade-in duration-700">
            <h1 className="text-7xl font-black tracking-tighter">SDG-X : LE FUTUR <span className="text-blue-500 text-glow">DURABLE</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">Mesurez, analysez et pilotez les Objectifs de Développement Durable de votre commune.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setActiveTab("identite")} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]">LANCER LE TEST</button>
                <button onClick={resetAllData} className="border border-white/20 hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all">REINITIALISER</button>
            </div>
          </div>
        )}

        {/* DIAGNOSTIC / IDENTITE */}
        {activeTab === "identite" && (
          <div className="max-w-3xl mx-auto bg-slate-900/50 p-12 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-4 uppercase italic">1. Identité Commune</h2>
            <div className="space-y-4">
              <input name="nomCommune" placeholder="NOM OFFICIEL" value={muralInfo.nomCommune || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
              <input name="emailOfficiel" placeholder="EMAIL DE CONTACT" value={muralInfo.emailOfficiel || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
              <button disabled={!isIdentified} onClick={() => setActiveTab("formulaire")} className={`w-full p-4 rounded-xl font-black tracking-widest transition-all ${isIdentified ? "bg-blue-600 hover:bg-blue-700 shadow-lg" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>PASSER AU QUESTIONNAIRE →</button>
            </div>
          </div>
        )}

        {/* QUESTIONNAIRE */}
        {activeTab === "formulaire" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-12 sticky top-24 bg-black/80 p-4 rounded-2xl backdrop-blur-sm border border-white/10 z-40">
              <h2 className="text-3xl font-black italic">2. ANALYSE TERRAIN</h2>
              <div className="flex gap-3">
                <button onClick={resetAllData} className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition">REINITIALISER</button>
                <button onClick={() => setActiveTab("resultats")} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase hover:bg-white hover:text-black transition">CALCULER MON SCORE</button>
              </div>
            </div>
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition duration-500 group">
                <p className="text-xl font-bold mb-6 text-slate-200 group-hover:text-white">{q.id}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <label key={opt.val} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${answers[q.id] === opt.val ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-black border-white/10 hover:border-white/40"}`}>
                      <input type="radio" checked={answers[q.id] === opt.val} onChange={() => setAnswers({...answers, [q.id]: opt.val})} className="w-4 h-4 accent-white" />
                      <span className="text-sm font-semibold uppercase tracking-wide">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESULTATS & RECOMMANDATIONS (Point 3 : Tout sur la même page ou boutons de retour) */}
        {activeTab === "resultats" && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
             <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-8 print:hidden">
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">Votre Scorecard</h2>
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab("formulaire")} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition">← RETOUR AUX QUESTIONS</button>
                    <button onClick={printToPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">IMPRIMER PDF (OFFICIEL)</button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 rounded-[40px] shadow-2xl flex flex-col items-center justify-center border border-white/20">
                  <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-4">Maturité SDG-X</span>
                  <div className="text-9xl font-black leading-none">{globalScore}</div>
                  <span className="text-2xl font-bold opacity-60 mt-2">SUR 4.0</span>
                </div>
                <div className="lg:col-span-2 bg-slate-900/50 rounded-[40px] p-8 border border-white/10 backdrop-blur-md">
                   <ReactECharts option={chartOption} style={{ height: "550px" }} />
                </div>
             </div>

             <div className="bg-white text-black p-12 rounded-[40px] shadow-2xl print:bg-transparent print:text-black">
                <h3 className="text-4xl font-black tracking-tighter mb-8 italic uppercase underline decoration-blue-600 decoration-8 underline-offset-4">Analyse des priorités</h3>
                <div className="grid gap-6">
                  {Object.keys(answers).map(id => (answers[id] === 1 || answers[id] === 2) && (
                    <div key={id} className="p-6 bg-slate-100 rounded-3xl border-l-[12px] border-blue-600 flex gap-6 items-center">
                       <div className="text-4xl font-black text-blue-600/30 uppercase shrink-0">Q{id}</div>
                       <p className="text-lg font-bold leading-tight">Une action stratégique est requise pour cet indicateur afin d'atteindre les objectifs 2030.</p>
                    </div>
                  ))}
                  {Object.keys(answers).every(id => answers[id] > 2) && (
                    <p className="text-center text-slate-400 italic py-10">Félicitations, aucune alerte critique détectée.</p>
                  )}
                </div>
             </div>
          </div>
        )}

        {/* PAGE CONTACT */}
        {activeTab === "contact" && (
          <div className="max-w-4xl mx-auto py-12 text-center space-y-12 animate-in fade-in">
            <h2 className="text-6xl font-black italic">REJOIGNEZ LE MOUVEMENT</h2>
            <div className="bg-slate-900/50 p-12 rounded-[40px] border border-white/10">
                <p className="text-2xl font-light text-slate-300 mb-8">Une question ? Un besoin d'accompagnement spécifique pour votre commune ?</p>
                <a href="mailto:info@sdg-x.com" className="text-4xl font-black text-blue-500 hover:text-white transition duration-500 underline decoration-white/20">info@sdg-x.com</a>
            </div>
            <button onClick={() => setActiveTab("accueil")} className="text-slate-500 font-bold hover:text-white uppercase tracking-widest text-sm">← Retour à l'accueil</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;