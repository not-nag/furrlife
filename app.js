const exp = require("constants");
const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const { strictEqual } = require("assert");
const { join } = require("path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "furrlife",
});

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/index.ejs", function (req, res) {
  res.render("index");
});

app.get("/list.ejs", function (req, res) {
  res.render("list");
});

app.post("/list.ejs", function (req, res) {
  var name = req.body.name;
  var city = req.body.city;
  var contact_no = req.body.contact_no;
  var type = req.body.type;
  var breed = req.body.breed;
  var vaccinated = req.body.vaccinated;
  var photo = req.body.photo;

  connection.connect(function (err) {
    if (err) {
      return console.error("error: " + err.message);
    }
    var sql =
      "INSERT INTO pet_listings (NAME, CITY, CONTACT_NO, TYPE, BREED, VACCINATED, PHOTO) VALUES (?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [name, city, contact_no, type, breed, vaccinated, photo],
      function (err, result) {
        if (err) {
          return console.error("error: " + err.message);
        }
      }
    );
  });
  res.render("success");
});

app.get("/success.ejs", function (req, res) {
  res.render("success");
});

app.get("/pets.ejs", function (req, res) {
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM pet_listings";
    connection.query(sql, function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("pets", { data: result });
    });
  });
});

app.listen(3000, function () {
  console.log(__dirname);
});
