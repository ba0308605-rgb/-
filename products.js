const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');
const { validationResult, body } = require('express-validator');
const auth = require('../middleware/auth');

// الحصول على جميع المنتجات
router.get('/', async (req, res) => {
    try {
        const { category, featured, search, page = 1, limit = 12 } = req.query;
        
        let where = { active: true };
        
        if (category && category !== 'all') {
            where.category_id = category;
        }
        
        if (featured) {
            where.featured = featured === 'true';
        }
        
        const offset = (page - 1) * limit;
        
        const products = await Product.findAndCountAll({
            where,
            include: [{
                model: Category,
                attributes: ['id', 'name', 'name_en']
            }],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: products.rows,
            total: products.count,
            totalPages: Math.ceil(products.count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتجات'
        });
    }
});

// الحصول على منتج بواسطة ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{
                model: Category,
                attributes: ['id', 'name', 'name_en']
            }]
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتج'
        });
    }
});

// إنشاء منتج جديد (يحتاج صلاحية مدير)
router.post('/', [
    auth,
    body('name').notEmpty().withMessage('اسم المنتج مطلوب'),
    body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقم موجب')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صالحة',
                errors: errors.array()
            });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }
        
        const product = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'تم إنشاء المنتج بنجاح',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المنتج'
        });
    }
});

// تحديث منتج
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }
        
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        await product.update(req.body);
        
        res.json({
            success: true,
            message: 'تم تحديث المنتج بنجاح',
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المنتج'
        });
    }
});

// حذف منتج
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }
        
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        await product.update({ active: false });
        
        res.json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المنتج'
        });
    }
});

module.exports = router;