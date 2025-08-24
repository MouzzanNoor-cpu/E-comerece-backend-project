const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoute = require("./routes/product");
const acess=require("./routes/Accessories")
const Grap=require("./routes/Graphiccards")
const pkg=require("./routes/packages")
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const newsletterRoute = require("./routes/newsletter");
const stripeRoute = require("./routes/stripe");
const seller = require('./routes/seller');
const User = require('./routes/user')
const paymentRoutes = require('./routes/paymentRoutes');
const divideOrders = require('./routes/divideOrders')
const cors = require("cors");
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
app.use("/api/admin-auth", adminAuthRoutes);





dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection successfull"))
  .catch((err) => {
    console.log(err);
  });
  app.use(cookieParser());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}))

 app.use(cors({origin: "*", credentials: true}))
 
 app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
      success: false,
      message: err.message || 'Something went wrong!',
  });
});

// Serve a simple message at root URL
app.get('/', (req, res) => {
  res.send('E-Commerce API is running');
});

app.use("/api/admin-auth", adminAuthRoutes);

 app.use("/api", productRoute);
 app.use('/api', User)
 app.use("/api", cartRoute);
 app.use("/api", orderRoute)
 app.use("/api", stripeRoute)
 app.use("/api", newsletterRoute);
 app.use("/api/",acess)
 app.use("/api",Grap)
 app.use("/api",pkg)
 app.use("/api", seller);
 app.use("/uploads", express.static('uploads'));
 app.use("/api",divideOrders)
 app.use('/api/payment', paymentRoutes);
 app.use("/api/admin", adminRoutes);
 


app.listen(process.env.PORT  || 4000, () => {
  console.log("Backend server is running!");
});
