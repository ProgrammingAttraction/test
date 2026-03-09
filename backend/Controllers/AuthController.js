const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");
const admin_model = require('../Models/Adminmodel');
const geoip = require('geoip-lite');
const signup = async (req, res) => {

}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        const user = await UserModel.findOne({ email, status: "active" });
        const errorMsg = 'Auth failed, email or password is wrong';

        if (!user) {
            return res.json({ message: errorMsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.json({ message: "Email and Password did not match!", success: false });
        }

        // Generate JWT Token
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Get login details
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const device = `${req.useragent.platform} - ${req.useragent.browser}`;
        const geo = geoip.lookup(ip);
        const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

        // Save login history
        await UserModel.findByIdAndUpdate(user._id, {
            $push: {
                loginHistory: { ipAddress: ip, device, location }
            }
        });

        res.status(200).json({
            message: "Login Success",
            success: true,
            jwtToken,
            email,
            user
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
const adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)
        const user = await admin_model.findOne({ email,is_admin:true });
        const errorMsg = 'Auth failed email or password is wrong';
        console.log(user)
        if (!user) {
            return res.json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.json({ message:"Email and Password did not match!", success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
        )

        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                jwtToken,
                email,
                     admin: user
            })
    } catch (err) {
        console.log(err)
        res.status(500)
            .json({
                message: err,
                success: false
            })
    }
}
const profile_update = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if(user){
            const hash_password=await bcrypt.hash(password,10)
            UserModel.findByIdAndUpdate({_id:user._id},{email:email,password:hash_password})
        }
        console.log(user)
        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                admin_data:user
            })
    } catch (err) {
        console.log(err)
        res.status(500)
            .json({
                message: err,
                success: false
            })
    }
}
module.exports = {
    signup,
    login,
    adminlogin,
    profile_update
}