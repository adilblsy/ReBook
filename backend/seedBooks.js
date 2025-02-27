// seedBooks.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Import your Book model (ensure the path is correct)
const Book = require("./models/book");

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to database");
  seedBooks();
})
.catch(err => console.error("MongoDB connection error:", err));

// Array of book objects with the new 'subject' field
const booksData = [
  {
    name: "Engineering Chemistry",
    department: "Chemistry",
    subject: "Chemistry",
    semester: 1,
    author: "John Doe",
    publication: "XYZ Publishers",
    price: 100,
    image: "images/chemistry.webp",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Computer Organization & Architecture",
    department: "Computer Science",
    subject: "Computer Science",
    semester: 3,
    author: "Jane Smith",
    publication: "ABC Publishers",
    price: 100,
    image: "images/coa.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "C Programming",
    department: "Computer Science",
    subject: "Programming",
    semester: 2,
    author: "Mark Twain",
    publication: "Penguin",
    price: 150,
    image: "images/cp.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Java",
    department: "Computer Science",
    subject: "Programming",
    semester: 4,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/java.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Engineering Mechanics",
    department: "Mechanical Engineering",
    subject: "Mechanics",
    semester: 3,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/mechanics.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Mechanics of Solids",
    department: "Mechanical Engineering",
    subject: "Mechanics",
    semester: 4,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/mos.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Engineering Physics",
    department: "Physics",
    subject: "Physics",
    semester: 2,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/physics.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Programming in Python",
    department: "Computer Science",
    subject: "Programming",
    semester: 5,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/python.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "System Software",
    department: "Computer Science",
    subject: "Computer Science",
    semester: 6,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/ss.jpg",
    sellerWhatsApp: "+1234567890"
  },
  {
    name: "Thermo Dynamics",
    department: "Mechanical Engineering",
    subject: "Thermodynamics",
    semester: 3,
    author: "Agatha Christie",
    publication: "HarperCollins",
    price: 180,
    image: "images/td.jpg",
    sellerWhatsApp: "+1234567890"
  }
];

async function seedBooks() {
  try {
    // Insert the array of books into the database
    await Book.insertMany(booksData);
    console.log("Books inserted successfully!");
  } catch (error) {
    console.error("Error inserting books:", error);
  } finally {
    // Close the database connection when done
    mongoose.connection.close();
  }
}
