import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper to build a clean public_id from original filename
 * Keeps your existing naming style.
 */
function makePublicId(file, prefix) {
  const base = (file.originalname || 'file');
  const nameNoExt = base.includes('.') ? base.substring(0, base.lastIndexOf('.')) : base;
  const ext = base.includes('.') ? base.substring(base.lastIndexOf('.') + 1) : '';
  return `${prefix}_${Date.now()}_${nameNoExt}${ext ? '.' + ext : ''}`;
}

// ===============================
// Storage for paper submissions
// (speaker paper, supplementary, source code, Turnitin report)
// ===============================
const paperStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = 'conference-papers';
    let resourceType = 'raw';

    if (file.fieldname === 'paperFile') {
      folder = 'conference-papers/papers';
      resourceType = 'raw';
    } else if (file.fieldname === 'supplementaryFile') {
      folder = 'conference-papers/supplementary';
      resourceType = 'raw';
    } else if (file.fieldname === 'sourceCodeFile') {
      folder = 'conference-papers/source-code';
      resourceType = 'raw';
    } else if (file.fieldname === 'turnitinReport') {
      // NEW: Turnitin reports go to a separate folder
      folder = 'Turnetin_Reports'; // (spelling per your request)
      resourceType = 'raw';
    }

    return {
      folder,
      resource_type: resourceType,
      public_id: makePublicId(file, file.fieldname),
    };
  }
});

// Multer middleware for paper + related uploads (including Turnitin report)
export const upload = multer({
  storage: paperStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      fieldname: file.fieldname,
      filename: file.originalname,
      mimetype: file.mimetype
    });

    const lower = (file.originalname || '').toLowerCase();
    const fileExtension = lower.slice(lower.lastIndexOf('.'));

    // Different allowed types for different file fields
    if (file.fieldname === 'paperFile') {
      // PDF, DOCX, LaTeX
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-tex',
        'text/x-tex',
        'application/x-latex',
        'text/x-latex',
        'text/plain'  // some systems send .tex as text/plain
      ];
      const allowedExts = ['.pdf', '.docx', '.tex', '.latex'];

      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Paper file must be PDF, DOCX, or LaTeX (.tex, .latex)!'), false);

    } else if (file.fieldname === 'supplementaryFile') {
      // PDF, DOCX, ZIP, RAR
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-zip-compressed'
      ];
      const allowedExts = ['.pdf', '.docx', '.zip', '.rar'];

      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Supplementary file must be PDF, DOCX, ZIP, or RAR!'), false);

    } else if (file.fieldname === 'sourceCodeFile') {
      // ZIP/RAR or common code/text files
      const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'text/plain',
        'text/x-python',
        'text/x-java-source',
        'text/x-c++src',
        'text/x-csrc',
        'text/javascript',
        'text/html',
        'text/css'
      ];
      const allowedExts = ['.zip', '.rar', '.py', '.java', '.cpp', '.c', '.js', '.html', '.css'];

      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Source code must be ZIP, RAR, or a programming file!'), false);

    } else if (file.fieldname === 'turnitinReport') {
      // NEW: Turnitin report — PDF or DOCX
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const allowedExts = ['.pdf', '.docx'];

      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Turnitin report must be PDF or DOCX!'), false);

    } else {
      return cb(new Error('Unknown file field!'), false);
    }
  }
});

// ===============================
// Legacy single file upload (backward-compatible)
// ===============================
const legacyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'conference-papers',
    resource_type: 'raw',
    public_id: (req, file) => makePublicId(file, 'paper'),
  },
});

export const legacyUpload = multer({
  storage: legacyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream',
      'text/x-tex',
      'application/x-tex',
      'text/plain',
      'application/x-latex',
      'text/x-latex'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.tex', '.latex'];
    const lower = (file.originalname || '').toLowerCase();
    const fileExtension = lower.slice(lower.lastIndexOf('.'));

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      return cb(null, true);
    }
    return cb(new Error('Only PDF, DOCX, and LaTeX (.tex, .latex) files are allowed!'), false);
  }
});

// ===============================
// Keynote speakers multi-type upload
// ===============================
const keynoteStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = 'keynote-speakers';
    let resourceType = 'raw';

    if (file.fieldname === 'cvFile') {
      folder = 'keynote-speakers/cv';
      resourceType = 'raw';
    } else if (file.fieldname === 'photoFile') {
      folder = 'keynote-speakers/photos';
      resourceType = 'image';
    } else if (file.fieldname === 'presentationFile') {
      folder = 'keynote-speakers/presentations';
      resourceType = 'raw';
    }

    return {
      folder,
      resource_type: resourceType,
      public_id: makePublicId(file, file.fieldname),
    };
  }
});

export const keynoteUpload = multer({
  storage: keynoteStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    console.log('Keynote file upload attempt:', {
      fieldname: file.fieldname,
      filename: file.originalname,
      mimetype: file.mimetype
    });
    const lower = (file.originalname || '').toLowerCase();
    const fileExtension = lower.slice(lower.lastIndexOf('.'));

    if (file.fieldname === 'cvFile') {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
        'text/x-tex',
        'application/x-tex',
        'text/plain',
        'application/x-latex',
        'text/x-latex'
      ];
      const allowedExts = ['.pdf', '.docx', '.tex', '.latex'];
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('CV must be PDF, DOCX, or LaTeX!'), false);

    } else if (file.fieldname === 'photoFile') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedExts = ['.jpg', '.jpeg', '.png'];
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Photo must be JPG, JPEG, or PNG!'), false);

    } else if (file.fieldname === 'presentationFile') {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      const allowedExts = ['.pdf', '.ppt', '.pptx'];
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        return cb(null, true);
      }
      return cb(new Error('Presentation must be PDF, PPT, or PPTX!'), false);

    } else {
      return cb(new Error('Unknown file field!'), false);
    }
  }
});

const reviewerExpressionStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const original = file.originalname || 'file';
    const nameNoExt = original.includes('.') ? original.substring(0, original.lastIndexOf('.')) : original;
    const ext = original.includes('.') ? original.substring(original.lastIndexOf('.') + 1) : undefined;
    return {
      folder: 'cv_reviewer_expression',
      resource_type: 'raw',
      public_id: `cv_${Date.now()}_${nameNoExt}`,
      format: ext,
    };
  }
});

export const reviewerExpressionUpload = multer({
  storage: reviewerExpressionStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    console.log('Reviewer Expression file upload attempt:', {
      fieldname: file.fieldname,
      filename: file.originalname,
      mimetype: file.mimetype
    });
    const original = (file.originalname || '').toLowerCase();
    const ext = original.slice(original.lastIndexOf('.'));
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExts = ['.pdf', '.docx'];

    if (file.fieldname !== 'cvFile') {
      return cb(new Error("Unknown file field for reviewer expression (expected 'cvFile')"), false);
    }
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('CV must be PDF or DOCX!'), false);
  }
});

export default cloudinary;
