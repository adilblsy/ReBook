
# ReBook

**ReBook** is a buy-and-sell platform designed exclusively for our college students to exchange used academic books securely and affordably. By enabling students to resell their semester books, the platform reduces financial strain, minimizes waste, and promotes sustainable consumption.
---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack & Tools](#technology-stack--tools)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Progress & Future Improvements](#progress--future-improvements)
- [Team](#team)
- [License](#license)

---

## Overview

In many colleges, students purchase textbooks for each semester but often find themselves with unused copies after the term ends. This leads to high costs, resource wastage, and difficulty in finding affordable second-hand books. **ReBook** addresses these issues by providing a dedicated platform for college students to buy and sell used textbooks within their own campus community.

Key goals include:
- Reducing the financial burden of purchasing new books.
- Promoting resource reuse and sustainability.
- Creating a secure, user-friendly, and college-specific marketplace.

---

## Features

- **User Authentication & Verification**
  - Registration with college email validation (only college emails allowed).
  - Password validation (minimum 8 characters).
  - OTP-based email verification ensuring only verified college students can access the platform.
  - Secure login using JWT tokens stored in localStorage.
  - Logout functionality that clears localStorage to prevent unauthorized access.

- **Book Listings & Management**
  - Dedicated book exchange for academic textbooks.
  - Sellers can list books by providing details such as name, department, semester, subject, author, publication, price, and seller’s WhatsApp number.
  - Buyers can filter books by department, semester, and subject (populated dynamically from the database).
  - Sorting of books by price (ascending/descending).
  - "Buy" button opens WhatsApp with a prefilled message including the book name.
  - "My Products" page displays only the books posted by the logged-in user.
  - Sellers can mark books as sold, which removes them from active listings.

- **Secure & Simple Interface**
  - Responsive frontend built with HTML, CSS, and JavaScript.
  - Intuitive navigation and minimalistic design to enhance user experience.
  - Offline exchanges arranged face-to-face within the college for added security and trust.

---

## Technology Stack & Tools

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB (using Mongoose)
- **Authentication & Security:** JWT, bcrypt, OTP email verification (Nodemailer)
- **Client-Side Storage:** localStorage for session management

---

## Project Structure

```
ReBook/
├── public/
│   ├── index.html          # Landing page with login and signup options
│   ├── home.html           # Main page for browsing and selling books
│   ├── my-products.html    # User dashboard for listed books
│   ├── login.html          # User login page
│   ├── register.html       # User registration page
│   ├── otp.html            # OTP verification page
│   ├── home.css            # Global styles for the application
│   ├── index.css           # Styles specific to the index page
│   ├── home.js             # JavaScript for home page functionality
│   └── auth.js             # Client-side authentication check script
├── models/
│   ├── book.js             # Mongoose schema for book listings
│   └── user.js             # Mongoose schema for user accounts
├── routes/
│   ├── authRoutes.js       # Routes for user authentication and OTP verification
│   └── bookRoutes.js       # Routes for managing book listings (add, fetch, delete)
├── server.js               # Main server file (Express configuration, MongoDB connection)
├── .env                    # Environment variables (MONGO_URI, EMAIL_USER, EMAIL_PASS, JWT_SECRET, etc.)
└── README.md               # This file
```

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v12 or higher recommended)
- [MongoDB](https://www.mongodb.com/) instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- An email account (e.g., Gmail) for OTP verification (set up `EMAIL_USER` and `EMAIL_PASS`)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/ReBook.git
   cd ReBook
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following content (adjust values as needed):

   ```env
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. **Run the application:**

   ```bash
   npm start
   ```

   Alternatively, if you have nodemon installed:

   ```bash
   nodemon server.js
   ```

5. **Access the application:**

   Open your browser and navigate to `http://localhost:5000`.

---

## Usage

1. **User Registration & OTP Verification:**
   - Register using a valid college email.
   - After registration, check your email for a 6-digit OTP.
   - Enter the OTP on the verification page to activate your account.

2. **Login:**
   - Log in with your credentials. The application will store a JWT token in localStorage.
   - Protected pages redirect to the login page if the token is missing or invalid.

3. **Book Listings:**
   - Browse available textbooks on the home page.
   - Use the filtering options (department, semester, subject) and sort by price.
   - Click "Sell Books" to open the sell form, fill in the book details, and list your book.
   - View your own listings on the "My Products" page and mark books as sold when they’re no longer available.

4. **Contacting Sellers:**
   - Buyers can click the "Buy" button on a listing to open WhatsApp with a prefilled message containing the book name.

5. **Logout:**
   - Clicking the "Logout" link clears all localStorage data, ensuring that users must log in again to access protected pages.

---

## Progress & Future Improvements

### Progress So Far
- **Frontend:** 75% completed. The UI is responsive and user-friendly.
- **Backend:** Approximately 90% completed. Core functionalities such as user authentication, OTP verification, and book listings are implemented.
- **Database Integration:** Fully integrated with MongoDB.
- **Prototype:** The final prototype is functional on localhost and has undergone performance and bug testing.

### Future Improvements
- Enhance backend stability and complete final debugging.
- Further improve UI/UX based on user feedback.
- Consider deploying the application on a cloud platform.
- Implement advanced security features and user role management if needed.

---

## Team

**Team Promptzee**

- Muhammad Shuhaibh
- Muhammed Adhil P P
- Nadha K M

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```

Feel free to modify any sections as necessary to match your project's latest details and style.