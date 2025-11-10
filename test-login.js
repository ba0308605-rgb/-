const { User } = require('./models');

async function testLogin() {
    try {
        const user = await User.findOne({ where: { email: 'ba0308605@gmail.com' } });
        console.log('👤 المستخدم:', user);
        console.log('🔑 كلمة المرور في DB:', user.password);
        
        const isValid = await user.validatePassword('B1@a2d3e4r5');
        console.log('✅ التحقق:', isValid);
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

testLogin();