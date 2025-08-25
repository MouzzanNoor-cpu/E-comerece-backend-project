const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
dotenv.config();

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection successful"))
  .catch((err) => console.error("DB Error:", err));

// Middleware 
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Root test route
app.get('/', (req, res) => {
  res.send('E-Commerce API is running');
});

// Route imports
const productRoute = require("./routes/product");
const acess = require("./routes/Accessories");
const Grap = require("./routes/Graphiccards");
const pkg = require("./routes/packages");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const newsletterRoute = require("./routes/newsletter");
const stripeRoute = require("./routes/stripe");
const seller = require('./routes/seller');
const User = require('./routes/user');
const paymentRoutes = require('./routes/paymentRoutes');
const divideOrders = require('./routes/divideOrders');
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");

// Mount all routes
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", productRoute);
app.use("/api", acess);
app.use("/api", Grap);
app.use("/api", pkg);
app.use("/api", cartRoute);
app.use("/api", orderRoute);
app.use("/api", stripeRoute);
app.use("/api", newsletterRoute);
app.use("/api", seller);
app.use("/api", divideOrders);
app.use("/api", User);
app.use("/api/payment", paymentRoutes);
app.use("/uploads", express.static('uploads'));

//  Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
