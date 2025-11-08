# Testing Guide: Inventory-Requisition Linking System

## Quick Start Testing

### Prerequisites
- Open the application in your browser
- Open Developer Tools (Press **F12**)
- Go to the **Console** tab to see detailed logging

---

## Test 1: Order Submission & Inventory Deduction ✅

### Steps:
1. **Login as: Dr. Johnson** (Lecturer)
   - Email: `lecturer@ims.com`
   - Password: `password123`

2. **Go to Recipes section**
   - Find an approved recipe (e.g., "Tomato Soup")

3. **Check current inventory**
   - Go to Ingredients section
   - Note down the current quantity of ingredients used in the recipe
   - Example: `Tomato: 50kg`

4. **Create an order**
   - Click "📋 Order Ingredients" on the recipe
   - Enter Students: `20`
   - Enter Lesson Date: Any future date
   - Click "📦 Create Order"

5. **Watch the console**
   - Look for messages like:
   ```
   ✅ Inventory adjustment completed for Order #...
   📊 Inventory Updated: Tomato: 50kg → 30kg (Deducted: 20kg)
   ```

6. **Verify in Ingredients section**
   - Refresh the page
   - Go to Ingredients
   - Check Tomato quantity
   - **Expected:** Should be REDUCED (e.g., `30kg` instead of `50kg`)

### ✅ Success Criteria:
- Console shows inventory adjustment logs
- Ingredient quantity in Ingredients section is LOWER
- Order appears in "My Orders" with correct status

---

## Test 2: Order Rejection & Inventory Restoration 🔄

### Steps:
1. **Login as: Lecturer In Charge**
   - Email: `lic@ims.com`
   - Password: `password123`

2. **Go to Approvals section**
   - Find the pending order you just created
   - Note the status

3. **Check current inventory**
   - Remember the reduced quantity from Test 1

4. **Reject the order**
   - Click "✕ Reject" button
   - Enter reason: "Testing inventory restoration"
   - Click confirm

5. **Watch the console**
   - Look for messages like:
   ```
   🔄 Restoring inventory for rejected order: Tomato Soup
   📊 Inventory Restored: Tomato: 30kg → 50kg (Released: 20kg)
   ✅ Inventory restoration completed for Order #...
   ```

6. **Verify in Ingredients section**
   - Go to Ingredients
   - Check Tomato quantity
   - **Expected:** Should be BACK TO ORIGINAL (e.g., `50kg`)

### ✅ Success Criteria:
- Console shows inventory restoration logs
- Ingredient quantity in Ingredients is BACK TO ORIGINAL
- Order status shows "rejected_lic"
- Alert confirms "Order rejected. Inventory has been restored."

---

## Test 3: Order Approval Chain (Inventory Stays Deducted) ⏳

### Steps:
1. **Login as: Dr. Johnson** (Lecturer)
   - Create a NEW order (follow Test 1 steps 1-4)
   - Check inventory is deducted

2. **Login as: Lecturer In Charge**
   - Go to Approvals
   - Find the new order
   - Click "✓ Recommend"
   - Alert shows "Order recommended"

3. **Check inventory**
   - Go to Ingredients
   - Verify quantity is STILL DEDUCTED
   - **Expected:** Still reduced, not restored

4. **Login as: HOD - Prof. Smith**
   - Email: `hod@ims.com`
   - Password: `password123`
   - Go to Approvals
   - Find the order recommended by LIC
   - Click "✓ Approve"

5. **Check inventory again**
   - Go to Ingredients
   - Verify quantity is STILL DEDUCTED
   - **Expected:** Still reduced, remains reserved

### ✅ Success Criteria:
- Inventory stays deducted at each approval step
- Order status progresses: `pending_lic` → `pending_hod` → `approved`
- No restoration logs appear (only during rejection)

---

## Test 4: Multiple Orders & Cumulative Deduction 📦

### Steps:
1. **Login as: Dr. Johnson** (Lecturer)

2. **Create first order**
   - Recipe: "Tomato Soup"
   - Students: 20
   - Check inventory: `Tomato: 50kg` → should be `30kg`

3. **Create second order**
   - Same recipe: "Tomato Soup"
   - Students: 10
   - Expected deduction: 10kg more

4. **Check inventory**
   - Go to Ingredients
   - Tomato quantity
   - **Expected:** `30kg - 10kg = 20kg` (cumulative)

5. **Check console logs**
   - Should see TWO inventory adjustment logs
   - Each showing the previous and new quantities

### ✅ Success Criteria:
- Both orders deduct correctly
- Quantities are cumulative
- Inventory correctly reflects multiple orders

---

## Test 5: Low Stock Warning 📉

### Steps:
1. **Login as: Admin User** or **Training Assistant**
   - Either manually reduce an ingredient to very low quantity
   - Or create enough orders to bring it below 5 units

2. **Create an order that needs more than available**
   - Example: Tomato has 2kg left, need 5kg for order
   - Submit the order anyway

3. **Check console**
   - Look for warnings:
   ```
   ⚠️ INVENTORY WARNING - Low stock for order:
   Tomato: Only 2kg available, need 5kg
   ```

4. **Verify order still created**
   - Order should still appear (allows override)
   - Inventory should still be deducted

### ✅ Success Criteria:
- Console shows low stock warnings
- Order is created despite low stock
- Inventory is deducted even with warning

---

## Test 6: Audit Trail Review 📋

### Steps:
1. **Login as: Admin User**
   - Go to Ingredients

