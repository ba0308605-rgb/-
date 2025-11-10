const sequelize = require('../config/database');

// استيراد النماذج بشكل منفصل أولاً
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');

// تأجيل العلاقات حتى يتم تحميل كل شيء
setTimeout(() => {
    try {
        //Product.belongsTo(Category, { foreignKey: 'category_id' });
        //Category.hasMany(Product, { foreignKey: 'category_id' });
       // Order.belongsTo(User, { foreignKey: 'user_id' });
        //User.hasMany(Order, { foreignKey: 'user_id' });
        
        console.log('✅ تم تعريف العلاقات بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تعريف العلاقات:', error);
    }
}, 100);

// ... باقي الكود بدون تغيير
const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ تم مزامنة قاعدة البيانات بنجاح');
        
        await createSampleData();
    } catch (error) {
        console.error('❌ خطأ في مزامنة قاعدة البيانات:', error);
    }
};

const createSampleData = async () => {
    try {
        const categoriesCount = await Category.count();
        if (categoriesCount === 0) {
            await Category.bulkCreate([
                { name: 'ديكور المنزل', name_en: 'Home Decor' },
                { name: 'هدايا شخصية', name_en: 'Personal Gifts' },
                { name: 'مناسبات خاصة', name_en: 'Special Occasions' },
                { name: 'تحف فنية', name_en: 'Art Pieces' }
            ]);
            console.log('✅ تم إنشاء التصنيفات التجريبية');
        }

        const productsCount = await Product.count();
        if (productsCount === 0) {
            await Product.bulkCreate([
                {
                    name: 'كوب تذكاري',
                    description: 'كوب سيراميك بتصميم فريد وأنيق',
                    price: 45.00,
                    category_id: 1,
                    featured: true,
                    stock: 50
                },
                {
                    name: 'إطار صورة',
                    description: 'إطار خشبي كلاسيكي يحفظ ذكرياتك الجميلة',
                    price: 75.00,
                    category_id: 1,
                    featured: true,
                    stock: 30
                },
                {
                    name: 'ساعة حائط',
                    description: 'ساعة حائط بتصميم أنتيک فريد',
                    price: 120.00,
                    category_id: 1,
                    featured: true,
                    stock: 20
                }
            ]);
            console.log('✅ تم إنشاء المنتجات التجريبية');
        }

        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount === 0) {
            await User.create({
                name: 'مدير النظام',
                email: 'ba0308605@gmail.com',
                password: 'B1@a2d3e4r5',
                role: 'admin'
            });
            console.log('✅ تم إنشاء حساب المدير');
        }
    } catch (error) {
        console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Product,
    Category,
    Order,
    syncDatabase
};