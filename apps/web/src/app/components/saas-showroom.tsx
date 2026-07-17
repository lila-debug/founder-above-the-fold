"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Cookie,
  FileText,
  Gift,
  Home,
  ImagePlus,
  Link2,
  LockKeyhole,
  LogIn,
  Menu,
  Mic,
  PenLine,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ShowroomScreen =
  | "welcome"
  | "login"
  | "signup"
  | "purchase"
  | "success"
  | "dashboard"
  | "files"
  | "photo"
  | "editor"
  | "links"
  | "perks"
  | "voice"
  | "local-ai"
  | "settings";

const SCREENS: Array<{ id: ShowroomScreen; label: string; icon: LucideIcon }> = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "login", label: "Log in", icon: LogIn },
  { id: "signup", label: "Sign up", icon: UserPlus },
  { id: "purchase", label: "One-time purchase", icon: LockKeyhole },
  { id: "success", label: "Build complete", icon: BadgeCheck },
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "files", label: "Files", icon: FileText },
  { id: "photo", label: "Profile photo", icon: Camera },
  { id: "editor", label: "Profile editor", icon: PenLine },
  { id: "links", label: "Links", icon: Link2 },
  { id: "perks", label: "Perks Hub", icon: Gift },
  { id: "voice", label: "Voice to text", icon: Mic },
  { id: "local-ai", label: "Local AI", icon: WandSparkles },
  { id: "settings", label: "Privacy & settings", icon: Settings },
];

const MANUAL: Record<ShowroomScreen, [string, string, string]> = {
  welcome: ["Place your private founder cabinet.", "Choose start or returning owner.", "No LinkedIn access is requested."],
  login: ["Insert the email key.", "Open the private sign-in link.", "Never display passwords or secrets."],
  signup: ["Label the new cabinet.", "Read the privacy panel before fastening.", "Consent must be specific and reversible."],
  purchase: ["Inspect the proposed one-time macOS licence.", "Use the verified direct web checkout once fitted.", "Apple is not the merchant or payment rail."],
  success: ["Confirm the server-verified licence receipt.", "Open the finished workbench.", "Recover access through the owner account."],
  dashboard: ["Read the four signal tiles.", "Choose the next visible action.", "Publishing stays intentionally locked."],
  files: ["Place source panels in the drawer.", "Label private or exportable.", "Remove a panel from all synced devices on request."],
  photo: ["Choose or capture a portrait.", "Align the crop inside the guide.", "Camera access starts only after a tap."],
  editor: ["Edit the canonical copy.", "Run the voice gauge.", "Paste LinkedIn profile changes by hand."],
  links: ["Insert one public link.", "Test the destination.", "No tracking wrapper is added by default."],
  perks: ["Inspect the unlocked parts.", "Choose a useful template.", "Partner offers must be labelled."],
  voice: ["Press and hold the microphone.", "Inspect the transcript.", "Audio is not retained unless the owner chooses."],
  "local-ai": ["Check device availability.", "Run the rewrite locally.", "Fallback stays clear when the model is unavailable."],
  settings: ["Inspect every lock and hinge.", "Export or remove owner data.", "Cookie controls apply to web surfaces only."],
};

