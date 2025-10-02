// Content management system
export interface ContentBlock {
  id: string;
  content: string;
  html: string;
  updatedAt: Date;
  updatedBy: string;
}

// Default content for the site
export const defaultContent: Record<string, ContentBlock> = {
  "hero-title": {
    id: "hero-title",
    content: "Snobol.ai",
    html: "Snobol.ai",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "hero-subtitle": {
    id: "hero-subtitle",
    content: "Clarity in Crisis. Powered by AI, guided by wisdom.",
    html: "Clarity in Crisis. Powered by AI, guided by wisdom.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "chart-disclaimer": {
    id: "chart-disclaimer",
    content: "*Past performance in no way guarantees future performance.",
    html: "*Past performance in no way guarantees future performance.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "hero-cta": {
    id: "hero-cta",
    content: "Join the Crisis Contrarians",
    html: "Join the Crisis Contrarians",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "exec-summary-title": {
    id: "exec-summary-title",
    content: "Executive Summary",
    html: "Executive Summary",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "exec-summary-intro": {
    id: "exec-summary-intro",
    content: "Snobol is a <strong>crisis investing movement</strong> that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.",
    html: "Snobol is a <strong>crisis investing movement</strong> that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "exec-summary-list": {
    id: "exec-summary-list",
    content: "<li><strong>Thesis:</strong> Markets overreact during crises. Durable companies become mispriced.</li><li><strong>Edge:</strong> Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.</li><li><strong>Promise:</strong> Radical transparency. Every alert published live, every win and loss logged.</li><li><strong>Vision:</strong> Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.</li>",
    html: "<li><strong>Thesis:</strong> Markets overreact during crises. Durable companies become mispriced.</li><li><strong>Edge:</strong> Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.</li><li><strong>Promise:</strong> Radical transparency. Every alert published live, every win and loss logged.</li><li><strong>Vision:</strong> Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "philosophy-title": {
    id: "philosophy-title",
    content: "Investment Philosophy",
    html: "Investment Philosophy",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "philosophy-list": {
    id: "philosophy-list",
    content: "<li>Respond, don't predict.</li><li>Buy quality under panic.</li><li>Transparency over hindsight.</li><li>Risk management first.</li><li>AI as tool, not oracle — humans apply judgment.</li>",
    html: "<li>Respond, don't predict.</li><li>Buy quality under panic.</li><li>Transparency over hindsight.</li><li>Risk management first.</li><li>AI as tool, not oracle — humans apply judgment.</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "process-title": {
    id: "process-title",
    content: "The Snobol Process",
    html: "The Snobol Process",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "signal-layer-title": {
    id: "signal-layer-title",
    content: "Signal Layer (AI)",
    html: "Signal Layer (AI)",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "signal-layer-list": {
    id: "signal-layer-list",
    content: "<li>Order flow stress</li><li>Options panic</li><li>Macro alerts</li>",
    html: "<li>Order flow stress</li><li>Options panic</li><li>Macro alerts</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "filter-layer-title": {
    id: "filter-layer-title",
    content: "Filter Layer (Rules)",
    html: "Filter Layer (Rules)",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "filter-layer-list": {
    id: "filter-layer-list",
    content: "<li>Quality metrics</li><li>Valuation checks</li><li>Crisis scoring</li>",
    html: "<li>Quality metrics</li><li>Valuation checks</li><li>Crisis scoring</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "action-layer-title": {
    id: "action-layer-title",
    content: "Action Layer (Transparency)",
    html: "Action Layer (Transparency)",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "action-layer-list": {
    id: "action-layer-list",
    content: "<li>Real-time alerts</li><li>Live portfolio</li><li>Educational commentary</li>",
    html: "<li>Real-time alerts</li><li>Live portfolio</li><li>Educational commentary</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "community-title": {
    id: "community-title",
    content: "Crisis Contrarians",
    html: "Crisis Contrarians",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "community-intro": {
    id: "community-intro",
    content: "Snobol is not a hedge fund. It's a <strong>movement of calm contrarians</strong>.",
    html: "Snobol is not a hedge fund. It's a <strong>movement of calm contrarians</strong>.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "community-list": {
    id: "community-list",
    content: "<li><strong>Design:</strong> Nordic minimalism, white space, pastel blue.</li><li><strong>Tone:</strong> Clear, rational, never hype.</li><li><strong>Community:</strong> Investors who stay calm, rational, and opportunistic when others fear.</li><li><strong>Transparency:</strong> Portfolio tracker, public letters, open discussions.</li>",
    html: "<li><strong>Design:</strong> Nordic minimalism, white space, pastel blue.</li><li><strong>Tone:</strong> Clear, rational, never hype.</li><li><strong>Community:</strong> Investors who stay calm, rational, and opportunistic when others fear.</li><li><strong>Transparency:</strong> Portfolio tracker, public letters, open discussions.</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "community-cta": {
    id: "community-cta",
    content: "Get Early Access",
    html: "Get Early Access",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "vision-title": {
    id: "vision-title",
    content: "Vision & Ask",
    html: "Vision & Ask",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "vision-intro": {
    id: "vision-intro",
    content: "We aim to build the world's most trusted brand in <strong>crisis investing</strong>.",
    html: "We aim to build the world's most trusted brand in <strong>crisis investing</strong>.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "vision-list": {
    id: "vision-list",
    content: "<li>Launch incubator-ready MVP in 6 months.</li><li>Grow global community of Crisis Contrarians.</li><li>Build AI-first transparency platform.</li>",
    html: "<li>Launch incubator-ready MVP in 6 months.</li><li>Grow global community of Crisis Contrarians.</li><li>Build AI-first transparency platform.</li>",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "vision-ask": {
    id: "vision-ask",
    content: "<strong>Ask:</strong> Let's connect with incubators, investors, and partners who share this vision.",
    html: "<strong>Ask:</strong> Let's connect with incubators, investors, and partners who share this vision.",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "footer-email": {
    id: "footer-email",
    content: "📩 hello@snobol.ai",
    html: "📩 hello@snobol.ai",
    updatedAt: new Date(),
    updatedBy: "system"
  },
  "footer-copyright": {
    id: "footer-copyright",
    content: "© 2025 Snobol.ai",
    html: "© 2025 Snobol.ai",
    updatedAt: new Date(),
    updatedBy: "system"
  }
};

// In-memory content store (replace with database in production)
let contentStore: Record<string, ContentBlock> = { ...defaultContent };

export function getContent(id: string): ContentBlock | null {
  return contentStore[id] || null;
}

export function getAllContent(): Record<string, ContentBlock> {
  return contentStore;
}

export function updateContent(id: string, html: string, updatedBy: string): ContentBlock {
  const contentBlock: ContentBlock = {
    id,
    content: html,
    html,
    updatedAt: new Date(),
    updatedBy
  };
  
  contentStore[id] = contentBlock;
  
  // Add to version history
  const { addContentVersion } = require('./contentHistory');
  addContentVersion(id, html, html, updatedBy, 'update');
  
  return contentBlock;
}

export function resetContent(): void {
  contentStore = { ...defaultContent };
}
