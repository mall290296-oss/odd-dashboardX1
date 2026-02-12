import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import questions from "./formulaire.json";

// Recommandations (Base de données)
const recommendationsData = {
  1: "Action Climat : Priorisez l'isolation thermique des écoles (ODD 13).",
  2: "Énergie : Accélérez les diagnostics énergétiques (ODD 7).",
  4: "Eau : Installez des systèmes de télé-relève pour les fuites (ODD 6).",
  8: "Déchets : Déployez des sites de compostage collectif (ODD 12).",
  11: "Mobilité : Tracez des pistes cyclables sécurisées (ODD 11).",
  21: "Égalité : Intégrez des critères de parité dans les recrutements (ODD 5).",
};

function App() {
  const [activeTab, setActiveTab] = useState("identite"); // Par défaut sur l'identité
  
  // États pour les données
  const [muralInfo, setMuralInfo] = useState(() => {
    const saved = localStorage.getItem("sdgx_identite");
    return saved ? JSON.parse(saved) : {};
  });
  
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("oddAnswers");
    return saved ? JSON.parse(saved) : {};
  });

  // Sauvegardes
  useEffect(() => {
    localStorage.setItem("sdgx_identite", JSON.stringify(muralInfo));
    localStorage.setItem("oddAnswers", JSON.stringify(answers));
  }, [muralInfo, answers]);

  // Vérification si l'identité est remplie (on vérifie au moins le nom et le courriel)
  const isIdentified = muralInfo.nomCommune && muralInfo.emailOfficiel;

  const handleIdentiteChange = (e) => {
    setMuralInfo({ ...muralInfo, [e.target.name]: e.target.value });
  };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: Number(value) }));
  };

  // Calculs ODD
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
    const global = averages.length > 0 
      ? (averages.reduce((acc, item) => acc + item.value, 0) / averages.length).toFixed(2)
      : 0;
    return {
      oddAverages: averages.sort((a, b) => a.odd.localeCompare(b.odd, undefined, {numeric: true})),
      globalScore: global,
    };
  }, [answers]);

  // Fonctions Partage et Export
  const sendResultsByEmail = () => {
    const recipient = "votre-email@exemple.com"; 
    const subject = `Synthèse SDG-X - ${muralInfo.nomCommune}`;
    const body = `Identité : ${JSON.stringify(muralInfo, null, 2)}\n\nRésultats :\nScore Global : ${globalScore}/4\n\nDétail : ${JSON.stringify(answers)}`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "<strong>{b}</strong><br/>Score : {c} / 4" },
    series: [
      {
        name: "Fond", type: "pie", radius: [40, 150], center: ["50%", "50%"], silent: true, label: { show: false },
        data: Array(17).fill({ value: 4, itemStyle: { color: "#f1f5f9" } }),
      },
      {
        name: "Score ODD", type: "pie", radius: [40, 150], center: ["50%", "50%"], roseType: "area",
        itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, fontSize: 10 },
        data: oddAverages.map((item) => {
          let color = "#e2e8f0";
          if (item.value <= 1.5) color = "#ef4444";
          else if (item.value <= 2.5) color = "#f97316";
          else if (item.value <= 3.5) color = "#eab308";
          else color = "#22c55e";
          return { value: item.value, name: item.odd, itemStyle: { color } };
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center px-6 py-4">
          <span className="font-bold text-xl text-blue-400">SDG-X</span>
          <div className="flex gap-2 text-sm">
            <button onClick={() => setActiveTab("identite")} className={`px-3 py-1 rounded ${activeTab === "identite" ? "bg-blue-600" : "text-slate-400"}`}>1. Identité</button>
            <button onClick={() => isIdentified ? setActiveTab("formulaire") : alert("Veuillez remplir l'identité d'abord")} className={`px-3 py-1 rounded ${activeTab === "formulaire" ? "bg-blue-600" : isIdentified ? "text-slate-400" : "text-slate-700 cursor-not-allowed"}`}>2. Questionnaire</button>
            <button onClick={() => isIdentified ? setActiveTab("resultats") : null} className={`px-3 py-1 rounded ${activeTab === "resultats" ? "bg-blue-600" : isIdentified ? "text-slate-400" : "text-slate-700 cursor-not-allowed"}`}>3. Résultats</button>
            <button onClick={() => isIdentified ? setActiveTab("recommandations") : null} className={`px-3 py-1 rounded ${activeTab === "recommandations" ? "bg-blue-600" : isIdentified ? "text-slate-400" : "text-slate-700 cursor-not-allowed"}`}>4. Recommandations</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 mt-6">
        
        {/* ONGLET 1 : IDENTITÉ */}
        {activeTab === "identite" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
            <h2 className="text-2xl font-black mb-6 text-slate-800 border-b pb-4">Formulaire d'Identité de la Mairie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-blue-600 mb-3 uppercase text-xs">Informations Générales</h3>
                <input name="nomCommune" placeholder="Nom officiel de la commune" value={muralInfo.nomCommune || ""} onChange={handleIdentiteChange} className="w-full p-2 mb-3 border rounded" />
                <input name="codePostal" placeholder="Code Postal" value={muralInfo.codePostal || ""} onChange={handleIdentiteChange} className="w-full p-2 mb-3 border rounded" />
                <input name="emailOfficiel" placeholder="Courriel officiel" value={muralInfo.emailOfficiel || ""} onChange={handleIdentiteChange} className="w-full p-2 mb-3 border rounded" />
                <input name="nomMaire" placeholder="Nom du Maire" value={muralInfo.nomMaire || ""} onChange={handleIdentiteChange} className="w-full p-2 border rounded" />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  Note : Ces informations permettent de personnaliser votre rapport final SDG-X. Une fois le nom et l'email saisis, vous pourrez accéder au questionnaire.
                </p>
                {isIdentified && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded text-center font-bold">✓ Accès débloqué</div>}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : QUESTIONNAIRE */}
        {activeTab === "formulaire" && (
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-800 mb-6">Questionnaire SDG-X</h1>
            {questions.map((q) => (
              <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="font-bold text-slate-700 mb-4">{q.id}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[q.id] === opt.val ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50"}`}>
                      <input type="radio" checked={answers[q.id] === opt.val} onChange={() => handleChange(q.id, opt.val)} />
                      <span className="text-sm">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET 3 : RÉSULTATS VISUELS */}
        {activeTab === "resultats" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div>
                  <h2 className="text-xl font-bold text-slate-800">{muralInfo.nomCommune}</h2>
                  <p className="text-slate-500 text-sm italic">Diagnostic établi pour le mandat SDG-X</p>
               </div>
               <div className="text-right">
                  <button onClick={sendResultsByEmail} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mr-2">Envoyer Synthèse</button>
                  <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm">PDF</button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score SDG-X</span>
                  <div className="text-7xl font-black text-slate-900">{globalScore}</div>
                  <div className="text-slate-400 font-bold text-2xl">/ 4</div>
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <ReactECharts option={chartOption} style={{ height: "500px" }} />
                </div>
            </div>
          </div>
        )}

        {/* ONGLET 4 : RECOMMANDATIONS (SÉPARÉ) */}
        {activeTab === "recommandations" && (
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6 text-blue-400 flex items-center gap-2">
              <span>💡</span> Analyse & Plan d'Action
            </h2>
            <div className="grid gap-4">
              {Object.keys(answers).some(id => answers[id] <= 2) ? (
                Object.keys(answers).map(id => (answers[id] === 1 || answers[id] === 2) && (
                  <div key={id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-4 items-start transition hover:bg-white/10">
                    <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg font-bold text-xs uppercase">Alerte Q{id}</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{recommendationsData[id] || "Une action est nécessaire pour améliorer cet indicateur."}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-500 italic">
                  Aucun point critique détecté. Continuez vos efforts !
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;