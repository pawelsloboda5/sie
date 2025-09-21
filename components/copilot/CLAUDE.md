Purpose
- UI components for the AI Copilot feature: chat rendering, input bar, ProviderCards, and a small state/debug panel in the page.

Notes
- Keep interactive components client-only.
- `ProviderCards` reuses `components/results/ProviderCard.tsx` in compact mode for consistency.
- Styling inherits from global theme (gradients, light/dark).
- The page wires optional streaming responses from the API to improve perceived speed.

Files
- ChatWindow.tsx – messages list, typing indicator, streaming deltas support.
- InputBar.tsx – input with Enter-to-send.
- ProviderCards.tsx – thin adapter to render provider cards.
- StatePanel.tsx – shows extracted state and lightweight debug info.


