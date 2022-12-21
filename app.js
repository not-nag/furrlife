const exp = require("constants");
const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");

const { strictEqual } = require("assert");
const { join } = require("path");
const { request } = require("http");

const upload = multer({ storage: multer.memoryStorage() });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

var cur_city = "";
var pet_type = "";
var pet_id = 0;
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

app.post("/list.ejs", upload.single("photo"), function (req, res) {
  var name = req.body.name;
  var city = req.body.city;
  var contact_no = req.body.contact_no;
  var type = req.body.type;
  if (req.body.breed != "") {
    var breed = req.body.breed;
  } else {
    var breed = "N/A";
  }
  var vaccinated = req.body.vaccinated;
  photo = req.file.buffer.toString("base64");
  passcode = req.body.passcode;

  connection.connect(function (err) {
    if (err) {
      return console.error("error: " + err.message);
    }
    var sql =
      "INSERT INTO pet_listings (NAME, CITY, CONTACT_NO, TYPE, BREED, VACCINATED, PHOTO, PASSCODE) VALUES (?,?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [name, city, contact_no, type, breed, vaccinated, photo, passcode],
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

app.get("/city.ejs", function (req, res) {
  res.render("city");
});

app.post("/city.ejs", function (req, res) {
  cur_city = req.body.city;
  pet_type = req.body.type;
  res.redirect("/pets.ejs");
});

app.get("/pets.ejs", function (req, res) {
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM pet_listings WHERE CITY = ? AND TYPE = ?";
    connection.query(sql, [cur_city, pet_type], function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("pets", { data: result });
    });
  });
});

app.post("/pets.ejs", function (req, res) {
  pet_id = req.body.mark;
  res.render("validate");
});

app.post("/validate.ejs", function (req, res) {
  given_pass = req.body.imp;
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT PASSCODE FROM pet_listings WHERE ID = ?";
    connection.query(sql, [pet_id], function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      actual_pass = result[0].PASSCODE;
      if (given_pass == actual_pass) {
        res.render("adopted");
      } else {
        res.render("inv_pass");
      }
    });
  });
});

app.listen(3000, function () {
  console.log(__dirname);
});
