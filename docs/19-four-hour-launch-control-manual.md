# Founder Above the Fold Launch Control
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Public preview | Shows the product without pretending planned machinery is live | `/` | Product |
| B | Owner workbench | Protects drafts and setup panels | `/dashboard` | Founder |
| C | Toy Box Explorer | Teaches and tests the assembly | `/dashboard#assembly-manual` | Founder + tester |
| D | Launch-smoke panel | Repeats route, lock, truth, and header checks | `scripts/launch-smoke.mjs` | Product |
| E | Evidence drawer | Holds browser captures and QA report | `output/launch-qa/` | Product |
| F | LinkedIn launch kit | Holds post copy, video script, CTA, and upload checks | `docs/20-linkedin-launch-kit.md` | Founder |
| G | Video assembly | Produces the sound-off master and proof sheet | `output/launch-video/` | Product |
| H | External fasteners | Domains, Cookiebot, database, LinkedIn, production email, deployment | Provider consoles | Founder |

### Mission Control Board
```text
[Truthful private-beta announcement]
                |
                v
[Preview + tutorial + tests + launch video]
                |
                v
[Founder reviews and manually posts]
                |
                v
[Interest / beta conversations]

[Full-product launch]
        |
        v
[External fasteners + real LinkedIn post test]
        |
        v
[Not yet proved]
```

### Current Go / No-Go Board
| Launch rail | State | Evidence | Decision |
|---|---|---|---|
| Local code and public preview | `[✓]` | Lint, typecheck, build, browser, and launch-smoke evidence | Go |
| LinkedIn build-in-public/private-beta announcement | `[~]` | Copy and video can be prepared; owner must approve and post manually | Go after final asset review |
| Live website/domain CTA | `[x]` | Domains are purchased but not connected or tested | No-go |
| Consent-complete public site | `[x]` | Cookiebot Domain ID and live-domain scan are missing | No-go |
| Production owner access | `[x]` | Resend, sender, callback, owner email, and secret are not configured | No-go |
| Live LinkedIn OAuth | `[x]` | Products, scopes, redirects, keys, database, and real callback are unproved | No-go |
| Queue and official API publishing | `[x]` | Queue, publish motor, retry, and real post test are not implemented | No-go |
| Full product launch | `[x]` | Multiple required live assemblies remain blocked | No-go |

### Assembly Steps
#### Step 1 - Clamp the launch claim
Diagram:
```text
[What is proved] ---> [Private-beta preview] ---> [Truthful post]
[What is planned] --------------------------X--> [Live capability claim]
```
Do:
1. Use “working preview”, “private beta build”, or “building in public”.
2. State that live publishing remains behind setup and LinkedIn approval gates.
3. Show the safety boundary and interactive manual as the proof today.

Check:
- No post or video says the scheduler has published a real LinkedIn post.
- No asset says queue, analytics, templates, or publish-now are live.

Avoid:
- “Launch-ready”, “fully automated”, or “now live” until the full-product board is green.

#### Step 2 - Run the local conveyor
Diagram:
```text
[Lint] ---> [Types] ---> [Build] ---> [13 route checks] ---> [Browser]
```
Do:
1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Start the production build and run `LAUNCH_SMOKE_BASE_URL=http://localhost:PORT npm run test:launch`.
5. Inspect desktop and mobile routes, owner locks, console, and overflow.

Check:
- Every turn returns green.
- Health reports unimplemented capability rails honestly.
- Security headers are present.

Avoid:
- Using a successful compile as the only launch evidence.

#### Step 3 - Pack the LinkedIn crate
Diagram:
```text
[Post copy] + [Video] + [Alt text] + [CTA]
                       |
                       v
                [Owner review]
```
Do:
1. Use the copy and alt text in `docs/20-linkedin-launch-kit.md`.
2. Upload the video manually to LinkedIn.
3. Use one CTA: ask for private-beta testers.

Check:
- The video stays inside LinkedIn’s current duration, resolution, aspect-ratio, frame-rate, bit-rate, and safe-zone requirements.
- Every key claim is visible on screen for sound-off playback.

Avoid:
- Posting, messaging, or changing a LinkedIn account from automation.

#### Step 4 - Insert external fasteners only with approval
Diagram:
```text
[Founder approval]
       |
       +--> [Vercel + domains]
       +--> [Cookiebot]
       +--> [Database]
       +--> [Resend]
       +--> [LinkedIn developer console]
```
Do:
1. Choose the primary domain.
2. Configure each provider without sharing secrets in chat.
3. Repeat the entire conveyor on the live domain.

Check:
- Privacy, cookies, health, callback, and owner access work on the primary domain.
- Secondary domains redirect to the primary domain.

Avoid:
- Changing production deployment, buying services, or accepting terms without explicit approval.

### Estimate Block
| Item | Conservative | Best estimate | Evidence level | Test needed |
|---|---:|---:|---|---|
| Local preview + tutorial + docs | Complete after final conveyor | Complete now | High | Repeat production build and browser sweep |
| LinkedIn private-beta announcement package | Same working session | Same working session | High | Inspect rendered MP4 and owner-review copy |
| Live domain launch | Unknown until console access | Same day if configuration is straightforward | Low | Connect domain, deploy, and test every route |
| Cookie/consent completion | Unknown until Cookiebot access and scan | Same day after Domain ID | Low | Live banner, withdrawal control, declaration |
| LinkedIn OAuth + real publish | Unknown; provider review can dominate | After credentials, database, code, and approval | Low | Owner OAuth plus one real test post |

What would disprove the plan:

- Any broken live link, missing consent control, owner-lock bypass, secret in a response, failed build, mobile overflow, unsupported video file, or product claim that exceeds the evidence.

### Safety Stickers
- [Security] Production development links fail closed; health never returns secret values.
- [Privacy] The public site cannot be called consent-complete until Cookiebot is live.
- [Cost] No provider purchase or paid activation is authorised by this manual.
- [IP] Use only project-owned UI and copy in the launch video.
- [Evidence] A preview launch and a full-product launch are separate rails.

### Finished-Build Test
- [ ] Final lint, typecheck, build, launch-smoke, and browser sweep pass.
- [ ] Video MP4 passes media inspection and visual proof frames.
- [ ] LinkedIn copy and alt text match the private-beta claim.
- [ ] Founder approves the manual upload.
- [ ] No production deployment or LinkedIn post occurs without approval.
- [ ] Full-product launch remains blocked until all external fasteners and one real post are proved.
