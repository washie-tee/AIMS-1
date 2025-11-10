// Ingredient Management System - Role-Based Access Control

// ===== USER ROLES & PERMISSIONS =====
const ROLES = {
    admin: {
        name: 'Administrator',
        permissions: ['create', 'edit', 'delete', 'approve', 'manage_users', 'view_reports'],
        navItems: ['dashboard', 'ingredients', 'recipes', 'approvals', 'users', 'reports']
    },
    hod: {
        name: 'Head of Department',
        permissions: ['create', 'approve', 'view_reports'],
        navItems: ['dashboard', 'ingredients', 'recipes', 'approvals', 'reports']
    },
    lecturer_incharge: {
        name: 'Lecturer in Charge',
        permissions: ['create', 'edit', 'delete', 'approve'],
        navItems: ['dashboard', 'ingredients', 'recipes', 'approvals']
    },
    lecturer: {
        name: 'Lecturer',
        permissions: ['create', 'edit', 'delete'],
        navItems: ['dashboard', 'ingredients', 'recipes', 'my_orders']
    },
    training_assistant: {
        name: 'Training Assistant',
        permissions: ['create', 'view', 'edit'],
        navItems: ['dashboard', 'ingredients', 'recipes']
    },
    stores: {
        name: 'Stores Manager',
        permissions: ['create', 'edit', 'delete', 'view', 'issue_orders'],
        navItems: ['dashboard', 'store_inventory', 'ingredients', 'orders', 'issued']
    }
};

// ===== DATA STORAGE =====
let currentUser = null;
let ingredients = [];
let recipes = [];
let users = [];
let ingredientOrders = [];
let purchaseOrders = [];
let selectedRecipeIngredients = [];

// Stock level threshold (ingredients below this quantity are considered low stock)
const LOW_STOCK_THRESHOLD = 5;

// ===== INGREDIENT CATALOG =====
const ingredientCatalog = [
    // Vegetables
    { name: 'Tomato', category: 'vegetables' },
    { name: 'Onion', category: 'vegetables' },
    { name: 'Garlic', category: 'vegetables' },
    { name: 'Carrot', category: 'vegetables' },
    { name: 'Broccoli', category: 'vegetables' },
    { name: 'Spinach', category: 'vegetables' },
    { name: 'Potato', category: 'vegetables' },
    { name: 'Bell Pepper', category: 'vegetables' },
    { name: 'Cucumber', category: 'vegetables' },
    { name: 'Lettuce', category: 'vegetables' },
    { name: 'Cabbage', category: 'vegetables' },
    { name: 'Cauliflower', category: 'vegetables' },
    { name: 'Zucchini', category: 'vegetables' },
    { name: 'Eggplant', category: 'vegetables' },
    { name: 'Green Beans', category: 'vegetables' },
    { name: 'Peas', category: 'vegetables' },
    { name: 'Corn', category: 'vegetables' },
    { name: 'Mushroom', category: 'vegetables' },
    { name: 'Leek', category: 'vegetables' },
    { name: 'Radish', category: 'vegetables' },
    
    // Fruits
    { name: 'Banana', category: 'fruits' },
    { name: 'Apple', category: 'fruits' },
    { name: 'Orange', category: 'fruits' },
    { name: 'Lemon', category: 'fruits' },
    { name: 'Lime', category: 'fruits' },
    { name: 'Strawberry', category: 'fruits' },
    { name: 'Blueberry', category: 'fruits' },
    { name: 'Watermelon', category: 'fruits' },
    { name: 'Pineapple', category: 'fruits' },
    { name: 'Mango', category: 'fruits' },
    { name: 'Papaya', category: 'fruits' },
    { name: 'Grape', category: 'fruits' },
    { name: 'Kiwi', category: 'fruits' },
    { name: 'Avocado', category: 'fruits' },
    { name: 'Coconut', category: 'fruits' },
    { name: 'Pomegranate', category: 'fruits' },
    { name: 'Peach', category: 'fruits' },
    { name: 'Plum', category: 'fruits' },
    
    // Dairy
    { name: 'Milk', category: 'dairy' },
    { name: 'Cheese', category: 'dairy' },
    { name: 'Butter', category: 'dairy' },
    { name: 'Yogurt', category: 'dairy' },
    { name: 'Cream', category: 'dairy' },
    { name: 'Sour Cream', category: 'dairy' },
    { name: 'Cream Cheese', category: 'dairy' },
    { name: 'Mozzarella', category: 'dairy' },
    { name: 'Cheddar', category: 'dairy' },
    { name: 'Feta', category: 'dairy' },
    { name: 'Parmesan', category: 'dairy' },
    { name: 'Ghee', category: 'dairy' },
    { name: 'Paneer', category: 'dairy' },
    
    // Proteins
    { name: 'Chicken', category: 'proteins' },
    { name: 'Beef', category: 'proteins' },
    { name: 'Pork', category: 'proteins' },
    { name: 'Fish', category: 'proteins' },
    { name: 'Salmon', category: 'proteins' },
    { name: 'Shrimp', category: 'proteins' },
    { name: 'Egg', category: 'proteins' },
    { name: 'Lentils', category: 'proteins' },
    { name: 'Chickpeas', category: 'proteins' },
    { name: 'Beans', category: 'proteins' },
    { name: 'Tofu', category: 'proteins' },
    { name: 'Turkey', category: 'proteins' },
    { name: 'Lamb', category: 'proteins' },
    { name: 'Duck', category: 'proteins' },
    
    // Grains
    { name: 'Rice', category: 'grains' },
    { name: 'Wheat', category: 'grains' },
    { name: 'Flour', category: 'grains' },
    { name: 'Pasta', category: 'grains' },
    { name: 'Bread', category: 'grains' },
    { name: 'Oats', category: 'grains' },
    { name: 'Corn', category: 'grains' },
    { name: 'Barley', category: 'grains' },
    { name: 'Couscous', category: 'grains' },
    { name: 'Quinoa', category: 'grains' },
    { name: 'Millets', category: 'grains' },
    
    // Spices
    { name: 'Salt', category: 'spices' },
    { name: 'Black Pepper', category: 'spices' },
    { name: 'Cumin', category: 'spices' },
    { name: 'Coriander', category: 'spices' },
    { name: 'Turmeric', category: 'spices' },
    { name: 'Cinnamon', category: 'spices' },
    { name: 'Cardamom', category: 'spices' },
    { name: 'Clove', category: 'spices' },
    { name: 'Nutmeg', category: 'spices' },
    { name: 'Ginger', category: 'spices' },
    { name: 'Chili Powder', category: 'spices' },
    { name: 'Paprika', category: 'spices' },
    { name: 'Fenugreek', category: 'spices' },
    { name: 'Bay Leaf', category: 'spices' },
    { name: 'Thyme', category: 'spices' },
    { name: 'Rosemary', category: 'spices' },
    { name: 'Basil', category: 'spices' },
    { name: 'Oregano', category: 'spices' },
    
    // Oils
    { name: 'Olive Oil', category: 'oils' },
    { name: 'Vegetable Oil', category: 'oils' },
    { name: 'Coconut Oil', category: 'oils' },
    { name: 'Sesame Oil', category: 'oils' },
    { name: 'Mustard Oil', category: 'oils' },
    { name: 'Sunflower Oil', category: 'oils' },
    { name: 'Canola Oil', category: 'oils' },
    { name: 'Peanut Oil', category: 'oils' }
    ,
    // Condiments
    { name: 'Soy Sauce', category: 'condiments' },
    { name: 'Vinegar', category: 'condiments' },
    { name: 'Mustard', category: 'condiments' },
    { name: 'Ketchup', category: 'condiments' },
    { name: 'Mayonnaise', category: 'condiments' },

    // Beverages
    { name: 'Water', category: 'beverage' },
    { name: 'Orange Juice', category: 'beverage' },
    { name: 'Apple Juice', category: 'beverage' },
    { name: 'Pineapple Juice', category: 'beverage' },
    { name: 'Lemonade', category: 'beverage' },
    { name: 'Tea', category: 'beverage' },
    { name: 'Iced Tea', category: 'beverage' },
    { name: 'Coffee', category: 'beverage' },
    { name: 'Cocoa', category: 'beverage' },
    { name: 'Sparkling Water', category: 'beverage' },
    { name: 'Soda', category: 'beverage' }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    // Load any saved data from localStorage
    loadFromLocalStorage();
    
    // Initialize demo users if none exist (this loads demo ingredients)
    initializeDemoUsers();
    
    // Now set up all event listeners after data is loaded
    setupEventListeners();
    setupLoginForm();
    
    // Populate datalists for ingredient inputs
    populateIngredientDatalist();
    populateRecipeIngredientDatalist();
});

// ===== LOGIN SYSTEM =====
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        authenticateUser(username, password);
    });
    
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });
}

function toggleSignupForm(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginToggleText').style.display = 'none';
    document.getElementById('signupToggleText').style.display = 'inline';
    // Clear login form
    document.getElementById('loginForm').reset();
}

function toggleLoginForm(e) {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginToggleText').style.display = 'inline';
    document.getElementById('signupToggleText').style.display = 'none';
    // Clear signup form
    document.getElementById('signupForm').reset();
}

function loginAsRole(role) {
    const user = users.find(u => u.role === role);
    if (user) {
        currentUser = user;
        initializeApp();
    }
}

