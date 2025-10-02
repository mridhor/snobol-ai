# snobol-ai

A financial AI chatbot built with Next.js, featuring real-time stock analysis, TradingView charts, and value investing insights.

## Features

- 🤖 **AI-Powered Financial Analysis** - Powered by OpenAI GPT
- 📊 **TradingView Charts** - Interactive charts for stocks, crypto, commodities, and forex
- 🔍 **Brave Search Integration** - Privacy-focused web search for financial data
- 💡 **Value Investing Focus** - Fundamental analysis and business quality assessments
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/)
3. **Brave Search API Key** - Get free key at [Brave Search API](https://api.search.brave.com/register)

### Environment Variables

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here
```

See [BRAVE_SEARCH_SETUP.md](./BRAVE_SEARCH_SETUP.md) for detailed Brave Search setup instructions.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
