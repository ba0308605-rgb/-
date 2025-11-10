const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function fixAdminPassword() {
    try {
        // إنشاء تشفير جديد لـ admin123
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('🔑 التشفير الجديد:', hashedPassword);

        // تحديث كلمة المرور في قاعدة البيانات
        const result = await User.update(
            { password: hashedPassword },
            { where: { email: 'admin@antika.com' } }
        );

        if (result[0] > 0) {
            console.log('✅ تم تحديث كلمة مرور المدير بنجاح');
            console.log('📧 البريد: admin@antika.com');
            console.log('🔑 كلمة المرور: admin123');
        } else {
            console.log('❌ لم يتم العثور على حساب المدير');
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

fixAdminPassword();