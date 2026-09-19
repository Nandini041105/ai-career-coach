import multer from 'multer';

// Use memory storage so we can stream PDF buffer directly to pdf-parse
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are supported.'), false);
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
}).single('resume');
