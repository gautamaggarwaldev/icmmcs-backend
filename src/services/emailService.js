import { transporter } from "../config/email.js";
import {
  welcomeTemplate,
  adminNotificationTemplate,
  speakerConfirmationTemplate,
  speakerAdminNotificationTemplate,
  sponsorConfirmationTemplate,
  sponsorAdminNotificationTemplate,
} from "../utils/emailTemplates/userRegistration.js";

function validateUserData(userData) {
  if (!userData.email || !userData.name) {
    throw new Error("Invalid user data provided");
  }
  // Add email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Invalid email format");
  }
}

export async function sendUserRegisterEmail(userRegisterData) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userRegisterData.email,
    subject: "ICMMCS 2025 | Conference Registration Email",
    html: welcomeTemplate(userRegisterData),
  };

  const confirmationMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Conference Registration`,
    html: adminNotificationTemplate(userRegisterData),
  };

  try {
    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(confirmationMailOptions),
    ]);

    console.log(
      `Registration emails sent successfully for ${userRegisterData.email}`
    );
    return true;
  } catch (error) {
    console.error("Email service error:", {
      error: error.message,
      user: userRegisterData.email,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to send registration emails: ${error.message}`);
  }
}

export async function sendSpeakerRegistrationEmail(speakerData) {
  validateUserData(speakerData);

  const speakerMailOptions = {
    from: process.env.EMAIL_USER,
    to: speakerData.email,
    subject: "ICMMCS 2025 | Presenter Registration Confirmation",
    html: speakerConfirmationTemplate(speakerData),
  };

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Presenter Registration: ${speakerData.name}`,
    html: speakerAdminNotificationTemplate(speakerData),
  };

  try {
    await Promise.all([
      transporter.sendMail(speakerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(
      `Speaker registration emails sent successfully for ${speakerData.email}`
    );
    return true;
  } catch (error) {
    console.error("Speaker email service error:", {
      error: error.message,
      speaker: speakerData.email,
      timestamp: new Date().toISOString(),
    });
    // Don't throw error, just log it - we don't want to fail registration if email fails
    return false;
  }
}

export async function sendSponsorRegistrationEmail(sponsorData) {
  validateUserData(sponsorData);

  const sponsorMailOptions = {
    from: process.env.EMAIL_USER,
    to: sponsorData.email,
    subject: "ICMMCS 2025 | Sponsorship Registration Confirmation",
    html: sponsorConfirmationTemplate(sponsorData),
  };

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Sponsor Registration: ${sponsorData.name}`,
    html: sponsorAdminNotificationTemplate(sponsorData),
  };

  try {
    await Promise.all([
      transporter.sendMail(sponsorMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(
      `Sponsor registration emails sent successfully for ${sponsorData.email}`
    );
    return true;
  } catch (error) {
    console.error("Sponsor email service error:", {
      error: error.message,
      sponsor: sponsorData.email,
      timestamp: new Date().toISOString(),
    });
    // Don't throw error, just log it - we don't want to fail registration if email fails
    return false;
  }
}

export async function sendKeynoteSpeakerRegistrationEmail(keynoteSpeakerData) {
  validateUserData(keynoteSpeakerData);

  const keynoteSpeakerMailOptions = {
    from: process.env.EMAIL_USER,
    to: keynoteSpeakerData.email,
    subject: "ICMMCS 2025 | Keynote Speaker Registration Confirmation",
    html: keynoteSpeakerConfirmationTemplate(keynoteSpeakerData),
  };

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Keynote Speaker Registration: ${keynoteSpeakerData.name}`,
    html: keynoteSpeakerAdminNotificationTemplate(keynoteSpeakerData),
  };

  try {
    await Promise.all([
      transporter.sendMail(keynoteSpeakerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(
      `Keynote speaker registration emails sent successfully for ${keynoteSpeakerData.email}`
    );
    return true;
  } catch (error) {
    console.error("Keynote speaker email service error:", {
      error: error.message,
      speaker: keynoteSpeakerData.email,
      timestamp: new Date().toISOString(),
    });
    // Don't throw error, just log it - we don't want to fail registration if email fails
    return false;
  }
}

export async function sendSpeakerToCommitteeEmail(speakerData, committeeMember) {
  const committeeMailOptions = {
    from: process.env.EMAIL_USER,
    to: committeeMember.email,
    subject: `ICMMCS 2025 | Presenter Review Request: ${speakerData.name}`,
    html: speakerReviewCommitteeTemplate(speakerData, committeeMember),
  };

  try {
    await transporter.sendMail(committeeMailOptions);
    console.log(
      `Speaker review email sent successfully to committee member ${committeeMember.email}`
    );
    return true;
  } catch (error) {
    console.error("Committee email service error:", {
      error: error.message,
      committeeMember: committeeMember.email,
      speaker: speakerData.email,
      timestamp: new Date().toISOString(),
    });
    throw error; // Re-throw to handle in controller
  }
}

// Email template for keynote speaker confirmation
const keynoteSpeakerConfirmationTemplate = (keynoteSpeakerData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #019087, #40c4ba); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight { background: #e8f5f3; padding: 15px; border-left: 4px solid #019087; margin: 20px 0; }
    .button { display: inline-block; background: #019087; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .info-section { margin: 20px 0; }
    .info-section h3 { color: #019087; margin-bottom: 10px; }
    ul { padding-left: 20px; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Keynote Speaker Registration Confirmed!</h1>
      <p>ICMMCS 2025 - International Conference on Mathematics, Management & Computer Science</p>
    </div>
    
    <div class="content">
      <h2>Dear ${keynoteSpeakerData.name},</h2>
      
      <p>Thank you for your interest in being a keynote speaker at ICMMCS 2025! We have successfully received your registration and proposal.</p>
      
      <div class="highlight">
        <h3>📋 Your Registration Details</h3>
        <p><strong>Keynote Title:</strong> ${keynoteSpeakerData.keynoteTitle}</p>
        <p><strong>Expertise Area:</strong> ${keynoteSpeakerData.expertiseArea}</p>
        <p><strong>Institution:</strong> ${keynoteSpeakerData.institutionName}</p>
        <p><strong>Registration Date:</strong> ${new Date(keynoteSpeakerData.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div class="info-section">
        <h3>🔍 What Happens Next?</h3>
        <ul>
          <li>Our academic committee will review your keynote proposal</li>
          <li>We will evaluate your credentials and expertise</li>
          <li>You will receive our decision within 10 business days</li>
          <li>If approved, we will send you detailed speaker guidelines</li>
        </ul>
      </div>
      
      <div class="info-section">
        <h3>📧 Stay Connected</h3>
        <p>For any questions or updates regarding your keynote speaker application, please contact us at:</p>
        <ul>
          <li>Email: info@icmmcs.org</li>
          <li>Phone: +968 93391308 / +91-9540111207</li>
        </ul>
      </div>
      
      <div class="info-section">
        <h3>📅 Conference Details</h3>
        <p><strong>Date:</strong> November 10th, 2025</p>
        <p><strong>Venue:</strong> Majan University College, Muscat, Oman</p>
        <p><strong>Website:</strong> <a href="https://www.icmmcs.org">www.icmmcs.org</a></p>
      </div>
      
      <p>We appreciate your willingness to share your expertise with our global community of researchers and professionals. Your contribution will help advance the fields of mathematics, management, and computer science.</p>
      
      <p>Thank you for your interest in ICMMCS 2025!</p>
      
      <p>Best regards,<br>
      <strong>ICMMCS 2025 Organizing Committee</strong><br>
      International Conference on Mathematics, Management & Computer Science</p>
      
      <div class="footer">
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
        <p>&copy; 2025 ICMMCS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email template for sending speaker to committee
const speakerReviewCommitteeTemplate = (speakerData, committeeMember) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #019087, #40c4ba); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #019087; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .label { font-weight: bold; color: #019087; }
    .value { margin-bottom: 10px; }
    .priority { background: #fff3cd; color: #856404; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
    .cta-button { display: inline-block; background: #019087; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 5px; font-weight: bold; }
    .file-link { display: inline-block; background: #f8f9fa; border: 1px solid #dee2e6; padding: 8px 12px; text-decoration: none; border-radius: 4px; margin: 5px; color: #495057; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: white; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Presenter Review Request</h1>
      <p>ICMMCS 2025 - International Conference on Mathematics, Management & Computer Science</p>
    </div>
    
    <div class="content">
      <h2>Dear ${committeeMember.name},</h2>
      
      <p>You have been assigned to review a presenter application for ICMMCS 2025. Please find the complete presenter details below for your evaluation.</p>
      
      <div class="priority">⏰ Review Priority: Standard Review Timeline</div>
      
      <div class="section">
        <h3>👤 Presenter Information</h3>
        <div class="grid">
          <div>
            <div class="label">Full Name:</div>
            <div class="value">${speakerData.name}</div>
          </div>
          <div>
            <div class="label">Email:</div>
            <div class="value">${speakerData.email}</div>
          </div>
          <div>
            <div class="label">Phone:</div>
            <div class="value">${speakerData.phone}</div>
          </div>
          <div>
            <div class="label">Country:</div>
            <div class="value">${speakerData.country}</div>
          </div>
          <div>
            <div class="label">Institution:</div>
            <div class="value">${speakerData.institutionName}</div>
          </div>
          <div>
            <div class="label">Attendee Type:</div>
            <div class="value">${speakerData.attendeeType}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>📄 Paper/Presentation Details</h3>
        <div class="label">Paper Title:</div>
        <div class="value" style="font-size: 18px; font-weight: bold; color: #019087; margin-bottom: 15px;">${speakerData.paperTitle}</div>
        
        <div class="grid">
          <div>
            <div class="label">Conference Title:</div>
            <div class="value">${speakerData.conferenceTitle}</div>
          </div>
          <div>
            <div class="label">Place & Date:</div>
            <div class="value">${speakerData.placeDate}</div>
          </div>
        </div>
        
        ${speakerData.message ? `
          <div style="margin-top: 15px;">
            <div class="label">Additional Message:</div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${speakerData.message}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="section">
        <h3>📎 Submitted Documents</h3>
        <div class="value">
          ${speakerData.fileUrl ? 
            `<a href="${speakerData.fileUrl}" class="file-link" target="_blank">
               <i class="fas fa-file-pdf"></i> Download Paper/Abstract
             </a>` : 
            '<span style="color: #dc3545;">❌ No paper file submitted</span>'
          }
        </div>
      </div>
      
      <div class="section">
        <h3>ℹ️ Registration Details</h3>
        <div class="grid">
          <div>
            <div class="label">Registration Date:</div>
            <div class="value">${new Date(speakerData.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div class="label">Speaker ID:</div>
            <div class="value">${speakerData.id}</div>
          </div>
          ${speakerData.referredBy ? `
            <div>
              <div class="label">Referred By:</div>
              <div class="value">${speakerData.referredBy.email}</div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="section">
        <h3>📋 Review Guidelines</h3>
        <ul style="margin: 15px 0; padding-left: 20px;">
          <li><strong>Content Quality:</strong> Evaluate the relevance and quality of the proposed paper/presentation</li>
          <li><strong>Academic Merit:</strong> Assess the academic contribution and research methodology</li>
          <li><strong>Conference Alignment:</strong> Ensure the topic aligns with ICMMCS 2025 themes</li>
          <li><strong>Presentation Readiness:</strong> Consider the speaker's ability to present effectively</li>
          <li><strong>Innovation Factor:</strong> Look for novel approaches or significant findings</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #019087;">
          <h3 style="color: #019087; margin-bottom: 15px;">Review Actions Required</h3>
          <p style="margin-bottom: 20px;">Please review the presenter application and provide your recommendation:</p>
          
          <div style="margin-bottom: 20px;">
            <a href="https://www.icmmcs.org/paper-review.html?id=${speakerData.id}" class="cta-button" style="background: #019087; margin-bottom: 10px;">
              📋 View Full Paper Details
            </a>
            <p style="font-size: 12px; color: #666; margin-top: 5px;">
              Click above to access the complete paper submission with all details, files, and review interface
            </p>
          </div>
          
          <div>
            <a href="mailto:${process.env.ADMIN_EMAIL}?subject=Presenter%20Review%20-%20APPROVED%20-${speakerData.name}&body=Presenter%20Name:${speakerData.name}%0D%0APaper%20Title:%20${speakerData.paperTitle}%0D%0ARecommendation:APPROVED%0D%0AComments:" class="cta-button" style="background: #28a745;">
              ✅ APPROVE
            </a>
            <a href="mailto:${process.env.ADMIN_EMAIL}?subject=Presenter%20Review%20-%20NEEDS%20REVISION%20-${speakerData.name}&body=Presenter%20Name:${speakerData.name}%0D%0APaper%20Title:%20${speakerData.paperTitle}%0D%0ARecommendation:NEEDS%20REVISION%0D%0AComments:" class="cta-button" style="background: #ffc107; color: #000;">
              📝 NEEDS REVISION
            </a>
            <a href="mailto:${process.env.ADMIN_EMAIL}?subject=Presenter%20Review%20-%20REJECTED%20-%20${speakerData.name}&body=Presenter%20Name:%20${speakerData.name}%0D%0APaper%20Title:%20${speakerData.paperTitle}%0D%0ARecommendation:%20REJECTED%0D%0AComments:" class="cta-button" style="background: #dc3545;">
              ❌ REJECT
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Click the appropriate button above to send your review via email, or reply directly to this email with your detailed feedback.
          </p>
        </div>
      </div>
      
      <div class="section">
        <h3>📞 Contact Information</h3>
        <p>If you have any questions about this review or need additional information, please contact:</p>
        <ul>
          <li><strong>Conference Email:</strong> info@icmmcs.org</li>
          <li><strong>Phone:</strong> +968 93391308 / +91-9540111207</li>
          <li><strong>Review Deadline:</strong> Please provide your feedback within 7 business days</li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for your valuable contribution to the ICMMCS 2025 review process!</strong></p>
        <p style="color: #666; font-size: 12px; margin-top: 15px;">
          This is an automated email from the ICMMCS 2025 Conference Management System.<br>
          Your expertise and time are greatly appreciated in maintaining the quality of our conference.
        </p>
        <p style="margin-top: 10px;">&copy; 2025 ICMMCS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email template for admin notification
const keynoteSpeakerAdminNotificationTemplate = (keynoteSpeakerData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #019087; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #019087; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .label { font-weight: bold; color: #019087; }
    .value { margin-bottom: 10px; }
    .status { background: #fff3cd; color: #856404; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; }
    .abstract { background: #e8f5f3; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎤 New Keynote Speaker Registration</h1>
      <p>ICMMCS 2025 Conference</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Keynote Speaker Details</h2>
        <span class="status">⏳ PENDING REVIEW</span>
        
        <div class="grid" style="margin-top: 20px;">
          <div>
            <div class="label">Full Name:</div>
            <div class="value">${keynoteSpeakerData.name}</div>
          </div>
          <div>
            <div class="label">Email:</div>
            <div class="value">${keynoteSpeakerData.email}</div>
          </div>
          <div>
            <div class="label">Phone:</div>
            <div class="value">${keynoteSpeakerData.phone}</div>
          </div>
          <div>
            <div class="label">Country:</div>
            <div class="value">${keynoteSpeakerData.country}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>Professional Information</h3>
        <div class="grid">
          <div>
            <div class="label">Designation:</div>
            <div class="value">${keynoteSpeakerData.designation}</div>
          </div>
          <div>
            <div class="label">Institution:</div>
            <div class="value">${keynoteSpeakerData.institutionName}</div>
          </div>
          <div>
            <div class="label">Department:</div>
            <div class="value">${keynoteSpeakerData.department || 'Not specified'}</div>
          </div>
          <div>
            <div class="label">Experience:</div>
            <div class="value">${keynoteSpeakerData.experienceYears} years</div>
          </div>
          <div>
            <div class="label">Expertise Area:</div>
            <div class="value">${keynoteSpeakerData.expertiseArea}</div>
          </div>
          <div>
            <div class="label">Specialization:</div>
            <div class="value">${keynoteSpeakerData.specialization}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>Academic Credentials</h3>
        <div class="grid">
          <div>
            <div class="label">Highest Degree:</div>
            <div class="value">${keynoteSpeakerData.highestDegree}</div>
          </div>
          <div>
            <div class="label">University:</div>
            <div class="value">${keynoteSpeakerData.university || 'Not specified'}</div>
          </div>
          <div>
            <div class="label">Publications:</div>
            <div class="value">${keynoteSpeakerData.publicationsCount || 'Not specified'}</div>
          </div>
          <div>
            <div class="label">Previous Keynotes:</div>
            <div class="value">${keynoteSpeakerData.keynoteExperience || 'Not specified'}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>🎯 Proposed Keynote</h3>
        <div class="label">Title:</div>
        <div class="value" style="font-size: 18px; font-weight: bold; color: #019087;">${keynoteSpeakerData.keynoteTitle}</div>
        
        <div class="abstract">
          <div class="label">Abstract:</div>
          <div style="margin-top: 10px; line-height: 1.8;">${keynoteSpeakerData.keynoteAbstract}</div>
        </div>
        
        ${keynoteSpeakerData.targetAudience ? `
          <div class="label">Target Audience:</div>
          <div class="value">${keynoteSpeakerData.targetAudience}</div>
        ` : ''}
      </div>
      
      <div class="section">
        <h3>📄 Uploaded Files</h3>
        <div class="value">
          <p><strong>CV/Resume:</strong> ${keynoteSpeakerData.cvFileUrl ? '✅ Uploaded' : '❌ Not uploaded'}</p>
          <p><strong>Photo:</strong> ${keynoteSpeakerData.photoFileUrl ? '✅ Uploaded' : '❌ Not uploaded'}</p>
          <p><strong>Sample Presentation:</strong> ${keynoteSpeakerData.presentationFileUrl ? '✅ Uploaded' : '❌ Not uploaded'}</p>
        </div>
      </div>
      
      <div class="section">
        <h3>🌐 Online Presence</h3>
        <div class="value">
          ${keynoteSpeakerData.linkedinProfile ? `<p><strong>LinkedIn:</strong> <a href="${keynoteSpeakerData.linkedinProfile}" target="_blank">${keynoteSpeakerData.linkedinProfile}</a></p>` : ''}
          ${keynoteSpeakerData.website ? `<p><strong>Website:</strong> <a href="${keynoteSpeakerData.website}" target="_blank">${keynoteSpeakerData.website}</a></p>` : ''}
          ${keynoteSpeakerData.orcidId ? `<p><strong>ORCID:</strong> ${keynoteSpeakerData.orcidId}</p>` : ''}
          ${keynoteSpeakerData.googleScholar ? `<p><strong>Google Scholar:</strong> <a href="${keynoteSpeakerData.googleScholar}" target="_blank">${keynoteSpeakerData.googleScholar}</a></p>` : ''}
          ${!keynoteSpeakerData.linkedinProfile && !keynoteSpeakerData.website && !keynoteSpeakerData.orcidId && !keynoteSpeakerData.googleScholar ? '<p>No online profiles provided</p>' : ''}
        </div>
      </div>
      
      ${keynoteSpeakerData.additionalComments ? `
        <div class="section">
          <h3>💬 Additional Comments</h3>
          <div class="value">${keynoteSpeakerData.additionalComments}</div>
        </div>
      ` : ''}
      
      <div class="section">
        <h3>📊 Quick Summary</h3>
        <div class="value">
          <p><strong>Registered:</strong> ${new Date(keynoteSpeakerData.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${keynoteSpeakerData.status}</p>
          <p><strong>Accommodation Needed:</strong> ${keynoteSpeakerData.accommodationNeeded || 'Not specified'}</p>
          <p><strong>Preferred Session:</strong> ${keynoteSpeakerData.preferredSessionTime || 'No preference'}</p>
          <p><strong>Marketing Consent:</strong> ${keynoteSpeakerData.agreeToMarketing ? 'Yes' : 'No'}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
        <p><strong>⚡ Action Required:</strong> Please review this keynote speaker application and update the status accordingly.</p>
        <p style="color: #666; font-size: 14px;">Speaker ID: ${keynoteSpeakerData.id}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
