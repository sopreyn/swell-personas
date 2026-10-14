// Stock coaching lines used in the review screen until a model-written line arrives,
// and whenever the model is unavailable.
export const FALLBACK_SUGGESTIONS = [
  "Naming what you noticed, instead of what they did wrong, tends to land softer.",
  "A specific ask usually lands better than a general complaint.",
  "Reflecting their point back before responding can lower the temperature.",
  "A short pause before reacting gives the other person room to soften too.",
];

export function fallbackSuggestions(count: number): string[] {
  return Array.from({ length: count }, (_, i) => FALLBACK_SUGGESTIONS[i % FALLBACK_SUGGESTIONS.length]);
}