function authenticateUser(username, password) {
    // Simple authentication (in production, use backend)
    const user = users.find(u => u.email === username || u.name === username);
    if (user && user.password === password) {
        currentUser = user;
        initializeApp();
    } else {
        alert('Invalid credentials');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const department = document.getElementById('signupDepartment').value;
    const role = document.getElementById('signupRole').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (!name || !email || !department || !role || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('Email already registered. Please use a different email or login.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        role: role,
        department: department,
        password: password,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    // Add user to array and save
    users.push(newUser);
    saveToLocalStorage();
    
    // Success message
    alert('Account created successfully! You can now login.');
    
    // Switch back to login form
    toggleLoginForm({ preventDefault: () => {} });
    
    // Optionally auto-login
    document.getElementById('username').value = email;
    document.getElementById('password').value = password;
}

function logout() {
    currentUser = null;
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('ingredientForm').reset();
    document.getElementById('recipeForm').reset();
}

function initializeApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');

    // Clear login form inputs immediately after successful login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.value = '';
    const passwordEl = document.getElementById('password');
    if (passwordEl) passwordEl.value = '';
    
    updateUserDisplay();
    buildNavMenu();
    
    // Switch to dashboard to properly clear old active states from previous user
    switchSection('dashboard');
    
    renderIngredients();
    renderRecipes();
    
    // For stores manager, also render orders sections
    if (currentUser.role === 'stores') {
        renderApprovedOrders();
        renderIssuedOrders();
    }
    
    // For lecturers, render their orders
    if (currentUser.role === 'lecturer') {
        renderMyOrders();
    }
}

function updateUserDisplay() {
    const avatar = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = avatar;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = ROLES[currentUser.role].name;
    document.getElementById('roleDisplay').textContent = ROLES[currentUser.role].name;
}

function buildNavMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.innerHTML = '';
    
    const navItems = ROLES[currentUser.role].navItems;
    const navConfig = {
        dashboard: { icon: '📊', label: 'Dashboard' },
        ingredients: { icon: '📦', label: 'Ingredients' },
        recipes: { icon: '📖', label: 'Recipes' },
        approvals: { icon: '✅', label: 'Approvals' },
        users: { icon: '👥', label: 'Users' },
        reports: { icon: '📈', label: 'Reports' },
        orders: { icon: '🛒', label: 'Orders' },
        issued: { icon: '📋', label: 'Issued' },
        my_orders: { icon: '📋', label: 'My Orders' },
        store_inventory: { icon: '📊', label: 'Store Inventory' }
    };

    navItems.forEach((item, index) => {
        const config = navConfig[item];
        const btn = document.createElement('button');
        btn.className = 'nav-btn' + (index === 0 ? ' active' : '');
        btn.dataset.section = item;
        btn.innerHTML = `<span class="icon">${config.icon}</span><span>${config.label}</span>`;
        btn.addEventListener('click', () => switchSection(item));
        navMenu.appendChild(btn);
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'dashboard') renderDashboard();
    if (sectionId === 'ingredients') renderIngredients();
    if (sectionId === 'recipes') renderRecipes();
    if (sectionId === 'approvals') renderApprovals();
    if (sectionId === 'users') renderUsers();
    if (sectionId === 'reports') renderReports();
    if (sectionId === 'orders') renderApprovedOrders();
    if (sectionId === 'issued') renderIssuedOrders();
    if (sectionId === 'my_orders') renderMyOrders();
    if (sectionId === 'store_inventory') renderStoreInventory();
}

// ===== DASHBOARD =====
function renderDashboard() {
    const grid = document.getElementById('dashboardGrid');
    
    const pendingIngredients = ingredients.filter(i => i.status === 'pending').length;
    const approvedIngredients = ingredients.filter(i => i.status === 'approved').length;
    const pendingRecipes = recipes.filter(r => r.status === 'pending').length;
    const approvedRecipes = recipes.filter(r => r.status === 'approved').length;
    const pendingOrders = ingredientOrders.filter(o => o.status.startsWith('pending')).length;
    const approvedOrders = ingredientOrders.filter(o => o.status === 'approved').length;
    const issuedOrders = ingredientOrders.filter(o => o.status === 'issued').length;
    
    let stats = [];
    
    // Stores Manager specific dashboard
    if (currentUser.role === 'stores') {
        stats = [
            { icon: '📦', label: 'Total Ingredients', value: ingredients.length },
            { icon: '🛒', label: 'Approved Orders', value: approvedOrders },
            { icon: '📋', label: 'Issued Requisitions', value: issuedOrders },
            { icon: '🛒', label: 'Total Orders', value: ingredientOrders.length }
        ];
    } else {
        stats = [
            { icon: '📦', label: 'Total Ingredients', value: ingredients.length },
            { icon: '⏳', label: 'Pending Approval', value: pendingIngredients + pendingRecipes + pendingOrders },
            { icon: '✅', label: 'Approved Items', value: approvedIngredients + approvedRecipes + approvedOrders },
            { icon: '📖', label: 'Total Recipes', value: recipes.length },
            { icon: '🛒', label: 'Ingredient Orders', value: ingredientOrders.length }
        ];
    }
    
    grid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon">${stat.icon}</div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

// ===== INGREDIENT FUNCTIONS =====
function setupEventListeners() {
    console.log('setupEventListeners called');
    console.log('categoryFilter element:', document.getElementById('categoryFilter'));
    
    // Modal controls
    document.getElementById('openIngredientModal').addEventListener('click', openIngredientModal);
    document.getElementById('cancelIngredient').addEventListener('click', closeIngredientModal);
    document.getElementById('ingredientForm').addEventListener('submit', addIngredient);
    
    // Ingredient name field - auto-populate category when ingredient is selected
    document.getElementById('ingredientName').addEventListener('input', function() {
        const selectedIngredient = ingredientCatalog.find(
            ing => ing.name.toLowerCase() === this.value.toLowerCase()
        );
        if (selectedIngredient) {
            document.getElementById('ingredientCategory').value = selectedIngredient.category;
        }
    });
    
    document.getElementById('openRecipeModal').addEventListener('click', openRecipeModal);
    document.getElementById('cancelRecipe').addEventListener('click', closeRecipeModal);
    document.getElementById('recipeForm').addEventListener('submit', addRecipe);
    document.getElementById('addIngredientBtn').addEventListener('click', addRecipeIngredient);
    
    document.getElementById('openUserModal').addEventListener('click', openUserModal);
    document.getElementById('cancelUser').addEventListener('click', closeUserModal);
    document.getElementById('userForm').addEventListener('submit', addUser);
    
    // Order modal listeners
    // TODO: These functions need to be implemented for the ingredient ordering feature
    // document.getElementById('cancelOrder').addEventListener('click', closeOrderModal);
    // document.getElementById('orderForm').addEventListener('submit', createOrder);
    // document.getElementById('orderStudentCount').addEventListener('input', calculateOrderQuantities);
    
    // Search and filter - with debouncing for better performance
    let searchTimeout;
    document.getElementById('ingredientSearch').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(renderIngredients, 100);
    });
    
    document.getElementById('categoryFilter').addEventListener('change', function() {
        console.log('Category filter changed to:', this.value);
        clearTimeout(searchTimeout);
        renderIngredients();
    });
    
    document.getElementById('approvalFilter').addEventListener('change', function() {
        console.log('Approval filter changed to:', this.value);
        clearTimeout(searchTimeout);
        renderIngredients();
    });
    
    document.getElementById('recipeSearch').addEventListener('input', renderRecipes);
    document.getElementById('recipeCourseFilter').addEventListener('change', renderRecipes);
    document.getElementById('recipeApprovalFilter').addEventListener('change', renderRecipes);
    
    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
            selectedRecipeIngredients = [];
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function populateIngredientDatalist() {
    const datalist = document.getElementById('ingredientList');
    datalist.innerHTML = '';
    
    ingredientCatalog.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.name;
        datalist.appendChild(option);
    });
}

function populateRecipeIngredientDatalist() {
    const datalist = document.getElementById('recipeIngredientList');
    datalist.innerHTML = '';
    
    ingredientCatalog.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.name;
        datalist.appendChild(option);
    });
}

function openIngredientModal() {
    document.getElementById('ingredientForm').reset();
    document.getElementById('ingredientModal').classList.add('active');
    populateIngredientDatalist();
}

function closeIngredientModal() {
    document.getElementById('ingredientModal').classList.remove('active');
}

function addIngredient() {
    // Only allow training assistant to add ingredients
    if (currentUser.role !== 'training_assistant') {
        alert('Only Training Assistants can add ingredients');
        return;
    }

    const name = document.getElementById('ingredientName').value.trim();
    const category = document.getElementById('ingredientCategory').value;
    const quantity = parseFloat(document.getElementById('ingredientQuantity').value);
    const unit = document.getElementById('ingredientUnit').value;

    if (!name || !category) return;

    const ingredient = {
        id: Date.now(),
        name,
        category,
        quantity,
    unit,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        status: 'approved'
    };

    ingredients.push(ingredient);
    saveToLocalStorage();
    renderIngredients();
    closeIngredientModal();
}

function deleteIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) return;
    if (!canDeleteIngredient(ingredient)) {
        alert('You are not authorized to delete this ingredient');
        return;
    }

    if (confirm('Delete this ingredient?')) {
        ingredients = ingredients.filter(ing => ing.id !== id);
        saveToLocalStorage();
        renderIngredients();
    }
}

