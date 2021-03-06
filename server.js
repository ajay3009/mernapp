const express = require("express");

const connectDB = require("./config/db");

const app = express();

// Connect database
connectDB();

// Init Middleware
app.use(
  express.json({
    extended: false
  })
);

// Define Routes
app.use("/api/users", require("./routes/apis/user"));
app.use("/api/auth", require("./routes/apis/auth"));
app.use("/api/profile", require("./routes/apis/profile"));
app.use("/api/feeds", require("./routes/apis/feed"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
