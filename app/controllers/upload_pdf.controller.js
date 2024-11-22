const multer = require("multer");
const path = require("path");
const fs = require("fs");
const RESPONSE = require("../constants/response");
const { StatusCode } = require("../constants/HttpStatusCode");

// const PDF_UPLOAD_DIR = process.env.PDF_UPLOAD_DIR || "uploads/pdfs/";

// Configure multer storage for PDF files
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/pdfs/"); // Configurable upload path for PDFs
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer setup for handling PDF uploads
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only PDF files are allowed!"));
    }
  },
}).single("uploadPdf"); // 'uploadPdf' is the form field name

// API for uploading PDFs
exports.uploadPdf = (req, res) => {
  uploadPdf(req, res, (err) => {
    if (err) {
      RESPONSE.Failure.Message = `File upload failed: ${err.message}`;
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }
    if (!req.file) {
      RESPONSE.Failure.Message = "No file uploaded!";
      RESPONSE.Failure.data = {};
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // const fullUrl = `${req.protocol}://${req.get("host")}/${PDF_UPLOAD_DIR}${req.file.filename}`;
    RESPONSE.Success.Message = "PDF file uploaded successfully!";
    RESPONSE.Success.data = { pdfUrl: `${req.file.filename}` };

    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  });
};

exports.downloadPdf = (req, res) => {
  const { filename } = req.params;

  // Construct the local path to the file using path.join
//   const filePath = path.join(__dirname, "../../uploads/pdfs", filename);
const filePath = path.join(__dirname, "..","..", "uploads", "pdfs", filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      return res
        .status(404)
        .json({ message: "File not found or could not be downloaded." });
    }

    // If file exists, send the file for download
    //   res.sendFile(filePath, (err) => {
    //     if (err) {
    //       console.error("Error sending the file:", err);
    //       return res.status(404).json({ message: "File not found or could not be downloaded." });
    //     }
    //   });

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error sending the file:", err);
        return res.status(500).json({ message: "Error downloading the file." });
      }
    });
  });
};
