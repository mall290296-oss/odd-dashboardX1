import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import questions from "./formulaire.json";

function App() {
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

    const global =
      averages.reduce((acc, item) => acc + item.value, 0) /
      (averages.length || 1);

    return {
      oddAverages: averages.sort((a, b) => a.value - b.value),
      globalScore: Number(global.toFixed(2)),
    };
  }, [answers]);

  const chartOption = {
    tooltip: {
      trigger: "item",
      formatter: (p) =>
        `<strong>${p.name}</strong><br/>Score : ${p.value} / 4`,
    },
    series: [
      {
        type: "pie",
        radius: [40, 160],
        center: ["50%", "55%"],
        silent: true,
        label: { show: false },
        data: oddAverages.map((item) => ({
          value: 4,
          name: item.odd,
          itemStyle: { color: "#f1f5f9" },
        })),
      },
      {
        type: "pie",
        radius: [40, 160],
        center: ["50%", "55%"],
        roseType: "area",
        data: oddAverages.map((item) => {
          let color = "#22C55E";
          if (item.value <= 1.5) color = "#EF4444";
          else if (item.value <= 2.5) color = "#F97316";
          else if (item.value <= 3.5) color = "#FACC15";

          return {
            value: item.value,
            name: item.odd,
            itemStyle: { color },
          };
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Tableau de maturité ODD – Évaluation Communale
        </h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8 flex justify-between">
          <div>
            <p className="text-lg font-semibold">Indice communal ODD</p>
            <p className="text-4xl font-bold">{globalScore} / 4</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <ReactECharts option={chartOption} style={{ height: "600px" }} />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <p className="font-medium mb-2">{q.id}. {q.question}</p>
              <div className="flex flex-wrap gap-4">
                {q.options.map((opt) => (
                  <label key={opt.val} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt.val}
                      onChange={() => handleChange(q.id, opt.val)}
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
