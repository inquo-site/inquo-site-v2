// Per-tool SEO config. Hand-curated entries for high-intent tools,
// plus a smart generator that produces rich keywords, FAQs, HowTo
// steps, and visible long-form content for every other tool.
//
// Goal: when someone searches "code editor" (or any tool name)
// InQuo's page for that tool ranks at the top — so every page
// ships unique title, description, keywords, FAQ schema, HowTo
// schema, and visible H2-level copy that crawlers can index.

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface ToolSeoConfig {
  /** SEO title — kept under 60 chars by SEOHead. */
  title: string;
  /** Meta description — kept under 160 chars. */
  description: string;
  /** Comma-joined keyword list (long-tail variants matter most). */
  keywords: string;
  /** Visible H1 (defaults to tool name). */
  h1?: string;
  /** Visible H2 marketing tagline. */
  tagline: string;
  /** Long-form intro paragraph rendered on page (1–2 sentences). */
  intro: string;
  /** Bulleted feature list rendered on page. */
  features: string[];
  /** Real-world use cases rendered on page. */
  useCases: string[];
  /** Step-by-step instructions (also emitted as HowTo schema). */
  howTo: ToolHowToStep[];
  /** FAQ — rendered on page and emitted as FAQPage schema. */
  faqs: ToolFaq[];
}

/* ------------------------------------------------------------------ */
/* Curated entries for the highest-intent tools                        */
/* ------------------------------------------------------------------ */

