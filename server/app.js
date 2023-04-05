const express = require("express");
const mysql = require("mysql");
const multer = require("multer");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "videostreaming",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    throw err;
  }
  console.log("MySql Connected...");
});

var cors = require("cors");
const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

app.get("/", (req, res) => {
  let sql = "DELETE FROM segment";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Database cleared...");
  });
});

app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE videostreaming";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Database created...");
  });
});

app.get("/createsegmenttable", (req, res) => {
  let sql =
    "CREATE TABLE segment(id int AUTO_INCREMENT, segment BLOB, segment_id int, PRIMARY KEY(id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("segment table created...");
  });
});

app.get("/segment/:id", (req, res) => {
    let sql = `SELECT * FROM segment WHERE segment_id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.post("/segment", upload.single("video"), (req, res) => {
  const segment_id = +req.headers["x-segment-id"];
  let segment = { segment: req.file, segment_id: segment_id };
  let sql = "INSERT INTO segment SET ?";
  db.query(sql, segment, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(`Segment ${segment_id} uploaded...`);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
