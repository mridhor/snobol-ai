"use client";

import { useContent } from "../hooks/useContent";
import { PerformanceChart } from "../components/chart";

export default function Home() {
  const { loading, getContent } = useContent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Current prices for the PerformanceChart
  const currentPrice = 18.49; // Snobol fund price
  const currentSP500Price = 3.30; // S&P 500 portion

  return (
    <main className="font-sans bg-white text-black px-6 md:px-16 lg:px-32 py-12 space-y-16">

      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 
          className="text-4xl md:text-5xl font-bold"
          dangerouslySetInnerHTML={{ __html: getContent("hero-title", "Snobol.ai") }}
        />
        <h2 
          className="text-xl md:text-2xl text-gray-700"
          dangerouslySetInnerHTML={{ __html: getContent("hero-subtitle", "Clarity in Crisis. Powered by AI, guided by wisdom.") }}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <PerformanceChart 
            currentPrice={currentPrice} 
            currentSP500Price={currentSP500Price} 
          />
          <p 
            className="text-xs text-gray-500 mt-2"
            dangerouslySetInnerHTML={{ __html: getContent("chart-disclaimer", "*Past performance in no way guarantees future performance.") }}
          />
        </div>
        <button 
          className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
          dangerouslySetInnerHTML={{ __html: getContent("hero-cta", "Join the Crisis Contrarians") }}
        />
      </section>

      {/* Executive Summary */}
      <section>
        <h3 
          className="text-2xl font-semibold mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("exec-summary-title", "Executive Summary") }}
        />
        <p 
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("exec-summary-intro", "Snobol is a <strong>crisis investing movement</strong> that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.") }}
        />
        <ul 
          className="list-disc list-inside space-y-1 text-gray-800"
          dangerouslySetInnerHTML={{ __html: getContent("exec-summary-list", "<li><strong>Thesis:</strong> Markets overreact during crises. Durable companies become mispriced.</li><li><strong>Edge:</strong> Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.</li><li><strong>Promise:</strong> Radical transparency. Every alert published live, every win and loss logged.</li><li><strong>Vision:</strong> Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.</li>") }}
        />
      </section>

      {/* Investment Philosophy */}
      <section>
        <h3 
          className="text-2xl font-semibold mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("philosophy-title", "Investment Philosophy") }}
        />
        <ul 
          className="list-disc list-inside space-y-1 text-gray-800"
          dangerouslySetInnerHTML={{ __html: getContent("philosophy-list", "<li>Respond, don't predict.</li><li>Buy quality under panic.</li><li>Transparency over hindsight.</li><li>Risk management first.</li><li>AI as tool, not oracle — humans apply judgment.</li>") }}
        />
      </section>

      {/* Process */}
      <section>
        <h3 
          className="text-2xl font-semibold mb-6"
          dangerouslySetInnerHTML={{ __html: getContent("process-title", "The Snobol Process") }}
        />
        <div className="grid md:grid-cols-3 gap-8 text-gray-800">
          <div>
            <h4 
              className="font-semibold mb-2"
              dangerouslySetInnerHTML={{ __html: getContent("signal-layer-title", "Signal Layer (AI)") }}
            />
            <ul 
              className="list-disc list-inside"
              dangerouslySetInnerHTML={{ __html: getContent("signal-layer-list", "<li>Order flow stress</li><li>Options panic</li><li>Macro alerts</li>") }}
            />
          </div>
          <div>
            <h4 
              className="font-semibold mb-2"
              dangerouslySetInnerHTML={{ __html: getContent("filter-layer-title", "Filter Layer (Rules)") }}
            />
            <ul 
              className="list-disc list-inside"
              dangerouslySetInnerHTML={{ __html: getContent("filter-layer-list", "<li>Quality metrics</li><li>Valuation checks</li><li>Crisis scoring</li>") }}
            />
          </div>
          <div>
            <h4 
              className="font-semibold mb-2"
              dangerouslySetInnerHTML={{ __html: getContent("action-layer-title", "Action Layer (Transparency)") }}
            />
            <ul 
              className="list-disc list-inside"
              dangerouslySetInnerHTML={{ __html: getContent("action-layer-list", "<li>Real-time alerts</li><li>Live portfolio</li><li>Educational commentary</li>") }}
            />
          </div>
        </div>
      </section>

      {/* Community */}
      <section>
        <h3 
          className="text-2xl font-semibold mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("community-title", "Crisis Contrarians") }}
        />
        <p 
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("community-intro", "Snobol is not a hedge fund. It's a <strong>movement of calm contrarians</strong>.") }}
        />
        <ul 
          className="list-disc list-inside space-y-1 text-gray-800"
          dangerouslySetInnerHTML={{ __html: getContent("community-list", "<li><strong>Design:</strong> Nordic minimalism, white space, pastel blue.</li><li><strong>Tone:</strong> Clear, rational, never hype.</li><li><strong>Community:</strong> Investors who stay calm, rational, and opportunistic when others fear.</li><li><strong>Transparency:</strong> Portfolio tracker, public letters, open discussions.</li>") }}
        />
        <button 
          className="mt-6 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
          dangerouslySetInnerHTML={{ __html: getContent("community-cta", "Get Early Access") }}
        />
      </section>

      {/* Vision & Ask */}
      <section>
        <h3 
          className="text-2xl font-semibold mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("vision-title", "Vision & Ask") }}
        />
        <p 
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("vision-intro", "We aim to build the world's most trusted brand in <strong>crisis investing</strong>.") }}
        />
        <ul 
          className="list-disc list-inside space-y-1 text-gray-800 mb-4"
          dangerouslySetInnerHTML={{ __html: getContent("vision-list", "<li>Launch incubator-ready MVP in 6 months.</li><li>Grow global community of Crisis Contrarians.</li><li>Build AI-first transparency platform.</li>") }}
        />
        <p
          dangerouslySetInnerHTML={{ __html: getContent("vision-ask", "<strong>Ask:</strong> Let's connect with incubators, investors, and partners who share this vision.") }}
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-12">
        <p
          dangerouslySetInnerHTML={{ __html: getContent("footer-email", "📩 hello@snobol.ai") }}
        />
        <p
          dangerouslySetInnerHTML={{ __html: getContent("footer-copyright", "© 2025 Snobol.ai") }}
        />
      </footer>
    </main>
  );
}
