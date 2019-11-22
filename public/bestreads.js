/*
 * Michael Graham
 * 11/22/19
 * Section AL - Tal Wolman
 * HW4
 *
 * This javascript provides client-side interactivity to bestreads.html, a wevsite that
 * provides information on a library of books
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * This function initializes the website by calling for the book container too be filled. It
   * also applys an event listener for when the Home button in clicked
   */
  function init() {
    fetchBooks();
    id("home").addEventListener("click", function() {
      id("single-book").classList.add("hidden");
      id("all-books").classList.remove("hidden");
    })
  }

  /**
   * This function fetches information on all books known to the Bestreads API so the book
   * container can be filled
   */
  function fetchBooks() {
    fetch("/bestreads/books")
      .then(checkStatus)
      .then(response => response.json())
      .then(showBooks)
      .catch(handleError);
  }

  /**
   * This function displays all books contained in the passed-in json object to the book
   * container
   * @param {Object} response - JSON object containing information on all books in the
   * Bestreads API
   */
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
      book.appendChild(cover);
      book.appendChild(title);
      id("all-books").appendChild(book);
    }
  }

  /**
   * This function fetches the information needed to display the book corresponding to
   * the passed-in book id to the book container
   * @param {String} book - ID of the selected book. IDs are all lower-case with no spaces
   */
  function fillContainer(book) {
    fetchInfo(book);
    fetchDesc(book);
    fetchReviews(book);
  }

  /**
   * This function fetches title and author information on the passed-in book from the
   * Bestreads API
   * @param {String} book - ID of the book being looked-up
   */
  function fetchInfo(book) {
    fetch("/bestreads/info/" + book)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(showInfo)
      .catch(handleError);
  }

  /**
   * This function manipulates the DOM to display the book information contained in the
   * passed-in JSON object
   * @param {Object} response - JSON object containing title and author information of a book
   */
  function showInfo(response) {
    id("book-title").textContent = response.title;
    id("book-author").textContent = response.author;
  }

  /**
   * This function fetches the description of the passed-in book from the Bestreads API
   * @param {String} book - ID of the book being looked-up
   */
  function fetchDesc(book) {
    fetch("/bestreads/description/" + book)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(showDesc)
      .catch(handleError);
  }

  /**
   * This function manipulates the DOM to display the description of a book contained in the
   * passed-in response
   * @param {Text} response - Description of a book
   */
  function showDesc(response) {
    id("book-description").textContent = response;
  }

  /**
   * This functon fetches the reviews for the passed-in book
   * @param {String} book - ID of the book being looked-up
   */
  function fetchReviews(book) {
    fetch("/bestreads/reviews/" + book)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processReviews)
      .catch(handleError);
  }

  /**
   * This function processes the reviews contained in the passed-in JSON object. It manipulates
   * the DOM to display this information, as well as calculates and displayes the average rating
   * of the book
   * @param {Object} response - JSON object containing all the reviews on a book
   */
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

/**
 * Manipulates the DOM appropriately when there is an error in a fetch request to the API by
 * hiding all book data and displaying an error message
 * @param {Object} response - Response object from the fetch request
 *
 */
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
