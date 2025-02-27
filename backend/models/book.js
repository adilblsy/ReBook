const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    author: { type: String, required: true },
    publication: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String, required: true }, // Store image URL or path
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
