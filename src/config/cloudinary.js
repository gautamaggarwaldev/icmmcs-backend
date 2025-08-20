import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for paper submissions
const paperStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
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
    }
    
    return {
      folder: folder,
      resource_type: resourceType,
      public_id: `${file.fieldname}_${Date.now()}_${file.originalname.split('.')[0]}.${file.originalname.split('.').pop()}`
    };
  }
});

// Create multer upload middleware for paper submissions
export const upload = multer({ 
  storage: paperStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for supplementary files
  },
  fileFilter: (req, file, cb) => {
    console.log('Paper submission file upload attempt:', {
      fieldname: file.fieldname,
      filename: file.originalname,
      mimetype: file.mimetype
    });
    
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    // Different allowed types for different file fields
    if (file.fieldname === 'paperFile') {
      // Paper file - PDF, DOCX, and LaTeX
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-tex',
        'text/x-tex',
        'application/x-latex',
        'text/x-latex',
        'text/plain'  // Some systems send .tex files as text/plain
      ];
      const allowedExts = ['.pdf', '.docx', '.tex', '.latex'];
      
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Paper file must be in PDF, DOCX, or LaTeX (.tex, .latex) format!'), false);
      }
    } else if (file.fieldname === 'supplementaryFile') {
      // Supplementary files - various document formats
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
        cb(null, true);
      } else {
        cb(new Error('Supplementary file must be PDF, DOCX, ZIP, or RAR format!'), false);
      }
    } else if (file.fieldname === 'sourceCodeFile') {
      // Source code files - various programming file formats
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
        cb(null, true);
      } else {
        cb(new Error('Source code file must be ZIP, RAR, or programming file format!'), false);
      }
    } else {
      cb(new Error('Unknown file field!'), false);
    }
  }
});

// Legacy single file upload for backward compatibility
const legacyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'conference-papers',
    resource_type: 'raw',
    public_id: (req, file) => {
      const timestamp = Date.now();
      const filename = file.originalname.split('.')[0];
      const extension = file.originalname.split('.').pop();
      return `paper_${timestamp}_${filename}.${extension}`;
    },
  },
});

export const legacyUpload = multer({ 
  storage: legacyStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
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
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    const mimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
    const extensionAllowed = allowedExtensions.includes(fileExtension);
    
    if (mimeTypeAllowed || extensionAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and LaTeX (.tex, .latex) files are allowed!'), false);
    }
  }
});

// Create separate storage for keynote speakers (supports multiple file types)
const keynoteStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
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
      folder: folder,
      resource_type: resourceType,
      public_id: `${file.fieldname}_${Date.now()}_${file.originalname.split('.')[0]}.${file.originalname.split('.').pop()}`
    };
  }
});

// Create multer upload middleware for keynote speakers
export const keynoteUpload = multer({
  storage: keynoteStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Keynote file upload attempt:', {
      fieldname: file.fieldname,
      filename: file.originalname,
      mimetype: file.mimetype
    });
    
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
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
        cb(null, true);
      } else {
        cb(new Error('CV must be PDF, DOCX, or LaTeX format!'), false);
      }
    } else if (file.fieldname === 'photoFile') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedExts = ['.jpg', '.jpeg', '.png'];
      
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Photo must be JPG, JPEG, or PNG format!'), false);
      }
    } else if (file.fieldname === 'presentationFile') {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      const allowedExts = ['.pdf', '.ppt', '.pptx'];
      
      if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Presentation must be PDF, PPT, or PPTX format!'), false);
      }
    } else {
      cb(new Error('Unknown file field!'), false);
    }
  }
});

export default cloudinary; 
