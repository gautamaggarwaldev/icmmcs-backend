import { prisma } from "../config/db.js";
import { sendSpeakerRegistrationEmail } from "../services/emailService.js";

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};

const validateOrcid = (orcid) => {
  if (!orcid) return true; // Optional field
  const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  return orcidRegex.test(orcid);
};

export const registerSpeaker = async (req, res) => {
  try {
    const speakerData = req.body;
    const { referralCode } = speakerData;
    
    // Handle file uploads
    let paperFileUrl = null;
    let supplementaryFileUrl = null;
    let sourceCodeFileUrl = null;
    
    if (req.files) {
      if (req.files.paperFile) {
        paperFileUrl = req.files.paperFile[0].path;
      }
      if (req.files.supplementaryFile) {
        supplementaryFileUrl = req.files.supplementaryFile[0].path;
      }
      if (req.files.sourceCodeFile) {
        sourceCodeFileUrl = req.files.sourceCodeFile[0].path;
      }
    }

    // If referral code is provided, verify it exists
    let referredById = null;
    if (referralCode) {
      const admin = await prisma.Admin.findUnique({
        where: { referralCode }
      });

      if (!admin) {
        return res.status(400).json({ 
          message: 'Invalid referral code',
          success: false 
        });
      }
      referredById = admin.id;
    }

    // Validate required fields
    const requiredFields = [
      'conferenceTitle', 'placeDate', 'paperTitle', 'paperAbstract', 'keywords',
      'name', 'email', 'phone', 'institutionName', 'country', 'primarySubject',
      'ethicsCompliance', 'agreeTerms', 'agreePresentation', 'agreePublication',
      'agreeReview', 'agreeDataSharing'
    ];
    
    const missingFields = requiredFields.filter(field => {
      if (field === 'ethicsCompliance' || field.startsWith('agree')) {
        return !speakerData[field] || speakerData[field] !== 'true';
      }
      return !speakerData[field];
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        success: false
      });
    }

    // Validate email format
    if (!validateEmail(speakerData.email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false
      });
    }

    // Validate phone format
    if (!validatePhone(speakerData.phone)) {
      return res.status(400).json({
        message: "Invalid phone number format",
        success: false
      });
    }

    // Validate ORCID if provided
    if (speakerData.orcidId && !validateOrcid(speakerData.orcidId)) {
      return res.status(400).json({
        message: "Invalid ORCID format (should be 0000-0000-0000-0000)",
        success: false
      });
    }

    // Validate abstract length
    const abstractWords = speakerData.paperAbstract.trim().split(/\s+/).filter(word => word.length > 0);
    if (abstractWords.length < 50) {
      return res.status(400).json({
        message: "Abstract must be at least 50 words long",
        success: false
      });
    }
    if (abstractWords.length > 500) {
      return res.status(400).json({
        message: "Abstract must not exceed 500 words",
        success: false
      });
    }

    // Validate conditional fields
    if (speakerData.preprintPolicy === 'true' && !speakerData.preprintUrl) {
      return res.status(400).json({
        message: "Preprint URL is required when preprint policy is selected",
        success: false
      });
    }

    if (speakerData.aiGeneratedContent === 'true' && !speakerData.aiContentDescription) {
      return res.status(400).json({
        message: "AI content description is required when AI-generated content is selected",
        success: false
      });
    }

    // Validate co-authors if any
    let coAuthors = [];
    if (speakerData.coAuthors) {
      try {
        coAuthors = JSON.parse(speakerData.coAuthors);
        for (let i = 0; i < coAuthors.length; i++) {
          const coAuthor = coAuthors[i];
          if (!coAuthor.name || !coAuthor.email || !coAuthor.institution || !coAuthor.country) {
            return res.status(400).json({
              message: `Co-author ${i + 1} is missing required fields`,
              success: false
            });
          }
          if (!validateEmail(coAuthor.email)) {
            return res.status(400).json({
              message: `Invalid email format for co-author ${i + 1}`,
              success: false
            });
          }
          if (coAuthor.orcidId && !validateOrcid(coAuthor.orcidId)) {
            return res.status(400).json({
              message: `Invalid ORCID format for co-author ${i + 1}`,
              success: false
            });
          }
        }
      } catch (error) {
        return res.status(400).json({
          message: "Invalid co-authors data format",
          success: false
        });
      }
    }

    // Check if email already exists
    const existingSpeaker = await prisma.speaker.findUnique({
      where: { email: speakerData.email }
    });

    if (existingSpeaker) {
      return res.status(400).json({
        message: "Speaker already registered with this email",
        success: false
      });
    }

    // Prepare data for database insertion
    const speakerCreateData = {
      // Conference Information
      conferenceTitle: speakerData.conferenceTitle,
      placeDate: speakerData.placeDate,
      
      // Paper Information
      paperTitle: speakerData.paperTitle,
      paperAbstract: speakerData.paperAbstract,
      keywords: speakerData.keywords,
      
      // Primary Author Information
      name: speakerData.name,
      email: speakerData.email,
      phone: speakerData.phone,
      institutionName: speakerData.institutionName,
      country: speakerData.country,
      orcidId: speakerData.orcidId || null,
      isCorrespondingAuthor: speakerData.correspondingAuthor === 'true',
      
      // Co-authors Information
      coAuthors: coAuthors.length > 0 ? JSON.stringify(coAuthors) : null,
      
      // Subject Areas
      primarySubject: speakerData.primarySubject,
      additionalSubjects: speakerData.additionalSubjects || null,
      
      // File Uploads
      paperFileUrl: paperFileUrl,
      supplementaryFileUrl: supplementaryFileUrl,
      sourceCodeFileUrl: sourceCodeFileUrl,
      
      // Additional Declarations
      ethicsCompliance: speakerData.ethicsCompliance === 'true',
      dataAvailability: speakerData.dataAvailability === 'true',
      preprintPolicy: speakerData.preprintPolicy === 'true',
      preprintUrl: speakerData.preprintUrl || null,
      conflictOfInterest: speakerData.conflictOfInterest === 'true',
      
      // Supplementary Questions
      previouslySubmitted: speakerData.previouslySubmitted === 'true',
      previousSubmissionInfo: speakerData.previousSubmissionInfo || null,
      willingToReview: speakerData.willingToReview === 'true',
      aiGeneratedContent: speakerData.aiGeneratedContent === 'true',
      aiContentDescription: speakerData.aiContentDescription || null,
      studentPaper: speakerData.studentPaper === 'true',
      
      // Agreements
      agreeTerms: speakerData.agreeTerms === 'true',
      agreePresentation: speakerData.agreePresentation === 'true',
      agreePublication: speakerData.agreePublication === 'true',
      agreeReview: speakerData.agreeReview === 'true',
      agreeDataSharing: speakerData.agreeDataSharing === 'true',
      
      // Additional Information
      message: speakerData.message || null,
      referralCode: referralCode || null,
      referredById: referredById,
      
      // Legacy fields for backward compatibility
      attendeeType: 'presenter',
      fileUrl: paperFileUrl
    };

    // Create new speaker
    const newSpeaker = await prisma.speaker.create({
      data: speakerCreateData,
    });

    // If referral code exists, create the user record with admin reference
    if (referralCode && referredById) {
      await prisma.user.create({
        data: {
          name: speakerData.name,
          email: speakerData.email,
          referredBy: referralCode,
          adminId: referredById
        }
      });
    }

    // Send registration confirmation emails
    await sendSpeakerRegistrationEmail(newSpeaker);

    res.status(201).json({
      message: "Paper submission successful",
      user: newSpeaker,
      success: true,
    });
  } catch (error) {
    console.error('Speaker registration error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2000') {
      return res.status(400).json({
        message: "One or more fields contain data that is too long. Please check your input and try again.",
        success: false
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: "A submission with this email address already exists. Please use a different email or contact support.",
        success: false
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: "Invalid reference data. Please check your form and try again.",
        success: false
      });
    }
    
    res.status(500).json({
      message: "Error submitting paper. Please try again later or contact support if the problem persists.",
      error: error.message,
      success: false,
    });
  }
};

