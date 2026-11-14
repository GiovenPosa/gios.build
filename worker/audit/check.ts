// The checks a report must pass before it can be sent (spec §8). A report
// that fails any of them is held for Gio to review, never sent on its own.
// They're mechanical on purpose: a guard against made-up numbers, missing
// evidence and off-brand wording, not a judge of quality.

import { AUDIT_PACKAGE_IDS, offerNumbers } from '../../src/data/auditOffer';
import type { AuditReport } from '../../src/data/auditReport';
import type { FactRow } from './factTable';

export interface ReportChecks {
  passed: boolean;
  problems: string[];
}

// talking as a person, or as a team: the voice is gios.build's. "I" only
// as a capital (so "i.e." passes); the rest in any case ("We", "Our")
const FIRST_PERSON_I = /\bI(?:['’](?:m|ve|ll|d))?\b/;
const FIRST_PERSON_OTHERS = /\b(?:me|my|we|we['’](?:re|ll|ve)|us|our|ours)\b/i;
// promises nobody can keep, and digs at the previous designer
const PROMISES = /\b(guarantee[sd]?|first page|page one|rank (?:#?1|first|top)|number one on google|double your|triple your)\b/i;
const CRITICISM = /\b(amateur|terrible|awful|rubbish|cheap-looking|poorly built|bad designer|lazy)\b/i;

/** every piece of prose in the report, labelled for the problem list */
function prose(report: AuditReport): [string, string][] {
  return [
    ['verdict', report.verdict],
    ...report.scorecards.map((card, i): [string, string] => [`scorecard ${i + 1}`, card.summary]),
    ...report.problems.flatMap((p, i): [string, string][] => [
      [`problem ${i + 1} title`, p.title],
      [`problem ${i + 1}`, p.whatItCosts],
      [`problem ${i + 1} fix`, p.fix],
    ]),
    ...report.observations.map((text, i): [string, string] => [`observation ${i + 1}`, text]),
    ...report.quickWins.flatMap((w, i): [string, string][] => [
      [`quick win ${i + 1}`, w.title],
      [`quick win ${i + 1}`, w.how],
    ]),
    ['recommendation', report.recommendation.why],
    ...report.recommendation.includes.map((text, i): [string, string] => [`includes ${i + 1}`, text]),
    ['also consider', report.recommendation.alsoConsider ?? ''],
    ['closing', report.closing],
  ];
}

/** the numbers the facts give (and the scales themselves: "51 out of 100") */
function factNumbers(rows: FactRow[]) {
  const allowed = new Set<number>([100, 5]);
  for (const row of rows) {
    if (typeof row.value === 'number') allowed.add(row.value);
    // numbers inside text values, e.g. a page title "PPF 1"
    else if (typeof row.value === 'string') for (const m of row.value.matchAll(/\d+(?:\.\d+)?/g)) allowed.add(Number(m[0]));
  }
  return allowed;
}

export function checkReport(report: AuditReport, rows: FactRow[]): ReportChecks {
  const problems: string[] = [];

  // the shape (Claude fills a schema, but never trust it blindly)
  if (!report?.verdict || !Array.isArray(report.problems) || !report.problems.length || !report.recommendation) {
    return { passed: false, problems: ['The report is missing its verdict, problems or recommendation.'] };
  }
  if (!AUDIT_PACKAGE_IDS.includes(report.recommendation.package)) {
    problems.push(`It recommends a package that doesn't exist: "${report.recommendation.package}".`);
  }

  // evidence: every problem rests on facts that exist
  const keys = new Set(rows.map((row) => row.key));
  report.problems.forEach((problem, i) => {
    if (!problem.evidence?.length) problems.push(`Problem ${i + 1} cites no evidence.`);
    for (const key of problem.evidence ?? []) {
      if (key === 'screenshot' || /^page\.\d+\.excerpt$/.test(key)) continue;
      if (!keys.has(key)) problems.push(`Problem ${i + 1} cites "${key}", which isn't a fact.`);
    }
  });

  // numbers: each one is a real value. A price (£) or a number of weeks
  // must be the offer's; a measurement (seconds, %, MB, a score) must be the
  // facts'; a bare number over 10 either. Small counts on their own ("3
  // pages") are fine.
  const facts = factNumbers(rows);
  const offer = new Set(offerNumbers());
  for (const [where, text] of prose(report)) {
    for (const match of text.matchAll(/(£)?\s?(\d[\d,]*(?:\.\d+)?)\s*(%|percent|seconds?|secs?|s\b|ms|MB|KB|GB|weeks?|days?|out of \d+|\/\s?\d+)?/gi)) {
      const value = Number(match[2].replace(/,/g, ''));
      const unit = (match[3] ?? '').toLowerCase();
      const ok = match[1]
        ? offer.has(value)
        : /^(weeks?|days?)$/.test(unit)
          ? offer.has(value)
          : unit
            ? facts.has(value)
            : value <= 10 || facts.has(value) || offer.has(value);
      if (!ok) problems.push(`In ${where}: "${match[0].trim()}" isn't in the facts or the offer.`);
    }
    const voice = text.match(FIRST_PERSON_I) ?? text.match(FIRST_PERSON_OTHERS);
    if (voice) problems.push(`In ${where}: speaks as "I" or "we" ("${voice[0]}").`);
    if (PROMISES.test(text)) problems.push(`In ${where}: makes a promise ("${text.match(PROMISES)?.[0]}").`);
    if (CRITICISM.test(text)) problems.push(`In ${where}: sounds critical ("${text.match(CRITICISM)?.[0]}").`);
  }

  // observations are judgements, so they carry no numbers at all
  report.observations.forEach((text, i) => {
    if (/\d/.test(text)) problems.push(`Observation ${i + 1} contains a number; observations are judgements only.`);
  });

  return { passed: problems.length === 0, problems: [...new Set(problems)] };
}
