"use strict";
(function() {
  window.addEventListener("load", init);

  function init() {
    fetchBooks();
    id("home").addEventListener("click", function() {
      id("single-book").classList.add("hidden");
      id("all-books").classList.remove("hidden");
    })
  }

  function fetchBooks() {
    fetch("/bestreads/books")
      .then(checkStatus)
      .then(response => response.json())
      .then(showBooks)
      .catch(console.error("Error"));
  }

  function showBooks(response) {
    let books = response.books;
    console.log(books);
    for (let i = 0; i < books.length; i++) {
      let book = gen("div");
      let cover = gen("img");
      cover.src = "covers/" + books[i].book_id + ".jpg";
      let title = gen("p");
      title.textContent = books[i].title;

      book.appendChild(cover);
      book.appendChild(title);
      id("all-books").appendChild(book);
    }
  }

  /**
 * Returns the element that has the ID attribute with the specified value.
 * @param {string} id - element ID
 * @return {object} DOM object associated with id.
 */
function id(id) {
  return document.getElementById(id);
}

/**
 * Returns the response's result text if successful, otherwise
 * returns the rejected Promise result with an error status and corresponding text
 * @param {Object} response - response to check for success/error
 * @return {Object} - valid response if response was successful, otherwise rejected
 *                    Promise result
 */
function checkStatus(response) {
  if (!response.ok) {
    throw Error("Error in request: " + response.statusText);
  }
  return response;
}

/**
 * This helper funtion generates a new DOM element
 * @param {string} tagName - DOM element that is to be created
 * @return {object} generated DOM object
 */
function gen(tagName) {
  return document.createElement(tagName);
}
});
