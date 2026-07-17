insert into templates (type, scenario_tag, body, notes)
select seed.type, seed.scenario_tag, seed.body, seed.notes
from (values
  ('outreach', 'cold-fractional-cpo', 'Hello {{first_name}}, I help founders turn messy product signals into clear decisions before they need a full-time product executive. I noticed {{company}} is working through {{product_moment}}. If a short outside product review would be useful, I would be glad to compare notes.', 'Manual copy only. Personalise from supplied, consented context.'),
  ('outreach', 'warm-introduction', 'Hello {{first_name}}, {{introducer_name}} suggested we connect. I work with founders who need senior product judgement around strategy, discovery and operating rhythm. If {{company}} is currently navigating {{product_moment}}, I would be glad to have a short, practical conversation.', 'Manual copy only. Do not imply an introduction that did not happen.'),
  ('outreach', 'follow-up', 'Hello {{first_name}}, a brief follow-up in case {{product_moment}} is still on your workbench. No pressure if the timing is wrong. If it is useful, I can share a compact view of where I would start and what I would test first.', 'One manual follow-up; no automated sequence.'),
  ('post', 'idea-01-roadmap-pressure-gauge', 'A roadmap is not a promise. It is a pressure gauge. Explain what the queue reveals when every item is marked urgent, then name the decision a founder must make.', 'Founder Clarity'),
  ('post', 'idea-02-ritual-under-pressure', 'Describe the product ritual that still works during a messy week. Contrast it with a ceremony that only works when the calendar is calm.', 'Fractional CPO OS'),
  ('post', 'idea-03-ai-and-judgement', 'Explain one part of the product loop AI can accelerate and one trade-off it must never own. End with the founder decision that remains human.', 'AI-Native Product'),
  ('post', 'idea-04-discovery-debt', 'Show how discovery debt accumulates when teams ship answers before agreeing on the question. Include one early warning sign.', 'Product Strategy'),
  ('post', 'idea-05-signal-versus-noise', 'Take one noisy customer request and show how to turn it into a testable product signal without dismissing the customer.', 'Founder Clarity'),
  ('post', 'idea-06-fractional-leadership', 'Explain what a fractional CPO should leave behind after an engagement: decisions, mechanisms and a team that can operate without dependency.', 'Fractional CPO OS'),
  ('post', 'idea-07-metric-with-a-job', 'Choose one product metric and give it a physical job in the system. State what decision changes when the number moves.', 'Product Strategy'),
  ('post', 'idea-08-feature-gravity', 'Describe feature gravity: the tendency for shipped machinery to attract maintenance, expectations and more machinery. Name a removal test.', 'Product Strategy'),
  ('post', 'idea-09-founder-bottleneck', 'Distinguish a founder acting as the necessary product editor from a founder becoming the queue through which every small decision must pass.', 'Founder Clarity'),
  ('post', 'idea-10-ai-prototype-test', 'Describe a small AI prototype that should be tested as a mechanism, not marketed as a transformation. Define the finished-build test.', 'AI-Native Product'),
  ('post', 'idea-11-roadmap-removal', 'Write about the strongest roadmap meeting being the one where a plausible item is deliberately removed. Explain the evidence used.', 'Product Strategy'),
  ('post', 'idea-12-operating-cadence', 'Lay out a calm weekly product cadence using physical hand-offs: collect, sort, decide, build, inspect and learn.', 'Fractional CPO OS'),
  ('post', 'idea-13-customer-language', 'Show the difference between copying customer words and understanding the mechanism beneath them. Use one concise example.', 'Discovery'),
  ('post', 'idea-14-decision-log', 'Explain why a decision log is a memory cabinet rather than bureaucracy. Include the three labels every decision needs.', 'Fractional CPO OS'),
  ('post', 'idea-15-launch-evidence', 'Separate launch theatre from launch evidence. Name three observations that would prove a release is genuinely usable.', 'Launch'),
  ('post', 'idea-16-positioning-test', 'Treat positioning as a testable interface. State who should recognise themselves, what they should understand and what action should become easier.', 'Founder Clarity'),
  ('post', 'idea-17-team-topology', 'Explain how work routing reveals the real team topology more accurately than an organisation chart.', 'Product Leadership'),
  ('post', 'idea-18-product-deletion', 'Describe deletion as a product capability. Explain what trust requires before a user presses remove.', 'Privacy and Trust'),
  ('post', 'idea-19-manual-beside-product', 'Make the case for building the manual beside the product. Use one failure that is clearly a manual problem and one that is clearly an app problem.', 'Product Operations'),
  ('post', 'idea-20-first-disconfirming-test', 'Take an attractive product belief and design the fastest ethical test that could disprove it. Explain why disconfirmation saves time.', 'Product Strategy')
) as seed(type, scenario_tag, body, notes)
where not exists (
  select 1 from templates current
  where current.type = seed.type and current.scenario_tag = seed.scenario_tag
);
