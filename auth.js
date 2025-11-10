const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'الوصول مرفوض. لا يوجد token.'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'antika_secret_key');
        const user = await User.findByPk(decoded.userId);
        
        if (!user || !user.active) {
            return res.status(401).json({
                success: false,
                message: 'الوصول مرفوض. المستخدم غير موجود.'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'الوصول مرفوض. token غير صالح.'
        });
    }
};

module.exports = auth;