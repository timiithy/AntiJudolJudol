const multer = require('multer');
const path = require('path');

// Simpan file sementara di folder uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Nama file: timestamp-namaasli.csv
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter cuma file .csv
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV yang diizinkan!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;