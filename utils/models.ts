// Model selection logic (locked)
export const MODELS = [
  { name: 'GPT-4', locked: true },
  { name: 'Claude 3', locked: true },
  { name: 'Llama 3', locked: true },
];

export function getAvailableModels() {
  return MODELS;
}
