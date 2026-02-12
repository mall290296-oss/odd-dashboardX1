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
  }, [answers, muralInfo]);

  const resetAllData = () => {
    if (window.confirm("Effacer toutes les données et recommencer ?")) {
      setAnswers({});
      setMuralInfo({});
      localStorage.removeItem("oddAnswers");
      localStorage.removeItem("sdgx_identite");
      setActiveTab("accueil");
    }
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
      {/* NAVIGATION */}
      <nav className="border-b border-white/10 px-8 py-4 sticky top-0 bg-black/90 backdrop-blur-md z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter text-blue-500 cursor-pointer" onClick={() => setActiveTab("accueil")}>SDG-X</span>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest">
            <button onClick={() => setActiveTab("accueil")} className={activeTab === "accueil" ? "text-blue-500" : "hover:text-blue-400"}>Accueil</button>
            <button onClick={() => setActiveTab("a-propos")} className={activeTab === "a-propos" ? "text-blue-500" : "hover:text-blue-400"}>À Propos</button>
            <button onClick={() => setActiveTab("identite")} className={activeTab === "identite" ? "text-blue-500" : "hover:text-blue-400"}>Diagnostic</button>
            <button onClick={() => isIdentified ? setActiveTab("resultats") : null} className={activeTab === "resultats" ? "text-blue-500" : "hover:text-blue-400"}>Résultats</button>
            <button onClick={() => isIdentified ? setActiveTab("recommandations") : null} className={activeTab === "recommandations" ? "text-blue-500" : "hover:text-blue-400"}>Priorités</button>
            <button onClick={() => setActiveTab("contact")} className={activeTab === "contact" ? "text-blue-500" : "hover:text-blue-400"}>Contact</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {activeTab === "accueil" && (
          <div className="text-center py-24 space-y-8 animate-in fade-in duration-700">
            <h1 className="text-7xl font-black tracking-tighter uppercase">Bienvenue sur <span className="text-blue-500">SDG-X</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">L'outil de diagnostic stratégique pour le développement durable de votre commune.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setActiveTab("identite")} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105">Lancer le diagnostic</button>
              <button onClick={resetAllData} className="border border-white/20 hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all">Réinitialiser</button>
            </div>
          </div>
        )}

        {/* SECTION À PROPOS (Rétablie avec image et texte souligné) */}
        {activeTab === "a-propos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-12 animate-in slide-in-from-left-10 duration-700">
            <div className="space-y-6 text-left">
              <h2 className="text-5xl font-black italic underline decoration-blue-500 decoration-8 underline-offset-8 uppercase">Notre Engagement</h2>
              <p className="text-lg text-slate-300 leading-relaxed">SDG-X accompagne les mairies dans l'accélération de leurs transitions. Notre méthodologie permet de transformer les indicateurs complexes en une vision stratégique claire, facilitant ainsi la prise de décision politique pour un territoire durable et résilient.</p>
              <p className="text-lg text-slate-300">En utilisant les 17 Objectifs de Développement Durable comme boussole, nous aidons à identifier les leviers prioritaires pour chaque commune.</p>
            </div>
            <div className="bg-slate-900 aspect-video rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800" alt="Bureau" className="w-full h-full object-cover opacity-60" />
            </div>
          </div>
        )}

        {activeTab === "identite" && (
          <div className="max-w-3xl mx-auto bg-slate-900/50 p-12 rounded-3xl border border-white/10 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-4 uppercase italic">Identité de la Mairie</h2>
            <div className="space-y-4">
              <input name="nomCommune" placeholder="NOM DE LA COMMUNE" value={muralInfo.nomCommune || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all" />
              <input name="emailOfficiel" placeholder="COURRIEL OFFICIEL" value={muralInfo.emailOfficiel || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all" />
              <button disabled={!isIdentified} onClick={() => setActiveTab("formulaire")} className={`w-full p-4 rounded-xl font-black tracking-widest transition-all ${isIdentified ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>Accéder au questionnaire</button>
            </div>
          </div>
        )}

        {activeTab === "formulaire" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 sticky top-24 bg-black/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md z-40">
              <h2 className="text-3xl font-black italic uppercase">Questionnaire</h2>
              <button onClick={() => setActiveTab("resultats")} className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold uppercase hover:bg-white hover:text-black transition">Voir les résultats</button>
            </div>
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition duration-500">
                <p className="text-xl font-bold mb-6 text-slate-200">{q.id}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <label key={opt.val} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${answers[q.id] === opt.val ? "bg-blue-600 border-blue-400" : "bg-black border-white/10 hover:border-white/30"}`}>
                      <input type="radio" checked={answers[q.id] === opt.val} onChange={() => setAnswers({...answers, [q.id]: opt.val})} />
                      <span className="text-sm font-medium uppercase tracking-wide">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION RÉSULTATS (Séparée des priorités) */}
        {activeTab === "resultats" && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-center border-b border-white/10 pb-8 print:hidden">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter underline decoration-blue-500 underline-offset-8">Résultats ODD</h2>
              <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 uppercase">Imprimer rapport PDF</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-blue-600 p-12 rounded-[40px] shadow-2xl flex flex-col items-center justify-center border border-white/20">
                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2">Indice global</span>
                <div className="text-9xl font-black leading-none">{globalScore}</div>
                <span className="text-2xl font-bold opacity-60">/ 4.0</span>
              </div>
              <div className="lg:col-span-2 bg-slate-900/50 rounded-[40px] p-8 border border-white/10 backdrop-blur-md">
                <ReactECharts option={chartOption} style={{ height: "550px" }} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION ANALYSE DES PRIORITÉS (Onglet distinct) */}
        {activeTab === "recommandations" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <h2 className="text-5xl font-black italic uppercase underline decoration-blue-500 underline-offset-8">Analyse des priorités</h2>
            <div className="grid gap-6">
              {Object.keys(answers).map(id => (answers[id] === 1 || answers[id] === 2) && (
                <div key={id} className="bg-slate-900/80 p-8 rounded-[30px] border-l-[12px] border-blue-600 flex gap-8 items-center hover:bg-slate-800 transition">
                  <div className="text-5xl font-black text-blue-600/40 uppercase tracking-tighter shrink-0">Q{id}</div>
                  <p className="text-xl font-bold leading-tight">Cette thématique nécessite une action immédiate pour s'aligner sur les objectifs de développement durable.</p>
                </div>
              ))}
              {Object.keys(answers).every(id => answers[id] > 2) && (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 italic text-slate-500">Aucune alerte prioritaire détectée pour le moment.</div>
              )}
            </div>
          </div>
        )}

        {/* SECTION CONTACT (Rétablie avec formulaire complet et infos) */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-12 animate-in fade-in duration-700">
            <div className="space-y-12 text-left">
              <h2 className="text-6xl font-black tracking-tighter uppercase italic underline decoration-blue-500 underline-offset-8">Contactez-nous</h2>
              <div className="space-y-8 text-slate-300">
                <div className="flex items-center gap-6">
                  <span className="text-4xl">📍</span>
                  <div><p className="text-xs font-bold uppercase text-blue-500">Localisation</p><p className="text-xl font-bold">Paris, France</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-4xl">📞</span>
                  <div><p className="text-xs font-bold uppercase text-blue-500">Téléphone</p><p className="text-xl font-bold">01 23 45 67 89</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-4xl">✉️</span>
                  <div><p className="text-xs font-bold uppercase text-blue-500">E-mail</p><p className="text-xl font-bold">info@sdg-x.com</p></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 p-10 rounded-[40px] border border-white/10 shadow-2xl space-y-4">
              <input placeholder="NOM COMPLET" className="w-full bg-black border border-white/20 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-bold" />
              <input placeholder="E-MAIL" className="w-full bg-black border border-white/20 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-bold" />
              <textarea placeholder="VOTRE MESSAGE" rows="5" className="w-full bg-black border border-white/20 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-bold"></textarea>
              <button className="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">Envoyer le message</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;