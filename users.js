const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

// تحديث بيانات المستخدم
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        await user.update(req.body);
        
        res.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث البيانات'
        });
    }
});

module.exports = router;