function renderIngredients() {
    console.log('renderIngredients called');
    const grid = document.getElementById('ingredientsGrid');
    const searchTerm = document.getElementById('ingredientSearch').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    console.log('Search term:', searchTerm, 'Category:', selectedCategory, 'Total ingredients:', ingredients.length);
    
    // Show/hide add ingredient button based on user role
    const addIngredientBtn = document.getElementById('openIngredientModal');
    if (addIngredientBtn) {
        // Keep add button visible for Training Assistants (existing behavior)
        addIngredientBtn.style.display = currentUser.role === 'training_assistant' ? 'block' : 'none';
    }

    let filtered = ingredients.filter(ing => {
        const matchesSearch = ing.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || ing.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    console.log('Filtered results:', filtered.length);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><h3>No ingredients found</h3></div>`;
        return;
    }

    // Add container styles to fill viewport
    grid.style.height = 'calc(100vh - 200px)'; // Adjust for header/filters
    grid.style.overflow = 'auto';
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';

    grid.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; min-width: 800px;">
            <thead style="position: sticky; top: 0; z-index: 1; background: var(--background);">
                <tr style="background: rgba(255,255,255,0.05);">
                    <th style="padding: 16px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); white-space: nowrap;">Name</th>
                    <th style="padding: 16px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); white-space: nowrap;">Category</th>
                    <th style="padding: 16px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1); white-space: nowrap;">Quantity</th>
                    
                    <th style="padding: 16px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); white-space: nowrap;">Added By</th>

                    ${currentUser.role === 'admin' ? '<th style="padding: 16px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1); white-space: nowrap;">Actions</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${filtered.map(ing => {
                    

                    return `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 16px;">${ing.name}</td>
                            <td style="padding: 16px;">${ing.category}</td>
                            <td style="padding: 16px; text-align: center;">
                                <strong>${ing.quantity}</strong> ${ing.unit}
                            </td>
                            <td style="padding: 16px; color: var(--text-secondary);">${ing.createdBy}</td>
                            ${currentUser.role === 'admin' ? `
                                <td style="padding: 16px; text-align: center;">
                                    <button class="btn-edit" onclick="editIngredient(${ing.id})" style="margin-right: 8px; padding: 6px 12px;">Edit</button>
                                    <button class="btn-delete" onclick="deleteIngredient(${ing.id})" style="padding: 6px 12px;">Delete</button>
                                </td>
                            ` : ''}
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function canEditIngredient(ingredient) {
    // Training assistants no longer have edit rights here.
    // Admins can edit any ingredient; Stores can edit if they created the item.
    return currentUser.role === 'admin' ||
        (currentUser.role === 'stores' && ingredient.createdBy === currentUser.name);
}

function canDeleteIngredient(ingredient) {
    // Training assistants no longer have delete rights.
    // Admins can delete any ingredient; Stores can delete if they created the item.
    return currentUser.role === 'admin' ||
        (currentUser.role === 'stores' && ingredient.createdBy === currentUser.name);
}

function editIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient || !canEditIngredient(ingredient)) return;

    document.getElementById('ingredientName').value = ingredient.name;
    document.getElementById('ingredientCategory').value = ingredient.category;
    document.getElementById('ingredientQuantity').value = ingredient.quantity;
    document.getElementById('ingredientUnit').value = ingredient.unit;

    ingredients = ingredients.filter(ing => ing.id !== id);
    openIngredientModal();
}

// ===== RECIPE FUNCTIONS =====
function openRecipeModal() {
    document.getElementById('recipeForm').reset();
    selectedRecipeIngredients = [];
    renderRecipeIngredientsDisplay();
    populateRecipeIngredientDatalist();
    document.getElementById('recipeModal').classList.add('active');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('active');
    selectedRecipeIngredients = [];
}

function addRecipeIngredient() {
    const ingredientName = document.getElementById('recipeIngredient').value.trim();
    const quantity = parseFloat(document.getElementById('recipeQuantity').value);
    const unit = document.getElementById('recipeUnit').value;
    
    if (!ingredientName || !quantity || !unit) {
        alert('Please enter ingredient name, quantity, and unit');
        return;
    }
    
    // Check if ingredient already added
    if (selectedRecipeIngredients.some(ing => ing.name.toLowerCase() === ingredientName.toLowerCase())) {
        alert('This ingredient is already added to the recipe');
        return;
    }
    
    selectedRecipeIngredients.push({
        name: ingredientName,
        quantity,
        unit
    });
    
    // Clear inputs
    document.getElementById('recipeIngredient').value = '';
    document.getElementById('recipeQuantity').value = '';
    document.getElementById('recipeUnit').value = 'kg';
    
    renderRecipeIngredientsDisplay();
}

function renderRecipeIngredientsDisplay() {
    const tbody = document.getElementById('recipeIngredientsTableBody');
    
    if (selectedRecipeIngredients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 13px;">No ingredients added yet</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = selectedRecipeIngredients.map((ing, index) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">${ing.name}</td>
            <td style="padding: 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.1);">${ing.quantity}</td>
            <td style="padding: 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.1);">${ing.unit}</td>
            <td style="padding: 12px; text-align: center;">
                <button type="button" onclick="removeRecipeIngredient(${index})" style="padding: 6px 12px; background: #ff4757; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px; transition: all 0.3s;">Remove</button>
            </td>
        </tr>
    `).join('');
}

function removeRecipeIngredient(index) {
    selectedRecipeIngredients.splice(index, 1);
    renderRecipeIngredientsDisplay();
}

function addRecipe(e) {
    e.preventDefault();
    
    const name = document.getElementById('recipeName').value.trim();
    const servings = parseInt(document.getElementById('recipeServings').value);

    if (!name || selectedRecipeIngredients.length === 0) {
        alert('Please enter a recipe name and add at least one ingredient');
        return;
    }

    const recipe = {
        id: Date.now(),
        name,
        ingredients: [...selectedRecipeIngredients],
        servings,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        status: ['lecturer', 'training_assistant'].includes(currentUser.role) ? 'pending' : 'approved'
    };

    recipes.push(recipe);

        // Check and add any missing ingredients to the ingredients list
        selectedRecipeIngredients.forEach(recipeIng => {
            const existingIng = ingredients.find(ing => ing.name.toLowerCase() === recipeIng.name.toLowerCase());
            if (!existingIng) {
                // Get category from catalog or default to 'other'
                const catalogItem = ingredientCatalog.find(cat => cat.name.toLowerCase() === recipeIng.name.toLowerCase());
                const category = catalogItem ? catalogItem.category : 'other';
            
                // Create new ingredient with default quantity
                const newIngredient = {
                    id: Date.now() + Math.random(), // Ensure unique ID
                    name: recipeIng.name,
                    category,
                    quantity: 0, // Start with zero quantity
                    unit: recipeIng.unit,
                    createdBy: currentUser.name,
                    createdAt: new Date().toISOString(),
                    status: 'approved'
                };
                ingredients.push(newIngredient);
            }
        });

    saveToLocalStorage();
    renderRecipes();
        renderIngredients(); // Refresh ingredients list to show new items
    closeRecipeModal();
}

function deleteRecipe(id) {
    if (confirm('Delete this recipe?')) {
        recipes = recipes.filter(rec => rec.id !== id);
        saveToLocalStorage();
        renderRecipes();
    }
}

function editRecipe(id) {
    const recipe = recipes.find(rec => rec.id === id);
    if (!recipe) return;

    if (currentUser.role !== 'training_assistant') {
        alert('You are not authorized to edit this recipe');
        return;
    }

    document.getElementById('recipeForm').reset();
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('recipeServings').value = recipe.servings;
    
    selectedRecipeIngredients = [...recipe.ingredients];
    renderRecipeIngredientsDisplay();
    populateRecipeIngredientDatalist();

    const form = document.getElementById('recipeForm');
    const originalFormSubmit = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();
        updateRecipe(id);
    };

    document.getElementById('recipeModal').classList.add('active');
}

function updateRecipe(id) {
    const name = document.getElementById('recipeName').value.trim();
    const servings = parseInt(document.getElementById('recipeServings').value);

    if (!name || selectedRecipeIngredients.length === 0) {
        alert('Please enter a recipe name and add at least one ingredient');
        return;
    }

    const recipeIndex = recipes.findIndex(rec => rec.id === id);
    if (recipeIndex === -1) return;

    const recipe = recipes[recipeIndex];
    recipe.name = name;
    recipe.ingredients = [...selectedRecipeIngredients];
    recipe.servings = servings;

    saveToLocalStorage();
    renderRecipes();
    closeRecipeModal();
    
    const form = document.getElementById('recipeForm');
    form.onsubmit = addRecipe;
}

// ===== APPROVALS =====
function renderApprovals() {
    const container = document.getElementById('approvalsContent');
    
    const pendingIngredients = ingredients.filter(i => i.status === 'pending');
    const pendingRecipes = recipes.filter(r => r.status === 'pending');
    const pendingOrders = ingredientOrders.filter(o => {
        if (currentUser.role === 'lecturer_incharge') return o.status === 'pending_lic';
        if (currentUser.role === 'hod') return o.status === 'pending_hod';
        return false;
    });
    
    const canApprove = ROLES[currentUser.role].permissions.includes('approve');
    
    if (!canApprove) {
        container.innerHTML = '<p style="color: var(--text-secondary);">You do not have permission to approve items.</p>';
        return;
    }

    let html = '';

    if (pendingIngredients.length > 0) {
        html += `<h3 style="color: var(--accent-vibrant); margin-bottom: 15px;">Pending Ingredients</h3>`;
        html += pendingIngredients.map(ing => `
            <div class="approval-item ingredient">
                <div class="approval-item-header">
                    <h4 class="approval-item-title">${ing.name}</h4>
                    <span class="approval-item-type">Ingredient</span>
                </div>
                <div class="approval-item-detail">Category: <strong>${ing.category}</strong></div>
                <div class="approval-item-detail">Quantity: <strong>${ing.quantity} ${ing.unit}</strong></div>
                <div class="approval-item-detail">Created by: <strong>${ing.createdBy}</strong></div>
                <div class="approval-item-actions">
                    <button class="btn-approve" onclick="approveIngredient(${ing.id})">✓ Approve</button>
                    <button class="btn-reject" onclick="rejectIngredient(${ing.id})">✕ Reject</button>
                </div>
            </div>
        `).join('');
    }

    if (pendingRecipes.length > 0) {
        html += `<h3 style="color: var(--accent-secondary); margin-bottom: 15px; margin-top: 25px;">Pending Recipes</h3>`;
        html += pendingRecipes.map(rec => `
            <div class="approval-item recipe">
                <div class="approval-item-header">
                    <h4 class="approval-item-title">${rec.name}</h4>
                    <span class="approval-item-type recipe">Recipe</span>
                </div>
                <div class="approval-item-detail">Ingredients: <strong>${rec.ingredients.length}</strong></div>
                <div class="approval-item-detail">Servings: <strong>${rec.servings}</strong></div>
                <div class="approval-item-detail">Created by: <strong>${rec.createdBy}</strong></div>
                <div class="approval-item-actions">
                    <button class="btn-approve" onclick="approveRecipe(${rec.id})">✓ Approve</button>
                    <button class="btn-reject" onclick="rejectRecipe(${rec.id})">✕ Reject</button>
                </div>
            </div>
        `).join('');
    }

    if (pendingOrders.length > 0) {
        const title = currentUser.role === 'lecturer_incharge' ? 'Ingredient Orders - Awaiting LIC Review' : 'Ingredient Orders - Awaiting HOD Approval';
        html += `<h3 style="color: var(--accent-vibrant); margin-bottom: 15px; margin-top: 25px;">${title}</h3>`;
        html += pendingOrders.map(order => `
            <div class="approval-item order">
                <div class="approval-item-header">
                    <h4 class="approval-item-title">🍽️ ${order.recipeName}</h4>
                    <span class="approval-item-type">${currentUser.role === 'lecturer_incharge' ? 'LIC Review' : 'HOD Approval'}</span>
                </div>
                <div class="approval-item-detail">Students: <strong>${order.studentCount}</strong></div>
                <div class="approval-item-detail">Lesson Date: <strong>${order.lessonDate}</strong></div>
                <div class="approval-item-detail">Ingredients: <strong>${order.ingredients.length}</strong></div>
                <div class="approval-item-detail">Created by: <strong>${order.createdBy}</strong></div>
                ${order.notes ? `<div class="approval-item-detail">Notes: <strong>${order.notes}</strong></div>` : ''}
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Required Ingredients:</div>
                    ${order.ingredients.map(ing => `
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; padding: 6px 0; color: var(--text-secondary);">
                            <div>${ing.name}</div>
                            <div style="text-align: right; color: var(--accent-secondary);">${ing.requiredQuantity} ${ing.unit}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="approval-item-actions" style="margin-top: 15px;">
                    <button class="btn-approve" onclick="approveOrder(${order.id}, '${currentUser.role}')">✓ ${currentUser.role === 'lecturer_incharge' ? 'Recommend' : 'Approve'}</button>
                    <button class="btn-reject" onclick="rejectOrder(${order.id}, '${currentUser.role}')">✕ Reject</button>
                </div>
            </div>
        `).join('');
    }

    // Show issued/collected orders tracking for HOD/LIC
    if ((currentUser.role === 'hod' || currentUser.role === 'lecturer_incharge' || currentUser.role === 'admin') && 
        (currentUser.role === 'hod' || pendingOrders.length === 0)) {
        
        const issuedOrders = ingredientOrders.filter(o => o.status === 'issued' || o.status === 'collected');
        
        if (issuedOrders.length > 0) {
            html += `<h3 style="color: var(--accent-secondary); margin-bottom: 15px; margin-top: 25px;">📦 Issued Requisitions & Receipt Status</h3>`;
            
            // Separate issued and collected orders
            const stillIssued = issuedOrders.filter(o => o.status === 'issued');
            const collected = issuedOrders.filter(o => o.status === 'collected');
            
            if (collected.length > 0) {
                html += `<div style="margin-bottom: 20px;">`;
                html += `<h4 style="color: #2ecc71; margin-bottom: 10px; font-size: 14px;">✅ Goods Received</h4>`;
                html += collected.map(order => `
                    <div class="approval-item order" style="border-left: 4px solid #2ecc71;">
                        <div class="approval-item-header">
                            <h4 class="approval-item-title">🍽️ ${order.recipeName}</h4>
                            <span class="approval-item-type" style="background-color: #2ecc71;">Collected</span>
                        </div>
                        <div class="approval-item-detail">Requested by: <strong>${order.createdBy}</strong></div>
                        <div class="approval-item-detail">Students: <strong>${order.studentCount}</strong></div>
                        <div class="approval-item-detail">Lesson Date: <strong>${order.lessonDate}</strong></div>
                        <div class="approval-item-detail">Issued by: <strong>${order.issuedBy}</strong></div>
                        <div class="approval-item-detail">Issued on: <strong>${new Date(order.issuedAt).toLocaleDateString()}</strong></div>
                        <div class="approval-item-detail" style="background-color: #f0f8f0; padding: 8px; border-radius: 4px; margin-top: 8px;">
                            <span style="color: #2ecc71; font-weight: 600;">✓ Received by: <strong>${order.collectedBy}</strong></span>
                        </div>
                        <div class="approval-item-detail" style="background-color: #f0f8f0; padding: 8px; border-radius: 4px;">
                            <span style="color: #2ecc71; font-weight: 600;">✓ Received on: <strong>${new Date(order.collectedAt).toLocaleDateString()}</strong></span>
                        </div>
                    </div>
                `).join('');
                html += `</div>`;
            }
            
            if (stillIssued.length > 0) {
                html += `<div>`;
                html += `<h4 style="color: #00bcd4; margin-bottom: 10px; font-size: 14px;">📦 Awaiting Receipt Confirmation</h4>`;
                html += stillIssued.map(order => `
                    <div class="approval-item order" style="border-left: 4px solid #00bcd4;">
                        <div class="approval-item-header">
                            <h4 class="approval-item-title">🍽️ ${order.recipeName}</h4>
                            <span class="approval-item-type" style="background-color: #00bcd4;">Issued</span>
                        </div>
                        <div class="approval-item-detail">Requested by: <strong>${order.createdBy}</strong></div>
                        <div class="approval-item-detail">Students: <strong>${order.studentCount}</strong></div>
                        <div class="approval-item-detail">Lesson Date: <strong>${order.lessonDate}</strong></div>
                        <div class="approval-item-detail">Issued by: <strong>${order.issuedBy}</strong></div>
                        <div class="approval-item-detail">Issued on: <strong>${new Date(order.issuedAt).toLocaleDateString()}</strong></div>
                        <div class="approval-item-detail" style="background-color: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 8px; color: #856404;">
                            ⏳ <strong>Waiting for ${order.createdBy} to confirm receipt...</strong>
                        </div>
                    </div>
                `).join('');
                html += `</div>`;
            }
        }
    }

    if (pendingIngredients.length === 0 && pendingRecipes.length === 0 && pendingOrders.length === 0 && 
        !html.includes('Issued Requisitions')) {
        html = '<p style="color: var(--text-secondary);">No pending items for approval.</p>';
    }

    container.innerHTML = html;
}

function approveOrder(orderId, role) {
    const order = ingredientOrders.find(o => o.id === orderId);
    if (!order) return;
    
    if (role === 'lecturer_incharge') {
        order.licRecommendation = 'recommended';
        order.licRecommendedBy = currentUser.name;
        order.licRecommendedAt = new Date().toISOString();
        order.status = 'pending_hod';
        alert('Order recommended. Sending to HOD for final approval.');
    } else if (role === 'hod') {
        order.hodApproval = 'approved';
        order.hodApprovedBy = currentUser.name;
        order.hodApprovedAt = new Date().toISOString();
        order.status = 'approved';
        alert('Order approved!');
    }
    
    saveToLocalStorage();
    renderApprovals();
    renderMyOrders();
    renderDashboard();
}

function rejectOrder(orderId, role) {
    const reason = prompt(`Reason for rejection (${role === 'lecturer_incharge' ? 'LIC' : 'HOD'}):`);
    if (!reason) return;
    
    const order = ingredientOrders.find(o => o.id === orderId);
    if (!order) return;
    
    if (role === 'lecturer_incharge') {
        order.status = 'rejected_lic';
        order.licRecommendation = 'rejected';
        order.licRecommendedBy = currentUser.name;
        order.licRecommendedAt = new Date().toISOString();
    } else if (role === 'hod') {
        order.status = 'rejected_hod';
        order.hodApproval = 'rejected';
        order.hodApprovedBy = currentUser.name;
        order.hodApprovedAt = new Date().toISOString();
    }
    
    order.rejectionReason = reason;
    
    // 🔗 LINK: Restore inventory when order is rejected
    // This releases reserved ingredients back to available inventory
    restoreInventoryForOrder(order);
    
    saveToLocalStorage();
    renderApprovals();
    renderMyOrders();
    alert('Order rejected. Inventory has been restored.');
}

function approveIngredient(id) {
    const ingredient = ingredients.find(i => i.id === id);
    if (ingredient) {
        ingredient.status = 'approved';
        ingredient.approvedBy = currentUser.name;
        ingredient.approvedAt = new Date().toISOString();
        saveToLocalStorage();
        renderApprovals();
        renderIngredients();
        renderDashboard();
    }
}

function rejectIngredient(id) {
    const ingredient = ingredients.find(i => i.id === id);
    if (ingredient) {
        ingredient.status = 'rejected';
        ingredient.rejectedBy = currentUser.name;
        ingredient.rejectedAt = new Date().toISOString();
        saveToLocalStorage();
        renderApprovals();
        renderIngredients();
        renderDashboard();
    }
}

function approveRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
        recipe.status = 'approved';
        recipe.approvedBy = currentUser.name;
        recipe.approvedAt = new Date().toISOString();
        saveToLocalStorage();
        renderApprovals();
        renderRecipes();
        renderDashboard();
    }
}

function rejectRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
        recipe.status = 'rejected';
        recipe.rejectedBy = currentUser.name;
        recipe.rejectedAt = new Date().toISOString();
        saveToLocalStorage();
        renderApprovals();
        renderRecipes();
        renderDashboard();
    }
}

// ===== USER MANAGEMENT (ADMIN ONLY) =====
function openUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

function addUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const department = document.getElementById('userDepartment').value.trim();

    if (!name || !email || !role) return;

    const user = {
        id: Date.now(),
        name,
        email,
        role,
        department,
        password: 'password123',
        createdAt: new Date().toISOString(),
        active: true
    };

    users.push(user);
    saveToLocalStorage();
    renderUsers();
    // Clear the signup form inputs after successful signup
    const userForm = document.getElementById('userForm');
    if (userForm) userForm.reset();
    closeUserModal();
}

function deactivateUser(id) {
    const user = users.find(u => u.id === id);
    if (user && user.id !== currentUser.id) {
        user.active = false;
        saveToLocalStorage();
        renderUsers();
    }
}

function renderUsers() {
    const grid = document.getElementById('usersGrid');
    const activeUsers = users.filter(u => u.active);

    if (activeUsers.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👥</div><h3>No users found</h3></div>`;
        return;
    }

    grid.innerHTML = activeUsers.map(user => {
        const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        return `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-card-avatar">${initials}</div>
                    <div class="user-card-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-card-role">${ROLES[user.role].name}</div>
                ${user.department ? `<div class="user-card-details">📍 ${user.department}</div>` : ''}
                <div class="user-card-actions">
                    ${user.id !== currentUser.id ? `<button class="btn-deactivate" onclick="deactivateUser(${user.id})">Deactivate</button>` : '<div></div>'}
                </div>
            </div>
        `;
    }).join('');
}

// ===== REPORTS (HOD ONLY) =====
function renderReports() {
    const container = document.getElementById('reportsContainer');
    
    const ingredientsByCategory = {};
    const ingredientsByStatus = { approved: 0, pending: 0, rejected: 0 };
    const recipesByStatus = { approved: 0, pending: 0, rejected: 0 };

    ingredients.forEach(ing => {
        ingredientsByCategory[ing.category] = (ingredientsByCategory[ing.category] || 0) + 1;
        ingredientsByStatus[ing.status]++;
    });

    recipes.forEach(rec => {
        recipesByStatus[rec.status]++;
    });

    let html = `
        <div class="report-section">
            <h3>Ingredient Summary</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>✅ Approved</td>
                        <td><strong>${ingredientsByStatus.approved}</strong></td>
                    </tr>
                    <tr>
                        <td>⏳ Pending</td>
                        <td><strong>${ingredientsByStatus.pending}</strong></td>
                    </tr>
                    <tr>
                        <td>❌ Rejected</td>
                        <td><strong>${ingredientsByStatus.rejected}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="report-section">
            <h3>Ingredients by Category</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(ingredientsByCategory).map(([cat, count]) => `
                        <tr>
                            <td>${cat}</td>
                            <td><strong>${count}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="report-section">
            <h3>Recipe Summary</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>✅ Approved</td>
                        <td><strong>${recipesByStatus.approved}</strong></td>
                    </tr>
                    <tr>
                        <td>⏳ Pending</td>
                        <td><strong>${recipesByStatus.pending}</strong></td>
                    </tr>
                    <tr>
                        <td>❌ Rejected</td>
                        <td><strong>${recipesByStatus.rejected}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ===== STORES ORDERS =====
function renderApprovedOrders() {
    const container = document.getElementById('ordersContainer');
    
    // Show only approved orders that haven't been issued yet
    const approvedOrders = ingredientOrders.filter(o => o.status === 'approved' && o.status !== 'issued');
    
    if (approvedOrders.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No approved orders</h3><p>All approved orders have been processed.</p></div>`;
        return;
    }

    let html = approvedOrders.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <h4>🍽️ ${order.recipeName}</h4>
                <span class="order-badge approved">Approved</span>
            </div>
            <div class="order-card-details">
                <div class="order-detail">
                    <span class="label">Students:</span>
                    <span class="value">${order.studentCount}</span>
                </div>
                <div class="order-detail">
                    <span class="label">Lesson Date:</span>
                    <span class="value">${order.lessonDate}</span>
                </div>
                <div class="order-detail">
                    <span class="label">Requested by:</span>
                    <span class="value">${order.createdBy}</span>
                </div>
                ${order.notes ? `<div class="order-detail"><span class="label">Notes:</span><span class="value">${order.notes}</span></div>` : ''}
            </div>
            <div class="order-ingredients">
                <h5>Required Ingredients:</h5>
                <div class="ingredients-list">
                    ${order.ingredients.map(ing => `
                        <div class="ingredient-line">
                            <span>${ing.name}</span>
                            <span class="qty">${ing.requiredQuantity} ${ing.unit}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="order-card-actions">
                <button class="btn-primary" onclick="issueOrder(${order.id})">✓ Issue Requisition</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderIssuedOrders() {
    const container = document.getElementById('issuedContainer');
    
    // Show only issued orders
    const issuedOrders = ingredientOrders.filter(o => o.status === 'issued');
    
    if (issuedOrders.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No issued requisitions</h3><p>No orders have been issued yet.</p></div>`;
        return;
    }

    let html = issuedOrders.map(order => `
        <div class="order-card issued">
            <div class="order-card-header">
                <h4>🍽️ ${order.recipeName}</h4>
                <span class="order-badge issued">Issued</span>
            </div>
            <div class="order-card-details">
                <div class="order-detail">
                    <span class="label">Students:</span>
                    <span class="value">${order.studentCount}</span>
                </div>
                <div class="order-detail">
                    <span class="label">Lesson Date:</span>
                    <span class="value">${order.lessonDate}</span>
                </div>
                <div class="order-detail">
                    <span class="label">Requested by:</span>
                    <span class="value">${order.createdBy}</span>
                </div>
                ${order.licRecommendedBy ? `<div class="order-detail">
                    <span class="label">LIC Review by:</span>
                    <span class="value">${order.licRecommendedBy}</span>
                </div>` : ''}
                ${order.hodApprovedBy ? `<div class="order-detail">
                    <span class="label">HOD Approved by:</span>
                    <span class="value">${order.hodApprovedBy}</span>
                </div>` : ''}
                <div class="order-detail">
                    <span class="label">Issued by:</span>
                    <span class="value">${order.issuedBy || 'N/A'}</span>
                </div>
                <div class="order-detail">
                    <span class="label">Issued on:</span>
                    <span class="value">${new Date(order.issuedAt).toLocaleDateString() || 'N/A'}</span>
                </div>
                ${order.notes ? `<div class="order-detail"><span class="label">Notes:</span><span class="value">${order.notes}</span></div>` : ''}
            </div>
            <div class="order-ingredients">
                <h5>Issued Ingredients:</h5>
                <div class="ingredients-list">
                    ${order.ingredients.map(ing => `
                        <div class="ingredient-line">
                            <span>${ing.name}</span>
                            <span class="qty">${ing.requiredQuantity} ${ing.unit}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function issueOrder(orderId) {
    const order = ingredientOrders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Issue requisition for "${order.recipeName}"?`)) {
        order.status = 'issued';
        order.issuedBy = currentUser.name;
        order.issuedAt = new Date().toISOString();
        
        saveToLocalStorage();
        renderApprovedOrders();
        renderIssuedOrders();
        renderMyOrders();
        renderDashboard();
        alert('✓ Requisition issued successfully!');
    }
}

function confirmReceiptOfGoods(orderId) {
    const order = ingredientOrders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Confirm receipt of goods for "${order.recipeName}"?`)) {
        order.status = 'collected';
        order.collectedBy = currentUser.name;
        order.collectedAt = new Date().toISOString();
        
        saveToLocalStorage();
        renderMyOrders();
        renderDashboard();
        alert('✓ Receipt of goods confirmed! Goods marked as collected.');
    }
}

function renderMyOrders() {
    const container = document.getElementById('myOrdersContainer');
    
    // Show only orders created by current lecturer
    const myOrders = ingredientOrders.filter(o => o.createdBy === currentUser.name);
    
    if (myOrders.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No requisitions yet</h3><p>You haven't placed any ingredient orders yet.</p></div>`;
        return;
    }

    // Group orders by status
    const statusGroups = {
        'pending_lic': { label: '⏳ Pending LIC Review', orders: [] },
        'pending_hod': { label: '⏳ Pending HOD Approval', orders: [] },
        'approved': { label: '✅ Approved (Ready for Collection)', orders: [] },
        'issued': { label: '📦 Awaiting Receipt Confirmation', orders: [] },
        'collected': { label: '✅ Goods Received', orders: [] },
        'rejected_lic': { label: '❌ Rejected by LIC', orders: [] },
        'rejected_hod': { label: '❌ Rejected by HOD', orders: [] }
    };

    myOrders.forEach(order => {
        if (statusGroups[order.status]) {
            statusGroups[order.status].orders.push(order);
        }
    });

    let html = '';

    Object.values(statusGroups).forEach(group => {
        if (group.orders.length > 0) {
            html += `<div style="margin-bottom: 30px;">
                <h3 style="color: var(--accent-secondary); margin-bottom: 15px; font-size: 16px;">${group.label}</h3>`;
            
            group.orders.forEach(order => {
                const statusColor = {
                    'pending_lic': '#FFA500',
                    'pending_hod': '#FFA500',
                    'approved': '#2ecc71',
                    'issued': '#00bcd4',
                    'collected': '#2ecc71',
                    'rejected_lic': '#ff4757',
                    'rejected_hod': '#ff4757'
                }[order.status] || '#999';

                html += `
                    <div class="order-card" style="margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                        <div class="order-card-header">
                            <h4>🍽️ ${order.recipeName}</h4>
                            <span class="order-badge" style="background-color: ${statusColor}; color: white;">${order.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div class="order-card-details">
                            <div class="order-detail">
                                <span class="label">Students:</span>
                                <span class="value">${order.studentCount}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Lesson Date:</span>
                                <span class="value">${order.lessonDate}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Submitted:</span>
                                <span class="value">${new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            ${order.licRecommendedBy ? `<div class="order-detail">
                                <span class="label">LIC Review by:</span>
                                <span class="value">${order.licRecommendedBy}</span>
                            </div>` : ''}
                            ${order.hodApprovedBy ? `<div class="order-detail">
                                <span class="label">HOD Approved by:</span>
                                <span class="value">${order.hodApprovedBy}</span>
                            </div>` : ''}
                            ${order.issuedBy ? `<div class="order-detail">
                                <span class="label">Issued by:</span>
                                <span class="value">${order.issuedBy}</span>
                            </div>` : ''}
                            ${order.issuedAt ? `<div class="order-detail">
                                <span class="label">Issued on:</span>
                                <span class="value">${new Date(order.issuedAt).toLocaleDateString()}</span>
                            </div>` : ''}
                            ${order.rejectionReason ? `<div class="order-detail">
                                <span class="label">Rejection Reason:</span>
                                <span class="value" style="color: #ff4757;">${order.rejectionReason}</span>
                            </div>` : ''}
                            ${order.notes ? `<div class="order-detail"><span class="label">Notes:</span><span class="value">${order.notes}</span></div>` : ''}
                        </div>
                        <div class="order-ingredients">
                            <h5>Required Ingredients:</h5>
                            <div class="ingredients-list">
                                ${order.ingredients.map(ing => `
                                    <div class="ingredient-line">
                                        <span>${ing.name}</span>
                                        <span class="qty">${ing.requiredQuantity} ${ing.unit}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${order.status === 'issued' ? `
                        <div class="order-card-actions">
                            <button class="btn-primary" onclick="confirmReceiptOfGoods(${order.id})">✓ Confirm Receipt of Goods</button>
                        </div>
                        ` : ''}
                        ${order.status === 'collected' ? `
                        <div class="order-detail" style="background-color: #f0f8f0; padding: 10px; border-radius: 4px; margin-top: 10px;">
                            <span class="label">Received by:</span>
                            <span class="value">${order.collectedBy}</span>
                        </div>
                        <div class="order-detail" style="background-color: #f0f8f0; padding: 10px; border-radius: 4px;">
                            <span class="label">Received on:</span>
                            <span class="value">${new Date(order.collectedAt).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `</div>`;
        }
    });

    container.innerHTML = html;
}

// ===== LOCAL STORAGE =====
function saveToLocalStorage() {
    localStorage.setItem('ims_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('ims_recipes', JSON.stringify(recipes));
    localStorage.setItem('ims_users', JSON.stringify(users));
    localStorage.setItem('ims_ingredient_orders', JSON.stringify(ingredientOrders));
}

function loadFromLocalStorage() {
    const savedIngredients = localStorage.getItem('ims_ingredients');
    const savedRecipes = localStorage.getItem('ims_recipes');
    const savedUsers = localStorage.getItem('ims_users');
    const savedOrders = localStorage.getItem('ims_ingredient_orders');

    if (savedIngredients) ingredients = JSON.parse(savedIngredients);
    if (savedRecipes) recipes = JSON.parse(savedRecipes);
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedOrders) ingredientOrders = JSON.parse(savedOrders);

    // Normalize units in loaded data: convert legacy 'piece' unit to 'each'
    function normalizeUnits() {
        if (Array.isArray(ingredients)) {
            ingredients.forEach(ing => {
                if (ing && ing.unit === 'piece') ing.unit = 'each';
            });
        }

        if (Array.isArray(recipes)) {
            recipes.forEach(rec => {
                if (Array.isArray(rec.ingredients)) {
                    rec.ingredients.forEach(ri => {
                        if (ri && ri.unit === 'piece') ri.unit = 'each';
                    });
                }
            });
        }

        if (Array.isArray(ingredientOrders)) {
            ingredientOrders.forEach(order => {
                if (Array.isArray(order.ingredients)) {
                    order.ingredients.forEach(oi => {
                        if (oi && oi.unit === 'piece') oi.unit = 'each';
                    });
                }
            });
        }

        if (Array.isArray(purchaseOrders)) {
            purchaseOrders.forEach(po => {
                if (po && po.unit === 'piece') po.unit = 'each';
            });
        }
    }

    normalizeUnits();

    // Persist normalized data back to localStorage so on-disk state matches UI
    saveToLocalStorage();
}

function initializeDemoUsers() {
    if (users.length === 0) {
        users = [
            { id: 1, name: 'Admin User', email: 'admin@ims.com', role: 'admin', department: 'Administration', password: 'password123', active: true },
            { id: 2, name: 'HOD - Prof. Smith', email: 'hod@ims.com', role: 'hod', department: 'Culinary Arts', password: 'password123', active: true },
            { id: 3, name: 'Lecturer In Charge', email: 'lic@ims.com', role: 'lecturer_incharge', department: 'Culinary Arts', password: 'password123', active: true },
            { id: 4, name: 'Dr. Johnson', email: 'lecturer@ims.com', role: 'lecturer', department: 'Culinary Arts', password: 'password123', active: true },
            { id: 5, name: 'Asst. Teacher', email: 'assistant@ims.com', role: 'training_assistant', department: 'Culinary Arts', password: 'password123', active: true },
            { id: 6, name: 'Stores Manager', email: 'stores@ims.com', role: 'stores', department: 'Stores', password: 'password123', active: true }
        ];
        saveToLocalStorage();
    }
    
    // Initialize demo ingredients if none exist
    if (ingredients.length === 0) {
        ingredients = [
            { id: 1, name: 'Tomato', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 2, name: 'Onion', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 3, name: 'Garlic', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 4, name: 'Carrot', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 5, name: 'Broccoli', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 6, name: 'Lettuce', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 7, name: 'Bell Pepper', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 8, name: 'Banana', category: 'fruits', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 9, name: 'Apple', category: 'fruits', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 10, name: 'Lemon', category: 'fruits', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 11, name: 'Milk', category: 'dairy', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 12, name: 'Cheese', category: 'dairy', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 13, name: 'Butter', category: 'dairy', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 14, name: 'Parmesan', category: 'dairy', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 15, name: 'Chicken', category: 'proteins', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 16, name: 'Fish', category: 'proteins', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 17, name: 'Egg', category: 'proteins', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 18, name: 'Lentils', category: 'proteins', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 19, name: 'Rice', category: 'grains', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 20, name: 'Flour', category: 'grains', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 21, name: 'Pasta', category: 'grains', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 22, name: 'Bread', category: 'grains', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 23, name: 'Salt', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 24, name: 'Black Pepper', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 25, name: 'Cumin', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 26, name: 'Turmeric', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 27, name: 'Cinnamon', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 28, name: 'Olive Oil', category: 'oils', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 29, name: 'Vegetable Oil', category: 'oils', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 30, name: 'Sesame Oil', category: 'oils', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 31, name: 'Soy Sauce', category: 'condiments', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 32, name: 'Honey', category: 'condiments', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 33, name: 'Chocolate', category: 'confectionery', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 34, name: 'Cocoa Powder', category: 'confectionery', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 35, name: 'Vanilla', category: 'spices', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 36, name: 'Almonds', category: 'nuts', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 37, name: 'Walnuts', category: 'nuts', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 38, name: 'Mint', category: 'herbs', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 39, name: 'Ginger', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 40, name: 'Lime', category: 'fruits', quantity: 1000, unit: 'each', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 41, name: 'Sugar', category: 'condiments', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 42, name: 'Peanut Butter', category: 'condiments', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 43, name: 'Cream', category: 'dairy', quantity: 1000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 44, name: 'Strawberry', category: 'fruits', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 45, name: 'Cucumber', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 46, name: 'Shrimp', category: 'proteins', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 47, name: 'Potato', category: 'vegetables', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 48, name: 'Fresh Herbs', category: 'herbs', quantity: 1000, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' }
            ,{ id: 49, name: 'Water', category: 'beverage', quantity: 2000, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 50, name: 'Orange Juice', category: 'beverage', quantity: 500, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 51, name: 'Apple Juice', category: 'beverage', quantity: 500, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 52, name: 'Lemonade', category: 'beverage', quantity: 400, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 53, name: 'Iced Tea', category: 'beverage', quantity: 300, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 54, name: 'Coffee (Ground)', category: 'beverage', quantity: 100, unit: 'kg', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 55, name: 'Sparkling Water', category: 'beverage', quantity: 300, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' },
            { id: 56, name: 'Soda', category: 'beverage', quantity: 500, unit: 'l', status: 'approved', createdBy: 'Asst. Teacher' }
        ];
        saveToLocalStorage();
    }
    
    // Initialize demo recipes if none exist
    if (recipes.length === 0) {
        recipes = [
            // ===== MAIN COURSES =====
            {
                id: 1,
                name: 'Tomato Pasta',
                course: 'main',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Tomato', quantity: 500, unit: 'g' },
                    { name: 'Garlic', quantity: 3, unit: 'each' },
                    { name: 'Onion', quantity: 1, unit: 'each' },
                    { name: 'Olive Oil', quantity: 50, unit: 'ml' }
                ]
            },
            {
                id: 2,
                name: 'Garlic Butter Fish Pasta',
                course: 'main',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Fish', quantity: 400, unit: 'g' },
                    { name: 'Pasta', quantity: 300, unit: 'g' },
                    { name: 'Garlic', quantity: 5, unit: 'each' },
                    { name: 'Butter', quantity: 100, unit: 'g' },
                    { name: 'Lemon', quantity: 1, unit: 'each' },
                    { name: 'Salt', quantity: 10, unit: 'g' },
                    { name: 'Black Pepper', quantity: 5, unit: 'g' }
                ]
            },
            {
                id: 3,
                name: 'Honey Glazed Chicken',
                course: 'main',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Chicken', quantity: 600, unit: 'g' },
                    { name: 'Honey', quantity: 150, unit: 'ml' },
                    { name: 'Garlic', quantity: 4, unit: 'each' },
                    { name: 'Lemon', quantity: 1, unit: 'each' },
                    { name: 'Salt', quantity: 10, unit: 'g' },
                    { name: 'Black Pepper', quantity: 5, unit: 'g' },
                    { name: 'Olive Oil', quantity: 60, unit: 'ml' }
                ]
            },

            // ===== SIDE DISHES =====
            {
                id: 4,
                name: 'Garlic Mashed Potatoes',
                course: 'side',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Potato', quantity: 800, unit: 'g' },
                    { name: 'Butter', quantity: 100, unit: 'g' },
                    { name: 'Milk', quantity: 200, unit: 'ml' },
                    { name: 'Garlic', quantity: 4, unit: 'each' },
                    { name: 'Salt', quantity: 5, unit: 'g' },
                    { name: 'Black Pepper', quantity: 3, unit: 'g' }
                ]
            },
            {
                id: 5,
                name: 'Herb Rice Pilaf',
                course: 'side',
                servings: 5,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Rice', quantity: 400, unit: 'g' },
                    { name: 'Vegetable Oil', quantity: 40, unit: 'ml' },
                    { name: 'Onion', quantity: 1, unit: 'each' },
                    { name: 'Garlic', quantity: 3, unit: 'each' },
                    { name: 'Fresh Herbs', quantity: 20, unit: 'g' },
                    { name: 'Salt', quantity: 5, unit: 'g' }
                ]
            },
            {
                id: 6,
                name: 'Roasted Root Vegetables',
                course: 'side',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Carrot', quantity: 300, unit: 'g' },
                    { name: 'Potato', quantity: 300, unit: 'g' },
                    { name: 'Onion', quantity: 2, unit: 'each' },
                    { name: 'Garlic', quantity: 4, unit: 'each' },
                    { name: 'Olive Oil', quantity: 50, unit: 'ml' },
                    { name: 'Fresh Herbs', quantity: 15, unit: 'g' }
                ]
            },

            // ===== APPETIZERS =====
            {
                id: 7,
                name: 'Garlic Cheese Croutons',
                course: 'appetizer',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Bread', quantity: 2, unit: 'each' },
                    { name: 'Cheese', quantity: 100, unit: 'g' },
                    { name: 'Garlic', quantity: 3, unit: 'each' },
                    { name: 'Butter', quantity: 50, unit: 'g' },
                    { name: 'Fresh Herbs', quantity: 10, unit: 'g' }
                ]
            },
            {
                id: 8,
                name: 'Shrimp Satay with Peanut Sauce',
                course: 'appetizer',
                servings: 6,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Shrimp', quantity: 300, unit: 'g' },
                    { name: 'Peanut Butter', quantity: 150, unit: 'g' },
                    { name: 'Lime', quantity: 2, unit: 'each' },
                    { name: 'Garlic', quantity: 3, unit: 'each' },
                    { name: 'Ginger', quantity: 20, unit: 'g' }
                ]
            },
            {
                id: 9,
                name: 'Vegetable Spring Rolls',
                course: 'appetizer',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Lettuce', quantity: 150, unit: 'g' },
                    { name: 'Carrot', quantity: 100, unit: 'g' },
                    { name: 'Cucumber', quantity: 100, unit: 'g' },
                    { name: 'Bread', quantity: 1, unit: 'each' },
                    { name: 'Soy Sauce', quantity: 50, unit: 'ml' }
                ]
            },

            // ===== DESSERTS =====
            {
                id: 10,
                name: 'Chocolate Mousse',
                course: 'dessert',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Chocolate', quantity: 200, unit: 'g' },
                    { name: 'Egg', quantity: 3, unit: 'each' },
                    { name: 'Vanilla', quantity: 5, unit: 'g' },
                    { name: 'Sugar', quantity: 50, unit: 'g' },
                    { name: 'Cream', quantity: 300, unit: 'ml' }
                ]
            },
            {
                id: 11,
                name: 'Lemon Vanilla Cake',
                course: 'dessert',
                servings: 6,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Flour', quantity: 300, unit: 'g' },
                    { name: 'Lemon', quantity: 2, unit: 'each' },
                    { name: 'Egg', quantity: 4, unit: 'each' },
                    { name: 'Sugar', quantity: 200, unit: 'g' },
                    { name: 'Butter', quantity: 150, unit: 'g' },
                    { name: 'Vanilla', quantity: 10, unit: 'g' }
                ]
            },
            {
                id: 12,
                name: 'Strawberry Tart',
                course: 'dessert',
                servings: 6,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Bread', quantity: 1, unit: 'each' },
                    { name: 'Cream', quantity: 400, unit: 'ml' },
                    { name: 'Strawberry', quantity: 250, unit: 'g' },
                    { name: 'Sugar', quantity: 100, unit: 'g' },
                    { name: 'Honey', quantity: 100, unit: 'ml' }
                ]
            },

            // ===== CONFECTIONERY =====
            {
                id: 13,
                name: 'Chocolate Truffles',
                course: 'confectionery',
                servings: 12,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Chocolate', quantity: 300, unit: 'g' },
                    { name: 'Cocoa Powder', quantity: 50, unit: 'g' },
                    { name: 'Cream', quantity: 200, unit: 'ml' },
                    { name: 'Sugar', quantity: 50, unit: 'g' }
                ]
            },
            {
                id: 14,
                name: 'Almond Brittle',
                course: 'confectionery',
                servings: 10,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Almonds', quantity: 250, unit: 'g' },
                    { name: 'Sugar', quantity: 300, unit: 'g' },
                    { name: 'Butter', quantity: 100, unit: 'g' },
                    { name: 'Salt', quantity: 5, unit: 'g' }
                ]
            },
            {
                id: 15,
                name: 'Vanilla Fudge',
                course: 'confectionery',
                servings: 8,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Chocolate', quantity: 250, unit: 'g' },
                    { name: 'Vanilla', quantity: 10, unit: 'g' },
                    { name: 'Sugar', quantity: 200, unit: 'g' },
                    { name: 'Butter', quantity: 120, unit: 'g' },
                    { name: 'Cream', quantity: 150, unit: 'ml' }
                ]
            },

            // ===== COCKTAILS =====
            {
                id: 16,
                name: 'Mojito',
                course: 'cocktail',
                servings: 1,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Mint', quantity: 10, unit: 'g' },
                    { name: 'Lime', quantity: 1, unit: 'each' },
                    { name: 'Sugar', quantity: 20, unit: 'g' },
                    { name: 'Soy Sauce', quantity: 50, unit: 'ml' }
                ]
            },
            {
                id: 17,
                name: 'Lime Ginger Refresher',
                course: 'cocktail',
                servings: 1,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Lime', quantity: 1, unit: 'each' },
                    { name: 'Ginger', quantity: 15, unit: 'g' },
                    { name: 'Sugar', quantity: 15, unit: 'g' },
                    { name: 'Fresh Herbs', quantity: 5, unit: 'g' }
                ]
            },
            {
                id: 18,
                name: 'Honey Lemon Punch',
                course: 'cocktail',
                servings: 4,
                status: 'approved',
                createdBy: 'Dr. Johnson',
                ingredients: [
                    { name: 'Lemon', quantity: 3, unit: 'each' },
                    { name: 'Honey', quantity: 200, unit: 'ml' },
                    { name: 'Ginger', quantity: 20, unit: 'g' },
                    { name: 'Mint', quantity: 15, unit: 'g' }
                ]
            }
        ];
        saveToLocalStorage();
    }
}

// ===== LOGIN FUNCTION =====
function loginAsRole(role) {
    loadFromLocalStorage();
    initializeDemoUsers();
    
    const user = users.find(u => u.role === role);
    if (user) {
        currentUser = user;
        initializeApp();
        setupEventListeners();
        populateIngredientDatalist();
        populateRecipeIngredientDatalist();
    }
}

// Login form submission
function handleLoginFormSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    loadFromLocalStorage();
    initializeDemoUsers();
    
    const user = users.find(u => (u.email === username || u.name === username) && u.password === password && u.active);
    
    if (user) {
        currentUser = user;
        initializeApp();
        setupEventListeners();
        populateIngredientDatalist();
        populateRecipeIngredientDatalist();
    } else {
        alert('Invalid credentials or inactive user');
    }
}

// ===== RECIPES RENDERING =====
function renderRecipes() {
    const grid = document.getElementById('recipesGrid');
    
    if (!grid) return;
    
    const searchTerm = document.getElementById('recipeSearch')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('recipeApprovalFilter')?.value || '';
    const filterCourse = document.getElementById('recipeCourseFilter')?.value || '';
    
    // Hide create recipe button for lecturer role
    const createRecipeBtn = document.getElementById('openRecipeModal');
    if (createRecipeBtn && currentUser.role === 'lecturer') {
        createRecipeBtn.style.display = 'none';
    }
    
    let filtered = recipes.filter(rec => {
        const matchesSearch = rec.name.toLowerCase().includes(searchTerm);
        const matchesFilter = !filterStatus || rec.status === filterStatus;
        const matchesCourse = !filterCourse || rec.course === filterCourse;
        return matchesSearch && matchesFilter && matchesCourse;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📖</div><h3>No recipes found</h3></div>`;
        return;
    }
    
    // Map course types to emoji
    const courseEmojis = {
        'appetizer': '🥒',
        'main': '🍽️',
        'side': '🥗',
        'dessert': '🍰',
        'confectionery': '🍫',
        'cocktail': '🍹'
    };
    
    grid.innerHTML = filtered.map(rec => `
        <div class="recipe-card ${rec.status}" ${rec.status === 'approved' && currentUser.role === 'lecturer' ? `onclick="openOrderModal(${rec.id}); return false;" style="cursor: pointer;"` : ''}>
            <div class="recipe-header">
                <div class="recipe-title">${rec.name}</div>
                
                <div class="recipe-meta">
                    <span>${courseEmojis[rec.course] || '📖'} ${rec.course ? rec.course.charAt(0).toUpperCase() + rec.course.slice(1) : 'Recipe'}</span>
                    <span>🍽️ ${rec.servings} servings</span>
                </div>
            </div>
            <div class="recipe-body">
                <div class="recipe-ingredients-list">
                    <h4>Ingredients</h4>
                    ${rec.ingredients.map(ing => `
                        <div class="recipe-ingredient-item">${ing.name}: ${ing.quantity} ${ing.unit}</div>
                    `).join('')}
                </div>
                ${rec.status === 'approved' && currentUser.role === 'lecturer' ? `<p style="font-size: 12px; color: var(--accent-vibrant); margin-top: 8px; font-weight: 600;">👆 Click to order ingredients</p>` : ''}
                <div class="recipe-card-actions">
                    ${rec.status === 'pending' && (currentUser.role === 'lecturer_incharge' || currentUser.role === 'admin') ? `
                        <button class="btn-edit" onclick="approveRecipe(${rec.id}); return false;">✅ Approve</button>
                        <button class="btn-delete" onclick="rejectRecipe(${rec.id}); return false;">❌ Reject</button>
                    ` : ''}
                    ${currentUser.role === 'training_assistant' ? `
                        <button class="btn-edit" onclick="editRecipe(${rec.id}); return false;">✏️ Edit</button>
                        <button class="btn-delete" onclick="deleteRecipe(${rec.id}); return false;">🗑 Delete</button>
                    ` : ''}
                    ${rec.createdBy === currentUser.name && rec.status === 'pending' && currentUser.role !== 'training_assistant' ? `<button class="btn-delete" onclick="deleteRecipe(${rec.id}); return false;">🗑 Delete</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ===== ORDER MODAL & SUBMISSION =====
function openOrderModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Create order modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="orderModalOverlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>📋 Order Ingredients for: ${recipe.name}</h3>
                    <button class="close-btn" id="orderModalCloseBtn" type="button">&times;</button>
                </div>
                
                <div class="order-form">
                    <div class="form-group">
                        <label>Base Servings (Recipe):</label>
                        <p style="font-size: 16px; font-weight: bold; color: #2ecc71;">${recipe.servings}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="studentCount_${recipeId}">Number of Students:</label>
                        <input type="number" id="studentCount_${recipeId}" min="1" value="20" style="width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.05); color: inherit;">
                    </div>
                    
                    <div class="form-group">
                        <label>📦 Ingredients to Order:</label>
                        <div id="orderIngredientsList" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; margin-top: 10px;">
                            ${recipe.ingredients.map((ing, idx) => `
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <span>${ing.name}</span>
                                    <span style="font-weight: bold; color: #2ecc71;" class="order-qty-display" data-ing-index="${idx}">Calculating...</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="lessonDate_${recipeId}">Lesson Date:</label>
                        <input type="date" id="lessonDate_${recipeId}" required style="width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.05); color: inherit;">
                    </div>
                    
                    <div class="form-group">
                        <label for="orderNotes_${recipeId}">Notes (Optional):</label>
                        <textarea id="orderNotes_${recipeId}" rows="3" placeholder="Add any special requirements..." style="width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.05); color: inherit; resize: vertical;"></textarea>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                        <button type="button" class="btn-secondary" id="orderCancelBtn" style="flex: 1;">❌ Cancel</button>
                        <button type="button" class="btn-primary" id="orderSubmitBtn" style="flex: 1;">✅ Submit Order Requisition</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert modal into page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners
    const closeBtn = document.getElementById('orderModalCloseBtn');
    const cancelBtn = document.getElementById('orderCancelBtn');
    const submitBtn = document.getElementById('orderSubmitBtn');
    const studentCountInput = document.getElementById(`studentCount_${recipeId}`);
    const overlay = document.getElementById('orderModalOverlay');
    
    closeBtn.addEventListener('click', closeOrderModal);
    cancelBtn.addEventListener('click', closeOrderModal);
    submitBtn.addEventListener('click', () => submitOrder(recipeId));
    studentCountInput.addEventListener('change', () => calculateOrderQuantities(recipeId));
    studentCountInput.addEventListener('input', () => calculateOrderQuantities(recipeId));
    
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'orderModalOverlay') closeOrderModal();
    });
    
    // Calculate initial quantities
    calculateOrderQuantities(recipeId);
}

function closeOrderModal() {
    const modal = document.getElementById('orderModalOverlay');
    if (modal) modal.remove();
}

function calculateOrderQuantities(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const studentCountInput = document.getElementById(`studentCount_${recipeId}`);
    if (!studentCountInput) return;
    
    const studentCount = parseInt(studentCountInput.value) || 1;
    
    // Update all ingredient quantity displays
    const displays = document.querySelectorAll('.order-qty-display');
    displays.forEach((display, idx) => {
        if (idx < recipe.ingredients.length) {
            const ing = recipe.ingredients[idx];
            const multiplier = studentCount / recipe.servings;
            const requiredQty = ing.quantity * multiplier;
            display.textContent = `${requiredQty.toFixed(2)} ${ing.unit}`;
        }
    });
}

// ===== INVENTORY ADJUSTMENT FOR REQUISITIONS =====
/**
 * Adjusts ingredient inventory quantities when an order is submitted.
 * This creates a link between requisitions and inventory management.
 * The inventory is immediately deducted to prevent over-allocation.
 * Creates an audit trail by recording:
 * - What ingredients were reserved
 * - How much was taken from inventory
 * - When the adjustment occurred
 * - Which order triggered the adjustment
 * 
 * @param {Object} order - The order object containing ingredients and quantities
 * @returns {boolean} - Returns true if adjustment was successful
 */
function adjustInventoryForOrder(order) {
    const insufficientItems = [];
    const adjustmentLog = [];
    
    // First, validate that we have enough stock for all ingredients
    for (const orderIng of order.ingredients) {
        const storeIng = ingredients.find(i => i.name.toLowerCase() === orderIng.name.toLowerCase());
        
        if (!storeIng) {
            insufficientItems.push(`${orderIng.name} - NOT FOUND in inventory`);
            continue;
        }
        
        if (storeIng.quantity < orderIng.requiredQuantity) {
            insufficientItems.push(`${orderIng.name}: Only ${storeIng.quantity}${storeIng.unit} available, need ${orderIng.requiredQuantity}${orderIng.unit}`);
        }
    }
    
    // If there are insufficient items, warn but continue (allowing manual override by approval process)
    if (insufficientItems.length > 0) {
        console.warn('⚠️ INVENTORY WARNING - Low stock for order:', insufficientItems);
    }
    
    // Deduct quantities from inventory
    for (const orderIng of order.ingredients) {
        const storeIng = ingredients.find(i => i.name.toLowerCase() === orderIng.name.toLowerCase());
        
        if (storeIng) {
            const previousQty = storeIng.quantity;
            storeIng.quantity -= orderIng.requiredQuantity;
            storeIng.quantity = parseFloat(storeIng.quantity.toFixed(2)); // Round to 2 decimals
            
            const logEntry = `${storeIng.name}: ${previousQty}${storeIng.unit} → ${storeIng.quantity}${storeIng.unit}`;
            adjustmentLog.push(logEntry);
            
            console.log(`📊 Inventory Updated: ${logEntry} (Deducted: ${orderIng.requiredQuantity}${storeIng.unit})`);
        }
    }
    
    // Record inventory adjustment timestamp in order for audit trail
    order.inventoryAdjustedAt = new Date().toISOString();
    
    console.log(`✅ Inventory adjustment completed for Order #${order.id} (${order.recipeName})`, adjustmentLog);
    
    return true;
}

/**
 * Restores ingredient inventory quantities if an order is rejected.
 * This ensures inventory accuracy by returning quantities when orders don't proceed.
 * Creates an audit trail by recording:
 * - What ingredients were released back
 * - How much was returned to inventory
 * - When the restoration occurred
 * - Which order triggered the restoration
 * 
 * @param {Object} order - The order object containing ingredients to be restored
 */
function restoreInventoryForOrder(order) {
    console.log(`🔄 Restoring inventory for rejected order: ${order.recipeName} (Order #${order.id})`);
    
    const restorationLog = [];
    
    for (const orderIng of order.ingredients) {
        const storeIng = ingredients.find(i => i.name.toLowerCase() === orderIng.name.toLowerCase());
        
        if (storeIng) {
            const previousQty = storeIng.quantity;
            storeIng.quantity += orderIng.requiredQuantity;
            storeIng.quantity = parseFloat(storeIng.quantity.toFixed(2)); // Round to 2 decimals
            
            const logEntry = `${storeIng.name}: ${previousQty}${storeIng.unit} → ${storeIng.quantity}${storeIng.unit}`;
            restorationLog.push(logEntry);
            
            console.log(`📊 Inventory Restored: ${logEntry} (Released: ${orderIng.requiredQuantity}${storeIng.unit})`);
        }
    }
    
    // Record inventory restoration timestamp in order for audit trail
    order.inventoryRestorredAt = new Date().toISOString();
    
    console.log(`✅ Inventory restoration completed for Order #${order.id}`, restorationLog);
}

function submitOrder(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const studentCountInput = document.getElementById(`studentCount_${recipeId}`);
    const lessonDateInput = document.getElementById(`lessonDate_${recipeId}`);
    const notesInput = document.getElementById(`orderNotes_${recipeId}`);
    
    const studentCount = parseInt(studentCountInput.value);
    const lessonDate = lessonDateInput.value;
    const notes = notesInput.value.trim();
    
    if (!studentCount || !lessonDate) {
        alert('Please enter number of students and lesson date');
        return;
    }
    
    // Calculate quantities for order
    const orderIngredients = recipe.ingredients.map(ing => ({
        name: ing.name,
        baseQuantity: ing.quantity,
        baseUnit: ing.unit,
        requiredQuantity: parseFloat(((ing.quantity / recipe.servings) * studentCount).toFixed(2)),
        unit: ing.unit
    }));
    
    const order = {
        id: Date.now(),
        recipeId: recipeId,
        recipeName: recipe.name,
        studentCount: studentCount,
        lessonDate: lessonDate,
        notes: notes,
        ingredients: orderIngredients,
        status: 'pending_lic',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        licRecommendation: null,
        licRecommendedBy: null,
        licRecommendedAt: null,
        hodApproval: null,
        hodApprovedBy: null,
        hodApprovedAt: null,
        // 📊 Inventory tracking for audit trail
        inventoryAdjustedAt: null,
        inventoryRestorredAt: null
    };
    
    // 🔗 LINK: Adjust inventory when order is submitted
    // This immediately reserves ingredients to prevent over-allocation
    adjustInventoryForOrder(order);
    
    ingredientOrders.push(order);
    saveToLocalStorage();
    closeOrderModal();
    
    alert(`✅ Order submitted successfully!\n\nRecipe: ${recipe.name}\nStudents: ${studentCount}\nDate: ${lessonDate}\n\n📊 Inventory automatically adjusted\n\nAwaiting LIC approval...`);
    
    renderRecipes();
    renderApprovals();
    renderDashboard();
}

// ===== STORE INVENTORY MANAGEMENT =====
function renderStoreInventory() {
    const container = document.getElementById('storeInventoryContainer');
    if (!container) return;
    
    // Get all ingredients and separate into low stock and normal stock
    const allIngredients = ingredients;
    const lowStockItems = allIngredients.filter(i => i.quantity < LOW_STOCK_THRESHOLD);
    const normalStockItems = allIngredients.filter(i => i.quantity >= LOW_STOCK_THRESHOLD);
    
    // Build HTML for low stock section
    const lowStockHTML = lowStockItems.length > 0 ? `
        <div class="store-section">
            <div class="section-divider">
                <h3 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Low Stock Items (Below ${LOW_STOCK_THRESHOLD} Units)</h3>
            </div>
            <div class="store-items-grid">
                ${lowStockItems.map(ing => {
                    const statusColor = ing.status === 'approved' ? '#2ecc71' : ing.status === 'pending' ? '#ff9f43' : '#ff6b6b';
                    const statusText = ing.status.charAt(0).toUpperCase() + ing.status.slice(1);
                    return `
                    <div class="store-item-card" style="border-left: 4px solid #ff6b6b;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 8px 0;">${ing.name}</h4>
                                <p style="margin: 5px 0; font-size: 13px; color: var(--text-secondary);">
                                    Category: <strong>${ing.category}</strong>
                                </p>
                                <p style="margin: 5px 0; font-size: 13px; color: var(--text-secondary);">
                                    Current Stock: <strong style="color: #ff6b6b; font-size: 16px;">${ing.quantity} ${ing.unit}</strong>
                                </p>
                                
                                ${ (ing.createdAt && !isNaN(new Date(ing.createdAt).getTime())) ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #ff9f43;">Added: ${new Date(ing.createdAt).toLocaleDateString()}</p>` : '' }
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 10px;">
                                <span class="stock-badge" style="background: #ff6b6b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; white-space: nowrap;">URGENT</span>
                            </div>
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <input type="number" min="1" value="10" class="restock-qty" style="width: 80px; padding: 6px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.05); color: inherit;" placeholder="Qty">
                            <button class="btn-primary" onclick="createPurchaseOrder(${ing.id}, this)" style="flex: 1; padding: 8px;">📝 Create PO</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    ` : `
        <div class="store-section">
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <p style="font-size: 16px;">✅ All ingredients are well-stocked! No urgent restocking needed.</p>
            </div>
        </div>
    `;
    
    // Build HTML for normal stock section
    const normalStockHTML = normalStockItems.length > 0 ? `
        <div class="store-section" style="margin-top: 30px;">
            <div class="section-divider">
                <h3 style="color: #2ecc71; margin-bottom: 20px;">📦 Normal Stock Items</h3>
            </div>
            <div class="store-items-grid">
                ${normalStockItems.map(ing => {
                    const statusColor = ing.status === 'approved' ? '#2ecc71' : ing.status === 'pending' ? '#ff9f43' : '#ff6b6b';
                    const statusText = ing.status.charAt(0).toUpperCase() + ing.status.slice(1);
                    return `
                    <div class="store-item-card" style="border-left: 4px solid #2ecc71;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 8px 0;">${ing.name}</h4>
                                <p style="margin: 5px 0; font-size: 13px; color: var(--text-secondary);">
                                    Category: <strong>${ing.category}</strong>
                                </p>
                                <p style="margin: 5px 0; font-size: 13px; color: var(--text-secondary);">
                                    Current Stock: <strong style="color: #2ecc71;">${ing.quantity} ${ing.unit}</strong>
                                </p>
                                
                                ${ (ing.createdAt && !isNaN(new Date(ing.createdAt).getTime())) ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #95a5a6;">Added: ${new Date(ing.createdAt).toLocaleDateString()}</p>` : '' }
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 10px;">
                                <span class="stock-badge" style="background: #2ecc71; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; white-space: nowrap;">OK</span>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    ` : '';
    
    // Build purchase orders section
    const poHTML = purchaseOrders.length > 0 ? `
        <div class="store-section" style="margin-top: 30px;">
            <div class="section-divider">
                <h3 style="margin-bottom: 20px;">📋 Purchase Orders History</h3>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.05); border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <th style="padding: 12px; text-align: left;">Ingredient</th>
                            <th style="padding: 12px; text-align: left;">Qty</th>
                            <th style="padding: 12px; text-align: left;">Unit</th>
                            <th style="padding: 12px; text-align: left;">Status</th>
                            <th style="padding: 12px; text-align: left;">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchaseOrders.map(po => {
                            const statusColor = po.status === 'pending' ? '#ff9f43' : po.status === 'received' ? '#2ecc71' : '#95a5a6';
                            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 12px;">${po.ingredientName}</td>
                                    <td style="padding: 12px;">${po.quantity}</td>
                                    <td style="padding: 12px;">${po.unit}</td>
                                    <td style="padding: 12px;">
                                        <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                            ${po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style="padding: 12px;">${new Date(po.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = lowStockHTML + normalStockHTML + poHTML;
}

function createPurchaseOrder(ingredientId, button) {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;
    
    const card = button.closest('.store-item-card');
    const qtyInput = card.querySelector('.restock-qty');
    const quantity = parseInt(qtyInput.value);
    
    if (!quantity || quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const purchaseOrder = {
        id: Date.now(),
        ingredientId: ingredientId,
        ingredientName: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
    };
    
    purchaseOrders.push(purchaseOrder);
    saveToLocalStorage();
    
    alert(`✅ Purchase Order Created!\n\nIngredient: ${ingredient.name}\nQuantity: ${quantity} ${ingredient.unit}\n\nStatus: Pending`);
    renderStoreInventory();
}

