Purpose
- UI components for the AI Copilot feature: chat rendering, input bar, and provider card adapter.

Notes
- Keep components client-only for interaction.
- ProviderCards reuses components/results/ProviderCard.tsx in compact mode for consistency.
- Styling inherits from global theme (gradients, light/dark).

Files
- CopilotChat.tsx – messages list and typing indicator.
- CopilotInput.tsx – input with Enter-to-send.
- ProviderCards.tsx – thin adapter to render provider cards.


