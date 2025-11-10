const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐⭐ خدمة ملفات الفرونت إند - هذا السطر الأساسي ⭐⭐
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
//app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// ⭐⭐ جميع الطلبات تذهب للفرونت إند ⭐⭐
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Database connection
const db = require('./config/database');

// Test database connection
db.authenticate()
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`🏪 متجر أنتيكا للتذكارات جاهز للعمل!`);
});