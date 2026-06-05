import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Free tools that don't require authentication
const FREE_TOOLS = ['blog', 'code', 'grammar', 'adcopy', 'summarize', 'chat', 'notes', 'essay', 'email', 'social', 'product', 'story', 'hashtags', 'paraphrase', 'copywriting', 'agent-chat'];

const TOOL_PROMPTS: Record<string, string> = {
  blog: "You are an expert blog writer. Create a well-structured, engaging blog post based on the user's topic. Include an introduction, main points with explanations, and a conclusion. Make it SEO-friendly and easy to read.",
  code: "You are an expert programmer. Generate clean, well-commented, functional code based on the user's requirements. Include explanations for complex parts. Follow best practices and coding standards.",
  grammar: "You are a grammar expert. Carefully review the text for grammar, spelling, punctuation, and style errors. Provide the corrected version with improvements. Be thorough but preserve the original meaning and tone.",
  adcopy: "You are an expert copywriter. Create compelling, persuasive ad copy that converts. Focus on benefits, create urgency, and include a strong call-to-action. Keep it concise and impactful.",
  summarize: "You are an expert at summarizing content. Create a concise summary that captures the key points and main ideas of the text. Make it clear, structured, and easy to understand.",
  image: "You are an expert at creating detailed image descriptions. Based on the user's prompt, create a vivid, detailed description for an AI image generator.",
  chat: "You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured answers. Use proper formatting with line breaks between paragraphs. Highlight important points and make your responses easy to read and understand.",
  notes: "You are an expert note organizer. Transform the user's thoughts, ideas, or raw information into well-organized, structured notes. Use clear headings, bullet points, and logical groupings to make the content easy to review and reference.",
  essay: "You are an expert academic writer. Create a well-structured essay with a clear thesis statement, supporting arguments, evidence, and a strong conclusion. Use formal academic language and proper paragraph structure. Include an introduction, body paragraphs, and conclusion.",
  email: "You are a professional email writer. Create clear, concise, and professional emails tailored to the specified purpose and audience. Include appropriate greeting, body, and sign-off. Maintain the right tone based on the context (formal, semi-formal, or friendly).",
  social: "You are a social media expert. Create engaging, platform-optimized content that drives engagement. Include relevant emojis, compelling hooks, and clear calls-to-action. Tailor the content style and length to the specified platform (Instagram, Twitter, LinkedIn, Facebook, TikTok).",
  product: "You are an expert product copywriter. Create compelling product descriptions that highlight key features, benefits, and unique selling points. Use persuasive language that appeals to the target audience and encourages purchases. Include specifications when relevant.",
  story: "You are a creative writer. Create engaging, imaginative short stories with vivid descriptions, compelling characters, and interesting plots. Use creative language and narrative techniques to captivate readers. Include dialogue, conflict, and resolution.",
  hashtags: "You are a social media strategist specializing in hashtag optimization. Generate a mix of popular, niche, and branded hashtags that maximize reach and engagement. Provide hashtags organized by category (trending, niche-specific, branded) with brief explanations of their relevance.",
  paraphrase: "You are an expert at paraphrasing text. Rewrite the provided content in a different way while preserving the original meaning. Vary sentence structure, use synonyms, and improve clarity while maintaining the core message.",
  copywriting: "You are an expert copywriter. Create persuasive, engaging copy that drives action. Focus on the target audience's pain points, desires, and motivations. Use proven copywriting techniques like AIDA (Attention, Interest, Desire, Action).",
  resume: "You are an expert resume writer and career coach. Create a professional, ATS-friendly resume that highlights the candidate's skills, experience, and achievements. Use action verbs, quantify accomplishments where possible, and format the content clearly with sections for Summary, Experience, Skills, and Education. Tailor the resume to the specified industry or job role.",
  coverletter: "You are an expert cover letter writer. Create a compelling, personalized cover letter that connects the candidate's experience to the job requirements. Include a strong opening hook, specific examples of relevant achievements, and enthusiasm for the role. Keep it professional yet personable, and end with a clear call-to-action.",
  seo: "You are an SEO content specialist. Create content that is optimized for search engines while remaining engaging for readers. Include the target keyword naturally throughout the content, use proper heading structure (H1, H2, H3), write meta descriptions, and ensure readability. Focus on E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness).",
  businessplan: "You are a business strategy consultant. Create a comprehensive business plan that includes an executive summary, company description, market analysis, organization structure, product/service details, marketing strategy, funding requirements, and financial projections. Use professional business language and include actionable recommendations.",
  legal: "You are a legal document specialist. Draft clear, professional legal documents based on the user's requirements. Use proper legal terminology and structure. Include all necessary clauses, definitions, and provisions. Note: Always recommend review by a qualified attorney before use. This is for informational purposes only and does not constitute legal advice.",
  videoscript: "You are a video content creator and scriptwriter. Write engaging video scripts with attention-grabbing hooks, clear structure, and compelling calls-to-action. Include visual cues, timing suggestions, and B-roll recommendations. Optimize for audience retention with pattern interrupts and storytelling techniques. Adapt the tone and style to the specified platform (YouTube, TikTok, Instagram Reels).",
  debug: "You are an expert debugger. Analyze the provided code for bugs, errors, and issues. Identify the problems, explain what's wrong, and provide corrected code with explanations of the fixes.",
  optimize: "You are a code optimization expert. Analyze the provided code and suggest optimizations for better performance, readability, and maintainability. Provide the optimized version with explanations.",
  landing: "You are a landing page copywriter. Create compelling landing page copy with attention-grabbing headlines, persuasive body copy, clear value propositions, and strong calls-to-action.",
  color: "You are a color palette expert. Generate beautiful, harmonious color palettes based on the user's requirements. Provide hex codes, RGB values, and usage suggestions.",
  logo: "You are a logo design consultant. Create detailed logo design descriptions and concepts based on the user's brand requirements and preferences.",
  strategy: "You are a marketing strategy expert. Develop comprehensive marketing strategies with clear goals, target audience analysis, channel recommendations, and actionable tactics.",
};

