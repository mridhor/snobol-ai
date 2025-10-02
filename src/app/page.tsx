"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  
} from "chart.js";
import { Line } from "react-chartjs-2";
import EditableText from "../components/EditableText";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Home() {
  const [editMode, setEditMode] = useState(false);

  const handleSave = async (html: string, elementId?: string) => {
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          elementId,
          content: html,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      const result = await response.json();
      console.log("Content saved:", result);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const labels = [
    "2013", "2014", "2015", "2016", "2017",
    "2018", "2019", "2020", "2021", "2022",
    "2023", "2024", "2025"
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Snobol Fund Price",
        data: [
          1.0, 1.34, 2.02, 2.51, 5.40,
          9.97, 11.77, 10.81, 12.45, 13.04,
          14.41, 14.95, 18.49
        ],
        borderColor: "#000000",
        backgroundColor: "rgba(0,0,0,0.1)",
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: { callback: (value: any) => `$${value}` },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <main className="font-sans bg-white text-black px-6 md:px-16 lg:px-32 py-12 space-y-16">
      {/* Edit Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            editMode
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {editMode ? "Exit Edit Mode" : "Edit Mode"}
        </button>
      </div>

      {/* Hero */}
      <section className="text-center space-y-4">
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "hero-title")}
          tag="h1"
          className="text-4xl md:text-5xl font-bold"
        >
          Snobol.ai
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "hero-subtitle")}
          tag="h2"
          className="text-xl md:text-2xl text-gray-700"
        >
          Clarity in Crisis. Powered by AI, guided by wisdom.
        </EditableText>
        <div className="max-w-3xl mx-auto mt-8">
          <Line data={data} options={options} />
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "chart-disclaimer")}
            tag="p"
            className="text-xs text-gray-500 mt-2"
          >
            *Past performance in no way guarantees future performance.
          </EditableText>
        </div>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "hero-cta")}
          tag="button"
          className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Join the Crisis Contrarians
        </EditableText>
      </section>

      {/* Executive Summary */}
      <section>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "exec-summary-title")}
          tag="h3"
          className="text-2xl font-semibold mb-4"
        >
          Executive Summary
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "exec-summary-intro")}
          tag="p"
          className="mb-4"
        >
          Snobol is a <strong>crisis investing movement</strong> that responds rationally when the
          market panics. We don't predict the future. We prepare, monitor, and respond with
          discipline when fear creates opportunity.
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "exec-summary-list")}
          tag="ul"
          className="list-disc list-inside space-y-1 text-gray-800"
        >
          <li><strong>Thesis:</strong> Markets overreact during crises. Durable companies become mispriced.</li>
          <li><strong>Edge:</strong> Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.</li>
          <li><strong>Promise:</strong> Radical transparency. Every alert published live, every win and loss logged.</li>
          <li><strong>Vision:</strong> Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.</li>
        </EditableText>
      </section>

      {/* Investment Philosophy */}
      <section>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "philosophy-title")}
          tag="h3"
          className="text-2xl font-semibold mb-4"
        >
          Investment Philosophy
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "philosophy-list")}
          tag="ul"
          className="list-disc list-inside space-y-1 text-gray-800"
        >
          <li>Respond, don't predict.</li>
          <li>Buy quality under panic.</li>
          <li>Transparency over hindsight.</li>
          <li>Risk management first.</li>
          <li>AI as tool, not oracle — humans apply judgment.</li>
        </EditableText>
      </section>

      {/* Process */}
      <section>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "process-title")}
          tag="h3"
          className="text-2xl font-semibold mb-6"
        >
          The Snobol Process
        </EditableText>
        <div className="grid md:grid-cols-3 gap-8 text-gray-800">
          <div>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "signal-layer-title")}
              tag="h4"
              className="font-semibold mb-2"
            >
              Signal Layer (AI)
            </EditableText>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "signal-layer-list")}
              tag="ul"
              className="list-disc list-inside"
            >
              <li>Order flow stress</li>
              <li>Options panic</li>
              <li>Macro alerts</li>
            </EditableText>
          </div>
          <div>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "filter-layer-title")}
              tag="h4"
              className="font-semibold mb-2"
            >
              Filter Layer (Rules)
            </EditableText>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "filter-layer-list")}
              tag="ul"
              className="list-disc list-inside"
            >
              <li>Quality metrics</li>
              <li>Valuation checks</li>
              <li>Crisis scoring</li>
            </EditableText>
          </div>
          <div>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "action-layer-title")}
              tag="h4"
              className="font-semibold mb-2"
            >
              Action Layer (Transparency)
            </EditableText>
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "action-layer-list")}
              tag="ul"
              className="list-disc list-inside"
            >
              <li>Real-time alerts</li>
              <li>Live portfolio</li>
              <li>Educational commentary</li>
            </EditableText>
          </div>
        </div>
      </section>

      {/* Community */}
      <section>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "community-title")}
          tag="h3"
          className="text-2xl font-semibold mb-4"
        >
          Crisis Contrarians
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "community-intro")}
          tag="p"
          className="mb-4"
        >
          Snobol is not a hedge fund. It's a <strong>movement of calm contrarians</strong>.
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "community-list")}
          tag="ul"
          className="list-disc list-inside space-y-1 text-gray-800"
        >
          <li><strong>Design:</strong> Nordic minimalism, white space, pastel blue.</li>
          <li><strong>Tone:</strong> Clear, rational, never hype.</li>
          <li><strong>Community:</strong> Investors who stay calm, rational, and opportunistic when others fear.</li>
          <li><strong>Transparency:</strong> Portfolio tracker, public letters, open discussions.</li>
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "community-cta")}
          tag="button"
          className="mt-6 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Get Early Access
        </EditableText>
      </section>

      {/* Vision & Ask */}
      <section>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "vision-title")}
          tag="h3"
          className="text-2xl font-semibold mb-4"
        >
          Vision & Ask
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "vision-intro")}
          tag="p"
          className="mb-4"
        >
          We aim to build the world's most trusted brand in <strong>crisis investing</strong>.
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "vision-list")}
          tag="ul"
          className="list-disc list-inside space-y-1 text-gray-800 mb-4"
        >
          <li>Launch incubator-ready MVP in 6 months.</li>
          <li>Grow global community of Crisis Contrarians.</li>
          <li>Build AI-first transparency platform.</li>
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "vision-ask")}
          tag="p"
        >
          <strong>Ask:</strong> Let's connect with incubators, investors, and partners who share this vision.
        </EditableText>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-12">
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "footer-email")}
          tag="p"
        >
          📩 hello@snobol.ai
        </EditableText>
        <EditableText
          editMode={editMode}
          onSave={(html) => handleSave(html, "footer-copyright")}
          tag="p"
        >
          © 2025 Snobol.ai
        </EditableText>
      </footer>
    </main>
  );
}
