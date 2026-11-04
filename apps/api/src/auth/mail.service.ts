import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });
        this.logger.log(`SMTP Mailer initialized using host ${host}:${port}`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      this.logger.warn('SMTP credentials not configured. OTP codes will be logged to console.');
    }
  }

  /**
   * Send a branded OTP verification email
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    name?: string,
  ): Promise<{ success: boolean; simulated: boolean; previewOtp?: string }> {
    const recipientName = name ? name.trim() : 'Valued Customer';
    const fromAddress =
      process.env.SMTP_FROM || '"Nexora Commerce" <no-reply@nexoracommerce.com>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexora Commerce Verification Code</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NEXORA</h1>
            <p style="margin: 4px 0 0 0; color: #bfdbfe; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Commerce Authentication</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 28px; text-align: center; color: #f8fafc;">
            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #f1f5f9;">Verify Your Email Address</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
              Hello <strong style="color: #e2e8f0;">${recipientName}</strong>, thank you for joining Nexora Commerce. Please enter this 6-digit confirmation code to verify your account:
            </p>

            <!-- OTP Box -->
            <div style="background: #1e293b; border: 2px dashed #3b82f6; border-radius: 16px; padding: 20px; margin: 24px 0; display: inline-block; min-width: 220px;">
              <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                ${otp}
              </span>
            </div>

            <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b;">
              ⏱️ Valid for <strong style="color: #94a3b8;">10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0b1120; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="margin: 0; font-size: 11px; color: #475569;">
              © ${new Date().getFullYear()} Nexora Commerce Inc. Secure Identity & Commerce Platform.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `${otp} is your Nexora Commerce verification code`,
          text: `Your Nexora Commerce verification code is: ${otp}. It expires in 10 minutes.`,
          html: htmlContent,
        });
        this.logger.log(`OTP verification email sent to ${email}`);
        return { success: true, simulated: false };
      } catch (err: any) {
        this.logger.error(`Error sending email to ${email}: ${err.message}. Falling back to console log.`);
      }
    }

    // Console fallback
    this.logger.log(`\n==========================================\n[NEXORA OTP SIMULATOR]\nRecipient: ${email} (${recipientName})\nCode: >>> ${otp} <<<\nExpires in: 10 minutes\n==========================================\n`);

    return {
      success: true,
      simulated: true,
      previewOtp: otp,
    };
  }
}
