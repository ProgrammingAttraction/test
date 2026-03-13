require("dotenv").config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const user_route = require('./Routes/Userroute');
const admin_route = require('./Routes/Adminroute');
const useragent = require('express-useragent');
const Router = require('./Routes/Router');
const Affiliaterouter = require("./Routes/Affiliaterouter");
const Affiliateauth = require("./Routes/Affliateauth");
const Gamesroute = require("./Routes/Gamesroute");
const supportrouter = require("./Routes/Supportroute");
require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 8000;

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.use(bodyParser.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(useragent.express());  // ✅ This enables `req.useragent`
// Enhanced CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "https://genzz.casino",
    "https://admin.genzz.casino",
    "https://admin2.genzz.casino",
    "https://genzz-support.netlify.app",
    "https://genzzv2.credixopay.com",
    "https://genzslots.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-api-key",
    "x-merchant-id", // Added the problematic header
    "x-timestamp",   // Added other custom headers
    "x-nonce",
    "x-sign"
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static("public"))
app.use('/auth', AuthRouter);
app.use("/user",user_route);
app.use("/admin",admin_route);
app.use("/api",Router);
app.use("/api/affiliate",Affiliateauth);
app.use("/api/affiliate-user",Affiliaterouter);
app.use("/api/games",Gamesroute)
app.use("/api/support",supportrouter)
app.get("/",(req,res)=>{
    res.send("hello HoBet backend part!")
})
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})