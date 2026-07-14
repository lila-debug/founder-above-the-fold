# Voice and Content System

## Positioning Aim

Founder Above the Fold exists to make the owner's LinkedIn presence impossible to confuse with generic AI content.

The above-the-fold target:

- A clear fractional CPO headline.
- A profile About section that makes the offer obvious fast.
- A steady feed that proves product judgment, operational clarity, and founder empathy.
- Outreach that sounds like the same person as the profile and posts.

## Core Content Pillars

### 1. Fractional CPO Operating System

Posts about how excellent product leadership works in practice:

- prioritisation
- discovery
- roadmap judgement
- stakeholder clarity
- shipping under constraint
- product rituals that do not waste time

### 2. AI-Native Product Work

Posts about using AI as leverage for product leadership without turning the work into theatre:

- AI-assisted research
- agentic workflows
- automated QA/review loops
- product ops
- decision support
- what should remain human

### 3. Founder Clarity

Posts for founders who need a sharper product function:

- messy signals
- customer truth
- pricing/product fit
- MVP scope
- when to hire full-time versus fractional

### 4. Prototype Cafe Point of View

Posts that make the brand distinct:

- taste
- systems
- craft
- speed
- "Revolutionising Life Since 1982" energy without overexplaining it

## Post Archetypes

### Field Note

A practical observation from product work.

Shape:

- Start with a sharp sentence.
- Name the pattern.
- Explain why it matters.
- End with a concrete takeaway.

### Before/After

Show how a product artefact or decision changed.

Shape:

- Before: vague, slow, noisy.
- Intervention: what changed.
- After: simpler decision, faster movement, clearer owner.

### Founder Warning

Name a common trap without scolding.

Shape:

- "A sign your roadmap is lying to you..."
- Give the signal.
- Explain the cost.
- Offer the better move.

### Operating Principle

A durable product belief.

Shape:

- Principle.
- Why people resist it.
- How to use it this week.

### Mini Case

Short narrative with business/product consequence.

Shape:

- Situation.
- Tension.
- Product move.
- Outcome or lesson.

## Voice Rules

Hard requirements:

- British English.
- No hype-bro phrasing.
- No generic AI filler.
- No fake certainty.
- No engagement bait.
- No "here's the thing" unless it genuinely earns its keep.
- No hashtags in MVP unless deliberately added by owner.
- No fabricated client results.

Preferred feel:

- clear
- exact
- warm
- commercially literate
- product-led
- slightly wry when natural
- calm confidence

## Voice Gate

The mechanical gate is `british_qa.py` with Hunspell `en_GB`.

Queueing rule:

- A post can be queued only when the latest body hash has a passing voice check.

Publishing rule:

- A post can be published only when the queued body hash still matches the passing voice check.

## Draft Quality Checklist

A draft is ready when:

- The first line has a point.
- The post is about one idea.
- The reader can tell why it matters.
- There is one practical insight.
- The voice check passes.
- It sounds like the owner's profile, not a content calendar.

## Weekly Cadence

Recommended starting cadence:

- 4 posts per week.
- 1 Field Note.
- 1 Founder Warning.
- 1 Operating Principle.
- 1 AI-Native Product Work post.

Avoid over-automation at launch. The aim is consistency and signal, not volume.

## Profile Copy Tracker Fields

Track these in Founder Above the Fold:

- Headline.
- About.
- Current fractional CPO offer.
- Experience summary.
- Featured links/copy.

Manual sync rule:

- Any edit sets "manual paste required".
- The flag remains until the owner confirms the update was pasted into LinkedIn.

## Outreach Templates

Template categories:

- cold founder intro
- warm intro follow-up
- product audit offer
- post-conversation recap
- gentle follow-up
- reactivation

Every rendered outreach message must include a reminder:

```text
Manual send only. Founder Above the Fold does not send LinkedIn messages.
```
