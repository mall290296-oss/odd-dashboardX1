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
      <nav className="border-b border-white/10 px-8 py-4 sticky top-0 bg-black/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tighter text-blue-500">SDG-X</span>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest">
            <button onClick={() => setActiveTab("accueil")} className={activeTab === "accueil" ? "text-blue-500" : "hover:text-blue-400"}>Accueil</button>
            <button onClick={() => setActiveTab("a-propos")} className={activeTab === "a-propos" ? "text-blue-500" : "hover:text-blue-400"}>À Propos</button>
            <button onClick={() => setActiveTab("identite")} className={activeTab === "identite" ? "text-blue-500" : "hover:text-blue-400"}>Diagnostic</button>
            <button onClick={() => setActiveTab("contact")} className={activeTab === "contact" ? "text-blue-500" : "hover:text-blue-400"}>Contact</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 1. PAGE D'ACCUEIL */}
        {activeTab === "accueil" && (
          <div className="text-center py-24 space-y-8 animate-in fade-in zoom-in duration-700">
            <h1 className="text-7xl font-black tracking-tighter leading-none">BIENVENUE SUR <span className="text-blue-500">SDG-X</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">L'outil d'accélération des Objectifs de Développement Durable pour les communes de demain.</p>
            <button onClick={() => setActiveTab("identite")} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105">COMMENCER LE DIAGNOSTIC</button>
          </div>
        )}

        {/* 2. PAGE À PROPOS */}
        {activeTab === "a-propos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-black italic underline decoration-blue-500">NOTRE ENGAGEMENT</h2>
              <p className="text-lg text-slate-300 leading-relaxed">SDG-X est conçu pour accompagner les décideurs locaux dans la transformation durable de leurs territoires. Notre plateforme offre une vision claire et chiffrée des performances communales face aux enjeux mondiaux.</p>
              <button onClick={() => setActiveTab("identite")} className="text-blue-400 font-bold flex items-center gap-2 hover:underline">DÉCOUVRIR LES ODD →</button>
            </div>
            <div className="bg-slate-900 aspect-video rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
               <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800" alt="Bureau moderne" className="opacity-50 hover:opacity-100 transition duration-500" />
            </div>
          </div>
        )}

        {/* 3. DIAGNOSTIC (IDENTITÉ + FORMULAIRE + RÉSULTATS + RECS) */}
        {activeTab === "identite" && (
          <div className="max-w-3xl mx-auto bg-slate-900/50 p-12 rounded-3xl border border-white/10">
            <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-tighter">Identité de la Commune</h2>
            <div className="space-y-4">
              <input name="nomCommune" placeholder="NOM DE LA COMMUNE" value={muralInfo.nomCommune || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white focus:border-blue-500 outline-none" />
              <input name="emailOfficiel" placeholder="EMAIL OFFICIEL" value={muralInfo.emailOfficiel || ""} onChange={(e) => setMuralInfo({...muralInfo, [e.target.name]: e.target.value})} className="w-full bg-black border border-white/20 p-4 rounded-xl text-white focus:border-blue-500 outline-none" />
              <button disabled={!isIdentified} onClick={() => setActiveTab("formulaire")} className={`w-full p-4 rounded-xl font-black tracking-widest transition ${isIdentified ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>ACCÉDER AU QUESTIONNAIRE</button>
            </div>
          </div>
        )}

        {activeTab === "formulaire" && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-4xl font-black tracking-tighter uppercase">Questionnaire</h2>
              <button onClick={() => setActiveTab("resultats")} className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs uppercase hover:bg-blue-500 hover:text-white transition">Voir Résultats</button>
            </div>
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-900 p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition">
                <p className="text-xl font-bold mb-6 text-slate-200">{q.id}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <label key={opt.val} className={`p-4 rounded-xl border cursor-pointer transition flex items-center gap-3 ${answers[q.id] === opt.val ? "bg-blue-600 border-blue-400" : "bg-black border-white/10 hover:border-white/30"}`}>
                      <input type="radio" checked={answers[q.id] === opt.val} onChange={() => setAnswers({...answers, [q.id]: opt.val})} />
                      <span className="text-sm font-medium">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "resultats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-blue-600 p-12 rounded-3xl text-center">
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">Indice Global</span>
                  <div className="text-8xl font-black leading-none my-2">{globalScore}</div>
                  <span className="text-xl font-bold opacity-60">/ 4</span>
                </div>
                <button onClick={() => setActiveTab("recommandations")} className="w-full bg-white text-black p-4 rounded-2xl font-black hover:bg-blue-500 hover:text-white transition">VOIR RECOMMANDATIONS</button>
             </div>
             <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 border border-white/10">
                <ReactECharts option={chartOption} style={{ height: "600px" }} />
             </div>
          </div>
        )}

        {activeTab === "recommandations" && (
          <div className="space-y-8">
            <h2 className="text-5xl font-black tracking-tighter italic">PLAN D'ACTION PRIORITAIRE</h2>
            <div className="grid gap-4">
              {Object.keys(answers).map(id => (answers[id] === 1 || answers[id] === 2) && (
                <div key={id} className="bg-slate-900 p-6 rounded-2xl border-l-4 border-orange-500 flex gap-6 items-center">
                   <div className="text-3xl font-black text-orange-500 opacity-50 uppercase">Q{id}</div>
                   <p className="text-slate-300 font-medium">Action recommandée pour cet indicateur stratégique.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PAGE CONTACT */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 py-12">
            <div className="space-y-12">
              <h2 className="text-6xl font-black tracking-tighter">CONTACTEZ-NOUS</h2>
              <div className="space-y-6 text-slate-400">
                <p className="flex items-center gap-4 text-xl"><span className="text-blue-500">📍</span> Paris, France</p>
                <p className="flex items-center gap-4 text-xl"><span className="text-blue-500">📞</span> 01 23 45 67 89</p>
                <p className="flex items-center gap-4 text-xl"><span className="text-blue-500">✉️</span> info@sdg-x.com</p>
              </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-3xl border border-white/10 space-y-4">
              <input placeholder="NOM" className="w-full bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-blue-500" />
              <input placeholder="EMAIL" className="w-full bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-blue-500" />
              <textarea placeholder="MESSAGE" rows="5" className="w-full bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-blue-500"></textarea>
              <button className="w-full bg-blue-600 p-4 rounded-xl font-black hover:bg-blue-700 transition">ENVOYER</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;