document.addEventListener("DOMContentLoaded", function () {
    // Default sort order: descending (highest price first)
    let sortOrder = "desc";
  
    // Get references to filter dropdowns and sort toggle elements
    const departmentSelect = document.getElementById("department");
    const semesterSelect = document.getElementById("semester");
    const subjectSelect = document.getElementById("subject");
    const sortToggle = document.getElementById("sortToggle");
    const sortIcon = document.getElementById("sortIcon");
  
    // Container where books will be rendered
    const container = document.querySelector(".main-container");
  
    // Function to fetch books from the backend using filters and sort order
    async function fetchBooks() {
      // Retrieve current filter values
      const department = departmentSelect.value;
      const semester = semesterSelect.value;
      const subject = subjectSelect.value;
  
      // Build URL query parameters
      const params = new URLSearchParams();
      if (department) params.append("department", department);
      if (semester) params.append("semester", semester);
      if (subject) params.append("subject", subject);
      // Append sorting parameters for price
      params.append("sort", "price");
      params.append("order", sortOrder);
  
      try {
        // Fetch books from your backend endpoint
        const response = await fetch(`/api/books?${params.toString()}`);
        const books = await response.json();
        renderBooks(books);
      } catch (error) {
        console.error("Error fetching books:", error);
        container.innerHTML = "<p>Error fetching books. Please try again later.</p>";
      }
    }
  
    // Function to render books in the main container, preserving your layout
    function renderBooks(books) {
      container.innerHTML = ""; // Clear any existing content
  
      if (books.length === 0) {
        container.innerHTML = "<p>No books found matching the criteria.</p>";
        return;
      }
  
      books.forEach(book => {
        // Create the item container for each book
        const item = document.createElement("div");
        item.className = "item";
  
        // Create and append the overlay image (wishlist icon)
        const overlayImg = document.createElement("img");
        overlayImg.className = "overlay-image";
        overlayImg.src = "images/noheart.png";
        overlayImg.alt = "Add to Wishlist";
        // Optionally, add an event listener for wishlist toggling here
        item.appendChild(overlayImg);
  
        // Create and append the main book image
        const bookImg = document.createElement("img");
        bookImg.src = book.image;
        bookImg.alt = "Book Image";
        item.appendChild(bookImg);
  
        // Create and append the book name element
        const bookName = document.createElement("h3");
        bookName.className = "book-name";
        bookName.textContent = book.name;
        item.appendChild(bookName);
  
        // Create and append the author name element
        const authorName = document.createElement("p");
        authorName.className = "author-name";
        authorName.textContent = book.author;
        item.appendChild(authorName);
  
        // Create and append the publication name element
        const publicationName = document.createElement("p");
        publicationName.className = "publication-name";
        publicationName.textContent = book.publication;
        item.appendChild(publicationName);
  
        // Create and append the price element
        const price = document.createElement("p");
        price.className = "price";
        price.textContent = `Price: ₹${book.price}`;
        item.appendChild(price);
  
        // Create and append the "Buy" button
        const buyButton = document.createElement("button");
        buyButton.className = "buy-button";
        buyButton.textContent = "Buy";
        buyButton.addEventListener("click", function () {
          // Open a WhatsApp chat with the seller's number
          window.open(`https://wa.me/${book.sellerWhatsApp}`, "_blank");
        });
        item.appendChild(buyButton);
  
        // Append the complete item to the main container
        container.appendChild(item);
      });
    }
  
    // Add event listeners to filter dropdowns to trigger new fetches when changed
    departmentSelect.addEventListener("change", fetchBooks);
    semesterSelect.addEventListener("change", fetchBooks);
    subjectSelect.addEventListener("change", fetchBooks);
  
    // Add event listener to sort toggle for toggling sort order and updating the icon
    sortToggle.addEventListener("click", function () {
      // Toggle sort order between "asc" and "desc"
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
      // Update sort icon image accordingly
      sortIcon.src = sortOrder === "asc" ? "images/asc.png" : "images/desc.png";
      fetchBooks();
    });
  
    // Initial fetch of books when page loads
    fetchBooks();
  });
  