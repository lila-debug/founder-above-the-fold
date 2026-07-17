# Cloud Press to Speak Assembly Manual

## Box contents

| Part | Job | Location |
|---|---|---|
| A — Microphone switch | Records only after the owner presses | Native Voice screen |
| B — Temporary M4A | Carries one recording and is then removed | iPhone temporary storage |
| C — Voice-only key | Unlocks only the transcription socket | Server environment + iOS Keychain |
| D — Deepgram key | Pays for and authorises transcription | Server environment only |
| E — Transcript tray | Lets the owner edit and explicitly keep text | Native local cabinet |
| F — Credit fuse | Stops after a daily request or byte ceiling | Aggregate database counter |

## Assembly diagram

```text
[Press to Speak]
       |
       v
[temporary M4A] -> [Founder voice lock] -> [Deepgram Nova-3]
       |                                      |
       +------ removed after request <--------+
                                              |
                                              v
                                   [editable transcript]
                                              |
                                      [owner taps Keep]
```

## Fit the labelled slots

1. Create a Deepgram API key in the owner account. Put it only in the production server slot `DEEPGRAM_API_KEY`. The server temporarily accepts the owner's existing misspelled `DEERGRAM_API` sensitive slot so the key never needs to be exposed or re-entered.
2. Generate a separate long random value for `IOS_VOICE_API_KEY`. Fit the same value in the server environment and the app's Settings panel.
3. Keep `DEEPGRAM_MODEL=nova-3` and `DEEPGRAM_LANGUAGE=en-GB` unless a deliberate model or language test changes them.
4. Fit `VOICE_DAILY_REQUEST_LIMIT` and `VOICE_DAILY_BYTE_LIMIT`, or keep the conservative defaults of 50 requests and 100 MiB per UTC day.
5. Apply migration `0004_cloud_voice_usage.sql`. It stores daily counts and byte totals only—not recordings or transcripts.
6. Review the Deepgram processing region, retention setting and provider disclosure before public use.
7. Obtain owner approval before deploying the route at `/api/speech/transcribe`.

## Finished-build test

- [ ] Missing and incorrect voice-only keys return a locked response.
- [ ] The compiled iOS app contains the microphone description and cloud endpoint, but no Deepgram key.
- [ ] A physical iPhone records, stops and receives a real transcript.
- [ ] The transcript remains editable and is saved only after **Keep transcript**.
- [ ] The temporary recording is removed after success or failure.
- [ ] Server logs and API responses contain no Deepgram key or raw upstream error.
- [ ] The daily credit fuse returns `429` after either configured ceiling is reached.

## Safety stickers

- Never paste the Deepgram key into the iOS app, source code, chat or screenshots.
- The voice-only key is not a general owner-session or Deepgram credential.
- The server relays audio in memory and does not write it to product storage.
- Do not call cloud speech live until the provider, region and retention labels are reviewed.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
