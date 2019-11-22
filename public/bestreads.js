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
      .catch(handleError);
  }

  function showBooks(response) {
    let books = response.books;
    for (let i = 0; i < books.length; i++) {
      let book = gen("div");
      let cover = gen("img");
      cover.src = "covers/" + books[i].book_id + ".jpg";
      let title = gen("p");
      title.textContent = books[i].title;

      book.classList.add("selectable");
      cover.classList.add("selectable");
      title.classList.add("selectable");

      book.addEventListener("click", function() {
        id("all-books").classList.add("hidden");
        id("single-book").classList.remove("hidden");
        fillContainer(books[i].book_id);
      });
      // cover.addEventListener("click", function() {
      //   id("all-books").classList.add("hidden");
      //   id("single-book").classList.remove("hidden");
      //   fillContainer(books[i].book_id);
      // });
      // title.addEventListener("click", function() {
      //   id("all-books").classList.add("hidden");
      //   id("single-book").classList.remove("hidden");
      //   fillContainer(books[i].book_id);
      // });

      book.appendChild(cover);
      book.appendChild(title);
      id("all-books").appendChild(book);
    }
  }

  function fillContainer(book) {
    fetchInfo(book);
    fetchDesc(book);
    fetchReviews(book);
  }

  function fetchInfo(book) {
    fetch("/bestreads/info/" + book)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(showInfo)
      .catch(handleError);
  }

  function showInfo(response) {
    id("book-title").textContent = response.title;
    id("book-author").textContent = response.author;
  }

  function fetchDesc(book) {
    fetch("/bestreads/description/" + book)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(showDesc)
      .catch(handleError);
  }

  function showDesc(response) {
    id("book-description").textContent = response;
  }

  function fetchReviews(book) {
    fetch("/bestreads/reviews/" + book)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processReviews)
      .catch(handleError);
  }

  function processReviews(response) {
    let avgRating = 0;
    let count = 0;
    for (let i = 0; i < response.length; i++) {
      let reviewer = gen("h3");
      reviewer.textContent = response[i].name;
      let rating = gen("h4");
      rating.textContent = "Rating: " + response[i].rating;
      let review = gen("p");
      review.textContent = response[i].text;

      id("book-reviews").appendChild(reviewer);
      id("book-reviews").appendChild(rating);
      id("book-reviews").appendChild(review);

      avgRating += parseFloat(response[i].rating);
      count ++;
    }
    avgRating = (avgRating / count);
    avgRating = avgRating.toFixed(1);
    id("book-rating").textContent = "" + avgRating;
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

function handleError(response) {
  id("book-data").classList.add("hidden");
  id("error-text").classList.remove("hidden");
  id("home").disabled = true;
}

/**
 * This helper funtion generates a new DOM element
 * @param {string} tagName - DOM element that is to be created
 * @return {object} generated DOM object
 */
function gen(tagName) {
  return document.createElement(tagName);
}
})();
