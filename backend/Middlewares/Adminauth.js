const jwt = require('jsonwebtoken');
const Admin = require('../Models/Adminmodel');

const ensureadminAuthenticated = async (req, res, next) => {
    const auth = req.headers['authorization'];
    console.log(auth)
    if (!auth) {
        return res.status(403)
            .json({ message: 'Unauthorized, JWT token is required', success: false });
    }
    
    try {
        // Extract token from "Bearer <token>" format if present
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
         console.log(decoded)
        // Verify the user still exists and is an admin
        const user = await Admin.findById(decoded._id);
         console.log(user)
        if (!user) {
            return res.status(403)
                .json({ message: 'Unauthorized, admin privileges required', success: false });
        }
        
        // Add user info to request object
        req.user = {
            _id: user._id,
            email: user.email,
            is_admin: user.is_admin
        };
        
        next();
    } catch (err) {
        // if (err.name === 'TokenExpiredError') {
        //     return res.status(403)
        //         .json({ message: 'Unauthorized, JWT token expired', success: false });
        // }
        
        // if (err.name === 'JsonWebTokenError') {
        //     return res.status(403)
        //         .json({ message: 'Unauthorized, invalid JWT token', success: false });
        // }
        
        console.error('Auth middleware error:', err);
        return res.status(500)
            .json({ message: 'Internal server error during authentication', success: false });
    }
}

module.exports = ensureadminAuthenticated;