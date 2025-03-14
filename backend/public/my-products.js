document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("productsContainer");

  // Dynamically create the custom alert popup
  const popup = document.createElement("div");
  popup.id = "customAlertPopup";
  popup.className = "popup-modal";

  const popupContent = document.createElement("div");
  popupContent.className = "popup-content";

  const closeBtn = document.createElement("span");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "&times;";

  const popupTitle = document.createElement("h2");
  popupTitle.id = "customAlertTitle";

  const popupMessage = document.createElement("p");
  popupMessage.id = "customAlertMessage";

  const confirmBtn = document.createElement("button");
  confirmBtn.id = "customAlertConfirmBtn";
  confirmBtn.textContent = "OK";

  // Append elements to the popup content
  popupContent.appendChild(closeBtn);
  popupContent.appendChild(popupTitle);
  popupContent.appendChild(popupMessage);
  popupContent.appendChild(confirmBtn);

  // Append the popup content to the popup container
  popup.appendChild(popupContent);

  // Append the popup to the body
  document.body.appendChild(popup);

  // Function to show the custom alert popup
  function showCustomAlert(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.style.display = "flex";
  }

  // Function to hide the custom alert popup
  function hideCustomAlert() {
    popup.style.display = "none";
  }

  // Event listeners for closing the popup
  closeBtn.addEventListener("click", hideCustomAlert);
  confirmBtn.addEventListener("click", hideCustomAlert);

  // Close the popup if the user clicks outside the modal
  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      hideCustomAlert();
    }
  });

  // Retrieve logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.whatsapp) {
    showCustomAlert("Error", "Please log in to view your products.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000); // Redirect after 2 seconds
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

    books.forEach((book) => {
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
    showCustomAlert("Confirm", "Are you sure you want to mark this book as sold? This will remove it from your listings.");
    
    // Wait for user confirmation
    confirmBtn.addEventListener("click", async () => {
      try {
        const response = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok) {
          showCustomAlert("Success", "Book marked as sold and removed.");
          // Remove the item from the DOM
          itemElement.remove();
        } else {
          showCustomAlert("Error", result.message || "Failed to mark as sold.");
        }
      } catch (error) {
        console.error("Error marking as sold:", error);
        showCustomAlert("Error", "Error marking as sold. Please try again later.");
      }
    });
  }

  // Initial fetch
  fetchMyProducts();
});