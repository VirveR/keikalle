const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images/profileimages/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
  // Create the multer instance
  const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, callback) {
      checkFileType(req, file, callback);
    }
  });

function checkFileType(req, file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
  return cb(null, true);
  } else {
    req.fileValidationError = 'vain jpg, jpeg, png tai gif tiedostomuodot ovat sallittu';
  return cb(null, false, req.fileValidationError);
  }
}
  
  module.exports = upload;