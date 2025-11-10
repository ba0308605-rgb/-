// لوحة إدارة أنتيكا - بدون تسجيل دخول
class AntikaAdmin {
    constructor() {
        this.currentPage = 'dashboard';
        this.products = [];
        this.orders = [];
        this.init();
    }

    init() {
        this.showDashboard(); // عرض لوحة التحكم مباشرة
        this.setupEventListeners();
        this.loadData();
    }

    async makeAPIRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'حدث خطأ');
            }

            return data;
        } catch (error) {
            console.error('API Request error:', error);
            this.showNotification(error.message || 'خطأ في الاتصال بالسيرفر', 'error');
            throw error;
        }
    }

    showDashboard() {
        // إخفاء صفحة الدخول وإظهار اللوحة
        const loginPage = document.getElementById('loginPage');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginPage) loginPage.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'flex';
        
        this.showPage('dashboard');
    }

    setupEventListeners() {
        // القائمة الجانبية
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showPage(page);
                
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // زر toggle القائمة
        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadProducts(),
                this.loadOrders()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadStats() {
        try {
            const data = await this.makeAPIRequest('/admin/stats');
            this.renderStats(data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    renderStats(stats) {
        if (!stats) return;
        
        const primaryStat = document.querySelector('.stat-card.primary .stat-value');
        const successStat = document.querySelector('.stat-card.success .stat-value');
        const warningStat = document.querySelector('.stat-card.warning .stat-value');
        const dangerStat = document.querySelector('.stat-card.danger .stat-value');
        
        if (primaryStat) primaryStat.textContent = stats.totalOrders || 0;
        if (successStat) successStat.textContent = `${(stats.totalSales || 0).toLocaleString()} ر.س`;
        if (warningStat) warningStat.textContent = stats.totalUsers || 0;
        if (dangerStat) dangerStat.textContent = stats.totalProducts || 0;

        this.renderRecentOrders(stats.recentOrders || []);
    }

    renderRecentOrders(orders) {
        const tbody = document.getElementById('recentOrdersTable');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #718096;">
                        لا توجد طلبات حديثة
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        orders.forEach(order => {
            const statusMap = {
                'pending': { text: 'قيد الانتظار', class: 'badge-warning' },
                'confirmed': { text: 'مؤكد', class: 'badge-primary' },
                'shipped': { text: 'تم الشحن', class: 'badge-info' },
                'delivered': { text: 'تم التوصيل', class: 'badge-success' },
                'cancelled': { text: 'ملغي', class: 'badge-danger' }
            };

            const status = statusMap[order.status] || statusMap.pending;

            const row = `
                <tr>
                    <td>${order.order_number || 'N/A'}</td>
                    <td>
                        <div><strong>${order.customer_name || 'غير معروف'}</strong></div>
                        <div style="font-size: 0.8rem; color: #718096;">${order.customer_email || ''}</div>
                    </td>
                    <td>${order.total || 0} ر.س</td>
                    <td><span class="badge ${status.class}">${status.text}</span></td>
                    <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="admin.viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    async loadProducts() {
        try {
            const data = await this.makeAPIRequest('/admin/products');
            this.products = data.data || [];
            this.renderProducts(this.products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(products) {
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;

        if (!products || products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #718096;">
                        لا توجد منتجات
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        products.forEach(product => {
            const statusBadge = product.active ? 
                '<span class="badge badge-success">نشط</span>' : 
                '<span class="badge badge-danger">غير نشط</span>';

            const featuredIcon = product.featured ? 
                '<i class="fas fa-star" style="color: #ffc107; margin-right: 5px;"></i>' : '';

            const stockBadge = product.stock < 5 ? 
                '<span class="badge badge-danger">' + (product.stock || 0) + '</span>' :
                '<span class="badge badge-success">' + (product.stock || 0) + '</span>';

            const row = `
                <tr>
                    <td>
                        <div class="product-image">
                            <i class="fas fa-gift"></i>
                        </div>
                    </td>
                    <td>${featuredIcon} ${product.name || 'غير معروف'}</td>
                    <td>${product.Category?.name || 'غير مصنف'}</td>
                    <td>
                        ${product.old_price ? 
                            `<div style="color: #718096; text-decoration: line-through; font-size: 0.8rem;">${product.old_price} ر.س</div>` : 
                            ''
                        }
                        <div>${product.price || 0} ر.س</div>
                    </td>
                    <td>${stockBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="admin.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="admin.toggleProductStatus(${product.id}, ${!product.active})">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="admin.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    async loadOrders() {
        try {
            const data = await this.makeAPIRequest('/admin/orders');
            this.orders = data.data || [];
            this.renderOrders(this.orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders(orders) {
        const tbody = document.getElementById('ordersTable');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #718096;">
                        لا توجد طلبات
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        orders.forEach(order => {
            const statusMap = {
                'pending': { text: 'قيد الانتظار', class: 'badge-warning' },
                'confirmed': { text: 'مؤكد', class: 'badge-primary' },
                'shipped': { text: 'تم الشحن', class: 'badge-info' },
                'delivered': { text: 'تم التوصيل', class: 'badge-success' },
                'cancelled': { text: 'ملغي', class: 'badge-danger' }
            };

            const status = statusMap[order.status] || statusMap.pending;

            const row = `
                <tr>
                    <td>${order.order_number || 'N/A'}</td>
                    <td>
                        <div><strong>${order.customer_name || 'غير معروف'}</strong></div>
                        <div style="font-size: 0.8rem; color: #718096;">${order.customer_email || ''}</div>
                    </td>
                    <td>${order.total || 0} ر.س</td>
                    <td>
                        <select class="form-control" style="width: 120px; padding: 4px 8px;" 
                                onchange="admin.updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>مؤكد</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                        </select>
                    </td>
                    <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="admin.viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    showPage(pageName) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });

        // إظهار الصفحة المطلوبة
        const pageElement = document.getElementById(pageName + 'Page');
        if (pageElement) {
            pageElement.style.display = 'block';
        }

        // تحديث breadcrumb
        this.updateBreadcrumb(pageName);
        
        this.currentPage = pageName;
        
        // تحميل بيانات الصفحة إذا لزم
        if (pageName === 'products' && this.products.length === 0) {
            this.loadProducts();
        } else if (pageName === 'orders' && this.orders.length === 0) {
            this.loadOrders();
        }
    }

    updateBreadcrumb(pageName) {
        const breadcrumbs = {
            'dashboard': 'الرئيسية / لوحة التحكم',
            'products': 'الرئيسية / المنتجات',
            'orders': 'الرئيسية / الطلبات',
            'customers': 'الرئيسية / العملاء',
            'categories': 'الرئيسية / التصنيفات'
        };

        const breadcrumbElement = document.getElementById('breadcrumb');
        if (breadcrumbElement) {
            breadcrumbElement.innerHTML = breadcrumbs[pageName] || 'الرئيسية';
        }
    }

    // إدارة المنتجات
    showProductModal(product = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">اسم المنتج</label>
                                <input type="text" class="form-control" name="name" value="${product ? product.name : ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">التصنيف</label>
                                <select class="form-control" name="category_id" required>
                                    <option value="">اختر التصنيف</option>
                                    <option value="1" ${product && product.category_id === 1 ? 'selected' : ''}>ديكور المنزل</option>
                                    <option value="2" ${product && product.category_id === 2 ? 'selected' : ''}>هدايا شخصية</option>
                                    <option value="3" ${product && product.category_id === 3 ? 'selected' : ''}>مناسبات خاصة</option>
                                    <option value="4" ${product && product.category_id === 4 ? 'selected' : ''}>تحف فنية</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">السعر (ر.س)</label>
                                <input type="number" class="form-control" name="price" step="0.01" value="${product ? product.price : ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">سعر الخصم (ر.س)</label>
                                <input type="number" class="form-control" name="old_price" step="0.01" value="${product ? product.old_price || '' : ''}">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">الكمية في المخزون</label>
                                <input type="number" class="form-control" name="stock" value="${product ? product.stock : ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الحد الأدنى للإنذار</label>
                                <input type="number" class="form-control" name="min_stock" value="${product ? product.min_stock || 5 : 5}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">وصف المنتج</label>
                            <textarea class="form-control" name="description" rows="3">${product ? product.description || '' : ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="featured" ${product && product.featured ? 'checked' : ''}>
                                    منتج مميز
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="active" ${!product || product.active ? 'checked' : ''}>
                                    نشط
                                </label>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-primary" onclick="admin.saveProductForm(${product ? product.id : null})">
                                ${product ? 'تحديث' : 'إضافة'}
                            </button>
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async saveProductForm(productId = null) {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);

        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category_id: parseInt(formData.get('category_id')),
            featured: formData.get('featured') === 'on',
            active: formData.get('active') === 'on'
        };

        if (formData.get('old_price')) {
            productData.old_price = parseFloat(formData.get('old_price'));
        }

        if (formData.get('min_stock')) {
            productData.min_stock = parseInt(formData.get('min_stock'));
        }

        try {
            const endpoint = productId ? `/admin/products/${productId}` : '/admin/products';
            const method = productId ? 'PUT' : 'POST';

            await this.makeAPIRequest(endpoint, {
                method: method,
                body: JSON.stringify(productData)
            });

            this.showNotification(productId ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح', 'success');
            document.querySelector('.modal')?.remove();
            await this.loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    }

    async editProduct(productId) {
        try {
            const data = await this.makeAPIRequest(`/admin/products/${productId}`);
            this.showProductModal(data.data);
        } catch (error) {
            console.error('Error editing product:', error);
        }
    }

    async toggleProductStatus(productId, newStatus) {
        try {
            await this.makeAPIRequest(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ active: newStatus })
            });

            this.showNotification('تم تغيير حالة المنتج', 'success');
            await this.loadProducts();
        } catch (error) {
            console.error('Error toggling product status:', error);
        }
    }

    async deleteProduct(productId) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await this.makeAPIRequest(`/admin/products/${productId}`, {
                    method: 'DELETE'
                });

                this.showNotification('تم حذف المنتج بنجاح', 'success');
                await this.loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            await this.makeAPIRequest(`/admin/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            this.showNotification('تم تحديث حالة الطلب', 'success');
            await this.loadOrders();
            await this.loadStats();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`تفاصيل الطلب #${order.order_number}\nالعميل: ${order.customer_name}\nالمجموع: ${order.total} ر.س\nالحالة: ${order.status}`);
        } else {
            alert('الطلب غير موجود');
        }
    }

    searchProducts(query) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.Category?.name || '').toLowerCase().includes(query.toLowerCase())
        );
        this.renderProducts(filteredProducts);
    }

    // نظام الإشعارات
    showNotification(message, type = 'info') {
        // إزالة الإشعارات القديمة
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // إزالة الإشعار تلقائياً بعد 5 ثواني
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// التهيئة
let admin;

document.addEventListener('DOMContentLoaded', () => {
    admin = new AntikaAdmin();
});