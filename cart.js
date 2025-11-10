// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('antika-cart')) || [];
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productCard = e.target.closest('.product-card');
                this.addToCart(productCard);
            }
        });

        // Cart icon click
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }
    }

    addToCart(productCard) {
        const product = {
            id: this.generateId(),
            name: productCard.querySelector('h3').textContent,
            price: parseInt(productCard.querySelector('.product-price').textContent),
            image: productCard.querySelector('.placeholder-product').innerHTML,
            quantity: 1
        };

        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }

        this.saveToLocalStorage();
        this.updateCartUI();
        this.showAddToCartAnimation(productCard);
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateCartUI();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveToLocalStorage();
                this.updateCartUI();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveToLocalStorage() {
        localStorage.setItem('antika-cart', JSON.stringify(this.items));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateCartUI() {
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            const totalItems = this.getTotalItems();
            
            // Remove existing badge
            const existingBadge = cartIcon.parentElement.querySelector('.cart-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Add new badge if there are items
            if (totalItems > 0) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.textContent = totalItems;
                badge.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                `;
                cartIcon.parentElement.style.position = 'relative';
                cartIcon.parentElement.appendChild(badge);
            }
        }
    }

    showAddToCartAnimation(productCard) {
        const button = productCard.querySelector('.add-to-cart');
        const originalText = button.textContent;
        
        button.textContent = '✓ تم الإضافة';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }

    toggleCart() {
        this.showCartModal();
    }

    showCartModal() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.cart-modal');
        if (existingModal) {
            existingModal.remove();
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'cart-modal';
        modal.innerHTML = this.getCartHTML();
        
        document.body.appendChild(modal);
        this.setupCartModalEvents(modal);
    }

    getCartHTML() {
        if (this.items.length === 0) {
            return `
                <div class="cart-modal-content">
                    <div class="cart-header">
                        <h3>سلة التسوق</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>سلة التسوق فارغة</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="cart-modal-content">
                <div class="cart-header">
                    <h3>سلة التسوق (${this.getTotalItems()})</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="cart-items">
                    ${this.items.map(item => `
                        <div class="cart-item" data-id="${item.id}">
                            <div class="item-image">
                                ${item.image}
                            </div>
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <div class="item-price">${item.price} ر.س</div>
                            </div>
                            <div class="item-controls">
                                <button class="quantity-btn minus">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus">+</button>
                                <button class="remove-item"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <strong>المجموع: ${this.getTotal()} ر.س</strong>
                    </div>
                    <button class="checkout-btn">إتمام الشراء</button>
                </div>
            </div>
        `;
    }

    setupCartModalEvents(modal) {
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Quantity controls
        modal.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                const quantityElement = cartItem.querySelector('.quantity');
                let quantity = parseInt(quantityElement.textContent);

                if (e.target.classList.contains('plus')) {
                    quantity++;
                } else if (e.target.classList.contains('minus')) {
                    quantity--;
                }

                this.updateQuantity(itemId, quantity);
                
                // Refresh modal
                modal.remove();
                this.showCartModal();
            });
        });

        // Remove item
        modal.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                this.removeFromCart(itemId);
                
                // Refresh modal
                modal.remove();
                if (this.items.length > 0) {
                    this.showCartModal();
                }
            });
        });

        // Checkout
        const checkoutBtn = modal.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
                modal.remove();
            });
        }

        // Add styles
        this.addCartModalStyles();
    }

    addCartModalStyles() {
        if (document.querySelector('#cart-modal-styles')) return;

        const styles = `
            .cart-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: flex-end;
                z-index: 10000;
            }
            
            .cart-modal-content {
                background: white;
                width: 400px;
                max-width: 90vw;
                height: 100%;
                display: flex;
                flex-direction: column;
                animation: slideInRight 0.3s ease;
            }
            
            .cart-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .cart-header h3 {
                margin: 0;
                color: var(--text-color);
            }
            
            .close-modal {
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--light-text);
            }
            
            .cart-items {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .cart-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .item-image {
                width: 60px;
                height: 60px;
                background: var(--secondary-color);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 15px;
            }
            
            .item-image i {
                font-size: 1.5rem;
                color: var(--primary-color);
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h4 {
                margin: 0 0 5px 0;
                color: var(--text-color);
            }
            
            .item-price {
                color: var(--primary-color);
                font-weight: bold;
            }
            
            .item-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quantity-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .quantity {
                min-width: 30px;
                text-align: center;
            }
            
            .remove-item {
                background: none;
                border: none;
                color: #ff4444;
                cursor: pointer;
                padding: 5px;
            }
            
            .cart-footer {
                padding: 20px;
                border-top: 1px solid #eee;
            }
            
            .cart-total {
                text-align: center;
                margin-bottom: 15px;
                font-size: 1.2rem;
            }
            
            .checkout-btn {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                width: 100%;
                font-size: 1.1rem;
                transition: var(--transition);
            }
            
            .checkout-btn:hover {
                background: var(--primary-dark);
            }
            
            .empty-cart {
                text-align: center;
                padding: 60px 20px;
                color: var(--light-text);
            }
            
            .empty-cart i {
                font-size: 4rem;
                margin-bottom: 20px;
                color: #ddd;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'cart-modal-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    checkout() {
        if (this.items.length === 0) {
            alert('سلة التسوق فارغة');
            return;
        }

        // Simulate checkout process
        const total = this.getTotal();
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        
        alert(`شكراً لشرائك من متجر أنتيكا!\n\nرقم الطلب: ${orderNumber}\nالمجموع: ${total} ر.س\n\nسيتم التواصل معك لتأكيد الطلب.`);
        
        // Clear cart
        this.items = [];
        this.saveToLocalStorage();
        this.updateCartUI();
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = new ShoppingCart();
});