// ============================================================
// AGENT TOOLS (Function Calling) — web_search, calculator, current_datetime
// ============================================================
const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the live internet for up-to-date information, news, facts, prices, statistics or anything outside your training data.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "The search query" } },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Evaluate a mathematical expression. Supports +, -, *, /, %, **, parentheses, and Math.* functions.",
      parameters: {
        type: "object",
        properties: { expression: { type: "string", description: "Math expression, e.g. '(2500 * 0.18) + 200'" } },
        required: ["expression"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "current_datetime",
      description: "Get the current date and time in a given IANA timezone (default UTC).",
      parameters: {
        type: "object",
        properties: { timezone: { type: "string", description: "IANA tz like 'Asia/Kolkata'", default: "UTC" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch and read the readable text content of a web page URL. Use after web_search to read full article content, or for any direct URL the user provides.",
      parameters: {
        type: "object",
        properties: { url: { type: "string", description: "Full https URL" } },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Persist a fact about the user to long-term memory for future conversations. Use when the user shares preferences, personal info, project details, or anything worth remembering.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Short snake_case key, e.g. 'favorite_language'" },
          value: { type: "string", description: "The value to remember" },
        },
        required: ["key", "value"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recall_memory",
      description: "Look up stored long-term memory about the user. Optionally filter by key substring.",
      parameters: {
        type: "object",
        properties: { key_contains: { type: "string", description: "Optional substring filter" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "code_exec",
      description: "Execute a small piece of sandboxed JavaScript and return the result. Use for data transformations, JSON parsing, regex, string manipulation, or any deterministic logic. No network or filesystem.",
      parameters: {
        type: "object",
        properties: { code: { type: "string", description: "JS expression or function body. Must `return` the result." } },
        required: ["code"],
        additionalProperties: false,
      },
    },
  },
];

interface ToolCtx { adminClient: any; userId: string | null; agentId: string | null; }

async function runTool(name: string, args: any, ctx: ToolCtx): Promise<string> {
  try {
    if (name === "calculator") {
      const expr = String(args?.expression ?? "");
      if (!/^[\d+\-*/().,\s%a-zA-Z_]+$/.test(expr)) return "Error: invalid characters in expression";
      const fn = new Function("Math", `"use strict"; return (${expr});`);
      return `Result: ${fn(Math)}`;
    }
    if (name === "current_datetime") {
      const tz = args?.timezone || "UTC";
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long", timeZone: tz }).format(now);
      return `Current datetime in ${tz}: ${formatted} (ISO: ${now.toISOString()})`;
    }
    if (name === "web_search") {
      const q = String(args?.query ?? "").trim();
      if (!q) return "Error: empty query";
      const res = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LovableAgent/1.0)" },
      });
      if (!res.ok) return `Web search failed with status ${res.status}`;
      const html = await res.text();
      const results: { title: string; url: string; snippet: string }[] = [];
      const blockRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      let m: RegExpExecArray | null;
      while ((m = blockRe.exec(html)) && results.length < 5) {
        const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
        let url = m[1];
        try {
          const u = new URL(url, "https://duckduckgo.com");
          const real = u.searchParams.get("uddg");
          if (real) url = decodeURIComponent(real);
        } catch { /* ignore */ }
        results.push({ title: stripTags(m[2]), url, snippet: stripTags(m[3]) });
      }
      if (results.length === 0) return `No web results found for "${q}".`;
      return results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`).join("\n\n");
    }
    if (name === "fetch_url") {
      const url = String(args?.url ?? "").trim();
      if (!/^https?:\/\//i.test(url)) return "Error: url must start with http(s)://";
      const res = await fetch(`https://r.jina.ai/${url}`, { headers: { "User-Agent": "Mozilla/5.0 LovableAgent" } });
      if (!res.ok) return `Fetch failed with status ${res.status}`;
      const text = await res.text();
      return text.slice(0, 8000);
    }
    if (name === "save_memory") {
      if (!ctx.userId || !ctx.agentId) return "Error: memory requires login";
      const key = String(args?.key ?? "").trim();
      const value = String(args?.value ?? "").trim();
      if (!key || !value) return "Error: key and value required";
      await ctx.adminClient.from('agent_memory').upsert(
        { user_id: ctx.userId, agent_id: ctx.agentId, key, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,agent_id,key' }
      );
      return `Saved: ${key} = ${value}`;
    }
    if (name === "recall_memory") {
      if (!ctx.userId || !ctx.agentId) return "Error: memory requires login";
      const filter = String(args?.key_contains ?? "").trim();
      let q = ctx.adminClient.from('agent_memory').select('key, value').eq('user_id', ctx.userId).eq('agent_id', ctx.agentId).limit(50);
      if (filter) q = q.ilike('key', `%${filter}%`);
      const { data, error } = await q;
      if (error) return `Error: ${error.message}`;
      if (!data || data.length === 0) return "No memories found.";
      return data.map((m: any) => `${m.key}: ${m.value}`).join('\n');
    }
    if (name === "code_exec") {
      const code = String(args?.code ?? "");
      if (!code.trim()) return "Error: empty code";
      try {
        const fn = new Function(
          "fetch", "Deno", "globalThis", "process", "window",
          `"use strict"; ${code.includes("return") ? code : `return (${code});`}`
        );
        const out = fn(undefined, undefined, undefined, undefined, undefined);
        const resolved = out && typeof (out as any).then === "function" ? await out : out;
        const str = typeof resolved === "string" ? resolved : JSON.stringify(resolved, null, 2);
        return `Result: ${str?.slice(0, 4000)}`;
      } catch (e) {
        return `Code error: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    return `Unknown tool: ${name}`;
  } catch (e) {
    return `Tool error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// Helper: Load agent memory
async function loadMemory(adminClient: any, userId: string, agentId: string): Promise<string> {
  try {
    const { data, error } = await adminClient
      .from('agent_memory')
      .select('key, value')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .order('updated_at', { ascending: false })
      .limit(50);
    if (error || !data || data.length === 0) return '';
    const memoryStr = data.map((m: any) => `- ${m.key}: ${m.value}`).join('\n');
    return `\n\n📝 USER MEMORY (things you remember about this user from past conversations):\n${memoryStr}`;
  } catch (e) {
    console.error('Error loading memory:', e);
    return '';
  }
}

async function saveMemory(adminClient: any, userId: string, agentId: string, memories: Array<{key: string, value: string}>) {
  try {
    for (const mem of memories) {
      await adminClient
        .from('agent_memory')
        .upsert(
          { user_id: userId, agent_id: agentId, key: mem.key, value: mem.value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,agent_id,key' }
        );
    }
  } catch (e) {
    console.error('Error saving memory:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, toolType, files, systemPrompt: customSystemPrompt, messages: conversationHistory, stream: requestStream, agentId, webSearch, selectedModel, enableTools } = await req.json();

    if (!prompt && (!files || files.length === 0)) {
      return new Response(JSON.stringify({ error: 'Missing prompt or files' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!toolType) {
      return new Response(JSON.stringify({ error: 'Missing toolType' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const isFreeTool = FREE_TOOLS.includes(toolType);

    const authHeader = req.headers.get('Authorization');
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
      const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(token);
      if (!authError && authUser) user = authUser;
    }

    const { data: tool } = await adminClient
      .from('tools')
      .select('id, is_premium, credits_cost, is_free_tool')
      .eq('tool_type', toolType)
      .limit(1)
      .maybeSingle();

    const toolIsFree = isFreeTool || tool?.is_free_tool === true || tool?.is_premium === false;
    if (!toolIsFree && !user) {
      return new Response(JSON.stringify({ error: 'Login required for premium tools' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const creditsCost = tool?.credits_cost || 2;
    if (tool?.is_premium && user) {
      const { data: hasAccess } = await adminClient.rpc('can_access_tool', { _user_id: user.id, _tool_id: tool.id });
      if (!hasAccess) {
        return new Response(JSON.stringify({ error: 'Premium subscription required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    if (user) {
      const { data: creditsDeducted } = await adminClient.rpc('deduct_credits', { _user_id: user.id, _amount: creditsCost });
      if (!creditsDeducted) {
        return new Response(JSON.stringify({ error: 'Insufficient credits. Please upgrade your plan.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    let systemPrompt = customSystemPrompt || TOOL_PROMPTS[toolType] || TOOL_PROMPTS.chat;
    if (toolType === 'agent-chat' && agentId) {
      const { data: agentRow } = await adminClient
        .from('ai_agents')
        .select('system_prompt')
        .eq('id', agentId)
        .eq('is_active', true)
        .maybeSingle();
      if (agentRow?.system_prompt) systemPrompt = agentRow.system_prompt;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('AI service is not configured');

    const hasImages = files && files.length > 0 && files.some((f: any) => f.type?.startsWith('image/'));
    let userContent: any;
    if (hasImages) {
      userContent = [];
      userContent.push({ type: 'text', text: prompt || 'Analyze this image and describe what you see in detail.' });
      for (const file of files) {
        if (file.type?.startsWith('image/') && file.data) {
          userContent.push({ type: 'image_url', image_url: { url: file.data } });
        }
      }
      const nonImageFiles = files.filter((f: any) => !f.type?.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        userContent.push({ type: 'text', text: `\n\nAdditional files attached: ${nonImageFiles.map((f: any) => f.name).join(', ')}` });
      }
    } else if (files && files.length > 0) {
      let fileContext = '';
      for (const file of files) {
        if (file.data) {
          if (file.type?.includes('text') || file.type?.includes('json') || file.type?.includes('csv')) {
            try {
              const decodedContent = atob(file.data.split(',')[1]);
              fileContext += `\n\n--- Content from ${file.name} ---\n${decodedContent}`;
            } catch {
              fileContext += `\n\n[File attached: ${file.name}]`;
            }
          } else {
            fileContext += `\n\n[File attached: ${file.name} (${file.type})]`;
          }
        }
      }
      userContent = (prompt || '') + fileContext;
    } else {
      userContent = prompt;
    }

    let enhancedSystemPrompt = systemPrompt;
    if (toolType === 'agent-chat') {
      let memoryContext = '';
      if (user && agentId) memoryContext = await loadMemory(adminClient, user.id, agentId);

      enhancedSystemPrompt = `${systemPrompt}

You are a real professional expert. Be specific, actionable, and structured.

🧰 TOOLS AVAILABLE (function calling — use them whenever helpful, don't hallucinate):
- web_search(query): Search the live internet for fresh facts, news, prices.
- fetch_url(url): Read full readable content of any web page.
- calculator(expression): Evaluate any math precisely.
- current_datetime(timezone): Get the current date/time in any timezone.
- save_memory(key, value): Persist a fact about this user for future chats.
- recall_memory(key_contains?): Look up what you remember about this user.
- code_exec(code): Run sandboxed JS for parsing, regex, transforms, logic.

Use a ReAct style: think → call tools → observe results → decide next step → final answer. Chain multiple tools across turns when needed.

🧠 MEMORY:
At the END of your final reply, if you learned facts about the user (and didn't already save via save_memory), output:
<MEMORY>
key: value
</MEMORY>
${memoryContext}`;
    }
    if (hasImages) enhancedSystemPrompt += `\n\nImages have been provided — analyze them carefully.`;

    let messagesArray: any[] = [{ role: 'system', content: enhancedSystemPrompt }];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) messagesArray.push({ role: msg.role, content: msg.content });
    }
    messagesArray.push({ role: 'user', content: userContent });

    const useStreaming = requestStream === true && toolType === 'agent-chat';
    // Function calling enabled for ALL agents (including with image inputs)
    const useTools = toolType === 'agent-chat';

    const MODEL_MAP: Record<string, string> = {
      'gemini': 'google/gemini-2.5-flash',
      'deepseek': 'deepseek-chat',
      'chatgpt': 'openai/gpt-5-mini',
    };
    const isDeepSeek = selectedModel === 'deepseek';
    const model = MODEL_MAP[selectedModel] || 'google/gemini-2.5-flash';

    if (webSearch && toolType === 'agent-chat' && typeof userContent === 'string') {
      messagesArray[messagesArray.length - 1].content = `[WEB SEARCH MODE] Search the internet and provide up-to-date, factual information with sources for: ${userContent}`;
    }

    const apiUrl = isDeepSeek ? 'https://api.deepseek.com/chat/completions' : 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const apiKey = isDeepSeek ? Deno.env.get('DEEPSEEK_API_KEY') : LOVABLE_API_KEY;
    if (!apiKey) throw new Error(`API key for ${isDeepSeek ? 'DeepSeek' : 'Lovable'} is not configured`);
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

    // ============================================================
    // STREAMING + TOOL CALLING PATH
    // ============================================================
    if (useStreaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          let fullText = "";
          try {
            const MAX_ITERATIONS = 10;
            for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
              const body: any = { model, messages: messagesArray, max_tokens: 4000, stream: true };
              if (useTools) { body.tools = AGENT_TOOLS; body.tool_choice = "auto"; }

              const resp = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
              if (!resp.ok || !resp.body) {
                const t = await resp.text().catch(() => "");
                send({ error: `AI error ${resp.status}: ${t.slice(0, 200)}` });
                break;
              }

              const reader = resp.body.getReader();
              const decoder = new TextDecoder();
              let buf = "";
              let assistantText = "";
              const toolCalls: any[] = []; // {id, name, arguments(string)}
              let finishReason: string | null = null;

              outer: while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                let nl: number;
                while ((nl = buf.indexOf("\n")) !== -1) {
                  let line = buf.slice(0, nl);
                  buf = buf.slice(nl + 1);
                  if (line.endsWith("\r")) line = line.slice(0, -1);
                  if (!line.startsWith("data: ")) continue;
                  const payload = line.slice(6).trim();
                  if (payload === "[DONE]") break outer;
                  try {
                    const j = JSON.parse(payload);
                    const delta = j.choices?.[0]?.delta;
                    const fr = j.choices?.[0]?.finish_reason;
                    if (fr) finishReason = fr;
                    if (delta?.content) {
                      assistantText += delta.content;
                      send({ type: "content", delta: delta.content });
                    }
                    if (delta?.tool_calls) {
                      for (const tc of delta.tool_calls) {
                        const idx = tc.index ?? 0;
                        if (!toolCalls[idx]) toolCalls[idx] = { id: tc.id || `call_${idx}`, name: "", arguments: "" };
                        if (tc.id) toolCalls[idx].id = tc.id;
                        if (tc.function?.name) toolCalls[idx].name += tc.function.name;
                        if (tc.function?.arguments) toolCalls[idx].arguments += tc.function.arguments;
                      }
                    }
                  } catch { /* partial */ }
                }
              }

              fullText += assistantText;

              // No tool calls → done
              if (toolCalls.length === 0) break;

              // Append assistant turn with tool_calls
              messagesArray.push({
                role: "assistant",
                content: assistantText || null,
                tool_calls: toolCalls.map(tc => ({
                  id: tc.id,
                  type: "function",
                  function: { name: tc.name, arguments: tc.arguments || "{}" },
                })),
              });

              // Execute each tool, emit chip events
              for (const tc of toolCalls) {
                let args: any = {};
                try { args = JSON.parse(tc.arguments || "{}"); } catch { /* ignore */ }
                send({ type: "tool_call_start", id: tc.id, name: tc.name, arguments: args });
                const result = await runTool(tc.name, args, { adminClient, userId: user?.id ?? null, agentId: agentId ?? null });
                send({ type: "tool_call_end", id: tc.id, name: tc.name, result: result.slice(0, 500) });
                messagesArray.push({ role: "tool", tool_call_id: tc.id, content: result });
              }
              // Loop again so model can use the results
            }

            // Memory extraction
            if (toolType === 'agent-chat' && user && agentId) {
              const m = fullText.match(/<MEMORY>([\s\S]*?)<\/MEMORY>/);
              if (m) {
                const memories = m[1].trim().split('\n').filter(l => l.trim()).map(line => {
                  const [key, ...v] = line.split(':');
                  return { key: key.trim().replace(/^-\s*/, ''), value: v.join(':').trim() };
                }).filter(x => x.key && x.value);
                if (memories.length > 0) await saveMemory(adminClient, user.id, agentId, memories);
              }
            }

            send({ type: "done" });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (e) {
            console.error("stream error:", e);
            send({ error: e instanceof Error ? e.message : "stream failed" });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
    }

    // Non-streaming path (legacy / non agent-chat)
    const requestBody: any = { model, messages: messagesArray, max_tokens: 4000, stream: false };
    const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(requestBody) });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI API error: ${response.status}`);
    }
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) throw new Error('No content in AI response');

    if (toolType === 'agent-chat' && user && agentId) {
      const memoryMatch = result.match(/<MEMORY>([\s\S]*?)<\/MEMORY>/);
      if (memoryMatch) {
        const memories = memoryMatch[1].trim().split('\n').filter((l: string) => l.trim()).map((line: string) => {
          const [key, ...v] = line.split(':');
          return { key: key.trim(), value: v.join(':').trim() };
        }).filter((m: any) => m.key && m.value);
        if (memories.length > 0) await saveMemory(adminClient, user.id, agentId, memories);
      }
    }

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in ai-tool function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
