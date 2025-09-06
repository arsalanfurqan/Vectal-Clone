// Agentic mode and keyword trigger logic
// More advanced agentic mode trigger logic (Vectal-style)
// Triggers on: /agent, /agentic, /ai, or input starting with "@agent" or "@ai"
const AGENTIC_PATTERNS = [
  /^\s*\/agent(ic)?\b/i,
  /^\s*\/ai\b/i,
  /^\s*@agent\b/i,
  /^\s*@ai\b/i,
  /\bactivate agent(ic)?\b/i,
  /\bstart agent(ic)?\b/i
];

export function isAgenticTrigger(input: string): boolean {
  return AGENTIC_PATTERNS.some(pattern => pattern.test(input));
}

export function getAgenticMode(input: string): 'agentic' | 'normal' {
  return isAgenticTrigger(input) ? 'agentic' : 'normal';
}
