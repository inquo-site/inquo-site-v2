// Deno tests for the function-calling workflow inside the ai-tool edge function.
// Run via the test-edge-functions tool. No network or DB credentials required —
// memory tools use a stub admin client.

import { assert, assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { AGENT_TOOLS, runTool } from "./index.ts";

// --- Stub admin client for memory tools -------------------------------------
function makeStubAdmin() {
  const store: Array<{ user_id: string; agent_id: string; key: string; value: string }> = [];
  return {
    _store: store,
    from(_table: string) {
      const chain: any = {
        _filters: {} as Record<string, string>,
        _ilike: null as null | { col: string; pat: string },
        select() { return chain; },
        eq(col: string, val: string) { chain._filters[col] = val; return chain; },
        order() { return chain; },
        limit() { return chain; },
        ilike(col: string, pat: string) { chain._ilike = { col, pat: pat.replace(/%/g, "") }; return chain; },
        then(resolve: any) {
          let rows = store.filter(r =>
            Object.entries(chain._filters).every(([k, v]) => (r as any)[k] === v)
          );
          if (chain._ilike) rows = rows.filter(r => (r as any)[chain._ilike!.col].includes(chain._ilike!.pat));
          resolve({ data: rows, error: null });
        },
        async upsert(row: any) {
          const idx = store.findIndex(r => r.user_id === row.user_id && r.agent_id === row.agent_id && r.key === row.key);
          if (idx >= 0) store[idx] = { ...store[idx], ...row };
          else store.push(row);
          return { data: row, error: null };
        },
      };
      return chain;
    },
  };
}

const ctx = (admin: any = makeStubAdmin()) => ({ adminClient: admin, userId: "user-1", agentId: "agent-1" });

// --- AGENT_TOOLS schema -----------------------------------------------------
Deno.test("AGENT_TOOLS exposes all 7 expected functions with valid schema", () => {
  const expected = ["web_search", "calculator", "current_datetime", "fetch_url", "save_memory", "recall_memory", "code_exec"];
  const names = AGENT_TOOLS.map(t => t.function.name);
  for (const n of expected) assert(names.includes(n), `missing tool: ${n}`);
  for (const t of AGENT_TOOLS) {
    assertEquals(t.type, "function");
    assert(typeof t.function.description === "string" && t.function.description.length > 10);
    assertEquals(t.function.parameters.type, "object");
  }
});

// --- calculator -------------------------------------------------------------
Deno.test("calculator evaluates valid math expression", async () => {
  const r = await runTool("calculator", { expression: "(2500 * 0.18) + 200" }, ctx());
  assertStringIncludes(r, "Result: 650");
});

Deno.test("calculator rejects unsafe characters", async () => {
  const r = await runTool("calculator", { expression: "fetch('http://x')" }, ctx());
  assertStringIncludes(r, "invalid characters");
});

// --- current_datetime -------------------------------------------------------
Deno.test("current_datetime returns ISO timestamp", async () => {
  const r = await runTool("current_datetime", { timezone: "Asia/Kolkata" }, ctx());
  assertStringIncludes(r, "Asia/Kolkata");
  assertStringIncludes(r, "ISO:");
});

// --- code_exec --------------------------------------------------------------
Deno.test("code_exec returns expression result", async () => {
  const r = await runTool("code_exec", { code: "[1,2,3].reduce((a,b)=>a+b,0)" }, ctx());
  assertStringIncludes(r, "Result: 6");
});

Deno.test("code_exec catches runtime error gracefully", async () => {
  const r = await runTool("code_exec", { code: "throw new Error('boom')" }, ctx());
  assertStringIncludes(r, "Code error");
});

// --- memory tools -----------------------------------------------------------
Deno.test("save_memory + recall_memory round-trip", async () => {
  const admin = makeStubAdmin();
  const c = ctx(admin);
  const s = await runTool("save_memory", { key: "name", value: "Suman" }, c);
  assertStringIncludes(s, "Saved");
  const r = await runTool("recall_memory", {}, c);
  assertStringIncludes(r, "name: Suman");
});

Deno.test("recall_memory filter narrows results", async () => {
  const admin = makeStubAdmin();
  const c = ctx(admin);
  await runTool("save_memory", { key: "fav_color", value: "blue" }, c);
  await runTool("save_memory", { key: "city", value: "Delhi" }, c);
  const r = await runTool("recall_memory", { key_contains: "fav" }, c);
  assertStringIncludes(r, "fav_color");
  assert(!r.includes("city"));
});

Deno.test("memory tools require login", async () => {
  const r = await runTool("save_memory", { key: "x", value: "y" }, { adminClient: makeStubAdmin(), userId: null, agentId: null });
  assertStringIncludes(r, "requires login");
});

// --- unknown / validation ---------------------------------------------------
Deno.test("unknown tool returns explicit message", async () => {
  const r = await runTool("does_not_exist", {}, ctx());
  assertStringIncludes(r, "Unknown tool");
});

Deno.test("fetch_url rejects non-http url", async () => {
  const r = await runTool("fetch_url", { url: "javascript:alert(1)" }, ctx());
  assertStringIncludes(r, "must start with http");
});
