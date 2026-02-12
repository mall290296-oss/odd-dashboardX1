import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import questions from "./formulaire.json";

// 1. Base de données des recommandations (à compléter selon vos besoins)
const recommendationsData = {
  1: "Action Climat : Priorisez l'isolation thermique des écoles (ODD 13).",
  2: "Énergie : Accélérez les diagnostics énergétiques (ODD 7).",
  4: "Eau : Installez des systèmes de télé-relève pour les fuites (ODD 6).",
  8: "Déchets : Déployez des sites de compostage collectif (ODD 12).",
  11: "Mobilité : Tracez des pistes cyclables sécurisées (ODD 11).",
  21: "Égalité : Intégrez des critères de parité dans les recrutements (ODD 5).",
};

function App() {
  const [activeTab, setActiveTab] = useState("formulaire");
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("oddAnswers");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("oddAnswers", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: Number(value) }));
  };

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

  // FONCTION : Envoyer les résultats par E-mail
  const sendResultsByEmail = () => {
    const recipient = "luis.martinez-lopez@polytechnique.com"; // REMPLACEZ PAR VOTRE EMAIL
    const subject = "Résultats Diagnostic SDG-X";
    const body = `Bonjour,\n\nVoici mes résultats SDG-X :\nIndice Global : ${globalScore}/4\n\nDétail des réponses : ${JSON.stringify(answers)}`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // FONCTION : Export PDF (via impression système)
  const exportToPDF = () => {
    window.print();
  };

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "<strong>{b}</strong><br/>Score : {c} / 4" },
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
        itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, fontSize: 10, formatter: "{b}" },
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. TITRE CHANGÉ EN "SDG-X" */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <span className="font-bold text-xl tracking-tight text-blue-400">SDG-X</span>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab("formulaire")} className={`px-3 py-1 rounded ${activeTab === "formulaire" ? "bg-blue-600" : "text-slate-400"}`}>1. Questionnaire</button>
            <button onClick={() => setActiveTab("resultats")} className={`px-3 py-1 rounded ${activeTab === "resultats" ? "bg-blue-600" : "text-slate-400"}`}>2. Résultats</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        {activeTab === "formulaire" && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-4xl font-black text-slate-800 text-center mb-10">Diagnostic SDG-X</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
              {questions.map((q) => (
                <div key={q.id} className="p-6 hover:bg-slate-50 transition">
                  <p className="font-semibold text-slate-700 mb-4">{q.id}. {q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt) => (
                      <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${answers[q.id] === opt.val ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt.val} onChange={() => handleChange(q.id, opt.val)} />
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "resultats" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-wrap justify-center gap-4 print:hidden">
              {/* 2. BOUTON ENVOI MAIRIE */}
              <button onClick={sendResultsByEmail} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700">
                📩 Partager à l'organisation
              </button>
              {/* 3. BOUTON EXPORT PDF */}
              <button onClick={exportToPDF} className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-slate-900">
                📄 Exporter en PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score Global SDG-X</span>
                <div className="text-6xl font-black text-slate-900">{globalScore}</div>
                <div className="text-slate-400 font-bold text-xl">/ 4</div>
              </div>
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ReactECharts option={chartOption} style={{ height: "500px" }} />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">💡 Analyse des Recommandations</h2>
              <div className="space-y-3 text-sm">
                {Object.keys(answers).some(id => answers[id] <= 2) ? (
                  Object.keys(answers).map(id => (answers[id] === 1 || answers[id] === 2) && (
                    <div key={id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex gap-3">
                      <span className="text-blue-400 font-bold">Q{id}</span>
                      <p>{recommendationsData[id] || "Mener une action corrective."}</p>
                    </div>
                  ))
                ) : <p className="italic text-slate-400">Aucune action prioritaire détectée.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;