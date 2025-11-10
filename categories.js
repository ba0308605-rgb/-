const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const auth = require('../middleware/auth');

// الحصول على جميع التصنيفات
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { active: true },
            order: [['name', 'ASC']]
        });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التصنيفات'
        });
    }
});

// إنشاء تصنيف جديد
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }
        
        const category = await Category.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'تم إنشاء التصنيف بنجاح',
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء التصنيف'
        });
    }
});

module.exports = router;