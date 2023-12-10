const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cors = require("cors");
const express = require("express");
const app = express();

const refreshTokens = {};
const SECRET = "VERY_SECRET_KEY!";
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

passport.use(
  new JwtStrategy(passportOpts, function (jwtPayload, done) {
    const expirationDate = new Date(jwtPayload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    done(null, jwtPayload);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

const mysql = require("mysql");
const bcrypt = require("bcrypt");

const PORT = 3000;

var connection = mysql.createPool({
  host: "sql5.freemysqlhosting.net",
  user: "sql5668972",
  password: "MxwbCP1ftw",
  database: "sql5668972",
});

app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  const date = new Date();
  const sqlDate = date.toISOString().split("T")[0];
  const bcryptedPassword = bcrypt.hashSync(password, 8);
  connection.query(
    'INSERT INTO users VALUES ("", ?, ?, ?)',
    [username, bcryptedPassword, sqlDate],
    function (error, results, fields) {
      if (error) {
        res.json(callback(error));
      } else {
        res.json({ success: true });
      }
    }
  );
});

let callback = (error, result) => {
  if (error !== null) {
    console.log("Caught error: " + String(error));
    return error;
  }
  return result;
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    function (error, results, fields) {
      if (error) {
        res.json(callback(error));
      } else {
        if (results.length == 0) {
          res.status(401).json({
            success: false,
            token: null,
            err: "Username is incorrect",
          });
        } else {
          if (bcrypt.compareSync(password, results[0].password)) {
            const { username, password } = req.body;
            const user = {
              username: username,
              role: "admin",
            };
            const token = jwt.sign(user, SECRET, { expiresIn: "1m" });
            const refreshToken = randtoken.uid(256);
            refreshTokens[refreshToken] = username;
            res.json({ jwt: token, refreshToken: refreshToken });
          } else {
            res.status(401).json({
              success: false,
              token: null,
              err: "Password is incorrect",
            });
          }
        }
      }
    }
  );
});

app.post("/api/logout", function (req, res) {
  //   console.log("Logout called");
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken];
  }
  res.sendStatus(204);
});

app.post("/api/refresh", function (req, res) {
  const refreshToken = req.body.refreshToken;

  if (refreshToken in refreshTokens) {
    const user = {
      username: refreshTokens[refreshToken],
      role: "admin",
    };

    const token = jwt.sign(user, SECRET, { expiresIn: "1m" });
    res.json({ jwt: token });
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/budget", async (req, res) => {
  connection.query(
    "SELECT * FROM chartData WHERE username = ?",
    [req.query.user],
    function (error, results, fields) {
      if (error) {
        res.json(callback(error));
      } else {
        res.json(results);
      }
    }
  );
});

app.get("/api/budget/:id", async (req, res) => {
  var id = req.params.id;
  connection.query(
    "SELECT * FROM chartData WHERE id = ?",
    [id],
    function (error, results, fields) {
      if (error) {
        res.json(callback(error));
      } else {
        res.json(results);
      }
    }
  );
});

app.delete("/api/budget/:id", async (req, res) => {
  var id = req.params.id;
  connection.query(
    "DELETE FROM chartData WHERE id = ?",
    [id],
    function (error, results, fields) {
      if (error) {
        res.json(callback(error));
      } else {
        res.json(results);
      }
    }
  );
});

app.post("/api/budget", (req, res) => {
  const { title, budget, color, expenses, username } = req.body;
  var re = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$");
  if (re.test(color)) {
    connection.query(
      'INSERT INTO chartData VALUES ("", ?, ?, ?, ?, ?)',
      [title, budget, color, expenses, username],
      function (error, results, fields) {
        if (error) {
          res.json(callback(error));
        } else {
          res.json({ success: true });
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      err: "Color is an invalid hex format",
    });
  }
});

app.put("/api/budget/:id", (req, res) => {
  const { title, budget, color, expenses } = req.body;
  var id = req.params.id;
  var re = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$");
  if (re.test(color)) {
    connection.query(
      "UPDATE chartData SET title = ?, budget = ?, color = ?, expenses = ? WHERE id = ?",
      [title, budget, color, expenses, id],
      function (error, results, fields) {
        if (error) {
          res.json(callback(error));
        } else {
          res.json({ success: true });
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      err: "Color is an invalid hex format",
    });
  }
});

app.post("/api/expenses", (req, res) => {
  const { expenseTitle, value, budgetId, date } = req.body;
  connection.query(
    'INSERT INTO expenses (id, expenseTitle, value, budgetId, date) VALUES ("", ?, ?, ?, ?)',
    [expenseTitle, value, budgetId, date],
    function (error, results, fields) {
      if (error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

app.get("/api/expenses", (req, res) => {
  const budgetId = parseInt(req.query.budgetId, 10);
  const month = req.query.month;
  const parsedMonth = parseInt(month, 10);

  if (isNaN(budgetId) || !isValidDate(month)) {
    return res
      .status(400)
      .json({
        error:
          "Invalid parameters. Ensure budgetId is a valid integer and month is a valid Date.",
      });
  }

  connection.query(
    "SELECT * FROM expenses WHERE budgetId = ? AND MONTH(date) = ?",
    [budgetId, parsedMonth],
    function (error, results, fields) {
      if (error) {
        res.json({ error: error.message });
      } else {
        res.json(results);
      }
    }
  );
});

function isValidDate(dateString) {
  // Check if the string is a valid Date format
  return !isNaN(Date.parse(dateString));
}

app.get("/expenses", (req, res) => {
  try {
    const budgetId = parseInt(req.query.budgetId, 10);
    const month = req.query.month; // Month format: 'YYYY-MM'

    if (isNaN(budgetId) || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({
          error:
            "Invalid parameters. Ensure budgetId is a valid integer and month is in the format YYYY-MM.",
        });
    }

    const budgetExpenses = expenses.filter((expense) => {
      const expenseMonth = expense.date.substring(0, 7); // Extracting YYYY-MM from the date
      return expense.budgetId === budgetId && expenseMonth === month;
    });

    res.json(budgetExpenses);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