export const getSpeakers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    if (status && status !== 'ALL') {
      where.reviewStatus = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { paperTitle: { contains: search, mode: 'insensitive' } },
        { institutionName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [speakers, total] = await Promise.all([
      prisma.speaker.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          referredBy: {
            select: {
              id: true,
              email: true,
              referralCode: true
            }
          }
        }
      }),
      prisma.speaker.count({ where })
    ]);

    res.status(200).json({ 
      speakers, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      success: true 
    });
  } catch (error) {
    console.error('Error retrieving speakers:', error);
    res.status(500).json({
      message: "Error retrieving speakers",
      error: error.message,
      success: false,
    });
  }
};

export const getSpeakerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const speaker = await prisma.speaker.findUnique({
      where: { id },
      include: {
        referredBy: {
          select: {
            id: true,
            email: true,
            referralCode: true
          }
        }
      }
    });

    if (!speaker) {
      return res.status(404).json({
        message: "Speaker not found",
        success: false
      });
    }

    res.status(200).json({ speaker, success: true });
  } catch (error) {
    console.error('Error retrieving speaker:', error);
    res.status(500).json({
      message: "Error retrieving speaker",
      error: error.message,
      success: false,
    });
  }
};

export const updateSpeakerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus, sentToCommittee, committeeMembers } = req.body;

    const speaker = await prisma.speaker.findUnique({
      where: { id }
    });

    if (!speaker) {
      return res.status(404).json({
        message: "Speaker not found",
        success: false
      });
    }

    const updatedSpeaker = await prisma.speaker.update({
      where: { id },
      data: {
        reviewStatus: reviewStatus || speaker.reviewStatus,
        sentToCommittee: sentToCommittee !== undefined ? sentToCommittee : speaker.sentToCommittee,
        committeeMembers: committeeMembers || speaker.committeeMembers
      }
    });

    res.status(200).json({
      message: "Speaker status updated successfully",
      speaker: updatedSpeaker,
      success: true
    });
  } catch (error) {
    console.error('Error updating speaker status:', error);
    res.status(500).json({
      message: "Error updating speaker status",
      error: error.message,
      success: false,
    });
  }
};

