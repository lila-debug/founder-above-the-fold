'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TutorialPage() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome, Founder',
      subtitle: 'Your credible LinkedIn presence starts here',
      content: 'This 5-minute tutorial shows you exactly how to use Founder Above the Fold to build a professional LinkedIn presence without the password chaos.',
      action: 'Start Tutorial'
    },
    {
      title: 'Step 1: Sign In (No Passwords)',
      subtitle: 'Magic links. That\'s it.',
      content: 'You don\'t remember passwords. We don\'t ask for them.\n\n• Go to /auth\n• Enter your email\n• Click the magic link in your email\n• Done.\n\nYou\'re now signed in for 7 days.',
      action: 'Next: Onboarding'
    },
    {
      title: 'Step 2: Tell Us About Yourself (10 Minutes)',
      subtitle: 'This is the only form you\'ll fill out. Promise.',
      content: 'The onboarding questionnaire is 4 simple screens:\n\n1. Your name, role, company\n2. Who you want to reach and why\n3. Your top 3 skills and biggest wins\n4. Content themes and voice tone\n\nWe use this to generate everything.',
      action: 'Next: Profile Copy'
    },
    {
      title: 'Step 3: LinkedIn Profile Copy (Auto-Generated)',
      subtitle: 'Professional. Credible. Yours.',
      content: 'From your questionnaire, we generate 4 pieces:\n\n• Headline (120 chars)\n• About (2000 chars)\n• Experience description\n• Featured section prompt\n\nCopy each to your LinkedIn profile. Mark as done.',
      action: 'Next: Posts'
    },
    {
      title: 'Step 4: 2 Weeks of Posts (Auto-Generated)',
      subtitle: '14 drafts. All pre-written. All voice-checked.',
      content: 'We create 14 posts using proven templates:\n\n• Mistake lessons\n• What you\'ve learned\n• Contrarian takes\n• Frameworks\n• Real talk\n• Quick wins\n\nAll matched to your voice and content pillars.\n\nEdit any you want. They\'re just drafts.',
      action: 'Next: Voice Check'
    },
    {
      title: 'Step 5: Voice Check (British English)',
      subtitle: 'Your posts stay professional. No exceptions.',
      content: 'Every post runs through our voice gate:\n\n❌ Banned words (gonna, wanna, kinda...)\n❌ Americanisms (color → colour)\n❌ Emojis\n❌ Sentences over 40 words\n\nFails a check? Edit and re-run.\n\nPasses? Ready to queue.',
      action: 'Next: Queue'
    },
    {
      title: 'Step 6: Schedule Your Posts',
      subtitle: 'Queue them. Pick dates. LinkedIn does the rest.',
      content: 'Once voice check passes:\n\n1. Click "Queue for Publishing"\n2. Pick a date and time\n3. We publish to LinkedIn at that time\n\nNo scraping. No fake engagement.\nOfficial LinkedIn API only.',
      action: 'Next: Dashboard'
    },
    {
      title: 'Your Dashboard',
      subtitle: 'Everything in one place',
      content: 'Dashboard shows:\n\n📋 Today overview\n📝 All drafts\n📅 Queued posts\n✅ Manual tasks (what you need to do)\n👤 Profile copy tracker\n⚙️ LinkedIn connection status\n\nNo noise. Just what matters.',
      action: 'Start Using It'
    }
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-persian-400">
        <div 
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col h-[calc(100vh-4px)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-imperial-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-mono text-lg font-bold">F</span>
            </div>
            <span className="font-mono text-sm text-ocean-500 tracking-wider uppercase">Founder Above the Fold</span>
          </div>
          <h1 className="text-4xl font-tarsius text-imperial-500 mb-3">{current.title}</h1>
          <p className="text-ocean-500 text-lg">{current.subtitle}</p>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <p className="text-ocean-500 whitespace-pre-line text-lg leading-relaxed">
            {current.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-12">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-3 border border-persian-400 text-imperial-500 font-mono text-sm rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-imperial-500 hover:text-white transition-colors"
          >
            Back
          </button>

          <div className="text-sm text-ocean-400 font-mono">
            {step + 1} of {steps.length}
          </div>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 bg-sky-500 text-white font-mono text-sm rounded-lg hover:bg-sky-600 transition-colors"
            >
              {current.action}
            </button>
          ) : (
            <Link
              href="/auth"
              className="px-6 py-3 bg-sky-500 text-white font-mono text-sm rounded-lg hover:bg-sky-600 transition-colors"
            >
              {current.action}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
