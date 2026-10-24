require("dotenv").config();
const path = require("path");
const express = require("express");

const categoryRouter = require("./routes/categoryRouter");
const brandRouter = require("./routes/brandRouter");
const itemRouter = require("./routes/itemRouter");
const categoryController = require("./controllers/categoryController");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Defaults so every template can safely reference these.
app.use((req, res, next) => {
  res.locals.errors = [];
  next();
});

app.get("/", categoryController.index);
app.use("/categories", categoryRouter);
app.use("/brands", brandRouter);
app.use("/items", itemRouter);

app.use((req, res) => {
  res.status(404).render("error", { title: "Not found", message: "That page does not exist." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { title: "Server error", message: "Something went wrong." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Inventory app running on http://localhost:${port}`));
