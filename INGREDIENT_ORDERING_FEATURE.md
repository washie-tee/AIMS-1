# Ingredient Ordering Feature - Implementation Summary

## 🎯 Feature Overview
Lecturers can now order ingredients for lessons using approved recipes. The system automatically calculates ingredient quantities based on the number of students, and routes orders through an approval workflow.

## ✨ Key Features

### 1. **Recipe-Based Ordering**
- Only approved recipes can be used for ordering
- Lecturers click "📋 Order Ingredients" button on approved recipe cards
- Recipe name and base servings are displayed in the order form

### 2. **Automatic Quantity Calculation**
- Lecturer enters the number of students to train
- System calculates required quantities using formula: `required_qty = base_qty × (student_count ÷ base_servings)`
- Real-time preview shows both base and calculated quantities
- All calculations are done to 2 decimal places for accuracy

### 3. **Order Details**
Each order includes:
- Recipe name and student count
- Lesson date (required)
- Optional notes for special requirements
- Detailed ingredient list with base and calculated quantities
- Timestamps and creator information

### 4. **Multi-Step Approval Workflow**
Orders follow this workflow:

```
Lecturer Creates Order
        ↓
   Status: pending_lic
        ↓
Lecturer in Charge Reviews
        ├─→ Recommends → Status: pending_hod → HOD Reviews
        │                          ├─→ Approves → Status: approved ✅
        │                          └─→ Rejects → Status: rejected_hod ❌
        │
        └─→ Rejects → Status: rejected_lic ❌
```

### 5. **Approvals Section Updates**
- **LIC (Lecturer in Charge)** sees pending orders awaiting their review
- **HOD (Head of Department)** sees orders recommended by LIC
- Each approval includes:
  - Order details and ingredients
  - Student count and lesson date
  - Creator information
  - Buttons to Recommend/Approve or Reject with reason

### 6. **Dashboard Statistics**
Dashboard now displays:
- Total Ingredients
- Pending Approvals (includes orders)
- Approved Items (includes approved orders)
- Total Recipes
- **Total Ingredient Orders** (new)

## 📋 Technical Implementation

### Data Structure
```javascript
ingredientOrders = [
  {
    id: timestamp,
    recipeId: number,
    recipeName: string,
    studentCount: number,
    lessonDate: date,
    notes: string,
    ingredients: [
      {
        name: string,
        baseQuantity: number,
        requiredQuantity: number,
        unit: string
      }
    ],
    createdBy: string,
    createdAt: ISO timestamp,
    status: 'pending_lic' | 'pending_hod' | 'approved' | 'rejected_lic' | 'rejected_hod',
    licRecommendation: 'recommended' | 'rejected' | null,
    licRecommendedBy: string | null,
    licRecommendedAt: ISO timestamp | null,
    hodApproval: 'approved' | 'rejected' | null,
    hodApprovedBy: string | null,
    hodApprovedAt: ISO timestamp | null,
    rejectionReason: string (optional)
  }
]
```

### New Functions
- `openOrderModal(recipeId)` - Opens the ordering form with recipe details
- `closeOrderModal()` - Closes the modal and resets form
- `calculateOrderQuantities()` - Updates quantity preview in real-time
- `createOrder(e)` - Creates and saves a new order
- `approveOrder(orderId, role)` - Approves/recommends an order
- `rejectOrder(orderId, role)` - Rejects an order with reason

### Files Modified
1. **index.html**
   - Added ingredient order modal with form fields
   - Displays base and calculated quantities

2. **main.js**
   - Added `ingredientOrders` array to data storage
   - Added ordering functions and calculations
   - Updated approvals system to handle orders
   - Updated dashboard statistics
   - Updated localStorage to save/load orders
   - Added event listeners for order form

3. **styles.css**
   - No additional changes needed (uses existing button styles)

## 🔄 User Workflow

### For Lecturers:
1. Go to Recipes section
2. Find an approved recipe
3. Click "📋 Order Ingredients" button
4. Enter number of students
5. Enter lesson date
6. (Optional) Add special notes
7. Review calculated quantities
8. Click "📦 Create Order"
9. Order is sent to LIC for review

### For Lecturer in Charge (LIC):
1. Go to Approvals section
2. See "Ingredient Orders - Awaiting LIC Review"
3. Review order details and ingredients
4. Click "✓ Recommend" to send to HOD or "✕ Reject" with reason

### For HOD:
1. Go to Approvals section
2. See "Ingredient Orders - Awaiting HOD Approval"
3. Review order details, ingredients, and LIC recommendation
4. Click "✓ Approve" or "✕ Reject" with reason
5. Approved orders can then be sent to Stores

## 🎛️ Role Permissions

| Role | Can Order | Can Review (LIC) | Can Approve (HOD) |
|------|-----------|------------------|-------------------|
| Lecturer | ✅ | ❌ | ❌ |
| Lecturer in Charge | ❌ | ✅ | ❌ |
| HOD | ❌ | ❌ | ✅ |
| Admin | ❌ | ❌ | ❌ |
| Training Assistant | ❌ | ❌ | ❌ |
| Stores | ❌ | ❌ | ❌ |

## 💾 Data Persistence
- All orders are saved to `localStorage` under key `ims_ingredient_orders`
- Orders persist across browser sessions
- Can be cleared by clearing browser cache

## 📊 Inventory Linking System

**NEW:** Orders are now automatically linked to inventory management!

When a requisition is submitted:
- ✅ Ingredients are **automatically deducted** from inventory (prevents over-allocation)
- ⏳ Inventory remains reserved throughout entire approval chain
- 🔄 If order is rejected, inventory is **automatically restored**
- 📈 Real-time tracking of inventory changes with detailed audit trail

### How It Works:
```
Order Submitted → adjustInventoryForOrder() → Inventory DEDUCTED
                                                      ↓
Order Approved/Issued → Inventory STAYS DEDUCTED (reserved)
                                                      ↓
Order Rejected → restoreInventoryForOrder() → Inventory RESTORED
```

See **INVENTORY_REQUISITION_LINKING.md** for complete documentation on:
- How inventory adjustment works
- Function reference for `adjustInventoryForOrder()` and `restoreInventoryForOrder()`
- Audit trail and tracking
- Console logging examples
- Troubleshooting guide

## 🚀 Future Enhancements
- Export approved orders as PDF for Stores department
- Email notifications for order status changes
- Track ingredient usage and create recurring orders
- Ability to modify orders before HOD approval
- Historical view of completed orders
- Low stock warnings in UI (currently in console)
- Partial issuance with inventory updates
- Purchase order auto-generation for low stock items