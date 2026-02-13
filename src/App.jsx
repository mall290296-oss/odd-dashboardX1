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
  
  // État pour stocker les idées citoyennes
  const [citizenIdeas, setCitizenIdeas] = useState(() => {
    const saved = localStorage.getItem("sdgx_ideas");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("sdgx_identite", JSON.stringify(muralInfo));
    localStorage.setItem("oddAnswers", JSON.stringify(answers));
    localStorage.setItem("sdgx_ideas", JSON.stringify(citizenIdeas));
  }, [answers, muralInfo, citizenIdeas]);

  const resetAllData = () => {
    if (window.confirm("Effacer toutes les données et recommencer ?")) {
      setAnswers({});
      setMuralInfo({});
      setCitizenIdeas([]);
      localStorage.clear();
      setActiveTab("accueil");
    }
  };

  const isIdentified = muralInfo.nomCommune && muralInfo.emailOfficiel;

  const { oddAverages, globalScore, lowPerformingODDs } = useMemo(() => {
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
      lowPerformingODDs: averages.filter(item => item.value < 2.5)
    };
  }, [answers]);

  const handleAddIdea = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newIdea = {
      odd: formData.get("oddSelection"),
      text: formData.get("ideaText"),
      date: new Date().toLocaleDateString()
    };
    setCitizenIdeas([newIdea, ...citizenIdeas]);
    e.target.reset();
  };

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500">
      {/* NAVIGATION */}
      <nav className="border-b border-white/10 px-8 py-4 sticky top-0 bg-black/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter text-blue-500 cursor-pointer" onClick={() => setActiveTab("accueil")}>SDG-X</span>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            {["accueil", "a-propos", "identite", "resultats", "participation", "contact"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`${activeTab === tab ? "text-blue-500" : "hover:text-blue-400"} transition-colors`}
              >
                {tab === "participation" ? "Citoyens" : tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* ACCUEIL */}
        {activeTab === "accueil" && (
          <div className="text-center py-32 space-y-8 animate-in fade-in duration-1000">
            <h1 className="text-8xl font-black tracking-tighter uppercase leading-none">BIENVENUE SUR <br/><span className="text-blue-500">SDG-X</span></h1>
            <p className="text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">Le futur durable de votre collectivité commence par une donnée claire.</p>
            <div className="flex justify-center gap-6 pt-8">
              <button onClick={() => setActiveTab("identite")} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-full font-black text-lg shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1">DÉMARRER</button>
              <button onClick={resetAllData} className="border border-white/20 hover:bg-white/10 px-12 py-5 rounded-full font-black text-lg transition-all">RESET</button>
            </div>
          </div>
        )}

        {/* SECTION À PROPOS (Mise à jour avec l'image tablette) */}
        {activeTab === "a-propos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center py-12 animate-in slide-in-from-left-10 duration-700">
            <div className="space-y-8">
              <h2 className="text-6xl font-black italic underline decoration-blue-500 decoration-8 underline-offset-8 uppercase leading-tight">Notre <br/>Engagement</h2>
              <p className="text-xl text-slate-300 leading-relaxed font-light">
                SDG-X se consacre à évaluer et améliorer la performance des petites et moyennes communes françaises. 
                Notre plateforme propose une collecte de données personnalisée, des résultats visuels pour les citoyens et une section interactive pour stimuler l'engagement communautaire.
              </p>
              <button onClick={() => setActiveTab("identite")} className="bg-white text-black px-8 py-3 rounded-full font-black uppercase hover:bg-blue-500 hover:text-white transition-all">Découvrir</button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800" 
                  alt="Analyse de données sur tablette" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        )}

        {/* PARTICIPATION CITOYENNE (Nouvelle Section) */}
        {activeTab === "participation" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black italic uppercase underline decoration-blue-500 decoration-8 underline-offset-8">Participation Citoyenne</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Citoyens, proposez vos idées pour améliorer les indicateurs où votre commune a besoin d'agir.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
              {/* Formulaire de proposition */}
              <div className="lg:col-span-1 bg-slate-900/80 p-8 rounded-[40px] border border-white/10 h-fit sticky top-32">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><span className="text-blue-500">💡</span> PROPOSER UNE IDÉE</h3>
                {lowPerformingODDs.length > 0 ? (
                  <form onSubmit={handleAddIdea} className="space-y-4">
                    <select name="oddSelection" className="w-full bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-blue-500 text-sm font-bold" required>
                      <option value="">Cibler un indicateur faible...</option>
                      {lowPerformingODDs.map(item => (
                        <option key={item.odd} value={item.odd}>{item.odd} (Score: {item.value})</option>
                      ))}
                    </select>
                    <textarea name="ideaText" placeholder="Décrivez votre idée d'amélioration..." rows="6" className="w-full bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-blue-500 text-sm" required></textarea>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">Soumettre</button>
                  </form>
                ) : (
                  <p className="text-slate-500 italic text-center py-10">Effectuez d'abord le diagnostic pour identifier les indicateurs à améliorer.</p>
                )}
              </div>

              {/* Mur des idées */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Boîte à idées communautaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citizenIdeas.length > 0 ? citizenIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white text-black p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                      <div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">{idea.odd}</span>
                        <p className="font-bold leading-tight mb-4 italic">"{idea.text}"</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 border-t pt-4">PUBLIÉ LE {idea.date}</p>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500 italic uppercase tracking-widest">Aucune idée partagée pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IDENTITE / DIAGNOSTIC */}
        {activeTab === "identite" && (
          <div className="max-w-3xl mx-auto bg-slate-900/50 p-12 rounded-[40px] border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-6 uppercase italic tracking-tighter">Identité Mairie</h2>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 ml-4 uppercase">Nom officiel</label>
                <input name="nomCommune" placeholder="MAIRIE DE..." value={muralInfo.nomCommune || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 ml-4 uppercase">Contact administratif</label>
                <input name="emailOfficiel" placeholder="EMAIL@MAIRIE.FR" value={muralInfo.emailOfficiel || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
              </div>
              <button disabled={!isIdentified} onClick={() => setActiveTab("formulaire")} className={`w-full p-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all pt-8 ${isIdentified ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>Accéder au questionnaire</button>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
        {activeTab === "formulaire" && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-10 sticky top-24 bg-black/90 p-6 rounded-3xl border border-white/10 backdrop-blur-md z-40">
              <h2 className="text-3xl font-black italic uppercase underline decoration-blue-500">Questionnaire</h2>
              <button onClick={() => setActiveTab("resultats")} className="bg-blue-600 text-white px-10 py-3 rounded-full font-black uppercase hover:bg-white hover:text-black transition-all shadow-xl shadow-blue-500/10">Calculer Score</button>
            </div>
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-900/40 p-10 rounded-[40px] border border-white/5 hover:border-blue-500/20 transition-all duration-500">
                <p className="text-xl font-bold mb-8 text-slate-100">{q.id}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <label key={opt.val} className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${answers[q.id] === opt.val ? "bg-blue-600 border-blue-400" : "bg-black border-white/10 hover:border-white/30"}`}>
                      <input type="radio" checked={answers[q.id] === opt.val} onChange={() => setAnswers({...answers, [q.id]: opt.val})} />
                      <span className="text-sm font-bold uppercase tracking-tight">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESULTATS */}
        {activeTab === "resultats" && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-end border-b border-white/10 pb-10">
              <h2 className="text-6xl font-black italic tracking-tighter uppercase underline decoration-blue-500 underline-offset-8">Rapport ODD</h2>
              <button onClick={() => window.print()} className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-2xl">Export PDF</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-blue-600 p-16 rounded-[50px] shadow-2xl flex flex-col items-center justify-center border border-white/20">
                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-80 mb-4 italic">Performance</span>
                <div className="text-[10rem] font-black leading-none">{globalScore}</div>
                <span className="text-3xl font-bold opacity-60">/ 4.0</span>
              </div>
              <div className="lg:col-span-2 bg-slate-900/50 rounded-[50px] p-10 border border-white/10 backdrop-blur-md">
                <ReactECharts option={chartOption} style={{ height: "600px" }} />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-12 items-center">
            <div className="space-y-12">
              <h2 className="text-7xl font-black tracking-tighter uppercase italic underline decoration-blue-500 underline-offset-8">Contact</h2>
              <div className="space-y-8 text-slate-300">
                <div className="flex items-center gap-8">
                  <span className="text-5xl opacity-50">📍</span>
                  <div><p className="text-xs font-black text-blue-500 uppercase tracking-widest">Siège</p><p className="text-2xl font-black">Paris, France</p></div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-5xl opacity-50">✉️</span>
                  <div><p className="text-xs font-black text-blue-500 uppercase tracking-widest">Support</p><p className="text-2xl font-black underline decoration-blue-500/30">info@sdg-x.com</p></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 p-12 rounded-[50px] border border-white/10 shadow-2xl space-y-4 relative">
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">Messagerie Directe</div>
              <input placeholder="VOTRE NOM" className="w-full bg-black border border-white/10 p-6 rounded-2xl outline-none focus:border-blue-500 font-bold" />
              <input placeholder="VOTRE EMAIL" className="w-full bg-black border border-white/10 p-6 rounded-2xl outline-none focus:border-blue-500 font-bold" />
              <textarea placeholder="COMMENT POUVONS-NOUS VOUS AIDER ?" rows="5" className="w-full bg-black border border-white/10 p-6 rounded-2xl outline-none focus:border-blue-500 font-bold"></textarea>
              <button className="w-full bg-blue-600 p-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;