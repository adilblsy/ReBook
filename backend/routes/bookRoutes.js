const express = require("express");
const Book = require("../models/book");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { department, semester, subject, sort, order } = req.query;
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;

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


// Add a new book
router.post("/", async (req, res) => {
  const {
    name,
    department,
    semester,
    subject,
    image,
    price,
    author,
    publication,
    seller,
  } = req.body;

  if (
    !name ||
    !department ||
    !semester ||
    !subject ||
    !image ||
    !price ||
    !author ||
    !publication ||
    !seller
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const book = new Book({
    name,
    department,
    semester,
    subject,
    image,
    price,
    author,
    publication,
    seller,
  });

  try {
    await book.save();
    res.status(201).json({ message: "Book added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding book" });
  }
});


// Delete a book
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
