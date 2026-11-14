// Claude writes the report (spec §6): the Messages API, with the report's
// shape as a tool Claude is told to fill in, so the answer is the JSON the
// report page expects. (Sonnet 5.5 doesn't take tool_choice "tool" or "any",
// so the tool is offered with "auto" and the brief says to use it; an answer
// without it fails the step, which retries.) The home page's phone
// screenshot goes along as an image, so Claude can judge the first
// impression.

import { REPORT_SCHEMA, type AuditReport } from '../../src/data/auditReport';
import type { AuditFacts } from './facts';
import type { FactRow } from './factTable';
import { brief, SYSTEM } from './prompt';

export interface WriteEnv {
  ANTHROPIC_API_KEY?: string;
  /** the model to write with (wrangler.jsonc) */
  AUDIT_MODEL?: string;
}

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

interface ClaudeResponse {
  content?: { type: string; name?: string; input?: unknown }[];
  usage?: { input_tokens?: number; output_tokens?: number };
  stop_reason?: string;
  error?: { message?: string };
}

export async function writeReport(env: WriteEnv, facts: AuditFacts, rows: FactRow[]) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('No Claude API key is set (ANTHROPIC_API_KEY).');
  const model = env.AUDIT_MODEL || DEFAULT_MODEL;

  const content: unknown[] = [];
  // a data URL from PageSpeed: "data:image/jpeg;base64,…"
  const shot = facts.screenshot?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (shot) {
    content.push({ type: 'text', text: 'Their home page on a phone, as Google’s test visit saw it (part of <site_content>):' });
    content.push({ type: 'image', source: { type: 'base64', media_type: shot[1], data: shot[2] } });
  }
  content.push({ type: 'text', text: brief(facts, rows) });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: SYSTEM,
      tools: [
        {
          name: 'write_report',
          description: 'The website audit report for this business.',
          input_schema: REPORT_SCHEMA,
        },
      ],
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content }],
    }),
    signal: AbortSignal.timeout(180_000),
  });
  const data = (await response.json()) as ClaudeResponse;
  if (!response.ok) throw new Error(`Claude ${response.status}: ${data.error?.message ?? 'no detail'}`);

  const call = data.content?.find((part) => part.type === 'tool_use' && part.name === 'write_report');
  if (!call?.input) throw new Error(`Claude didn’t fill in the report (${data.stop_reason ?? 'no reason given'}).`);
  return {
    report: call.input as AuditReport,
    model,
    tokensIn: data.usage?.input_tokens ?? null,
    tokensOut: data.usage?.output_tokens ?? null,
  };
}
