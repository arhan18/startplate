import { betterAuth } from "better-auth";
import { LibsqlDialect } from "kysely-libsql";
import {
  twoFactor,
  magicLink,
  organization,
  admin,
  bearer,
} from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: process.env.TURSO_DATABASE_URL || "",
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    }),
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Send password reset email via Resend
      const { Resend } = await import('resend');
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: user.email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID || "",
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: import.meta.env.GITHUB_CLIENT_ID || "",
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  emailVerification: {
    sendOnSignUp: true,
    autoVerifyAfterSignUp: false,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Send verification email via Resend
      const { Resend } = await import('resend');
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <h1>Welcome to our platform!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${url}">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    },
  },
  trustedOrigins: [
    "https://arhanahmad.com",
    "https://*.arhanahmad.com",
  ],
  plugins: [
    // Two-Factor Authentication (TOTP + OTP)
    twoFactor({
      issuer: "YourApp",
      totpOptions: {
        period: 30, // 30 seconds
      },
      otpOptions: {
        sendOTP: async ({ email, otp }, request) => {
          // Send OTP via email
          const { Resend } = await import('resend');
          const resend = new Resend(import.meta.env.RESEND_API_KEY);
          
          await resend.emails.send({
            from: import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com',
            to: email,
            subject: 'Your verification code',
            html: `
              <h1>Your Code</h1>
              <p>Your verification code is: <strong>${otp}</strong></p>
              <p>This code expires in 5 minutes.</p>
            `,
          });
        },
      },
    }),
    
    // NOTE: passkey (WebAuthn) + API-key plugins do not exist in
    // better-auth 1.7. Deferred until verified paths land; do NOT
    // advertise them until this note is removed by a passing test.

    // Magic Link Authentication
    magicLink({
      sendMagicLink: async ({ email, url, token, metadata }, ctx) => {
        // Send magic link via email
        const { Resend } = await import('resend');
        const resend = new Resend(import.meta.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com',
          to: email,
          subject: 'Sign in to your account',
          html: `
            <h1>Sign In</h1>
            <p>Click the link below to sign in:</p>
            <a href="${url}">Sign In</a>
            <p>This link expires in 5 minutes.</p>
          `,
        });
      },
      expiresIn: 300, // 5 minutes
    }),
    
    // Organization (Multi-tenancy)
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `https://yourdomain.com/accept-invitation/${data.id}`;
        
        const { Resend } = await import('resend');
        const resend = new Resend(import.meta.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com',
          to: data.email,
          subject: `You've been invited to ${data.organization.name}`,
          html: `
            <h1>Organization Invitation</h1>
            <p>${data.inviter.user.name} has invited you to join ${data.organization.name}.</p>
            <p>Your role: ${data.role}</p>
            <a href="${inviteLink}">Accept Invitation</a>
            <p>This invitation expires in 7 days.</p>
          `,
        });
      },
    }),
    
    // Admin (Super Admin & Impersonation)
    admin(),
    
    // Bearer Token Authentication
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
