document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------
  // BOOK FETCH & RENDER FUNCTIONALITY
  // -------------------------------
  let sortOrder = "desc";
  
  const departmentSelect = document.getElementById("department");
  const semesterSelect = document.getElementById("semester");
  const subjectSelect = document.getElementById("subject");
  const sortToggle = document.getElementById("sortToggle");
  const sortIcon = document.getElementById("sortIcon");
  const container = document.querySelector(".main-container");
  
  async function fetchBooks() {
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    const subject = subjectSelect.value;
    
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (semester) params.append("semester", semester);
    if (subject) params.append("subject", subject);
    params.append("sort", "price");
    params.append("order", sortOrder);
    
    try {
      const response = await fetch(`/api/books?${params.toString()}`);
      const books = await response.json();
      renderBooks(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      container.innerHTML = "<p>Error fetching books. Please try again later.</p>";
    }
  }
  
  function renderBooks(books) {
    container.innerHTML = "";
    if (books.length === 0) {
      container.innerHTML = "<p>No books found matching the criteria.</p>";
      return;
    }
    books.forEach(book => {
      const item = document.createElement("div");
      item.className = "item";
      
      const bookImg = document.createElement("img");
      bookImg.src = book.image;
      bookImg.alt = "Book Image";
      item.appendChild(bookImg);
      
      const bookName = document.createElement("h3");
      bookName.className = "book-name";
      bookName.textContent = book.name;
      item.appendChild(bookName);
      
      const authorName = document.createElement("p");
      authorName.className = "author-name";
      authorName.textContent = book.author;
      item.appendChild(authorName);
      
      const publicationName = document.createElement("p");
      publicationName.className = "publication-name";
      publicationName.textContent = book.publication;
      item.appendChild(publicationName);
      
      const priceElem = document.createElement("p");
      priceElem.className = "price";
      priceElem.textContent = `Price: ₹${book.price}`;
      item.appendChild(priceElem);
      
      const buyButton = document.createElement("button");
      buyButton.className = "buy-button";
      buyButton.textContent = "Buy";
      buyButton.addEventListener("click", function () {
        window.open(`https://wa.me/${book.sellerWhatsApp}`, "_blank");
      });
      item.appendChild(buyButton);
      
      container.appendChild(item);
    });
  }
  
  departmentSelect.addEventListener("change", fetchBooks);
  semesterSelect.addEventListener("change", fetchBooks);
  subjectSelect.addEventListener("change", fetchBooks);
  
  sortToggle.addEventListener("click", function () {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
    sortIcon.src = sortOrder === "asc" ? "images/asc.png" : "images/desc.png";
    fetchBooks();
  });
  
  // Initial fetch of books
  fetchBooks();
  
  // -------------------------------
  // FILE INPUT LABEL HANDLING
  // -------------------------------
  const inputFile = document.getElementById("inputFile");
  const fileLabel = document.querySelector(".file-label");
  
  inputFile.addEventListener("change", function () {
    if (this.files.length > 0) {
      const fileName = this.files[0].name;
      fileLabel.textContent = fileName;
      fileLabel.style.color = "darkviolet";
      fileLabel.style.fontWeight = "normal";
    } else {
      fileLabel.textContent = "Choose File";
    }
  });
  
  // -------------------------------
  // SELL FORM SUBMISSION HANDLER
  // -------------------------------
  const sellForm = document.querySelector("#sell-popup form");
  sellForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    // Collect sell form values
    const department = document.getElementById("sell-department").value;
    const semester = parseInt(document.getElementById("sell-semester").value);
    const subject = document.getElementById("sell-subject").value;
    const name = document.getElementById("book-name").value;
    const author = document.getElementById("author").value;
    const publication = document.getElementById("publication").value;
    const price = parseFloat(document.getElementById("price").value);
    
    const fileInput = document.getElementById("inputFile");
    let image = "";
    if (fileInput.files.length > 0) {
      image = "images/" + fileInput.files[0].name;
    } else {
      image = "images/default.png"; // Optional default image if none selected
    }
    
    // Get the logged-in user data (assumed to be stored in localStorage)
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.whatsapp) {
      alert("Please log in to sell a book.");
      return;
    }
    const sellerWhatsApp = `+91${user.whatsapp}`;
    
    // Prepare the data object with consistent field names
    const bookData = {
      name,
      department,
      semester,
      subject,
      image,
      price,
      author,
      publication,
      sellerWhatsApp,
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Book listed successfully!");
        sellForm.reset();
      } else {
        alert(result.message || "Failed to list book.");
      }
    } catch (error) {
      console.error("Error listing book:", error);
      alert("Error listing book. Please try again later.");
    }
  });
});
