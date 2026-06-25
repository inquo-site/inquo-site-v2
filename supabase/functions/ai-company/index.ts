import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ============================================================
// INTERNAL AI COMPANY — CEO + Departmental Team Agents
// Only the founder (admin) issues directives. Teams execute.
// ============================================================
const TEAM = {
  ceo: {
    title: "CEO",
    system:
      "You are the CEO of an internal AI company that runs an AI-tools SaaS website. " +
      "The founder gives you a single directive. Your job: break it into concrete tasks " +
      "and assign each task to ONE department from this list ONLY: " +
      "marketing, content, engineering, design, support, analytics, sales, operations. " +
      "Return STRICT JSON only, no prose, no markdown fences. Shape:\n" +
      `{"summary":"1-2 line plan","tasks":[{"department":"marketing","task":"...","deliverable":"..."}]}`,
  },
  marketing: {
    title: "Head of Marketing",
    system:
      "You are the Head of Marketing. Execute the assigned task. Produce campaigns, ad copy, " +
      "SEO angles, social posts, growth experiments. Be specific, actionable, ready-to-ship.",
  },
  content: {
    title: "Head of Content",
    system:
      "You are the Head of Content. Produce ready-to-publish blog outlines, full copy, " +
      "newsletters, video scripts. Use strong hooks and SEO-friendly structure.",
  },
  engineering: {
    title: "Head of Engineering",
    system:
      "You are the Head of Engineering. Produce technical specs, implementation plans, " +
      "API/DB design notes, and concrete code snippets when useful. Be precise.",
  },
  design: {
    title: "Head of Design",
    system:
      "You are the Head of Design. Produce UX flows, layout specs, color/typography choices, " +
      "and component-level guidance. Reference the existing Never Settle dark/gold theme.",
  },
  support: {
    title: "Head of Customer Support",
    system:
      "You are the Head of Customer Support. Produce FAQs, canned replies, escalation rules, " +
      "and proactive outreach scripts. Tone: warm, fast, solution-first.",
  },
  analytics: {
    title: "Head of Analytics",
    system:
      "You are the Head of Analytics. Produce KPI breakdowns, dashboards to track, SQL ideas, " +
      "and clear insight summaries with next actions.",
  },
  sales: {
    title: "Head of Sales",
    system:
      "You are the Head of Sales / B2B. Produce outreach sequences, pricing positioning, " +
      "objection handling, and pipeline plays.",
  },
  operations: {
    title: "Head of Operations",
    system:
      "You are the Head of Operations. Produce SOPs, weekly checklists, vendor/process plans, " +
      "and risk mitigation steps.",
  },
} as const;

type Dept = keyof typeof TEAM;

async function callGateway(system: string, user: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson(s: string) {
  const cleaned = s.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userRes } = await supabase.auth.getUser(token);
    const user = userRes?.user;
    if (!user) throw new Error("Unauthorized");

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Admin only");

    const { directive } = await req.json();
    if (!directive || typeof directive !== "string") throw new Error("directive required");

    // 1. Insert pending record
    const { data: rec, error: insErr } = await supabase
      .from("company_directives")
      .insert({ user_id: user.id, directive, status: "planning" })
      .select()
      .single();
    if (insErr) throw insErr;

    // 2. CEO plans
    const planRaw = await callGateway(TEAM.ceo.system, directive);
    let plan: { summary: string; tasks: { department: string; task: string; deliverable?: string }[] };
    try {
      plan = parseJson(planRaw);
    } catch {
      plan = { summary: "Plan parse failed; using directive as single task.", tasks: [{ department: "operations", task: directive }] };
    }

    await supabase.from("company_directives").update({ ceo_plan: plan, status: "executing" }).eq("id", rec.id);

    // 3. Departments execute in parallel
    const validTasks = plan.tasks.filter((t) => t.department in TEAM && t.department !== "ceo");
    const outputs = await Promise.all(
      validTasks.map(async (t) => {
        const dept = TEAM[t.department as Dept];
        try {
          const userPrompt =
            `Founder directive: ${directive}\n\n` +
            `Your assigned task: ${t.task}\n` +
            (t.deliverable ? `Expected deliverable: ${t.deliverable}\n` : "") +
            `Respond with your concrete output now.`;
          const out = await callGateway(dept.system, userPrompt);
          return { department: t.department, title: dept.title, task: t.task, output: out };
        } catch (e) {
          return { department: t.department, title: dept.title, task: t.task, output: `Error: ${(e as Error).message}` };
        }
      }),
    );

    // 4. CEO final summary
    const reportRaw = await callGateway(
      "You are the CEO. Summarize execution back to the founder in crisp markdown: what was done, key results per department, recommended next step. No fluff.",
      `Directive: ${directive}\n\nPlan: ${JSON.stringify(plan)}\n\nDepartment outputs:\n${outputs.map((o) => `### ${o.title}\n${o.output}`).join("\n\n")}`,
    );

    await supabase
      .from("company_directives")
      .update({ team_outputs: outputs, final_report: reportRaw, status: "complete", updated_at: new Date().toISOString() })
      .eq("id", rec.id);

    return new Response(JSON.stringify({ id: rec.id, plan, outputs, final_report: reportRaw }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
