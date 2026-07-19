# Untitled Visual Guide — Prototype Product Contract
## IKEA / Meccano Assembly Manual Edition

**Owner and inventor:** Lila Olufemi Abegunrin  
**Status:** Untitled working prototype; no permanent product name selected  
**Core sentence:** The user must never be expected to guess where something is that they have never seen before.

## Problem

Complicated digital and bureaucratic procedures place many similarly named controls, accounts, projects, documents, and instructions on the same screen. Conventional guides describe an action but often fail to show the exact place where it occurs or what the correct finished state looks like.

## Product Rule

Every step receives one functional picture. The picture must answer:

1. What am I looking for?
2. Exactly where is it?
3. What do I do to it?
4. What should it look like when I am finished?

When a truthful screenshot, document crop, map, or photograph exists, use it. When it does not exist, produce a clearly labelled late-1980s/early-1990s Meccano-style diagram. Never present an invented interface as a real screenshot.

## First Workflow

Fit a private service key into the correct deployed application:

```text
[Repository label]
       |
       v
[Deployment-project label]
       |
       v
[Live-domain label]
       |
       v
[Exact settings tab]
       |
       v
[Exact labelled slot]
       |
       v
[Live finished-build test]
```

## MVP Panels

1. Mission Control overview
2. Whole-map / one-thing presentation switch
3. One action and one picture per step
4. Exact-location label
5. Completion check and warning drawer
6. Persistent progress stored locally
7. “My screen does not match” stop control
8. Local screenshot attachment slot
9. Finished-build test

## Non-Goals For Prototype 01

- No AI-generated guide creation yet.
- No screenshot upload or remote storage.
- No secret collection.
- No production deployment.
- No permanent name or visual identity decision.
- No claim of accessibility certification.

## Acceptance Tests

- The default view exposes one action rather than the entire procedure.
- Every step has an accessible SVG title and description.
- Every interactive control has a visible label and keyboard focus state.
- The user can expose the whole map without losing their place.
- Progress survives a page reload.
- A mismatch stops the workflow and never instructs the user to guess.
- The layout does not overflow at a 390-pixel viewport.
- Lint, typecheck, build and browser interaction checks pass.
