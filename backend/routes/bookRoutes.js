const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Book = require("../models/book");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploads

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: Fetch books with optional filtering & sorting
router.get("/", async (req, res) => {
  try {
    const { department, semester, subject, sort, order, sellerWhatsApp } =
      req.query;
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;
    if (sellerWhatsApp) query.sellerWhatsApp = sellerWhatsApp;

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    if (sort) {
      sortOptions[sort] = sortOrder;
    }

    const books = await Book.find(query).sort(sortOptions);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// POST: Add a new book (sell form connection)
router.post("/", upload.single("image"), async (req, res) => {
  const {
    name,
    department,
    semester,
    subject,
    price,
    author,
    publication,
    sellerWhatsApp,
  } = req.body;

  // Validate all required fields
  if (
    !name ||
    !department ||
    !semester ||
    !subject ||
    !price ||
    !author ||
    !publication ||
    !sellerWhatsApp ||
    !req.file
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Create a new book with the Cloudinary image URL
    const book = new Book({
      name,
      department,
      semester,
      subject,
      image: result.secure_url, // Store Cloudinary URL
      price,
      author,
      publication,
      sellerWhatsApp,
    });

    await book.save();
    res.status(201).json({ message: "Book added successfully" });
  } catch (err) {
    console.error("Error uploading image or saving book:", err);
    res.status(500).json({ message: "Error adding book" });
  }
});

// DELETE: Remove a book by ID
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting book" });
  }
});

module.exports = router;