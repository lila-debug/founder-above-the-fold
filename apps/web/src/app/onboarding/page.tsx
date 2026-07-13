'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type QuestionnaireData = {
  fullName: string;
  currentRole: string;
  company: string;
  industry: string;
  yearsExperience: string;
  targetAudience: string;
  mainGoal: string;
  expertise1: string;
  expertise2: string;
  expertise3: string;
  achievements: string;
  contentThemes: string;
  postingFrequency: string;
  voiceTone: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<QuestionnaireData>({
    fullName: '',
    currentRole: '',
    company: '',
    industry: '',
    yearsExperience: '',
    targetAudience: '',
    mainGoal: '',
    expertise1: '',
    expertise2: '',
    expertise3: '',
    achievements: '',
    contentThemes: '',
    postingFrequency: '2-3x per week',
    voiceTone: 'Professional and direct',
  });

  const updateData = (field: keyof QuestionnaireData, value: string) => {
    setData({ ...data, [field]: value });
  };

  async function handleComplete() {
    setLoading(true);
    setError('');

    try {
      // Generate profile copy
      const profileRes = await fetch('/api/onboarding/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || 'Failed to generate profile');
      }

      // Generate initial posts
      const postsRes = await fetch('/api/onboarding/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!postsRes.ok) {
        const err = await postsRes.json();
        throw new Error(err.error || 'Failed to generate posts');
      }

      router.push('/dashboard?onboarding=complete');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-imperial-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-mono text-lg font-bold">F</span>
            </div>
            <span className="font-mono text-sm text-ocean-500 tracking-wider uppercase">Founder Above the Fold</span>
          </div>
          <h1 className="text-4xl font-tarsius text-imperial-500 mb-4">Welcome aboard</h1>
          <p className="text-ocean-500 text-lg">
            This 10-minute questionnaire will generate your LinkedIn profile copy and first 2 weeks of posts.
          </p>
          <div className="mt-6 flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i + 1 <= step ? 'bg-sky-500' : 'bg-persian-400'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-ocean-400">Step {step} of {totalSteps}</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-tarsius text-imperial-500 mb-6">Let's start with the basics</h2>
            
            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Full name
              </label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => updateData('fullName', e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Current role / title
              </label>
              <input
                type="text"
                value={data.currentRole}
                onChange={(e) => updateData('currentRole', e.target.value)}
                placeholder="Founder & CEO"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Company
              </label>
              <input
                type="text"
                value={data.company}
                onChange={(e) => updateData('company', e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={data.industry}
                onChange={(e) => updateData('industry', e.target.value)}
                placeholder="B2B SaaS, Fintech, etc."
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Years of professional experience
              </label>
              <input
                type="text"
                value={data.yearsExperience}
                onChange={(e) => updateData('yearsExperience', e.target.value)}
                placeholder="10+ years"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!data.fullName || !data.currentRole || !data.company || !data.industry}
                className="flex-1 px-6 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Audience & Goals */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-tarsius text-imperial-500 mb-6">Who are you trying to reach?</h2>
            
            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Target audience
              </label>
              <textarea
                value={data.targetAudience}
                onChange={(e) => updateData('targetAudience', e.target.value)}
                placeholder="Founders, CTOs, engineering leaders, B2B buyers, etc."
                rows={3}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
              <p className="mt-1 text-sm text-ocean-400">Who should be reading your posts and viewing your profile?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Main goal on LinkedIn
              </label>
              <textarea
                value={data.mainGoal}
                onChange={(e) => updateData('mainGoal', e.target.value)}
                placeholder="Build credibility, generate inbound leads, attract investors, find talent, etc."
                rows={3}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
              <p className="mt-1 text-sm text-ocean-400">What do you want LinkedIn to do for you?</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-persian-400 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-500 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!data.targetAudience || !data.mainGoal}
                className="flex-1 px-6 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Expertise */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-tarsius text-imperial-500 mb-6">What are you known for?</h2>
            
            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Top expertise / skill #1
              </label>
              <input
                type="text"
                value={data.expertise1}
                onChange={(e) => updateData('expertise1', e.target.value)}
                placeholder="Go-to-market strategy"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Top expertise / skill #2
              </label>
              <input
                type="text"
                value={data.expertise2}
                onChange={(e) => updateData('expertise2', e.target.value)}
                placeholder="Product-led growth"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Top expertise / skill #3 (optional)
              </label>
              <input
                type="text"
                value={data.expertise3}
                onChange={(e) => updateData('expertise3', e.target.value)}
                placeholder="Developer tools"
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Notable achievements
              </label>
              <textarea
                value={data.achievements}
                onChange={(e) => updateData('achievements', e.target.value)}
                placeholder="Scaled ARR from £0 to £5M in 18 months. Led product team of 30. Sold previous startup to XYZ Corp."
                rows={4}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
              <p className="mt-1 text-sm text-ocean-400">Numbers, exits, big milestones — anything impressive</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border border-persian-400 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-500 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!data.expertise1 || !data.expertise2 || !data.achievements}
                className="flex-1 px-6 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Content Strategy */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-tarsius text-imperial-500 mb-6">Let's define your content pillars</h2>
            
            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Content themes
              </label>
              <textarea
                value={data.contentThemes}
                onChange={(e) => updateData('contentThemes', e.target.value)}
                placeholder="Lessons from building startups, hiring advice, B2B sales tactics, product strategy, founder mental health"
                rows={4}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              />
              <p className="mt-1 text-sm text-ocean-400">3-5 topics you could write about every week</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Voice & tone
              </label>
              <select
                value={data.voiceTone}
                onChange={(e) => updateData('voiceTone', e.target.value)}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              >
                <option>Professional and direct</option>
                <option>Conversational and friendly</option>
                <option>Analytical and data-driven</option>
                <option>Bold and opinionated</option>
                <option>Humble and story-driven</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-imperial-500 mb-2">
                Posting frequency
              </label>
              <select
                value={data.postingFrequency}
                onChange={(e) => updateData('postingFrequency', e.target.value)}
                className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
              >
                <option>Daily</option>
                <option>3-4x per week</option>
                <option>2-3x per week</option>
                <option>Once per week</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setStep(3)}
                disabled={loading}
                className="px-6 py-4 border border-persian-400 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-500 hover:text-white transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading || !data.contentThemes}
                className="flex-1 px-6 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating your profile & posts...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
