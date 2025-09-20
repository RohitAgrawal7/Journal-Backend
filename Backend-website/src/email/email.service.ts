import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendSubmissionConfirmation(
    to: string,
    name: string,
    trackingId: string,
    manuscriptTitle: string,
  ): Promise<void> {
    const subject = 'Your Manuscript Submission Confirmation - UJGSM';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2d5c7f; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .tracking-id { font-weight: bold; color: #2d5c7f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universal Journal of Green SciTech & Management</h1>
          </div>
          <div class="content">
            <h2>Submission Received</h2>
            <p>Dear ${name},</p>
            <p>Thank you for submitting your manuscript <strong>"${manuscriptTitle}"</strong> to UJGSM.</p>
            <p>Your submission has been received and is currently under review.</p>
            <p><strong>Tracking ID:</strong> <span class="tracking-id">${trackingId}</span></p>
            <p>You can use this tracking ID to check the status of your submission at any time.</p>
            <p>We will notify you once the review process is complete.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2025 Universal Journal of Green SciTech & Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendStatusUpdate(
    to: string,
    name: string,
    trackingId: string,
    manuscriptTitle: string,
    status: string,
    remarks: string = '',
  ): Promise<void> {
    const statusText = this.getStatusText(status);
    const subject = `Your Manuscript Status Update - ${statusText} - UJGSM`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2d5c7f; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .status { font-weight: bold; padding: 5px 10px; border-radius: 4px; }
          .status-submitted { background-color: #e3f2fd; color: #0d47a1; }
          .status-under_review { background-color: #fff3e0; color: #e65100; }
          .status-revision_required { background-color: #fff9c4; color: #f57f17; }
          .status-accepted { background-color: #e8f5e9; color: #2e7d32; }
          .status-rejected { background-color: #ffebee; color: #c62828; }
          .remarks { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2d5c7f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universal Journal of Green SciTech & Management</h1>
          </div>
          <div class="content">
            <h2>Submission Status Update</h2>
            <p>Dear ${name},</p>
            <p>The status of your manuscript <strong>"${manuscriptTitle}"</strong> has been updated.</p>
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>New Status:</strong> <span class="status status-${status}">${statusText}</span></p>
            ${remarks ? `<div class="remarks"><strong>Editor's Remarks:</strong><br>${remarks}</div>` : ''}
            <p>You can check the status of your submission at any time using your tracking ID.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2025 Universal Journal of Green SciTech & Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      revision_required: 'Revision Required',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return statusMap[status] || status;
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@ujgsm.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}: ${error.stack}`,
      );
      // Don't throw the error to avoid breaking the main functionality
    }
  }
}
