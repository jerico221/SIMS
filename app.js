var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var categoryRouter = require("./routes/category");
var posRouter = require("./routes/pos");
var accessRouter = require("./routes/access");
var productRouter = require("./routes/product");
var inventoryRouter = require("./routes/inventory");
var employeeRouter = require("./routes/employee");
var salesRouter = require("./routes/sales");
var paymentRouter = require("./routes/payment");
var customerRouter = require("./routes/customer");
var loginRouter = require("./routes/login");
var registrationRouter = require("./routes/registration");
var cartRouter = require("./routes/cart");
var productdisplayRouter = require("./routes/productdisplay");
var orderRouter = require("./routes/order");
var customerorderRouter = require("./routes/customerorder");
var customerorderhistoryRouter = require("./routes/customerorderhistory");
var storepointhistoryRouter = require("./routes/storepointhistory");
var customerstorepointsRouter = require("./routes/customerstorepoints");
var verificationRouter = require("./routes/verification");
var chatRouter = require("./routes/chat");
var customerchatRouter = require("./routes/customerchat");

const { SetMongo } = require("./routes/controller/mongodb");

var app = express();

//Initialize Mongo DB and Sessions
SetMongo(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(
  express.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 100000000,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/category", categoryRouter);
app.use("/pos", posRouter);
app.use("/access", accessRouter);
app.use("/product", productRouter);
app.use("/inventory", inventoryRouter);
app.use("/employee", employeeRouter);
app.use("/sales", salesRouter);
app.use("/payment", paymentRouter);
app.use("/customer", customerRouter);
app.use("/login", loginRouter);
app.use("/registration", registrationRouter);
app.use("/cart", cartRouter);
app.use("/productdisplay", productdisplayRouter);
app.use("/order", orderRouter);
app.use("/customerorder", customerorderRouter);
app.use("/customerorderhistory", customerorderhistoryRouter);
app.use("/storepointhistory", storepointhistoryRouter);
app.use("/customerstorepoints", customerstorepointsRouter);
app.use("/verification", verificationRouter);
app.use("/chat", chatRouter);
app.use("/customerchat", customerchatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
