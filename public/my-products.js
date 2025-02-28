document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("productsContainer");
  
    // Retrieve logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.whatsapp) {
      alert("Please log in to view your products.");
      window.location.href = "login.html";
      return;
    }
    
    // Construct full sellerWhatsApp number (with +91)
    const sellerWhatsApp = `+91${user.whatsapp}`;
  
    // Fetch books that belong to the logged-in user
    async function fetchMyProducts() {
      try {
        // Pass sellerWhatsApp as a query parameter
        const response = await fetch(`/api/books?sellerWhatsApp=${encodeURIComponent(sellerWhatsApp)}`);
        const books = await response.json();
        renderProducts(books);
      } catch (error) {
        console.error("Error fetching products:", error);
        container.innerHTML = "<p>Error fetching your products. Please try again later.</p>";
      }
    }
  
    // Render each book in the container
    function renderProducts(books) {
      container.innerHTML = "";
      if (books.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
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
        authorName.textContent = book.author || "";
        item.appendChild(authorName);
  
        const publicationName = document.createElement("p");
        publicationName.className = "publication-name";
        publicationName.textContent = book.publication || "";
        item.appendChild(publicationName);
  
        const priceElem = document.createElement("p");
        priceElem.className = "price";
        priceElem.textContent = `Price: ₹${book.price}`;
        item.appendChild(priceElem);
  
        const soldButton = document.createElement("button");
        soldButton.className = "buy-button";
        soldButton.textContent = "Sold";
        soldButton.addEventListener("click", () => handleSold(book._id, item));
        item.appendChild(soldButton);
  
        container.appendChild(item);
      });
    }
  
    // Handle the "Sold" action for a given book
    async function handleSold(bookId, itemElement) {
      const confirmed = confirm("Are you sure you want to mark this book as sold? This will remove it from your listings.");
      if (!confirmed) return;
      
      try {
        const response = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok) {
          alert("Book marked as sold and removed.");
          // Remove the item from the DOM
          itemElement.remove();
        } else {
          alert(result.message || "Failed to mark as sold.");
        }
      } catch (error) {
        console.error("Error marking as sold:", error);
        alert("Error marking as sold. Please try again later.");
      }
    }
  
    // Initial fetch
    fetchMyProducts();
  });
  