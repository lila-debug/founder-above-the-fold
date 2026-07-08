import { NextRequest, NextResponse } from 'next/server';
import { createMagicLinkToken } from '@/lib/auth';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const token = await createMagicLinkToken(email);
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`;

    // Dev mode: return the link in the response
    if (process.env.AUTH_PROVIDER === 'dev' || !resend) {
      return NextResponse.json({
        success: true,
        devMode: true,
        magicLink: callbackUrl,
        message: 'Magic link generated (dev mode). Check response for link.',
      });
    }

    // Production: send via Resend
    await resend.emails.send({
      from: process.env.MAGIC_LINK_FROM || 'Founder Above the Fold <login@founderaccount.app>',
      to: email,
      subject: 'Your magic link to sign in',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #03256c; font-size: 24px; margin-bottom: 20px;">Founder Above the Fold</h2>
          <p style="color: #1768ac; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Click the button below to sign in securely. No password required. This link expires in 15 minutes.
          </p>
          <a href="${callbackUrl}" style="display: inline-block; background: #06bee1; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
            Sign In Securely
          </a>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Magic link sent to your email.' });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
