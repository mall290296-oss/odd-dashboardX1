import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import questions from "./formulaire.json";

function App() {
  // Gestion de l'onglet actif
  const [activeTab, setActiveTab] = useState("formulaire");

  // Initialisation des réponses depuis le localStorage
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("oddAnswers");
    return saved ? JSON.parse(saved) : {};
  });

  // Sauvegarde automatique des réponses
  useEffect(() => {
    localStorage.setItem("oddAnswers", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: Number(value) }));
  };

  // Logique de calcul des moyennes par ODD et du score global
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

  // Configuration du graphique Nightingale Rose
  const chartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "<strong>{b}</strong><br/>Score : {c} / 4",
    },
    series: [
      {
        name: "Fond",
        type: "pie",
        radius: [40, 160],
        center: ["50%", "50%"],
        silent: true,
        label: { show: false },
        data: Array(17).fill({ value: 4, itemStyle: { color: "#f1f5f9" } }),
      },
      {
        name: "Score ODD",
        type: "pie",
        radius: [40, 160],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: true, fontSize: 10, formatter: "{b}" },
        data: oddAverages.map((item) => {
          let color = "#e2e8f0";
          if (item.value > 0 && item.value <= 1.5) color = "#ef4444"; // Rouge
          else if (item.value <= 2.5) color = "#f97316"; // Orange
          else if (item.value <= 3.5) color = "#eab308"; // Jaune
          else if (item.value <= 4) color = "#22c55e";   // Vert
          return { value: item.value, name: item.odd, itemStyle: { color } };
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* BARRE DE NAVIGATION */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <span className="font-bold text-xl tracking-tight">Diagnostic ODD</span>
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab("formulaire")}
              className={`px-3 py-1 rounded transition ${activeTab === "formulaire" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              1. Questionnaire
            </button>
            <button 
              onClick={() => setActiveTab("resultats")}
              className={`px-3 py-1 rounded transition ${activeTab === "resultats" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              2. Résultats & Scorecard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        {/* VUE QUESTIONNAIRE */}
        {activeTab === "formulaire" && (
          <div className="space-y-6">
            <header className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold text-slate-800">Auto-évaluation Communale</h1>
              <p className="text-slate-500 mt-2">Répondez aux 52 questions pour mesurer votre maturité durable.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div key={q.id} className="p-6 hover:bg-slate-50 transition">
                    <p className="font-semibold text-slate-700 mb-4">{q.id}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {q.options.map((opt) => (
                        <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${answers[q.id] === opt.val ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300"}`}>
                          <input
                            type="radio"
                            className="w-4 h-4 text-blue-600"
                            name={`question-${q.id}`}
                            value={opt.val}
                            checked={answers[q.id] === opt.val}
                            onChange={() => handleChange(q.id, opt.val)}
                          />
                          <span className="text-sm text-slate-600">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 italic">
                  Le fichier formulaire.json est vide. Veuillez y ajouter vos questions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VUE RÉSULTATS */}
        {activeTab === "resultats" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
                <span className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Indice de Maturité Global</span>
                <div className="text-6xl font-black text-slate-900">{globalScore}</div>
                <div className="text-slate-400 font-bold mt-1 text-xl">/ 4</div>
              </div>
              
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ReactECharts option={chartOption} style={{ height: "500px" }} />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Analyse & Recommandations
              </h2>
              <p className="text-slate-400 text-sm mb-6 italic">
                Les recommandations s'afficheront ici en fonction de vos scores les plus bas.
              </p>
              {/* Ajoutez ici votre logique de recommandations basée sur answers */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;