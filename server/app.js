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

const upload = multer();

app.use(cors());

app.get("/", (req, res) => {
  let sql = "DELETE FROM record";
  db.query(sql, (err, result) => {
    if (err) throw err;
  });
  sql = "DELETE FROM segment";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("segment table is cleared...");
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

app.get("/createrecordtable", (req, res) => {
  let sql =
    "CREATE TABLE record(id int AUTO_INCREMENT, start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("record table created...");
  });
});

app.get("/createsegmenttable", (req, res) => {
  let sql =
    "CREATE TABLE segment(id int AUTO_INCREMENT, segment LONGBLOB, segment_id int, PRIMARY KEY(id), record_id int, FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE)";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("segment table created...");
  });
});

app.get("/segment/list", (req, res) => {
  let sql = "SELECT * FROM record ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.get("/segment/video", (req, res) => {
  let record_id = +req.headers["x-record-id"];
  if (!record_id) {
    let sql = "SELECT * FROM record ORDER BY id DESC LIMIT 1";
    db.query(sql, (err, result) => {
      if (err) throw err;
      record_id = result[0].id;
    });
  }
  const segment_id = 1;
  let sql = `SELECT * FROM segment WHERE segment_id = ${segment_id} AND record_id = ${record_id}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result[0].segment);
  });
});

app.get("/video", async (req, res) => {
  const [result] = await connection.execute("SELECT * FROM segment");
  const chunks = result.map((row) => row.segment);
  res.render("video", { chunks });
});

app.post("/segment", upload.single("video"), async (req, res) => {
  const segment_id = +req.headers["x-segment-id"];
  const start = req.headers["x-segment-start"] === "true";
  if (start) {
    let sql = "INSERT INTO record set ?";
    let record = { start_time: new Date() };
    db.query(sql, record, (err, result) => {
      if (err) throw err;
      console.log(result.insertId);
      let segment = {
        segment: req.file.buffer,
        segment_id: segment_id,
        record_id: result.insertId,
      };
      let sql = "INSERT INTO segment SET ?";
      db.query(sql, segment, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`Segment ${segment_id} uploaded...`);
      });
    });
  } else {
    let recordSql = "SELECT * FROM record ORDER BY id DESC LIMIT 1";
    db.query(recordSql, (err, result) => {
      if (err) throw err;
      let segment = {
        segment: req.file.buffer,
        segment_id: segment_id,
        record_id: result[0].id,
      };
      let sql = "INSERT INTO segment SET ?";
      db.query(sql, segment, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`Segment uploaded...`);
      });
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
