export const OPEN_ASSISTANT_EVENT = "assistant:open";

export type OpenAssistantDetail = { prompt?: string };

export function openAssistant(prompt?: string) {
  window.dispatchEvent(
    new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, { detail: { prompt } }),
  );
}
