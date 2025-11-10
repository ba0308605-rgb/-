const express = require('express');
const router = express.Router();
const { Product, Category, Order, User, sequelize } = require('../models');
const auth = require('../middleware/auth');

// الحصول على إحصائيات لوحة التحكم
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const totalOrders = await Order.count();
        const totalProducts = await Product.count({ where: { active: true } });
        const totalUsers = await User.count({ where: { active: true, role: 'customer' } });
        
        const totalSalesResult = await Order.findOne({
            where: { payment_status: 'paid' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total')), 'totalSales']
            ],
            raw: true
        });

        const totalSales = totalSalesResult.totalSales || 0;

        // الطلبات الأخيرة
        const recentOrders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            data: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalSales,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات'
        });
    }
});

// الحصول على جميع المنتجات للإدارة
router.get('/products', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const products = await Product.findAll({
            include: [{
                model: Category,
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتجات'
        });
    }
});

// الحصول على منتج معين
router.get('/products/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const product = await Product.findByPk(req.params.id, {
            include: [{
                model: Category,
                attributes: ['id', 'name']
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

// إنشاء منتج جديد
router.post('/products', auth, async (req, res) => {
    try {
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
router.put('/products/:id', auth, async (req, res) => {
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
router.delete('/products/:id', auth, async (req, res) => {
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

        await product.destroy();

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

// الحصول على جميع الطلبات
router.get('/orders', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلبات'
        });
    }
});

// تحديث حالة الطلب
router.put('/orders/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        await order.update({ status: req.body.status });

        res.json({
            success: true,
            message: 'تم تحديث حالة الطلب بنجاح',
            data: order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الطلب'
        });
    }
});

// الحصول على جميع المستخدمين
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بهذا الإجراء'
            });
        }

        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المستخدمين'
        });
    }
});

module.exports = router;