export function SaasShowroom({ initialScreen = "welcome" }: { initialScreen?: ShowroomScreen }) {
  const [screen, setScreen] = useState<ShowroomScreen>(initialScreen);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = SCREENS.find((item) => item.id === screen) ?? SCREENS[0];
  const index = SCREENS.findIndex((item) => item.id === screen);

  function open(next: ShowroomScreen) {
    setScreen(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="saas-shell">
      <header aria-hidden={menuOpen || undefined} className="saas-header" inert={menuOpen || undefined}>
        <Link className="founder-wordmark" href="/"><span>ABOVE</span><span>THE FOLD</span></Link>
        <div
          aria-label={`Screen ${index + 1} of ${SCREENS.length}`}
          aria-valuemax={SCREENS.length}
          aria-valuemin={1}
          aria-valuenow={index + 1}
          className="saas-progress"
          role="progressbar"
        >
          <span style={{ width: `${((index + 1) / SCREENS.length) * 100}%` }} />
        </div>
        <span className="state-stamp is-ready hidden sm:inline-flex">14-screen product build</span>
        <button className="icon-key" type="button" aria-label="Open screen index" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
      </header>

      <aside
        aria-label="Product screens"
        aria-modal={menuOpen ? true : undefined}
        className={`saas-index ${menuOpen ? "is-open" : ""}`}
        role={menuOpen ? "dialog" : undefined}
      >
        <div className="flex items-center justify-between border-b-2 border-black p-4">
          <strong className="text-sm font-black uppercase">Screen parts · 01–14</strong>
          <button className="icon-key" type="button" aria-label="Close screen index" onClick={() => setMenuOpen(false)}><X size={19} /></button>
        </div>
        <nav className="grid gap-1 overflow-auto p-3">
          {SCREENS.map((item, itemIndex) => {
            const Icon = item.icon;
            return <button aria-current={screen === item.id ? "page" : undefined} className={`rail-button ${screen === item.id ? "is-active" : ""}`} key={item.id} onClick={() => open(item.id)} type="button"><span className="rail-number">{String(itemIndex + 1).padStart(2, "0")}</span><Icon size={17} /><span>{item.label}</span></button>;
          })}
        </nav>
      </aside>
      {menuOpen ? <button className="rail-scrim" aria-hidden="true" onClick={() => setMenuOpen(false)} tabIndex={-1} type="button" /> : null}

      <section aria-hidden={menuOpen || undefined} className="saas-stage" inert={menuOpen || undefined}>
        <div className="saas-stage-label"><span>{String(index + 1).padStart(2, "0")}</span><div><p>Founder Above the Fold · Web + iPhone</p><h1>{active.label}</h1></div></div>
        <div className="saas-screen-frame" key={screen}>
          <Screen screen={screen} open={open} />
        </div>
        <Manual screen={screen} />
        <div className="saas-stepper">
          <button className="hard-button bg-white" disabled={index === 0} onClick={() => open(SCREENS[Math.max(index - 1, 0)].id)} type="button"><ArrowLeft size={16} /> Previous</button>
          <p>{index + 1} / {SCREENS.length}</p>
          <button className="hard-button bg-[#f4d13d]" disabled={index === SCREENS.length - 1} onClick={() => open(SCREENS[Math.min(index + 1, SCREENS.length - 1)].id)} type="button">Next <ArrowRight size={16} /></button>
        </div>
      </section>
    </main>
  );
}

function Screen({ screen, open }: { screen: ShowroomScreen; open: (screen: ShowroomScreen) => void }) {
  if (screen === "welcome") return <Poster tone="teal" eyebrow="Private founder operating system" title={<>BUILD YOUR<br />PUBLIC SIGNAL.</>} body="Draft, speak, organise and export—without handing a machine the keys to your LinkedIn account." action="Assemble my cabinet" onAction={() => open("signup")} secondary="I already own it" onSecondary={() => open("login")} art />;
  if (screen === "login") return <AuthCard kind="login" onNext={() => open("dashboard")} />;
  if (screen === "signup") return <AuthCard kind="signup" onNext={() => open("purchase")} />;
  if (screen === "purchase") return <Purchase onNext={() => open("success")} />;
  if (screen === "success") return <Poster tone="blue" eyebrow="Receipt fitted · licence restored" title={<>YOUR TOOL<br />IS ASSEMBLED.</>} body="Founder Above the Fold is yours. The chrome dog marks a finished build: private cabinet, voice tools and Perks Hub unlocked." action="Open my workbench" onAction={() => open("dashboard")} art />;
  if (screen === "dashboard") return <Dashboard open={open} />;
  if (screen === "files") return <Files />;
  if (screen === "photo") return <Photo />;
  if (screen === "editor") return <Editor />;
  if (screen === "links") return <Links />;
  if (screen === "perks") return <Perks />;
  if (screen === "voice") return <Voice />;
  if (screen === "local-ai") return <LocalAI />;
  return <SettingsScreen />;
}

function Poster({ tone, eyebrow, title, body, action, onAction, secondary, onSecondary, art }: { tone: "teal" | "blue"; eyebrow: string; title: React.ReactNode; body: string; action: string; onAction: () => void; secondary?: string; onSecondary?: () => void; art?: boolean }) {
  return <section className={`saas-poster ${tone === "blue" ? "is-blue" : ""} ${art ? "has-art" : ""}`}><div className="saas-poster-copy relative z-10"><span className="cut-label bg-white">{eyebrow}</span><h2>{title}</h2><p>{body}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button className="hard-button bg-black text-white" onClick={onAction} type="button">{action}<ArrowRight size={17} /></button>{secondary ? <button className="hard-button bg-white" onClick={onSecondary} type="button">{secondary}</button> : null}</div></div>{art ? <ChromeDog /> : null}</section>;
}

function ChromeDog() {
  return <svg className="chrome-dog" viewBox="0 0 360 280" role="img" aria-label="Complete chrome-blue balloon dog, the finished-build marker"><defs><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4ffff"/><stop offset=".2" stopColor="#33d6ff"/><stop offset=".48" stopColor="#0757e7"/><stop offset=".72" stopColor="#7deaff"/><stop offset="1" stopColor="#03256c"/></linearGradient></defs><g fill="url(#chrome)" stroke="#111" strokeWidth="4.5" strokeLinejoin="round"><ellipse cx="298" cy="84" rx="18" ry="46" transform="rotate(18 298 84)"/><ellipse cx="270" cy="213" rx="20" ry="53" transform="rotate(-8 270 213)"/><ellipse cx="305" cy="214" rx="22" ry="56" transform="rotate(-10 305 214)"/><ellipse cx="145" cy="213" rx="20" ry="53" transform="rotate(8 145 213)"/><ellipse cx="180" cy="214" rx="22" ry="56" transform="rotate(10 180 214)"/><ellipse cx="220" cy="157" rx="72" ry="26"/><ellipse cx="146" cy="124" rx="20" ry="37" transform="rotate(-12 146 124)"/><circle cx="157" cy="153" r="10"/><circle cx="290" cy="157" r="10"/><ellipse cx="112" cy="48" rx="20" ry="43" transform="rotate(-10 112 48)"/><ellipse cx="149" cy="48" rx="22" ry="45" transform="rotate(13 149 48)"/><ellipse cx="134" cy="88" rx="26" ry="42" transform="rotate(5 134 88)"/><ellipse cx="82" cy="102" rx="50" ry="24" transform="rotate(-5 82 102)"/><ellipse cx="33" cy="102" rx="8" ry="12"/><ellipse cx="42" cy="102" rx="6" ry="9"/><ellipse cx="142" cy="268" rx="13" ry="5"/><ellipse cx="180" cy="269" rx="13" ry="5"/><ellipse cx="270" cy="268" rx="13" ry="5"/><ellipse cx="307" cy="269" rx="13" ry="5"/></g><path d="M309 43 L320 17" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round"/><path d="M309 43 L320 17" fill="none" stroke="#33d6ff" strokeWidth="4" strokeLinecap="round"/></svg>;
}

function AuthCard({ kind, onNext }: { kind: "login" | "signup"; onNext: () => void }) {
  const signup = kind === "signup";
  return <section className="saas-form-wrap"><div className={`saas-form-poster ${signup ? "tone-orange" : "tone-yellow"}`}><span className="cut-label bg-white">{signup ? "New cabinet" : "Returning owner"}</span><h2>{signup ? "MAKE A\nPRIVATE HOME." : "OPEN YOUR\nCABINET."}</h2><p>{signup ? "One owner. Clear consent. Your words remain yours." : "We send a private sign-in link. There is no password to remember."}</p></div><form className="saas-form-card" onSubmit={(event) => { event.preventDefault(); onNext(); }}><label>Email address<input type="email" required placeholder="founder@company.ca" /></label>{signup ? <label>Display name<input required placeholder="Your name" /></label> : null}{signup ? <label className="check-line"><input type="checkbox" required /><span>I have read the <Link href="/privacy">privacy panel</Link> and agree to the <Link href="/terms">terms</Link>.</span></label> : null}<button className="hard-button bg-black text-white" type="submit">{signup ? "Continue to licence" : "Send private link"}<ArrowRight size={16} /></button><p className="form-note"><ShieldCheck size={16} /> No LinkedIn password. No automated DMs. No scraping.</p></form></section>;
}

function Purchase({ onNext }: { onNext: () => void }) {
  return <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><article className="licence-card"><span className="cut-label bg-[#f4d13d]">Direct founder licence · price test only</span><h2>CA$199</h2><p className="text-lg font-black uppercase">One purchase. Keep this major version.</p><ul>{["Private macOS workbench", "Persistent local drafts and labels", "Voice-to-text included", "Signed updates during the stated update period", "Private licence recovery by email"].map((item) => <li key={item}><Check size={18} />{item}</li>)}</ul><Link className="hard-button bg-black text-white" href="/pricing">Open real licence panel <ArrowRight size={16} /></Link><button className="text-button" onClick={onNext} type="button"><RotateCcw size={15} /> Preview receipt state</button><p className="form-note"><LockKeyhole size={16} /> Stripe sandbox is selected. Checkout stays locked until its signed webhook is fitted.</p></article><article className="paper-card p-5"><span className="section-kicker">01 → Inspect the licence</span><h3 className="mt-4 text-3xl font-black uppercase">No subscription trap.</h3><p className="mt-3 leading-7">The launch rail is a direct Stripe web purchase for the separately distributed, signed and notarized macOS app. Apple is not the merchant. The cabinet unlocks only after the signed server event creates exactly one receipt; the return-page redirect cannot grant access.</p><div className="mt-6 grid gap-3"><div className="field-slat"><span>Native product</span><strong>Direct macOS licence</strong></div><div className="field-slat"><span>Payment rail</span><strong>Stripe sandbox fitted</strong></div><div className="field-slat"><span>Auto renewal</span><strong>Off</strong></div></div></article></section>;
}

function Dashboard({ open }: { open: (screen: ShowroomScreen) => void }) {
  const cards: Array<[string, string, string, ShowroomScreen]> = [["12", "Draft panels", "Draft created", "files"], ["4", "Voice checks", "Voice passed", "voice"], ["3", "Profile parts", "Awaiting approval", "editor"], ["0", "Automated posts", "Intentionally locked", "settings"]];
  return <div className="grid gap-5"><Poster tone="teal" eyebrow="Owner control board" title={<>MAKE THE WEEK.<br />KEEP IT HUMAN.</>} body="The next action is visible, the safety lock is explicit, and no demo state pretends to be live evidence." action="Start with voice" onAction={() => open("voice")} art /><section className="stat-grid">{cards.map(([value,label,state,target], i) => <button className={`stat-card text-left ${["tone-yellow","tone-teal","tone-orange","tone-paper"][i]}`} key={label} onClick={() => open(target)} type="button"><strong>{value}</strong><div><p>{label}</p><span className="state-stamp mt-3">{state}</span></div></button>)}</section></div>;
}

function Files() { return <Panel title="Private parts drawer" kicker="Files · device + chosen sync"><div className="file-grid">{[["Founder voice notes.txt","Private","12 KB"],["Profile source copy.md","Exportable","28 KB"],["Portrait options","Private","4 photos"],["Launch links.csv","Exportable","8 links"]].map(([name,state,size],i) => <article className="file-card" key={name}><span className={`file-icon tone-${(i%3)+1}`}><FileText /></span><strong>{name}</strong><p>{state} · {size}</p><button type="button">Inspect <ChevronRight size={15} /></button></article>)}<button className="file-add" type="button"><span><ImagePlus /></span><strong>Place a new panel</strong><p>Choose a file; nothing uploads until you confirm.</p></button></div></Panel> }

function Photo() { return <Panel title="Profile portrait fitter" kicker="Camera · opt-in only"><div className="photo-grid"><div className="portrait-jig"><div className="portrait-head"/><div className="portrait-body"/><span>Align eyes to this rail</span></div><div className="grid content-start gap-3"><button className="hard-button bg-black text-white" type="button"><Camera size={17} /> Open camera</button><button className="hard-button bg-white" type="button"><ImagePlus size={17} /> Choose photo</button><div className="warning-strip mt-3"><ShieldCheck size={19} /><span>Camera opens only after your tap. The original stays private unless you export it.</span></div></div></div></Panel> }

function Editor() { return <Panel title="Canonical profile editor" kicker="Edit here · paste to LinkedIn by hand"><div className="editor-grid"><label>Headline<textarea defaultValue="Founder building practical systems for people navigating high-stakes work." /></label><label>About<textarea className="min-h-52" defaultValue="I turn complicated systems into visible, testable parts. My work sits where product invention, public evidence and humane automation meet." /></label><div className="grid gap-3 sm:grid-cols-3"><div className="field-slat">Voice <strong>Passed</strong></div><div className="field-slat">Version <strong>v4</strong></div><div className="field-slat">LinkedIn <strong>Manual</strong></div></div><button className="hard-button w-fit bg-[#f4d13d]" type="button">Save approved copy <Check size={16} /></button></div></Panel> }

function Links() { return <Panel title="Public link rack" kicker="Links · test before export"><div className="grid gap-3">{[["Founder Above the Fold","founder.example/product","Live"],["Book a working session","calendar.example/lila","Test"],["Privacy panel","founder.example/privacy","Live"]].map(([label,url,state]) => <div className="link-slat" key={label}><span><Link2 size={19} /></span><div><strong>{label}</strong><p>{url}</p></div><button type="button">{state}</button></div>)}<button className="hard-button w-fit bg-black text-white" type="button">Insert link <Link2 size={16} /></button></div></Panel> }

function Perks() { return <Panel title="Perks Hub" kicker="Unlocked with your licence"><div className="perk-grid">{[["90-day founder signal plan","12-panel workbook","Included"],["Voice jig library","18 British-English checks","Included"],["Public preview kit","Profile + links template","Included"],["Partner drawer","Clearly labelled offers","Optional"]].map(([title,body,label],i) => <article className={`perk-card perk-${i+1}`} key={title}><span>{String(i+1).padStart(2,"0")}</span><Gift size={28}/><h3>{title}</h3><p>{body}</p><strong>{label}</strong></article>)}</div></Panel> }

function Voice() { return <Panel title="Speak the first draft" kicker="Mandatory product rail · owner controlled"><div className="voice-board"><button className="mic-key" type="button" aria-label="Start voice capture"><Mic size={44}/><span>Press to speak</span></button><div className="wave" aria-hidden="true">{[18,42,28,68,50,88,38,72,30,52,20].map((h,i)=><i key={i} style={{height:h}} />)}</div><article><span className="state-stamp is-ready">Transcript ready</span><p>“The strongest founder profile is not a résumé. It is a clear signal that helps the right person understand the work.”</p><div className="flex flex-wrap gap-2"><button className="hard-button bg-[#f4d13d]" type="button">Keep transcript <Check size={16}/></button><button className="hard-button bg-white" type="button">Discard</button></div></article><p className="form-note"><ShieldCheck size={16}/> Default: process the transcript, do not retain the recording.</p></div></Panel> }

function LocalAI() { return <Panel title="Local AI finishing tool" kicker="Optional · availability checked on device"><div className="ai-grid"><article className="local-ai-card"><ChromeDog/><span className="state-stamp is-ready">On-device model ready</span><h3>Polish without shipping your draft away.</h3><p>Use the device model for concise rewrites, structure and extraction. It is not treated as a source of current facts.</p><button className="hard-button bg-black text-white" type="button"><WandSparkles size={17}/> Refine locally</button></article><article className="paper-card p-5"><h3 className="text-xl font-black uppercase">Availability clamp</h3><div className="mt-4 grid gap-3"><div className="field-slat"><span>Compatible device</span><strong>Check</strong></div><div className="field-slat"><span>Apple Intelligence</span><strong>Check</strong></div><div className="field-slat"><span>Fallback</span><strong>Manual editor</strong></div></div><p className="mt-5 text-sm leading-6">When local AI is unavailable, every core screen still works. Voice capture and manual editing remain first-class tools.</p></article></div></Panel> }

function SettingsScreen() { return <Panel title="Locks, hinges & owner controls" kicker="Privacy · access · legal"><div className="settings-list">{[["Privacy panel","What is collected, why, retention and choices","/privacy"],["Cookie controls","Web cookies and Cookiebot declaration","/cookies"],["Terms of use","One-time licence and responsible use","/terms"],["Export my cabinet","Portable copy of owner content","#"],["Remove my cabinet","Verified deletion route","#"]].map(([title,body,href],i) => <Link className={i===4 ? "is-danger" : ""} href={href} key={title}><span>{i===0 ? <ShieldCheck/> : i===1 ? <Cookie/> : i===2 ? <BookOpen/> : i===3 ? <FileText/> : <X/>}</span><div><strong>{title}</strong><p>{body}</p></div><ChevronRight/></Link>)}</div></Panel> }

function Panel({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) { return <section className="saas-panel"><div className="screen-intro"><span className="section-kicker">{kicker}</span><h2 className="mt-3 text-4xl font-black uppercase sm:text-6xl">{title}</h2></div><div className="mt-6">{children}</div></section> }

function Manual({ screen }: { screen: ShowroomScreen }) { const [place,check,avoid]=MANUAL[screen]; return <aside className="manual-panel !m-0 mt-5"><div className="manual-tab"><BookOpen size={17}/> Matching assembly panel</div><div className="manual-grid"><div><span>Place</span><strong>{place}</strong></div><div><span>Align</span><strong>{check}</strong></div><div><span>Avoid</span><strong>{avoid}</strong></div><div><span>Finished-build test</span><strong>Can the owner complete this screen without live coaching?</strong></div></div></aside> }