export const deleteSpeaker = async (req, res) => {
  try {
    const { id } = req.params;
    
    const speaker = await prisma.speaker.findUnique({
      where: { id }
    });

    if (!speaker) {
      return res.status(404).json({
        message: "Speaker not found",
        success: false
      });
    }

    await prisma.speaker.delete({
      where: { id }
    });

    res.status(200).json({
      message: "Speaker deleted successfully",
      success: true
    });
  } catch (error) {
    console.error('Error deleting speaker:', error);
    res.status(500).json({
      message: "Error deleting speaker",
      error: error.message,
      success: false,
    });
  }
};

export const getSpeakerStats = async (req, res) => {
  try {
    const [
      total,
      pending,
      underReview,
      approved,
      rejected,
      needsRevision,
      sentToCommittee
    ] = await Promise.all([
      prisma.speaker.count(),
      prisma.speaker.count({ where: { reviewStatus: 'PENDING' } }),
      prisma.speaker.count({ where: { reviewStatus: 'UNDER_REVIEW' } }),
      prisma.speaker.count({ where: { reviewStatus: 'APPROVED' } }),
      prisma.speaker.count({ where: { reviewStatus: 'REJECTED' } }),
      prisma.speaker.count({ where: { reviewStatus: 'NEEDS_REVISION' } }),
      prisma.speaker.count({ where: { sentToCommittee: true } })
    ]);

    res.status(200).json({
      stats: {
        total,
        pending,
        underReview,
        approved,
        rejected,
        needsRevision,
        sentToCommittee
      },
      success: true
    });
  } catch (error) {
    console.error('Error retrieving speaker stats:', error);
    res.status(500).json({
      message: "Error retrieving speaker statistics",
      error: error.message,
      success: false,
    });
  }
};
