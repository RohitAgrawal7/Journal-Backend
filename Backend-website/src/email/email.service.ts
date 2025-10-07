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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UJGSM - Submission Confirmation</title>
  <style>
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background-color: #f7fafc;
      -webkit-font-smoothing: antialiased;
    }

    .email-container {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    /* Header Styles */
    .header {
      background: linear-gradient(135deg, #2d5c7f 0%, #1e4a6e 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
      border-bottom: 4px solid #38b2ac;
    }

    .journal-name {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }

    .journal-subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }

    /* Content Styles */
    .content {
      padding: 40px;
      background-color: #ffffff;
    }

    .greeting {
      font-size: 18px;
      margin-bottom: 25px;
      color: #2d3748;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d5c7f;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .highlight-box {
      background-color: #f0fff4;
      border-left: 4px solid #38b2ac;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }

    .tracking-id {
      display: inline-block;
      background: linear-gradient(135deg, #2d5c7f 0%, #38b2ac 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 1px;
      margin: 10px 0;
    }

    .manuscript-title {
      font-style: italic;
      color: #2d5c7f;
      font-weight: 500;
    }

    /* Timeline Styles */
    .timeline {
      margin: 25px 0;
      position: relative;
    }

    .timeline:before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #e2e8f0;
    }

    .timeline-item {
      display: flex;
      margin-bottom: 20px;
      position: relative;
    }

    .timeline-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #38b2ac;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      margin-right: 20px;
      z-index: 1;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
      padding-bottom: 10px;
    }

    .timeline-title {
      font-weight: 600;
      margin-bottom: 5px;
      color: #2d3748;
    }

    .timeline-desc {
      font-size: 14px;
      color: #718096;
    }

    /* Action Button */
    .action-button {
      display: inline-block;
      background: linear-gradient(135deg, #2d5c7f 0%, #38b2ac 100%);
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 600;
      margin: 15px 0;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Footer Styles */
    .footer {
      background-color: #2d3748;
      color: #cbd5e0;
      padding: 30px 40px;
      text-align: center;
      font-size: 13px;
    }

    .footer-links {
      margin: 15px 0;
    }

    .footer-link {
      color: #38b2ac;
      text-decoration: none;
      margin: 0 10px;
    }

    .footer-link:hover {
      text-decoration: underline;
    }

    .copyright {
      margin-top: 20px;
      font-size: 12px;
      opacity: 0.7;
    }

    /* Responsive Adjustments */
    @media (max-width: 600px) {
      .header, .content, .footer {
        padding: 25px;
      }
      
      .journal-name {
        font-size: 20px;
      }
      
      .timeline:before {
        left: 12px;
      }
      
      .timeline-marker {
        width: 24px;
        height: 24px;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header Section -->
    <div class="header">
      <div class="journal-name">Universal Journal of Green Sci-Tech & Management</div>
      <div class="journal-subtitle">A Peer-Reviewed International Journal | ISSN: XXXX-XXXX</div>
    </div>
    
    <!-- Content Section -->
    <div class="content">
      <p class="greeting">Dear ${name},</p>
      
      <div class="section">
        <h2 class="section-title">Submission Confirmation</h2>
        <p>We are pleased to inform you that we have successfully received your manuscript submission to the Universal Journal of Green Sci-Tech & Management (UJGSM).</p>
        
        <div class="highlight-box">
          <p><strong>Manuscript Title:</strong> <span class="manuscript-title">"${manuscriptTitle}"</span></p>
          <p><strong>Tracking ID:</strong> <span class="tracking-id">${trackingId}</span></p>
    
        </div>
        
        <p>Your manuscript has entered our editorial workflow and is currently undergoing initial screening.</p>
      </div>
      
      <div class="section">
        <h2 class="section-title">What to Expect Next</h2>
        
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-marker">1</div>
            <div class="timeline-content">
              <div class="timeline-title">Initial Screening</div>
              <div class="timeline-desc">Our editorial team will check your manuscript for completeness, scope, and adherence to journal guidelines. This typically takes 3-5 business days.</div>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-marker">2</div>
            <div class="timeline-content">
              <div class="timeline-title">Peer Review</div>
              <div class="timeline-desc">If your manuscript passes initial screening, it will be sent for double-blind peer review by experts in your field. This process usually takes 4-6 weeks.</div>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-marker">3</div>
            <div class="timeline-content">
              <div class="timeline-title">Editorial Decision</div>
              <div class="timeline-desc">Based on reviewer feedback, our editors will make a decision and communicate it to you along with reviewer comments.</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Track Your Submission</h2>
        <p>You can check the status of your submission at any time using your Tracking ID:</p>
        <a href="https://ujgsm.uorapublications.com/track-paper" class="action-button">Track Submission Status</a>
        <p>Alternatively, visit our submission portal and enter your Tracking ID: <strong>${trackingId}</strong></p>
      </div>
      
      <div class="section">
        <h2 class="section-title">Need Assistance?</h2>
        <p>If you have any questions about your submission or the review process, please don't hesitate to contact our editorial office:</p>
        <p>
          <strong>Email:</strong> editorial@uorapublications.com<br>
          <strong>Phone:</strong> +91-9766930707<br>
          <strong>Office Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM IST
        </p>
        <p>Please include your Tracking ID in all communications for faster assistance.</p>
      </div>
      
      <p>Thank you for choosing to publish with UJGSM. We appreciate your contribution to the scientific community.</p>
      
      <p>Best regards,<br>
      <strong>Editorial Team</strong><br>
      Universal Journal of Green Sci-Tech & Management<br>
      Universal Oneness Research Association</p>
    </div>
    
    <!-- Footer Section -->
    <div class="footer">
      <div class="footer-links">
        <a href="https://ujgsm.uorapublications.com" class="footer-link">Journal Website</a>
        <a href="https://ujgsm.uorapublications.com/author-guidelines" class="footer-link">Author Guidelines</a>
        <a href="https://ujgsm.uorapublications.com/contact" class="footer-link">Contact Us</a>
      </div>
      
      <p>This is an automated message. Please do not reply directly to this email.</p>
      
      <div class="copyright">
        <p>© 2025 Universal Journal of Green Sci-Tech & Management. All rights reserved.</p>
        <p>Universal Oneness Research Association, Chhatrapati Sambhajinagar, Maharashtra, India</p>
      </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UJGSM - Submission Status Update</title>
  <style>
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background-color: #f7fafc;
      -webkit-font-smoothing: antialiased;
    }

    .email-container {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    /* Header Styles */
    .header {
      background: linear-gradient(135deg, #2d5c7f 0%, #1e4a6e 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
      border-bottom: 4px solid #38b2ac;
    }

    .journal-name {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }

    .journal-subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }

    /* Content Styles */
    .content {
      padding: 40px;
      background-color: #ffffff;
    }

    .greeting {
      font-size: 18px;
      margin-bottom: 25px;
      color: #2d3748;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d5c7f;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .status-update-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 8px;
      padding: 25px;
      margin: 20px 0;
      border-left: 4px solid #2d5c7f;
    }

    .manuscript-title {
      font-style: italic;
      color: #2d5c7f;
      font-weight: 500;
      font-size: 18px;
      margin: 10px 0;
    }

    .tracking-id {
      display: inline-block;
      background: #2d5c7f;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.5px;
      margin: 10px 0;
    }

    /* Status Badge Styles */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 15px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-badge i {
      margin-right: 8px;
      font-size: 18px;
    }

    .status-submitted { 
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
      color: #0d47a1; 
      border: 1px solid #90caf9;
    }
    .status-under_review { 
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); 
      color: #e65100; 
      border: 1px solid #ffb74d;
    }
    .status-revision_required { 
      background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); 
      color: #f57f17; 
      border: 1px solid #fff176;
    }
    .status-accepted { 
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); 
      color: #2e7d32; 
      border: 1px solid #a5d6a7;
    }
    .status-rejected { 
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
      color: #c62828; 
      border: 1px solid #ef9a9a;
    }

    /* Remarks Section */
    .remarks-section {
      background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      border-left: 4px solid #38b2ac;
    }

    .remarks-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d5c7f;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }

    .remarks-title i {
      margin-right: 10px;
      color: #38b2ac;
    }

    .remarks-content {
      background: white;
      padding: 20px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-style: italic;
      line-height: 1.7;
    }

    /* Next Steps */
    .next-steps {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }

    .next-steps-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d5c7f;
      margin-bottom: 15px;
    }

    .step-item {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;
    }

    .step-number {
      background: #2d5c7f;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }

    /* Action Button */
    .action-button {
      display: inline-block;
      background: linear-gradient(135deg, #2d5c7f 0%, #38b2ac 100%);
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 600;
      margin: 15px 0;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Footer Styles */
    .footer {
      background-color: #2d3748;
      color: #cbd5e0;
      padding: 30px 40px;
      text-align: center;
      font-size: 13px;
    }

    .footer-links {
      margin: 15px 0;
    }

    .footer-link {
      color: #38b2ac;
      text-decoration: none;
      margin: 0 10px;
    }

    .footer-link:hover {
      text-decoration: underline;
    }

    .next-steps {
  counter-reset: step; /* reset counter */
}

.step-item {
  counter-increment: step; /* increase counter */
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.step-item::before {
  content: counter(step); /* auto number */
  font-weight: bold;
  color: white;
  background: #0070f3;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 14px;
}

.step-text {
  flex: 1;
}

    .copyright {
      margin-top: 20px;
      font-size: 12px;
      opacity: 0.7;
    }

    /* Responsive Adjustments */
    @media (max-width: 600px) {
      .header, .content, .footer {
        padding: 25px;
      }
      
      .journal-name {
        font-size: 20px;
      }
      
      .status-badge {
        padding: 8px 16px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header Section -->
    <div class="header">
      <div class="journal-name">Universal Journal of Green Sci-Tech & Management</div>
      <div class="journal-subtitle">A Peer-Reviewed International Journal | ISSN: XXXX-XXXX</div>
    </div>
    
    <!-- Content Section -->
    <div class="content">
      <p class="greeting">Dear ${name},</p>
      
      <div class="section">
        <h2 class="section-title">Submission Status Update</h2>
        <p>We would like to inform you about an update regarding your manuscript submission to the Universal Journal of Green Sci-Tech & Management (UJGSM).</p>
        
        <div class="status-update-card">
          <p><strong>Manuscript Title:</strong></p>
          <p class="manuscript-title">"${manuscriptTitle}"</p>
          
          <p><strong>Tracking ID:</strong> <span class="tracking-id">${trackingId}</span></p>
          
          <p><strong>Current Status:</strong></p>
          <div class="status-badge status-${status}">
             ${statusText}
          </div>
          
          
        </div>
      </div>
      
      ${
        remarks
          ? `
      <div class="remarks-section">
        <div class="remarks-title">
          <i>📝</i> Editorial Remarks
        </div>
        <div class="remarks-content">
          ${remarks}
        </div>
      </div>
      `
          : ''
      }
      
     <div class="section">
  <h2 class="section-title">Next Steps</h2>

  <div class="next-steps">
    ${
      status === 'submitted'
        ? `
    <div class="step-item">
      <div class="step-text">Your manuscript is undergoing initial editorial screening for scope and formatting requirements.</div>
    </div>
    <div class="step-item">
      <div class="step-text">If it passes initial screening, it will be sent for peer review (typically within 5-7 business days).</div>
    </div>
    `
        : ''
    }

    ${
      status === 'under_review'
        ? `
    <div class="step-item">
      <div class="step-text">Your manuscript is currently undergoing double-blind peer review by experts in your field.</div>
    </div>
    <div class="step-item">
      <div class="step-text">This process typically takes 4-6 weeks. You will be notified once reviews are complete.</div>
    </div>
    `
        : ''
    }

    ${
      status === 'revision_required'
        ? `
    <div class="step-item">
      <div class="step-text">Please review the editorial remarks carefully and prepare your revised manuscript.</div>
    </div>
    <div class="step-item">
      <div class="step-text">Submit your revised manuscript through the submission portal within the specified timeframe.</div>
    </div>
    <div class="step-item">
      <div class="step-text">Include a detailed response to all reviewer comments in your resubmission.</div>
    </div>
    `
        : ''
    }

    ${
      status === 'accepted'
        ? `
    <div class="step-item">
      <div class="step-text">Congratulations! Your manuscript has been accepted for publication.</div>
    </div>
    <div class="step-item">
      <div class="step-text">Our production team will contact you shortly regarding the next steps for publication.</div>
    </div>
    <div class="step-item">
      <div class="step-text">You will receive proofs for final approval before the article is published.</div>
    </div>
    `
        : ''
    }

    ${
      status === 'rejected'
        ? `
    <div class="step-item">
      <div class="step-text">We appreciate your interest in publishing with UJGSM.</div>
    </div>
    <div class="step-item">
      <div class="step-text">You may consider submitting to another journal that might be a better fit for your work.</div>
    </div>
    <div class="step-item">
      <div class="step-text">We encourage you to review the feedback provided, which may help strengthen future submissions.</div>
    </div>
    `
        : ''
    }
  </div>
</div>

      
      <div class="section">
        <h2 class="section-title">Track Your Submission</h2>
        <p>You can check the current status of your submission at any time using your Tracking ID:</p>
        <a href="https://ujgsm.uorapublications.com/track-paper?id=${trackingId}" class="action-button">Track Submission Status</a>
        <p>Or visit our submission portal and enter your Tracking ID: <strong>${trackingId}</strong></p>
      </div>
      
      <div class="section">
        <h2 class="section-title">Need Assistance?</h2>
        <p>If you have any questions about this status update or the review process, please contact our editorial office:</p>
        <p>
          <strong>Email:</strong> editorial@uorapublications.com<br>
          <strong>Phone:</strong> +91-9766930707<br>
          <strong>Reference:</strong> Please quote Tracking ID: ${trackingId} in all communications
        </p>
      </div>
      
      <p>Thank you for your contribution to the scientific community.</p>
      
      <p>Best regards,<br>
      <strong>Editorial Team</strong><br>
      Universal Journal of Green Sci-Tech & Management<br>
      Universal Oneness Research Association</p>
    </div>
    
    <!-- Footer Section -->
    <div class="footer">
      <div class="footer-links">
        <a href="https://ujgsm.uorapublications.com" class="footer-link">Journal Website</a>
        <a href="https://ujgsm.uorapublications.com/author-guidelines" class="footer-link">Author Guidelines</a>
        <a href="https://ujgsm.uorapublications.com/contact" class="footer-link">Contact Us</a>
      </div>
      
      <p>This is an automated message. Please do not reply directly to this email.</p>
      
      <div class="copyright">
        <p>© 2025 Universal Journal of Green Sci-Tech & Management. All rights reserved.</p>
        <p>Universal Oneness Research Association, Chhatrapati Sambhajinagar, Maharashtra, India</p>
      </div>
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
