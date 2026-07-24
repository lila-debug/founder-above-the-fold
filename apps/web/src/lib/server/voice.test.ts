import assert from "node:assert/strict";
import test from "node:test";
import { runVoiceCommand } from "./voice";

test("the language gate respects English dialect choices", async () => {
  const previous = process.env.VOICE_CHECK_COMMAND;
  process.env.VOICE_CHECK_COMMAND = "builtin";

  try {
    const british = await runVoiceCommand(
      "The color system helps the team analyze the work.",
      "en-GB",
    );
    const american = await runVoiceCommand(
      "The color system helps the team analyze the work.",
      "en-US",
    );
    const ownDialect = await runVoiceCommand(
      "The color system helps the team analyse the work.",
      "en",
    );

    assert.equal(british.status, "failed");
    assert.equal(american.status, "passed");
    assert.equal(ownDialect.status, "passed");
  } finally {
    if (previous === undefined) delete process.env.VOICE_CHECK_COMMAND;
    else process.env.VOICE_CHECK_COMMAND = previous;
  }
});

test("Parisian and Québécois French are separate supported settings", async () => {
  const parisian = await runVoiceCommand(
    "Une stratégie claire aide l’équipe à choisir et à expliquer ses décisions.",
    "fr-FR",
  );
  const quebecois = await runVoiceCommand(
    "Une stratégie claire aide l’équipe à choisir et à expliquer ses décisions.",
    "fr-CA",
  );

  assert.equal(parisian.status, "passed");
  assert.equal(quebecois.status, "passed");
  assert.match(parisian.command, /fr-FR/);
  assert.match(quebecois.command, /fr-CA/);
});
