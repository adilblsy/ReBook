const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    subject:{type: String ,required:true },
    author: { type: String },
    publication: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Ensure consistency with API
    sellerWhatsApp: { type: String, required: true }, // Storing WhatsApp number instead of user ID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);

