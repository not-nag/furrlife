const exp = require("constants");
const express = require("express");
const app = express();
const mysql = require("mysql");
const path = require("path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/index.ejs", function (req, res) {
  res.render("index");
});

app.get("/list.ejs", function (req, res) {
  res.render("list");
});

app.listen(3000, function () {
  console.log(__dirname);
});
