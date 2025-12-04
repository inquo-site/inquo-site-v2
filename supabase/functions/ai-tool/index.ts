import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOOL_PROMPTS: Record<string, string> = {
  blog: "You are an expert blog writer. Create a well-structured, engaging blog post based on the user's topic. Include an introduction, main points with explanations, and a conclusion. Make it SEO-friendly and easy to read.",
  code: "You are an expert programmer. Generate clean, well-commented, functional code based on the user's requirements. Include explanations for complex parts. Follow best practices and coding standards.",
  grammar: "You are a grammar expert. Carefully review the text for grammar, spelling, punctuation, and style errors. Provide the corrected version with improvements. Be thorough but preserve the original meaning and tone.",
  adcopy: "You are an expert copywriter. Create compelling, persuasive ad copy that converts. Focus on benefits, create urgency, and include a strong call-to-action. Keep it concise and impactful.",
  summarize: "You are an expert at summarizing content. Create a concise summary that captures the key points and main ideas of the text. Make it clear, structured, and easy to understand.",
  image: "You are an expert at creating detailed image descriptions. Based on the user's prompt, create a vivid, detailed description for an AI image generator.",
  chat: "You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured answers. Use proper formatting with line breaks between paragraphs. Highlight important points and make your responses easy to read and understand.",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, toolType } = await req.json();

    if (!prompt || !toolType) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt or toolType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get tool info and validate access
    const { data: tool, error: toolError } = await supabaseClient
      .from('tools')
      .select('id, is_premium, credits_cost')
      .eq('tool_type', toolType)
      .maybeSingle();

    // Default credits cost if tool not found in DB
    const creditsCost = tool?.credits_cost || 2;

    // Check premium access if tool is premium
    if (tool?.is_premium) {
      const { data: hasAccess, error: accessError } = await supabaseClient
        .rpc('can_access_tool', { _user_id: user.id, _tool_id: tool.id });

      if (accessError || !hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Premium subscription required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Deduct credits (2 per generation)
    const { data: creditsDeducted, error: creditsError } = await supabaseClient
      .rpc('deduct_credits', { _user_id: user.id, _amount: creditsCost });

    if (creditsError || !creditsDeducted) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = TOOL_PROMPTS[toolType] || TOOL_PROMPTS.chat;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`Processing ${toolType} request for user ${user.id}...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please check your OpenAI account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error('No content in AI response');
    }

    console.log(`Successfully processed ${toolType} request`);

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
