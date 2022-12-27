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
const { connect } = require("http2");

const upload = multer({ storage: multer.memoryStorage() });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

var cur_city = "";
var pet_type = "";
var pet_id = 0;
var vet_city = "";

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
    var sql =
      "SELECT * FROM pet_listings WHERE CITY = ? AND TYPE = ? AND ADOPTED = 'NO' ORDER BY ID DESC";
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
        var sql2 = "SELECT * FROM pet_listings WHERE ID = ?";
        connection.query(sql2, [pet_id], function (err, result) {
          if (err) {
            return console.error("error : " + err.message);
          }
          insert_id = result[0].ID;
          insert_name = result[0].NAME;
          insert_city = result[0].CITY;
          insert_contact = result[0].CONTACT_NO;
          insert_type = result[0].TYPE;
          insert_breed = result[0].BREED;
          insert_vaccinated = result[0].VACCINATED;
          insert_photo = result[0].PHOTO;
          sql3 =
            "INSERT INTO successful_adoptions (ID, NAME, CITY, CONTACT_NO, TYPE, BREED, VACCINATED, PHOTO) VALUES (?,?,?,?,?,?,?,?) ";
          connection.query(
            sql3,
            [
              insert_id,
              insert_name,
              insert_city,
              insert_contact,
              insert_type,
              insert_breed,
              insert_vaccinated,
              insert_photo,
            ],
            function (err, result) {
              if (err) {
                return console.error("error : " + err.message);
              }
            }
          );
        });
        sql4 = "UPDATE pet_listings SET ADOPTED = 'YES' WHERE ID = ?";
        connection.query(sql4, [pet_id], function (err, result) {
          if (err) {
            return console.error("error : " + err.message);
          }
        });
        res.render("adopted");
      } else {
        res.render("inv_pass");
      }
    });
  });
});

app.get("/successful_adoptions.ejs", function (req, res) {
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM successful_adoptions";
    connection.query(sql, function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("successful_adoptions", { data: result });
    });
  });
});

app.get("/city_vet.ejs", function (req, res) {
  res.render("city_vet");
});

app.post("/city_vet.ejs", function (req, res) {
  vet_city = req.body.city;
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM shelter_homes WHERE UPPER(CITY) = UPPER(?)";
    connection.query(sql, [vet_city], function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("shelter_house", { data: result });
    });
  });
});

app.get("/articles.ejs", function (req, res) {
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM articles";
    connection.query(sql, function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("articles", { data: result });
    });
  });
});

app.get("/reviews.ejs", function (req, res) {
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT * FROM reviews ORDER BY ID DESC";
    connection.query(sql, function (err, result) {
      if (err) {
        return console.error("error : " + err.message);
      }
      res.render("reviews", { data: result });
    });
  });
});

app.post("/reviews.ejs", function (req, res) {
  var name = req.body.name;
  var comment = req.body.comments;
  var pet_id = req.body.id;
  connection.connect(function (err) {
    if (err) {
      return console.error("error : " + err.message);
    }
    var sql = "SELECT ID FROM successful_adoptions WHERE ID = ?";
    connection.query(sql, [pet_id], function (err, resu) {
      if (err) {
        return console.error("error : " + err.message);
      }
      if (resu.length == 0) {
        res.redirect("/no_reviews.ejs");
      } else {
        cur_id = resu[0].ID;
        var sql = "INSERT INTO reviews(PET_ID, NAME, REVIEW) VALUES (?,?,?)";
        connection.query(sql, [cur_id, name, comment], function (err, result) {
          if (err) {
            return console.error("error : " + err.message);
          }
        });
        var sql3 = "SELECT * FROM REVIEWS";
        connection.query(sql3, function (err, result) {
          if (err) {
            return console.error("error : " + err.message);
          }
          res.redirect("/reviews.ejs");
        });
      }
    });
  });
});

app.get("/no_reviews.ejs", function (req, res) {
  res.render("no_reviews");
});

app.get("/volunteers.ejs", function (req, res) {
  res.render("volunteers");
});

app.post("/volunteers.ejs", function (req, res) {
  var n = req.body.name;
  var c = req.body.city;
  var contact = req.body.contact_no;
  var s_id = req.body.shelter_id;
  connection.connect(function (err) {
    if (err) {
      return console.log("error : " + err.message);
    }
    var sql = "SELECT ID FROM shelter_homes WHERE ID = ? AND CITY = ?";
    connection.query(sql, [s_id, c], function (err, result) {
      if (err) {
        return console.log("error : " + err.message);
      }
      if (result.length == 0) {
        res.render("inv_shelter");
      } else {
        var sql2 =
          "INSERT INTO volunteers (NAME, CITY, CONTACT_NO, SHELTER_ID) VALUES (?,?,?,?)";
        connection.query(sql2, [n, c, contact, s_id], function (err, result2) {
          if (err) {
            return console.log("error : " + err.message);
          }
          res.render("suc_volunteer", { data: s_id });
        });
      }
    });
  });
});

app.listen(3000, function () {
  console.log(__dirname);
});