const CURATED: Record<string, Partial<ToolSeoConfig>> = {
  code: {
    title: "Free Online AI Code Generator & Editor",
    description:
      "Generate, edit and debug code in 30+ languages with AI. Free online code editor — no signup. Python, JavaScript, TypeScript, Go, Rust, SQL and more.",
    keywords:
      "code editor, online code editor, ai code generator, free code editor, code editor online, write code with ai, code generator free, ai coding assistant, online ide, javascript editor, python editor, html editor, react code generator, code completion ai, github copilot alternative, free coding tool, ai pair programmer",
    tagline: "Write production-ready code in any language — instantly.",
    intro:
      "InQuo's AI Code Generator is a free online code editor and pair-programming assistant. Describe what you want in plain English and get clean, runnable code in Python, JavaScript, TypeScript, Go, Rust, Java, C++, SQL, HTML/CSS and 20+ more languages — with explanations, tests and inline comments.",
    features: [
      "30+ programming languages with syntax-aware output",
      "Inline comments and unit-test suggestions on request",
      "Free unlimited generations — no signup required",
      "Markdown + copy/download for instant use",
      "Works on mobile, tablet and desktop browsers",
    ],
    useCases: [
      "Bootstrap a React, Next.js or Vue component in seconds",
      "Convert Python to TypeScript (or any language pair)",
      "Generate SQL queries from a plain-English question",
      "Write regex, shell scripts, Dockerfiles and GitHub Actions",
      "Refactor and add types to legacy JavaScript",
    ],
    howTo: [
      { name: "Describe what you want", text: "Type a plain-English prompt — e.g. 'a REST endpoint in Express that returns paginated users'." },
      { name: "Pick or imply a language", text: "Mention the target language or framework in the prompt; the AI infers the rest." },
      { name: "Generate", text: "Click Generate. Code appears in seconds with syntax highlighting." },
      { name: "Copy or download", text: "Copy to clipboard or download as a .txt file to drop into your project." },
    ],
    faqs: [
      { q: "Is this AI code editor really free?", a: "Yes. The code generator is free with no signup. Power users can upgrade for higher daily limits." },
      { q: "Which programming languages are supported?", a: "30+ including Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, HTML, CSS, Bash and more." },
      { q: "Can I use the generated code commercially?", a: "Yes — code you generate is yours to use in personal and commercial projects." },
      { q: "How is this different from GitHub Copilot?", a: "InQuo runs in your browser with no IDE install, supports natural-language prompts in any language, and is free to start." },
    ],
  },
  chat: {
    title: "Free AI Chat — ChatGPT Alternative, No Login",
    description:
      "Chat with a fast, free AI assistant in your browser. ChatGPT-style answers, code, writing and analysis. No signup, no credit card.",
    keywords:
      "ai chat, free ai chat, chatgpt alternative, free chatgpt, ai assistant online, ai chatbot, gemini chat, deepseek chat, chat with ai free, ai chat no login, gpt online free, ai chat tool",
    tagline: "ChatGPT-style answers — instant, free, no login.",
    intro:
      "InQuo AI Chat is a free in-browser ChatGPT alternative powered by Gemini 2.5 Flash and DeepSeek. Ask anything — code, writing, research, math, translation — and get accurate, source-grounded answers in seconds.",
    features: ["Multi-model: Gemini, DeepSeek, GPT-class quality", "No signup for first 15 chats per day", "Markdown answers with code blocks and tables", "Upload images and PDFs (10MB) for vision Q&A", "Works on mobile and desktop"],
    useCases: ["Quick answers without opening ChatGPT", "Summarize a PDF or screenshot", "Translate between 50+ languages", "Debug an error message", "Brainstorm content ideas"],
    howTo: [
      { name: "Type your question", text: "Enter any question, task or paste content into the chat box." },
      { name: "(Optional) attach a file", text: "Upload an image, PDF or text file up to 10MB for context." },
      { name: "Send", text: "The AI streams an answer in seconds — copy, download or follow up." },
    ],
    faqs: [
      { q: "Is InQuo AI Chat free?", a: "Yes — free for 15 messages per day with no signup, unlimited on paid plans." },
      { q: "Which model does it use?", a: "Gemini 2.5 Flash by default; switch to DeepSeek or GPT-class models inside the agent." },
      { q: "Is my chat private?", a: "Chats are not used to train models. Only your account can see your conversation history." },
    ],
  },
  blog: {
    title: "Free AI Blog Post Generator — SEO Optimized",
    description:
      "Generate full SEO-optimized blog posts in seconds. Free AI blog writer with intros, H2/H3 structure, meta description and keywords.",
    keywords:
      "blog generator, ai blog writer, free blog generator, ai content writer, seo blog generator, blog post writer ai, article generator, free article writer, ai writing tool, content generator, blog writing ai, write blog with ai",
    tagline: "Publish-ready SEO blog posts — in one click.",
    intro:
      "InQuo's AI Blog Generator writes complete, SEO-optimized blog posts from a single keyword or title. Get H2/H3 structure, meta description, internal-link suggestions and a publish-ready Markdown draft in under 30 seconds.",
    features: ["SEO H2/H3 structure with keyword density", "500–2000 word drafts on demand", "Meta title + description included", "Tone presets: casual, expert, marketing", "Free first draft — no signup"],
    useCases: ["Weekly blog content for SaaS and startups", "Affiliate review posts", "How-to guides and tutorials", "Landing page long-form sections", "Newsletter drafts"],
    howTo: [
      { name: "Enter a topic", text: "Type a title or keyword — e.g. 'best CRM for freelancers 2026'." },
      { name: "Generate", text: "Click Generate. Wait ~20 seconds for a full draft." },
      { name: "Edit and publish", text: "Copy the Markdown into WordPress, Ghost, Notion or your CMS." },
    ],
    faqs: [
      { q: "Are the blog posts SEO optimized?", a: "Yes — each draft includes proper H1/H2/H3 hierarchy, meta description and natural keyword usage." },
      { q: "Will Google flag this as AI content?", a: "Google ranks helpful content regardless of origin. We recommend a quick human edit pass before publishing." },
      { q: "Is the AI blog generator free?", a: "Yes, free to start with no signup. Upgrade for unlimited daily generations." },
    ],
  },
  image: {
    title: "Free AI Image Generator — Text to Image Online",
    description:
      "Generate stunning AI images from text, free. High-quality text-to-image generator, no signup. Realistic, anime, art, logos and more.",
    keywords:
      "ai image generator, free ai image generator, text to image, free text to image, ai art generator, image generator free, ai picture generator, online image generator, dall-e alternative, midjourney alternative free, stable diffusion online",
    tagline: "Text to image in seconds — no signup.",
    intro:
      "Turn any text prompt into a high-resolution image with InQuo's free AI image generator. Photoreal, anime, 3D, logos, illustrations — all in your browser.",
    features: ["Photoreal, anime, illustration, 3D, logo styles", "1024×1024 high-resolution output", "No signup for first images each day", "Commercial-use license on paid plans", "Mobile and desktop friendly"],
    useCases: ["Marketing creatives and social posts", "Blog hero images", "App and UI mockups", "Logo concepts", "Storyboards and concept art"],
    howTo: [
      { name: "Write a prompt", text: "Describe the image — subject, style, lighting, camera." },
      { name: "Generate", text: "Click Generate. The image appears in 10–20 seconds." },
      { name: "Download", text: "Save the PNG and use it anywhere." },
    ],
    faqs: [
      { q: "Is the AI image generator free?", a: "Yes — free daily generations with no signup; paid plans unlock unlimited use and commercial rights." },
      { q: "Can I use the images commercially?", a: "Yes on Pro and Business plans. Free tier is for personal use." },
      { q: "What resolution are the images?", a: "1024×1024 by default; Pro plans support higher resolutions." },
    ],
  },
  grammar: {
    title: "Free AI Grammar Checker & Fixer Online",
    description:
      "Fix grammar, spelling and style in seconds with AI. Free online grammar checker — no signup, unlimited corrections, Grammarly alternative.",
    keywords:
      "grammar checker, ai grammar checker, free grammar checker, grammar fixer, spell checker online, grammarly alternative, online proofreader, sentence corrector, english grammar tool, fix grammar online",
    tagline: "Grammarly-quality corrections — completely free.",
    intro:
      "Paste any text and InQuo's AI fixes grammar, spelling, punctuation and clunky phrasing in seconds. A free Grammarly alternative that works in any browser.",
    features: ["Grammar, spelling and punctuation fixes", "Style and clarity suggestions", "Unlimited words on paid plans", "No signup for first 500 words/day", "Works for emails, essays, posts and code comments"],
    useCases: ["Polish emails before sending", "Proofread essays and reports", "Fix LinkedIn posts and bios", "Clean up AI-generated drafts", "ESL writing improvement"],
    howTo: [
      { name: "Paste your text", text: "Drop in up to 5,000 characters of any English text." },
      { name: "Click Fix", text: "InQuo returns the corrected version with changes applied." },
      { name: "Copy and use", text: "Copy the polished text back into your email, doc or post." },
    ],
    faqs: [
      { q: "Is the grammar checker really free?", a: "Yes — free for up to 500 words per day with no signup." },
      { q: "Is it as accurate as Grammarly?", a: "Independent tests show comparable accuracy for grammar and spelling, with cleaner style suggestions." },
      { q: "Does it support British English?", a: "Yes — both US and UK English spelling and grammar conventions." },
    ],
  },
  summarize: {
    title: "Free AI Text Summarizer — TL;DR Generator",
    description:
      "Summarize articles, PDFs and long text in seconds with AI. Free TL;DR generator. Paste, upload or link — get a clean summary instantly.",
    keywords:
      "text summarizer, ai summarizer, free summarizer, tldr generator, article summarizer, pdf summarizer, summarize text online, ai summary tool, summary generator free, long text summarizer",
    tagline: "Read 10× faster — paste in, summary out.",
    intro:
      "InQuo's AI Summarizer turns long articles, PDFs, transcripts and research papers into clean bullet-point or paragraph summaries in seconds. Free, no signup.",
    features: ["Bullet or paragraph summary modes", "Handles up to 30,000 characters", "PDF and image upload support", "Source-grounded — no hallucinated facts", "Free with no signup"],
    useCases: ["Speed-read research papers", "Summarize meeting transcripts", "Digest long news articles", "TL;DR for newsletters", "Study aid for textbooks"],
    howTo: [
      { name: "Paste or upload", text: "Drop in text, or upload a PDF / image (max 10MB)." },
      { name: "Summarize", text: "Click Generate. Choose bullets or paragraph in the prompt." },
      { name: "Copy or download", text: "Use the clean summary anywhere." },
    ],
    faqs: [
      { q: "How long can the input be?", a: "Up to 30,000 characters or a 10MB PDF on the free tier." },
      { q: "Is it accurate?", a: "Yes — InQuo only summarizes what's actually in the source text; no fabricated facts." },
      { q: "Does it work on PDFs?", a: "Yes — upload any PDF and the summarizer parses it before summarizing." },
    ],
  },
  adcopy: {
    title: "Free AI Ad Copy Generator — Google, Meta, LinkedIn",
    description:
      "Write high-converting ad copy with AI for Google, Meta, LinkedIn and TikTok. Free ad copy generator — headlines, descriptions and CTAs.",
    keywords:
      "ad copy generator, ai ad copy, free ad copy generator, google ads generator, facebook ad copy, linkedin ad copy, tiktok ad generator, ad headline generator, ppc copy ai, marketing copy generator",
    tagline: "Click-worthy ad copy in seconds — every platform.",
    intro:
      "Generate high-converting ad headlines, descriptions and CTAs for Google Ads, Meta, LinkedIn and TikTok with InQuo's free AI ad copy generator.",
    features: ["Platform-specific length and tone", "5–10 variants per generation", "A/B test ready outputs", "Persona and offer aware", "Free first batch — no signup"],
    useCases: ["Google Search & PMax campaigns", "Meta and Instagram ads", "LinkedIn sponsored content", "TikTok promoted videos", "Email subject lines"],
    howTo: [
      { name: "Describe the offer", text: "Enter product, target audience and platform." },
      { name: "Generate", text: "Get 5–10 ad copy variants ready to paste." },
      { name: "Test", text: "Pick the top 2–3 and A/B test in your ad manager." },
    ],
    faqs: [
      { q: "Is the ad copy generator free?", a: "Yes — free with no signup; Pro unlocks unlimited generations and saved templates." },
      { q: "Which ad platforms does it support?", a: "Google Ads, Meta, LinkedIn, TikTok, X/Twitter, Reddit, and email subject lines." },
      { q: "Can I tune the tone?", a: "Yes — specify casual, professional, urgent, playful or any custom tone in your prompt." },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Smart fallback generator                                            */
/* ------------------------------------------------------------------ */

/** Capitalize each word in a tool name. */
function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Build a long-tail keyword string from the tool name. */
function generateKeywords(name: string, toolType: string): string {
  const n = name.toLowerCase();
  const variants = [
    n,
    `ai ${n}`,
    `free ${n}`,
    `online ${n}`,
    `${n} online`,
    `${n} free`,
    `${n} generator`,
    `${n} tool`,
    `free ${n} online`,
    `best ${n}`,
    `${n} ai`,
    `${n} no signup`,
    `${n} no login`,
    `${n} 2026`,
    `${toolType} tool`,
    `ai ${toolType}`,
  ];
  // de-dupe while preserving order
  return Array.from(new Set(variants)).join(", ");
}

/** Build the full SEO config — curated entry if present, generated otherwise. */
export function getToolSeo(
  toolType: string,
  name: string,
  description: string,
): ToolSeoConfig {
  const curated = CURATED[toolType] ?? {};
  const cleanName = titleCase(name.trim());

  const generated: ToolSeoConfig = {
    title: `Free ${cleanName} — AI Tool Online`,
    description: `${description.replace(/\.$/, "")}. Free online ${cleanName.toLowerCase()} powered by AI — no signup required.`,
    keywords: generateKeywords(cleanName, toolType),
    tagline: `${cleanName} — powered by AI, free in your browser.`,
    intro: `InQuo's ${cleanName} is a free, online AI tool that helps you ${description.toLowerCase().replace(/\.$/, "")}. Works in any modern browser — no install, no signup for your first runs.`,
    features: [
      `Free ${cleanName.toLowerCase()} with no signup required`,
      "Powered by Gemini 2.5 Flash for fast, accurate output",
      "Works on mobile, tablet and desktop",
      "Copy or download results in one click",
      "Unlimited generations on Pro and Business plans",
    ],
    useCases: [
      `Quick ${cleanName.toLowerCase()} tasks without leaving your browser`,
      `Replace expensive ${cleanName.toLowerCase()} subscriptions`,
      `Add ${cleanName.toLowerCase()} to your daily workflow`,
      `Try ${cleanName.toLowerCase()} before committing to a paid SaaS`,
    ],
    howTo: [
      { name: "Enter your input", text: `Paste or type the content you want the ${cleanName} to process.` },
      { name: "Generate", text: "Click Generate. Results appear in a few seconds." },
      { name: "Copy or download", text: "Use the copy or download button to grab the output." },
    ],
    faqs: [
      { q: `Is the ${cleanName} free?`, a: `Yes — InQuo's ${cleanName} is free to try with no signup. Pro plans unlock unlimited daily use.` },
      { q: `How does the AI ${cleanName.toLowerCase()} work?`, a: `It uses Google's Gemini 2.5 Flash model to ${description.toLowerCase().replace(/\.$/, "")} in seconds.` },
      { q: "Do I need to install anything?", a: "No — the tool runs entirely in your browser on desktop and mobile." },
      { q: "Is my data private?", a: "Your inputs are processed for that request only and never used to train models." },
    ],
  };

  return { ...generated, ...curated } as ToolSeoConfig;
}
