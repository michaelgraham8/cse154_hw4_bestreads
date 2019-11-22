"use strict";

const util = require('util');
const express = require('express');
const fs = require('fs').promises;
const glob = require("glob");

const globPromise = util.promisify(glob);
const app = express();

const INVALID_REQUEST = 400;

app.use(express.static('public'));

//Endpoints
app.get('/bestreads/description/:book_id', async (req,res) => {
  let book = req.params['book_id'].toLowerCase();
  try {
    let path = "books/" + book + "/description.txt"
    let content = await readFileAsync(path);
    res.type('text');
    res.send(content);
  } catch (err) {
    res.type("text");
    res.status(INVALID_REQUEST).send("(1) No results found for " + book)
  }
});

app.get('/bestreads/info/:book_id', async (req, res) => {
  let book = req.params['book_id'].toLowerCase();
  try {
    let path = "books/" + book + "/info.txt";
    let content = await getInfo(path);
    res.json(content);
  } catch (err) {
    res.type("text");
    res.status(INVALID_REQUEST).send("(2) No results found for " + req.params['book_id']);
  }
});

app.get('/bestreads/reviews/:book_id', async (req, res) => {
  let book = req.params['book_id'].toLowerCase();
  let paths;
  let reviews = [];
  try {
    paths = await globPromise("books/" + book + "/review*.txt");
    for (let i = 0; i < paths.length; i++) {
      let review = await buildReview(paths[i]);
      reviews.push(review);
      console.log(reviews[i]);
    }
    res.json(reviews);
  } catch (err) {
    res.type("text");
    res.status(INVALID_REQUEST).send("(3) No results found for " + req.params['book_id']);
  }
});

app.get('/bestreads/books', async (req, res) => {
  try {
    let result = [];
    let books = await fs.readdir("books/");
    let titles = []

    for (let i = 0; i < books.length; i++) {
      titles.push(await getTitle(books[i]));
    }
    for (let i = 0; i < books.length - 1; i++) {
      result.push({"title": titles[i],"book_id": books[i]},);
    }

    result.push({"title": titles[(titles.length - 1)],"book_id": books[(books.length - 1)]});

    let newJson = {"books": result};
    res.json(newJson);
  } catch (err) {
    res.type("text");
    res.status(INVALID_REQUEST).send("(4) No results found");
  }
});

function splitLines(data) {
  return data.split("\n");
}

async function getTitle(id) {
  let path = "books/" + id + "/info.txt";
  let info = await readFileAsync(path);
  let title = splitLines(info)[0];
  return title;
}

//Functions
async function readFileAsync(path) {
  try {
    let content = await fs.readFile(path, 'utf8');
    return content;
  } catch (error) {
    console.error(error);
  }
}

async function getInfo(path) {
  let info = await readFileAsync(path);
  let lines = info.split("\n");

  let title = lines[0];
  let author = lines[1];

  let jsonInfo = {
    "title": title,
    "author": author
  }
  return jsonInfo;
}

async function buildReview(path) {
  let review = await readFileAsync(path);
  let lines = review.split("\n");

  let name = lines[0];
  let rating = lines[1];
  let text = lines[2];

  let newJson = {
    "name": name,
    "rating": rating,
    "text": text
  }

  return newJson;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
