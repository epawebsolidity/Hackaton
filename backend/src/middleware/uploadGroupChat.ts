import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/imagesGroup/"); 
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();

    const safeName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-") 
      .replace(/[^a-z0-9.-]/g, ""); 

    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

export default upload; 
