import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-imperial-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-mono text-lg font-bold">F</span>
            </div>
            <span className="font-mono text-sm text-ocean-500 tracking-wider uppercase">Founder Above the Fold</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-tarsius text-imperial-500 leading-tight mb-6 max-w-4xl">
            The passwordless LinkedIn operating system for founders who hate doing LinkedIn
          </h1>

          <p className="text-xl text-ocean-500 max-w-2xl mb-10 leading-relaxed">
            Magic link login. Profile setup assistant. Voice-locked post queue. Safe official LinkedIn publishing. MCP/AI command centre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
            >
              Get Early Access
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-imperial-500 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-500 hover:text-white transition-colors"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-8 text-sm text-ocean-400">
            <span>No passwords</span>
            <span className="w-1 h-1 bg-ocean-400 rounded-full" />
            <span>No scraping</span>
            <span className="w-1 h-1 bg-ocean-400 rounded-full" />
            <span>Official LinkedIn API only</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-24 bg-imperial-500">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-tarsius text-white mb-12">
            LinkedIn is a humiliating admin chore. It should make you look credible.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-imperial-400 rounded-lg">
              <h3 className="font-mono text-sky-400 text-sm uppercase tracking-wider mb-3">The Problem</h3>
              <p className="text-white-300">
                Your profile is neglected. Your headline is from 2019. You have not posted in months. LinkedIn is a source of anxiety, not opportunity.
              </p>
            </div>
            <div className="p-6 bg-imperial-400 rounded-lg">
              <h3 className="font-mono text-sky-400 text-sm uppercase tracking-wider mb-3">The Risk</h3>
              <p className="text-white-300">
                Automation tools that scrape, fake engagement, or violate LinkedIn's Terms of Service can get your account restricted or banned.
              </p>
            </div>
            <div className="p-6 bg-imperial-400 rounded-lg">
              <h3 className="font-mono text-sky-400 text-sm uppercase tracking-wider mb-3">The Opportunity</h3>
              <p className="text-white-300">
                A credible above-the-fold presence turns LinkedIn from a chore into a silent business development engine. Founders, consultants, and fractional execs who look credible get inbound.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-tarsius text-imperial-500 mb-16">
            What you get
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              number="01"
              title="Magic Link Login"
              description="No passwords. No password managers. No forgotten credentials. Just your email and a secure link."
            />
            <FeatureCard
              number="02"
              title="Profile Setup Assistant"
              description="Headline, About, Experience, Featured Links — generated from your 10-minute onboarding questionnaire. Copy-to-LinkedIn checklist included."
            />
            <FeatureCard
              number="03"
              title="Voice-Locked Post Queue"
              description="Every draft runs through a British English voice gate. Failed posts cannot be queued. Your voice stays consistent."
            />
            <FeatureCard
              number="04"
              title="Safe Publishing"
              description="Posts publish through LinkedIn's official Posts API. No scraping. No fake engagement. No account-risky behaviour."
            />
            <FeatureCard
              number="05"
              title="MCP/AI Command Centre"
              description="Tell your AI assistant: 'Make me visible this week.' It generates drafts, runs voice checks, and queues posts. You approve."
            />
            <FeatureCard
              number="06"
              title="Manual Tasks Tracker"
              description="Know exactly what needs your human attention. Profile copy to paste. Connections to make. Messages to send."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-24 bg-persian-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-tarsius text-white mb-16">
            Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Setup"
              price="£299-799"
              period="one-time"
              description="Complete profile overhaul. Headline, About, Experience, Featured Links. 2 weeks of voice-checked posts. Copy-paste checklist."
              features={[
                "10-minute onboarding questionnaire",
                "Generated profile copy",
                "Copy-to-LinkedIn checklist",
                "2 weeks of post drafts",
                "Voice check on all posts",
                "Queue and schedule",
              ]}
              cta="Get Started"
              highlighted={false}
            />
            <PricingCard
              name="SaaS"
              price="£49-99"
              period="/month"
              description="The full operating system. Dashboard, magic link, voice lock, queue, reminders, analytics, and MCP tools."
              features={[
                "Unlimited drafts",
                "Voice-locked queue",
                "Scheduled publishing",
                "Profile copy tracker",
                "Manual tasks dashboard",
                "MCP/AI command centre",
                "Analytics for your posts",
              ]}
              cta="Join Beta"
              highlighted={true}
            />
            <PricingCard
              name="Done-With-You"
              price="£500-1,500"
              period="/month"
              description="Founder visibility ops. We run your LinkedIn presence for you. Content strategy, weekly posts, profile updates, and inbound optimisation."
              features={[
                "Everything in SaaS",
                "Weekly content strategy",
                "Profile copy refreshes",
                "Inquiry response templates",
                "Monthly analytics review",
                "Priority support",
              ]}
              cta="Apply Now"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-tarsius text-imperial-500 mb-6">
            Turn your LinkedIn from neglected to credible in 48 hours
          </h2>
          <p className="text-ocean-500 mb-10 max-w-2xl mx-auto">
            Join the beta. Get the tool to keep your LinkedIn alive without password hell or risky automation.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-10 py-5 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
          >
            Get Early Access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-persian-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-imperial-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-mono text-sm font-bold">F</span>
            </div>
            <span className="font-mono text-sm text-ocean-500">Founder Above the Fold</span>
          </div>
          <div className="flex gap-6 text-sm text-ocean-400">
            <Link href="/privacy" className="hover:text-imperial-500">Privacy</Link>
            <Link href="/cookies" className="hover:text-imperial-500">Cookies</Link>
            <Link href="/terms" className="hover:text-imperial-500">Terms</Link>
          </div>
          <p className="text-sm text-ocean-400">
            Based on true events. Sadly.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="p-6 border border-persian-400 rounded-lg hover:border-sky-500 transition-colors">
      <span className="font-mono text-xs text-sky-500 uppercase tracking-wider">{number}</span>
      <h3 className="font-tarsius text-xl text-imperial-500 mt-2 mb-3">{title}</h3>
      <p className="text-ocean-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, cta, highlighted }: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}) {
  return (
    <div className={`p-8 rounded-lg ${highlighted ? 'bg-imperial-500 text-white' : 'bg-white border border-persian-400'}`}>
      <h3 className={`font-mono text-sm uppercase tracking-wider mb-4 ${highlighted ? 'text-sky-400' : 'text-ocean-500'}`}>
        {name}
      </h3>
      <div className="mb-4">
        <span className={`text-4xl font-tarsius ${highlighted ? 'text-white' : 'text-imperial-500'}`}>{price}</span>
        <span className={`text-sm ${highlighted ? 'text-white-300' : 'text-ocean-400'}`}> {period}</span>
      </div>
      <p className={`text-sm mb-6 ${highlighted ? 'text-white-300' : 'text-ocean-500'}`}>{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${highlighted ? 'text-white-300' : 'text-ocean-500'}`}>
            <span className={highlighted ? 'text-sky-400' : 'text-sky-500'}>+</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/auth"
        className={`inline-flex items-center justify-center w-full px-6 py-3 font-mono text-sm uppercase tracking-wider rounded-lg transition-colors ${
          highlighted
            ? 'bg-sky-500 text-white hover:bg-sky-600'
            : 'bg-imperial-500 text-white hover:bg-imperial-600'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
