const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, required: true },
    author: { type: String },
    publication: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    sellerWhatsApp: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
