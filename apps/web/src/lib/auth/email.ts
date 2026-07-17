import { BRAND_FOOTER_LINES, BRAND_FOOTER_TEXT } from "@/lib/brand";

type SendMagicLinkInput = {
  email: string;
  magicLink: string;
};

type SendLicenceRecoveryInput = {
  email: string;
  recoveryLink: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export async function sendMagicLinkEmail({ email, magicLink }: SendMagicLinkInput) {
  const provider = process.env.AUTH_PROVIDER ?? "dev";

  if (provider === "dev") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_PROVIDER=resend is required in production. Development sign-in links are disabled.",
      );
    }

    return {
      mode: "dev" as const,
      sent: false,
      magicLink,
      message: "Dev magic link generated. No email was sent.",
    };
  }

  if (provider !== "resend") {
    throw new Error(`Unsupported AUTH_PROVIDER '${provider}'.`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAGIC_LINK_FROM;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and MAGIC_LINK_FROM are required.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Founder Above the Fold sign-in link",
      html: renderMagicLinkEmail(magicLink),
      text: `Sign in to Founder Above the Fold: ${magicLink}\n\nThis link expires in 15 minutes.\n\n${BRAND_FOOTER_TEXT}`,
      tags: [
        {
          name: "category",
          value: "magic_link",
        },
      ],
    }),
  });

  const result = (await response.json()) as ResendResponse;

  if (!response.ok) {
    throw new Error(result.message ?? result.name ?? "Resend email failed.");
  }

  return {
    mode: "resend" as const,
    sent: true,
    id: result.id,
    message: "Magic link sent.",
  };
}

export async function sendLicenceRecoveryEmail({
  email,
  recoveryLink,
}: SendLicenceRecoveryInput) {
  const provider = process.env.AUTH_PROVIDER ?? "dev";

  if (provider === "dev") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_PROVIDER=resend is required for licence recovery in production.");
    }

    return {
      mode: "dev" as const,
      sent: false,
      recoveryLink,
      message: "Development recovery link generated. No email was sent.",
    };
  }

  if (provider !== "resend") {
    throw new Error(`Unsupported AUTH_PROVIDER '${provider}'.`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAGIC_LINK_FROM;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and MAGIC_LINK_FROM are required.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Recover your Founder Above the Fold licence",
      html: renderLicenceRecoveryEmail(recoveryLink),
      text: `Recover your Founder Above the Fold licence: ${recoveryLink}\n\nThis private link expires in 15 minutes. If you did not request it, ignore this email.\n\n${BRAND_FOOTER_TEXT}`,
      tags: [{ name: "category", value: "licence_recovery" }],
    }),
  });

  const result = (await response.json()) as ResendResponse;
  if (!response.ok) {
    throw new Error(result.message ?? result.name ?? "Resend email failed.");
  }

  return {
    mode: "resend" as const,
    sent: true,
    id: result.id,
    message: "Licence recovery email sent.",
  };
}

function renderMagicLinkEmail(magicLink: string) {
  const footer = BRAND_FOOTER_LINES.map(
    (line) => `<p style="margin: 0 0 8px; color: #1768ac; font-size: 12px; line-height: 1.5;">${line}</p>`,
  ).join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4fbff; padding: 32px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #1768ac; border-radius: 8px; padding: 28px;">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #1768ac; font-weight: 700;">Founder Above the Fold</p>
        <h1 style="margin: 0 0 16px; color: #03256c; font-size: 24px;">Sign in without a password</h1>
        <p style="margin: 0 0 22px; color: #1768ac; line-height: 1.6;">Use this magic link to open your LinkedIn MCP command centre. It expires in 15 minutes.</p>
        <a href="${magicLink}" style="display: inline-block; background: #03256c; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700;">Open Founder Above the Fold</a>
        <p style="margin: 24px 0 0; color: #1768ac; font-size: 13px; line-height: 1.6;">If you did not request this, you can ignore the email.</p>
        <div style="margin-top: 24px; border-top: 1px solid #1768ac; padding-top: 16px;">${footer}</div>
      </div>
    </div>
  `;
}

function renderLicenceRecoveryEmail(recoveryLink: string) {
  const footer = BRAND_FOOTER_LINES.map(
    (line) => `<p style="margin: 0 0 8px; color: #1768ac; font-size: 12px; line-height: 1.5;">${line}</p>`,
  ).join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7f1df; padding: 32px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 2px solid #111111; padding: 28px; box-shadow: 6px 6px 0 #111111;">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #1768ac; font-weight: 800;">Part 06 · recovery handle</p>
        <h1 style="margin: 0 0 16px; color: #111111; font-size: 24px;">Recover your one-time licence</h1>
        <p style="margin: 0 0 22px; color: #333333; line-height: 1.6;">This private link checks the server-verified purchase record. It expires in 15 minutes and never asks for payment again.</p>
        <a href="${recoveryLink}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 12px 18px; font-weight: 800;">Inspect my licence</a>
        <p style="margin: 24px 0 0; color: #555555; font-size: 13px; line-height: 1.6;">If you did not request this, ignore the email. The licence remains unchanged.</p>
        <div style="margin-top: 24px; border-top: 1px solid #1768ac; padding-top: 16px;">${footer}</div>
      </div>
    </div>
  `;
}