2. **Watch console for complete workflow**
   - Create order → See `inventoryAdjustedAt` recorded
   - Reject order → See `inventoryRestorredAt` recorded

3. **Check order object**
   - Open DevTools Console
   - Type:
   ```javascript
   console.log(ingredientOrders[0])
   ```
   - Should show timestamps:
   ```javascript
   {
     id: 123456,
     recipeName: "Tomato Soup",
     inventoryAdjustedAt: "2024-01-15T10:30:00.000Z",
     inventoryRestorredAt: null  // or timestamp if rejected
   }
   ```

### ✅ Success Criteria:
- Timestamps are recorded in order objects
- `inventoryAdjustedAt` populated on submission
- `inventoryRestorredAt` populated only on rejection

---

## Test 7: Issue Order & Collection Tracking 📦

### Steps:
1. **Prepare:** Create and approve an order (through all 3 steps)

2. **Login as: Stores Manager**
   - Email: `stores@ims.com`
   - Password: `password123`
   - Go to Orders section
   - Find the approved order

3. **Issue the order**
   - Click "✓ Issue Requisition"
   - Check inventory
   - **Expected:** Still deducted (goods physically issued)

4. **Login as: Dr. Johnson** (Lecturer)
   - Go to My Orders
   - Find the issued order
   - Click "✓ Confirm Receipt of Goods"

5. **Check inventory final state**
   - Go to Ingredients
   - Quantity should be FINAL (deducted, not restored)
   - **Expected:** Permanently reduced

### ✅ Success Criteria:
- Inventory deducted at submission
- Remains deducted through approvals and issuance
- Final deduction when collected (not restored)

---

## Console Log Reference

### Order Submitted:
```
📊 Inventory Updated: Tomato: 50kg → 30kg (Deducted: 20kg)
📊 Inventory Updated: Onion: 30kg → 25kg (Deducted: 5kg)
✅ Inventory adjustment completed for Order #1705321800000 (Tomato Soup)
```

### Order Rejected:
```
🔄 Restoring inventory for rejected order: Tomato Soup (Order #1705321800000)
📊 Inventory Restored: Tomato: 30kg → 50kg (Released: 20kg)
📊 Inventory Restored: Onion: 25kg → 30kg (Released: 5kg)
✅ Inventory restoration completed for Order #1705321800000
```

### Low Stock Warning:
```
⚠️ INVENTORY WARNING - Low stock for order: [
  "Tomato: Only 2kg available, need 5kg",
  "Onion: Only 1kg available, need 2kg"
]
```

---

## Debugging Tips

### If inventory doesn't change:
1. **Check console for errors** - Look for red error messages
2. **Verify ingredient names** - Must match exactly (case-insensitive)
3. **Check ingredients array** - Recipe must have ingredients
4. **Reload page** - Ensure fresh data load

### If logs don't appear:
1. **Ensure Console tab is open** - Before submitting order
2. **Check filter** - Console might be filtering messages
3. **Look for truncated logs** - Scroll console history

### If inventory goes negative:
1. **This is normal** - Low stock allowed intentionally
2. **Check logs** - Should show warning
3. **Verify math** - Manual calculation should match

### To clear data and restart:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## Automation Test Scenarios

### Scenario 1: Basic Workflow
```
1. Create order → Check deducted ✅
2. Reject order → Check restored ✅
```

### Scenario 2: Approval Chain
```
1. Create order → Check deducted ✅
2. LIC approves → Check still deducted ✅
3. HOD approves → Check still deducted ✅
```

### Scenario 3: Complete Fulfillment
```
1. Create order → Check deducted ✅
2. LIC approves
3. HOD approves
4. Stores issues
5. Lecturer collects → Check final deducted ✅
```

### Scenario 4: Multiple Orders
```
1. Create order 1 → Check qty1 deducted ✅
2. Create order 2 → Check qty2 also deducted ✅
3. Total should be qty1 + qty2 ✅
```

### Scenario 5: Rejection at Different Stages
```
1. Create order → Check deducted ✅
2. LIC rejects → Check restored ✅
3. Create order 2 → Check deducted ✅
4. LIC approves
5. HOD rejects → Check restored ✅
```

---

## Expected Behaviors

| Action | Inventory | Order Status | Console |
|--------|-----------|--------------|---------|
| Submit | 🔴 Deducted | pending_lic | `📊 Inventory Updated` |
| LIC Reject | 🟢 Restored | rejected_lic | `📊 Inventory Restored` |
| LIC Approve | 🔴 Still Deducted | pending_hod | (no change) |
| HOD Reject | 🟢 Restored | rejected_hod | `📊 Inventory Restored` |
| HOD Approve | 🔴 Still Deducted | approved | (no change) |
| Issue | 🔴 Still Deducted | issued | (no change) |
| Collect | 🔴 Final | collected | (no change) |

---

## Success Checklist

- [ ] Order submission triggers inventory deduction
- [ ] Inventory reduction is visible in Ingredients section
- [ ] Order rejection triggers inventory restoration
- [ ] Inventory restoration returns to original value
- [ ] Inventory stays deducted during approval chain
- [ ] Multiple orders have cumulative deductions
- [ ] Low stock warnings appear in console
- [ ] Audit trail timestamps are recorded
- [ ] Console logs are clear and detailed
- [ ] All data persists after page reload

---

## Getting Help

If tests fail:
1. Check browser console (F12)
2. Review the **INVENTORY_REQUISITION_LINKING.md** documentation
3. Check ingredient names match exactly
4. Verify order has ingredients
5. Try clearing localStorage and restarting
6. Check the order object structure in console

Happy testing! 🚀