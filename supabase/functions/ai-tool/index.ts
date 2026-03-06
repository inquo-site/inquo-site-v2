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
  // Free tools
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

// Helper: Save memory items extracted by AI
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
    console.log(`Saved ${memories.length} memory items for user ${userId}`);
  } catch (e) {
    console.error('Error saving memory:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, toolType, files, systemPrompt: customSystemPrompt, messages: conversationHistory, stream: requestStream, agentId, webSearch, selectedModel } = await req.json();

    if (!prompt && (!files || files.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt or files' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!toolType) {
      return new Response(
        JSON.stringify({ error: 'Missing toolType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(token);
      if (!authError && authUser) {
        user = authUser;
        console.log(`User authenticated: ${user.id}`);
      }
    }

    const { data: tool, error: toolError } = await adminClient
      .from('tools')
      .select('id, is_premium, credits_cost, is_free_tool')
      .eq('tool_type', toolType)
      .limit(1)
      .maybeSingle();

    if (toolError) console.log('Tool fetch error:', toolError.message);

    const toolIsFree = isFreeTool || tool?.is_free_tool === true || tool?.is_premium === false;

    if (!toolIsFree && !user) {
      return new Response(
        JSON.stringify({ error: 'Login required for premium tools' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditsCost = tool?.credits_cost || 2;

    if (tool?.is_premium && user) {
      const { data: hasAccess, error: accessError } = await adminClient
        .rpc('can_access_tool', { _user_id: user.id, _tool_id: tool.id });
      if (accessError || !hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Premium subscription required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (user) {
      const { data: creditsDeducted, error: creditsError } = await adminClient
        .rpc('deduct_credits', { _user_id: user.id, _amount: creditsCost });
      if (creditsError || !creditsDeducted) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please upgrade your plan.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const systemPrompt = customSystemPrompt || TOOL_PROMPTS[toolType] || TOOL_PROMPTS.chat;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI service is not configured');
    }

    // Check if we have image files
    const hasImages = files && files.length > 0 && files.some((f: any) => f.type?.startsWith('image/'));

    // Build user content
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
        const fileList = nonImageFiles.map((f: any) => f.name).join(', ');
        userContent.push({ type: 'text', text: `\n\nAdditional files attached: ${fileList}` });
      }
    } else if (files && files.length > 0) {
      let fileContext = '';
      for (const file of files) {
        if (file.data) {
          if (file.type?.includes('text') || file.type?.includes('json') || file.type?.includes('csv')) {
            try {
              const base64Content = file.data.split(',')[1];
              const decodedContent = atob(base64Content);
              fileContext += `\n\n--- Content from ${file.name} ---\n${decodedContent}`;
            } catch (e) {
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

    // Build enhanced system prompt
    let enhancedSystemPrompt = systemPrompt;

    if (toolType === 'agent-chat') {
      // Load user memory for this agent
      let memoryContext = '';
      if (user && agentId) {
        memoryContext = await loadMemory(adminClient, user.id, agentId);
      }

      enhancedSystemPrompt = `${systemPrompt}

IMPORTANT WORKING GUIDELINES:
- You are a real professional expert, NOT just a text generator. Act like a senior human professional in your field.
- When files, images, documents, or links are provided, analyze them THOROUGHLY and base your work on the actual content — don't give generic responses.
- For images: describe what you see, identify key elements, extract text/data, and use it in your deliverable.
- For documents/PDFs: read the content carefully, understand the context, and reference specific details in your output.
- For data files (CSV, Excel, JSON): analyze the data, identify patterns, trends, and provide data-driven insights.
- For links: acknowledge the reference and incorporate relevant context.
- Always provide ACTIONABLE, SPECIFIC, DETAILED deliverables — not vague advice.
- Use real-world best practices, frameworks, and proven methodologies.
- Structure your output professionally with clear sections, headings, and formatting.
- If you need more information, ask specific questions instead of making assumptions.
- Think step-by-step like a human expert would when solving complex problems.

🧠 MEMORY SYSTEM:
- You have persistent memory. You can remember facts about the user across conversations.
- At the END of your response, if you learned important facts about the user (their name, company, industry, preferences, goals, projects, etc.), output a memory block like this:
<MEMORY>
key1: value1
key2: value2
</MEMORY>
- Only store genuinely useful facts. Examples: "user_name: Rahul", "company: TechStartup Inc", "industry: SaaS", "preferred_tone: formal", "current_project: AI chatbot for customer support"
- If no new facts were learned, don't output any memory block.
${memoryContext}

🔍 RESEARCH & ANALYSIS CAPABILITIES:
- When the user asks you to research something, provide comprehensive analysis based on your training knowledge.
- Structure research outputs with clear sections: Overview, Key Findings, Analysis, Recommendations.
- Cite specific facts, statistics, and frameworks when available.
- If asked to compare options, create structured comparison tables.
- For market research, include industry trends, competitor analysis, and strategic insights.

📄 DOCUMENT ANALYSIS:
- When documents are shared, provide thorough summaries with key takeaways.
- Extract action items, important dates, names, and data points.
- Offer insights and recommendations based on document content.
- Cross-reference multiple documents when available.

🛠️ TOOL-LIKE CAPABILITIES:
- You can generate tables, charts (in text/markdown), calculations, and structured data.
- You can create templates, frameworks, checklists, and action plans.
- You can draft emails, proposals, contracts, and other business documents.
- You can analyze data and provide statistical insights.
- You can create step-by-step guides and SOPs.`;
    }

    if (hasImages) {
      enhancedSystemPrompt += `\n\nYou have been provided with one or more images. Analyze them carefully and incorporate your observations into your response.`;
    }

    let messagesArray: any[] = [{ role: 'system', content: enhancedSystemPrompt }];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messagesArray.push({ role: msg.role, content: msg.content });
      }
    }
    
    messagesArray.push({ role: 'user', content: userContent });

    const useStreaming = requestStream === true && toolType === 'agent-chat';

    // Model selection: user can pick gemini, deepseek, or chatgpt
    const MODEL_MAP: Record<string, string> = {
      'gemini': 'google/gemini-2.5-flash',
      'deepseek': 'deepseek-chat',
      'chatgpt': 'openai/gpt-5-mini',
    };

    const isDeepSeek = selectedModel === 'deepseek';
    const model = MODEL_MAP[selectedModel] || 'google/gemini-2.5-flash';

    const requestBody: any = {
      model,
      messages: messagesArray,
      max_tokens: 4000,
      stream: useStreaming,
    };

    // Add web search grounding for search requests
    if (webSearch && toolType === 'agent-chat') {
      if (typeof userContent === 'string') {
        messagesArray[messagesArray.length - 1].content = `[WEB SEARCH MODE] Search the internet and provide up-to-date, factual information with sources for: ${userContent}`;
      }
    }

    // Route to DeepSeek API or Lovable AI Gateway
    let apiUrl: string;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (isDeepSeek) {
      const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key is not configured');
      }
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers['Authorization'] = `Bearer ${DEEPSEEK_API_KEY}`;
    } else {
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      headers['Authorization'] = `Bearer ${LOVABLE_API_KEY}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    // For streaming, we need to intercept to extract memory
    if (useStreaming) {
      console.log(`Streaming ${toolType} response...`);
      
      // We can't easily extract memory from streaming, so we pass it through
      // Memory extraction will happen on the client side
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    // Non-streaming response
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) throw new Error('No content in AI response');

    // Extract and save memory from non-streaming responses
    if (toolType === 'agent-chat' && user && agentId) {
      const memoryMatch = result.match(/<MEMORY>([\s\S]*?)<\/MEMORY>/);
      if (memoryMatch) {
        const memoryLines = memoryMatch[1].trim().split('\n').filter((l: string) => l.trim());
        const memories = memoryLines.map((line: string) => {
          const [key, ...valueParts] = line.split(':');
          return { key: key.trim(), value: valueParts.join(':').trim() };
        }).filter((m: any) => m.key && m.value);
        
        if (memories.length > 0) {
          await saveMemory(adminClient, user.id, agentId, memories);
        }
      }
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-tool function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
