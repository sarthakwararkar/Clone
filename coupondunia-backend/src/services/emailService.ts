import { Resend } from 'resend';
import type { CouponResponse } from '../types';

/**
 * Email service using Resend.com for transactional emails and deal alerts.
 */
export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'CouponDunia <noreply@coupondunia.com>') {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  /**
   * Send a welcome email when a user subscribes to deal alerts.
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Welcome to CouponDunia Deal Alerts! 🎉',
      html: this.getWelcomeEmailTemplate(name),
    });
    if (error) {
      throw new Error(`Resend error: ${error.message} (${error.name})`);
    }
  }

  /**
   * Send a deal alert email with matching coupons for a store or category.
   */
  async sendDealAlert(
    to: string,
    coupons: CouponResponse[],
    storeName?: string
  ): Promise<void> {
    const subject = storeName
      ? `🔥 New deals from ${storeName} on CouponDunia!`
      : '🔥 New deals matching your alerts on CouponDunia!';

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html: this.getDealAlertTemplate(coupons, storeName),
    });
    if (error) {
      throw new Error(`Resend error: ${error.message} (${error.name})`);
    }
  }

  /**
   * Send a new coupon alert to multiple subscribers.
   */
  async sendNewCouponAlert(to: string[], coupon: CouponResponse): Promise<void> {
    if (to.length === 0) return;

    // Send in batches of 50 (Resend limit)
    for (let i = 0; i < to.length; i += 50) {
      const batch = to.slice(i, i + 50);
      const results = await Promise.all(
        batch.map((email) =>
          this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: `💰 New coupon: ${coupon.title}`,
            html: this.getNewCouponAlertTemplate(coupon),
          })
        )
      );
      const failed = results.find((r) => r.error);
      if (failed) {
        throw new Error(`Resend error: ${failed.error?.message} (${failed.error?.name})`);
      }
    }
  }

  // ─── Email Templates ────────────────────────────────────────────────────

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f7;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px 12px 0 0;padding:40px 30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">🎉 Welcome to CouponDunia!</h1>
          </div>
          <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size:16px;color:#333;line-height:1.6;">Hi ${this.escapeHtml(name)},</p>
            <p style="font-size:16px;color:#333;line-height:1.6;">Thanks for subscribing to deal alerts! You'll now receive notifications when we find amazing deals matching your preferences.</p>
            <p style="font-size:16px;color:#333;line-height:1.6;">Here's what you can expect:</p>
            <ul style="font-size:14px;color:#555;line-height:2;">
              <li>🛍️ Exclusive coupon codes from top Indian stores</li>
              <li>💸 Cashback offers and deals</li>
              <li>⚡ Flash sale notifications</li>
              <li>📱 Personalized recommendations</li>
            </ul>
            <div style="text-align:center;margin-top:30px;">
              <a href="https://coupondunia.com" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:14px 30px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">Browse Latest Deals</a>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#999;margin-top:20px;">© ${new Date().getFullYear()} CouponDunia. You're receiving this because you subscribed to deal alerts.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDealAlertTemplate(coupons: CouponResponse[], storeName?: string): string {
    const couponCards = coupons
      .slice(0, 5)
      .map(
        (coupon) => `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;font-size:16px;color:#111;">${this.escapeHtml(coupon.title)}</h3>
            ${coupon.is_verified ? '<span style="background:#10b981;color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;">Verified ✓</span>' : ''}
          </div>
          ${coupon.description ? `<p style="font-size:13px;color:#666;margin:8px 0;">${this.escapeHtml(coupon.description)}</p>` : ''}
          <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
            ${coupon.code ? `<span style="background:#f3f4f6;border:1px dashed #9ca3af;padding:6px 12px;border-radius:6px;font-family:monospace;font-weight:700;letter-spacing:1px;">${this.escapeHtml(coupon.code)}</span>` : ''}
            ${coupon.discount_value ? `<span style="color:#ef4444;font-weight:700;">${this.escapeHtml(coupon.discount_value)}</span>` : ''}
          </div>
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f7;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🔥 ${storeName ? `New deals from ${this.escapeHtml(storeName)}` : 'New deals for you'}!</h1>
          </div>
          <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            ${couponCards}
            <div style="text-align:center;margin-top:24px;">
              <a href="https://coupondunia.com" style="background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">View All Deals →</a>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#999;margin-top:20px;">© ${new Date().getFullYear()} CouponDunia. <a href="https://coupondunia.com/unsubscribe" style="color:#999;">Unsubscribe</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private getNewCouponAlertTemplate(coupon: CouponResponse): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f7;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">💰 New Coupon Alert!</h1>
          </div>
          <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111;">${this.escapeHtml(coupon.title)}</h2>
            ${coupon.store ? `<p style="font-size:14px;color:#6b7280;margin:0 0 16px;">from <strong>${this.escapeHtml(coupon.store.name)}</strong></p>` : ''}
            ${coupon.description ? `<p style="font-size:14px;color:#555;line-height:1.6;">${this.escapeHtml(coupon.description)}</p>` : ''}
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
              ${coupon.code ? `<p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Coupon Code</p><p style="margin:0;font-size:24px;font-weight:700;font-family:monospace;color:#111;letter-spacing:2px;">${this.escapeHtml(coupon.code)}</p>` : `<p style="margin:0;font-size:16px;font-weight:600;color:#10b981;">No code needed — deal applied automatically!</p>`}
              ${coupon.discount_value ? `<p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#ef4444;">${this.escapeHtml(coupon.discount_value)}</p>` : ''}
            </div>
            ${coupon.expires_at ? `<p style="font-size:13px;color:#ef4444;text-align:center;">⏰ Expires: ${new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
            <div style="text-align:center;margin-top:20px;">
              <a href="https://coupondunia.com/coupons/${coupon.id}" style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">Get This Deal →</a>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#999;margin-top:20px;">© ${new Date().getFullYear()} CouponDunia. <a href="https://coupondunia.com/unsubscribe" style="color:#999;">Unsubscribe</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export function createEmailService(apiKey: string, fromEmail?: string): EmailService {
  return new EmailService(apiKey, fromEmail);
}
