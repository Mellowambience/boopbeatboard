# Boop Beat Board

> Unified monorepo — web app + iOS shell

```
boopbeatboard/
├── web/      Vite + React/TS — Liquid Chrome UI, Web Audio API, Fae language system
└── mobile/   Expo 51 — iOS WebView shell with haptics bridge
```

## Sprint map
- **Sprint 1.5** ✅ Fusion scaffold — web deployed to Vercel, mobile points at stable URL
- **Sprint 2** MIST tRPC bridge — clawd voice control (BPM, pattern, AgentBar states)
- **Sprint 3** Lumina-Core — Swift AVAudioEngine native audio (<5ms latency)

## Quick start
```bash
# Install all workspaces
pnpm install

# Run web app
cd web && pnpm dev

# Run iOS shell
cd mobile && npx expo start
```

## Architecture
The `web/` app is the real product — full beat sequencer, 16-pad grid, Web Audio API synth, Fae runic language system, and AgentBar (MIST hook). The `mobile/` shell wraps it in a WebView with native haptics on every pad hit via a JS bridge.

Target bundle ID: `com.aetherhaven.boopbeatboard`
