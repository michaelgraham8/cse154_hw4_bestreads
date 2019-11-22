/*
 * Michael Graham
 * 11/22/19
 * Section AL - Tal Wolman
 * HW4
 *
 * This API provides information on a selection of books.
 * The API supports four endpoints, three of which can send both 400 and 500 error status codes
 * The fourth endpoint only supports 500 error codes
 *
 * **Endpoints**
 * /bestreads/description/:book_id
 * Provides a description of the book corresponding to book_id
 * Response type: text
 * This endpoint can send errors with 400 or 500 status codes
 *
 * /bestreads/info/:book_id
 * Provides title and author information on the book corresponding to the book_id
 * Response type: JSON
 * This endpoint can send errors with 400 or 500 status codes
 *
 * /bestreads/reviews/:book_id
 * Provides a JSON object containing all reviews of the book corresponding to book_id
 * Response type: JSON
 * This endpoint can send errors with 400 or 500 status codes
 *
 * /bestreads/books
 * Provides a JSON object containing title and id information on all books known to the API
 * Response type: JSON
 * This endpoint only supports errors with 500 status codes
 *
 */

"use strict";

const util = require('util');
const express = require('express');
const fs = require('fs').promises;
const glob = require("glob");

const globPromise = util.promisify(glob);
const app = express();

const INVALID_REQUEST = 400;
const INTERNAL_ERROR = 500;

/*
 * This endpoint provides a description of the book corresponding to book_id.
 * Response type is text
 */
app.get('/bestreads/description/:book_id', async (req, res) => {
  let book = req.params['book_id'].toLowerCase();
  try {
    let path = "books/" + book + "/description.txt";
    let content = await readFileAsync(path);
    res.type('text');
    if (content === INVALID_REQUEST) {
      res.status(INVALID_REQUEST).send("No results found for " + book);
    } else {
      res.send(content);
    }
  } catch (err) {
    res.type("text");
    res.status(INTERNAL_ERROR).send("Something went wrong on the server, try again later.");
  }
});

/*
 * This endpoint provides title and author information on the book corresponding to the book_id
 * Response type is JSON
 */
app.get('/bestreads/info/:book_id', async (req, res) => {
  let book = req.params['book_id'].toLowerCase();
  try {
    let path = "books/" + book + "/info.txt";
    let content = await getInfo(path);
    if (content === INVALID_REQUEST) {
      res.type("text");
      res.status(INVALID_REQUEST).send("No results found for " + book);
    } else {
      res.json(content);
    }
  } catch (err) {
    res.type("text");
    res.status(INTERNAL_ERROR).send("Something went wrong on the server, try again later.");
  }
});

/*
 * This endpoint provides a JSON object containing all reviews of the book corresponding to book_id
 * Response type is JSON
 */
app.get('/bestreads/reviews/:book_id', async (req, res) => {
  let book = req.params['book_id'].toLowerCase();
  let paths;
  let reviews = [];
  try {
    paths = await globPromise("books/" + book + "/review*.txt");
    if (paths.length === 0) {
      res.type("text");
      res.status(INVALID_REQUEST).send("No results found for " + book);
    } else {
      for (let i = 0; i < paths.length; i++) {
        let review = await buildReview(paths[i]);
        reviews.push(review);
      }
      res.json(reviews);
    }
  } catch (err) {
    res.type("text");
    res.status(INTERNAL_ERROR).send("Something went wrong on the server, try again later.");
  }
});

/*
 * This endpoint provides a JSON object containing title and id information on all books
 * known to the API
 * Response type is JSON
 */
app.get('/bestreads/books', async (req, res) => {
  try {
    let result = [];
    let books = await fs.readdir("books/");
    let titles = [];

    for (let i = 0; i < books.length; i++) {
      titles.push(await getTitle(books[i]));
    }
    for (let i = 0; i < books.length - 1; i++) {
      result.push({"title": titles[i], "book_id": books[i]},);
    }

    result.push({"title": titles[(titles.length - 1)], "book_id": books[(books.length - 1)]});

    let newJson = {"books": result};
    res.json(newJson);
  } catch (err) {
    res.type("text");
    res.status(INTERNAL_ERROR).send("Something went wrong on the server, try again later");
  }
});

/**
 * This function splits the passed-in text by line, returning an array with each element
 * being a separate line
 * @param {Text} data - Text data being split-up
 * @return {Array} Array with each element being a separate line
 */
function splitLines(data) {
  return data.split("\n");
}

/**
 * This function gets a books title given its book_id
 * @param {String} id - ID of the book thats title is being found
 * @return {String} title - title of the passed-in book
 */
async function getTitle(id) {
  let path = "books/" + id + "/info.txt";
  let info = await readFileAsync(path);
  let title = splitLines(info)[0];
  return title;
}

/**
 * This function reads the passed-in file asyncronously, returning a Promise value
 * @param {String} path - Directory path of the file being read
 * @return {Text} Value of the resolved promise object
 */
async function readFileAsync(path) {
  try {
    let content = await fs.readFile(path, 'utf8');
    return content;
  } catch (error) {
    if (error.code === "ENOENT") {
      return INVALID_REQUEST;
    }
  }
}

/**
 * This function builds a JSON object containing the info read from the passed-in directory path
 * @param {String} path - Directory path of a books info.txt file
 * @return {Object} jsonInfo - JSON object with title and author information of a book
 */
async function getInfo(path) {
  let info = await readFileAsync(path);
  if (info === INVALID_REQUEST) {
    return info;
  } else {
    let lines = splitLines(info);

    let title = lines[0];
    let author = lines[1];

    let jsonInfo = {
      "title": title,
      "author": author
    };
    return jsonInfo;
  }
}

/**
 * This function builds a JSON object containing the data of a single book review
 * @param {String} path - Directory path of a books review file
 * @return {Object} newJson - JSON object containing the name, rating, and text information
 * of a single book review
 */
async function buildReview(path) {
  let review = await readFileAsync(path);
  if (review === INVALID_REQUEST) {
    return review;
  }
    let lines = splitLines(review);

    let name = lines[0];
    let rating = lines[1];
    let text = lines[2];

    let newJson = {
      "name": name,
      "rating": rating,
      "text": text
    };

    return newJson;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
