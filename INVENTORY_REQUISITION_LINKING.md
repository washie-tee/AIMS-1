# Goods Requisition & Inventory Linking System

## Overview

The inventory adjustment system automatically links ingredient requisitions with inventory management. When a requisition (recipe order) is submitted, the required ingredients are immediately deducted from inventory. If the requisition is rejected, the ingredients are restored.

This creates a **bi-directional link** between the requisition workflow and ingredient inventory, ensuring accurate stock tracking throughout the entire approval and fulfillment process.

---

## How It Works

### 1. **Order Submission → Inventory Deduction** ✅

When a lecturer submits a recipe order (requisition):

```
LECTURER SUBMITS ORDER
         ↓
calculateOrderQuantities() → determines ingredient amounts needed
         ↓
submitOrder() → creates order object
         ↓
adjustInventoryForOrder(order) → 🔗 DEDUCTS ingredients from inventory
         ↓
Order saved & Inventory Updated simultaneously
```

**What happens:**
- All ingredients in the order are calculated based on number of students and lesson date
- The `adjustInventoryForOrder()` function is called BEFORE the order is saved
- Ingredient quantities in the inventory are immediately reduced
- Timestamps are recorded for audit trail (`inventoryAdjustedAt`)

**Example:**
```
Recipe: Tomato Soup (serves 20)
- Tomato: 10kg per serving

Lecturer orders for 40 students:
- Tomato needed: 20kg

Inventory BEFORE: Tomato = 50kg
Inventory AFTER:  Tomato = 30kg  ← Automatically reduced
```

---

### 2. **Order Rejection → Inventory Restoration** 🔄

If an order is rejected at any approval stage (LIC or HOD):

```
APPROVER REJECTS ORDER
         ↓
rejectOrder() → marks order as rejected, records reason
         ↓
restoreInventoryForOrder(order) → 🔗 RESTORES ingredients to inventory
         ↓
Order rejected & Inventory restored simultaneously
```

**What happens:**
- The rejection reason is recorded
- The `restoreInventoryForOrder()` function returns all reserved ingredients
- Ingredient quantities in inventory are restored to their original amounts
- Timestamps are recorded (`inventoryRestorredAt`)

**Example:**
```
Order rejected: "Insufficient funds for this lesson"

Inventory BEFORE:  Tomato = 30kg  (already deducted)
Inventory AFTER:   Tomato = 50kg  ← Automatically restored
```

---

## Function Reference

### `adjustInventoryForOrder(order)`

**Purpose:** Deducts ingredients from inventory when an order is submitted.

**Parameters:**
- `order` (Object) - The order object containing:
  - `ingredients` - Array of ingredient objects with `name`, `requiredQuantity`, `unit`
  - Other order details (recipeName, studentCount, etc.)

**Logic:**
1. Validates that sufficient stock exists for all ingredients
2. Warns about low stock items but continues (approval process can override)
3. Deducts quantities from matching ingredients in the inventory
4. Records adjustment timestamp in the order
5. Logs detailed console messages for audit trail

**Returns:** `true` if adjustment completed

**Example Usage:**
```javascript
// Called automatically in submitOrder()
adjustInventoryForOrder(order);

// Inventory is immediately deducted
// Result visible in console: "📊 Inventory Updated: Tomato: 50kg → 30kg"
```

---

### `restoreInventoryForOrder(order)`

**Purpose:** Restores ingredients to inventory when an order is rejected.

**Parameters:**
- `order` (Object) - The order object with ingredient details

**Logic:**
1. Iterates through all ingredients in the rejected order
2. Adds quantities back to matching inventory items
3. Records restoration timestamp in the order
4. Logs detailed console messages for audit trail

**Returns:** None (void function)

**Example Usage:**
```javascript
// Called automatically in rejectOrder()
restoreInventoryForOrder(order);

// Inventory is immediately restored
// Result visible in console: "📊 Inventory Restored: Tomato: 30kg → 50kg"
```

---

## Audit Trail & Tracking

Each order now includes inventory tracking fields:

```javascript
{
    id: 12345,
    recipeName: "Tomato Soup",
    ingredients: [...],
    status: "pending_lic",
    
    // 📊 Inventory Tracking
    inventoryAdjustedAt: "2024-01-15T10:30:00.000Z",     // When deducted
    inventoryRestorredAt: null,                           // When restored (if rejected)
    
    // Other fields: createdAt, licRecommendedBy, hodApprovedBy, etc.
}
```

**Timestamp Fields:**
- `inventoryAdjustedAt` - Recorded when order is first submitted (inventory deducted)
- `inventoryRestorredAt` - Recorded if order is rejected (inventory restored)

---

## Order Workflow & Inventory Status

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUISITION LIFECYCLE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SUBMITTED                                                   │
│  └─→ adjustInventoryForOrder() called                       │
│      📊 Ingredients DEDUCTED from inventory                 │
│      ⏳ Status: pending_lic                                  │
│      📈 Low stock warnings in console                       │
│                                                              │
│  ├─ LIC REJECTS                                             │
│  │  └─→ restoreInventoryForOrder() called                  │
│  │      📊 Ingredients RESTORED to inventory               │
│  │      ❌ Status: rejected_lic                             │
│  │                                                          │
│  ├─ LIC APPROVES                                            │
│  │  └─→ Status: pending_hod                                │
│  │      📊 Inventory STAYS DEDUCTED (still reserved)       │
│  │                                                          │
│  │  ├─ HOD REJECTS                                         │
│  │  │  └─→ restoreInventoryForOrder() called              │
│  │  │      📊 Ingredients RESTORED to inventory           │
│  │  │      ❌ Status: rejected_hod                         │
│  │  │                                                      │
│  │  ├─ HOD APPROVES                                        │
│  │  │  └─→ Status: approved                               │
│  │  │      📊 Inventory STAYS DEDUCTED (reserved)         │
│  │  │                                                      │
│  │  │  ├─ ISSUED BY STORES                                │
│  │  │  │  └─→ Status: issued                              │
│  │  │  │      📊 Inventory already deducted (physical)    │
│  │  │  │      ✅ Goods ready for collection               │
│  │  │  │                                                  │
│  │  │  │  ├─ LECTURER CONFIRMS RECEIPT                    │
│  │  │  │  │  └─→ Status: collected                        │
│  │  │  │  │      📊 Inventory deduction is final          │
│  │  │  │  │      ✅ Audit complete                        │
│  │  │  │  │                                               │
│  │  │  │  └─ PENDING RECEIPT                              │
│  │  │  │     └─→ Status: issued (waiting)                 │
│  │  │  │         📊 Inventory still deducted              │
│  │  │  │         ⏳ Awaiting lecturer confirmation         │
│  │  │  │                                                  │
│  │  │  └─ (Stores Manager handles issuance)              │
│                                                            │
│      (Inventory remains deducted throughout entire        │
│       approval chain - prevents over-allocation)          │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### ✅ Immediate Reservation
- Inventory is deducted **at order submission**, not at approval
- Prevents multiple orders from claiming the same inventory
- Ensures stock accuracy across the entire approval chain

### ✅ Automatic Restoration
- If order is rejected, inventory is **automatically restored**
- No manual intervention needed
- Timestamps track when restoration occurred

### ✅ Audit Trail
- Console logs show detailed inventory changes
- Order objects store adjustment timestamps
- Tracks which recipe orders caused which inventory changes

### ✅ Stock Level Warnings
- Warns if insufficient stock exists
- Allows approval process to override if needed
- Manager still sees the warning and can decide

### ✅ Precise Calculations
- Quantities calculated based on:
  - Recipe serving size
  - Number of students
  - Recipe ingredients and units
- Floating-point math handled carefully with rounding

---

## Console Output Example

When you submit an order, you'll see detailed logging:

```
submitOrder called for recipe...
adjustInventoryForOrder() starting...
📊 Inventory Updated: Tomato: 50kg → 30kg (Deducted: 20kg)
📊 Inventory Updated: Onion: 30kg → 25kg (Deducted: 5kg)
📊 Inventory Updated: Garlic: 10kg → 8.5kg (Deducted: 1.5kg)
✅ Inventory adjustment completed for Order #1705321800000 (Tomato Soup)
```

When order is rejected:

```
rejectOrder called...
restoreInventoryForOrder() starting...
🔄 Restoring inventory for rejected order: Tomato Soup (Order #1705321800000)
📊 Inventory Restored: Tomato: 30kg → 50kg (Released: 20kg)
📊 Inventory Restored: Onion: 25kg → 30kg (Released: 5kg)
📊 Inventory Restored: Garlic: 8.5kg → 10kg (Released: 1.5kg)
✅ Inventory restoration completed for Order #1705321800000
```

---

## Implementation Details

### When Functions Are Called

| Event | Function Called | Inventory Status |
|-------|------------------|------------------|
| **Order Submitted** | `adjustInventoryForOrder()` | 📉 DEDUCTED |
| **Order LIC Rejected** | `restoreInventoryForOrder()` | 📈 RESTORED |
| **Order HOD Rejected** | `restoreInventoryForOrder()` | 📈 RESTORED |
| **Order Approved** | (None - stays deducted) | 📉 STILL DEDUCTED |
| **Order Issued** | (None - stays deducted) | 📉 STILL DEDUCTED |
| **Receipt Confirmed** | (None - stays deducted) | 📉 FINAL |

### Data Flow

```
Recipe Order Form
    ↓
submitOrder(recipeId)
    ├─ Calculate quantities based on students/servings
    ├─ Create order object
    ├─ Call adjustInventoryForOrder(order)  ← 🔗 LINK POINT
    │  ├─ Validate stock availability
    │  ├─ Deduct quantities
    │  └─ Update order.inventoryAdjustedAt
    ├─ Push order to ingredientOrders[]
    ├─ Save to localStorage
    └─ Alert user & render updates
```

---

## Error Handling

### Missing Ingredients
If an ingredient in the order is not found in inventory:
- Warning logged: `"NOT FOUND in inventory"`
- Order still submits (allows approval process to handle)
- Ingredient list in console shows the issue

### Insufficient Stock
If available quantity < required quantity:
- Warning logged with quantity details
- Order still submits (allows override by approval)
- Manager can see warnings and decide

### Floating-Point Precision
- All quantities rounded to 2 decimal places
- Prevents precision errors in calculations
- Example: `8.75kg` not `8.750000000001kg`

---

## Future Enhancements

Possible improvements:

1. **Low Stock Alerts** - Show warnings in UI instead of just console
2. **Order Cancellation** - Allow lecturers to cancel before LIC review to restore inventory
3. **Partial Issuance** - Allow issuing only part of order with inventory tracking
4. **Purchase Order Integration** - Auto-create PO when stock gets too low
5. **Ingredient Substitution** - Allow replacements with similar ingredients
6. **Batch Operations** - Bulk adjust inventory for multiple orders
7. **Inventory History** - Full transaction log of all changes

---

## Troubleshooting

### Inventory Not Updating
**Check:**
1. Open browser DevTools Console (F12)
2. Submit an order
3. Look for `📊 Inventory Updated:` messages
4. Verify ingredient names match (case-insensitive)

### Order Submitted But Inventory Unchanged
**Possible causes:**
- Ingredient names don't match exactly
- Ingredients array is empty
- JavaScript errors (check console)

**Fix:**
- Verify ingredient names in recipes match ingredient catalog
- Check console for error messages
- Reload page and try again

### Inventory Over-Subtracted
**Check:**
- Multiple orders for same recipe
- Quantity calculation math
- Local storage sync issues

**Fix:**
- Verify order calculations in console
- Check `requiredQuantity` vs `baseQuantity`
- Clear localStorage and reload if corrupted

---

## Related Functions

- `submitOrder()` - Creates and submits order → triggers inventory adjustment
- `rejectOrder()` - Rejects order → triggers inventory restoration
- `approveOrder()` - Approves order → inventory stays deducted
- `issueOrder()` - Issues order → inventory stays deducted
- `confirmReceiptOfGoods()` - Confirms receipt → inventory deduction is final
- `renderIngredients()` - Displays updated inventory quantities
- `renderStoreInventory()` - Shows low stock warnings

---

## Summary

The inventory-requisition linking system creates a **closed loop** where:

1. ✅ **Submit Order** → Automatically deduct ingredients (prevent over-allocation)
2. ✅ **Approve/Reject** → Automatically restore if rejected (release reservation)
3. ✅ **Issue Goods** → Inventory remains deducted (goods physically taken)
4. ✅ **Confirm Receipt** → Deduction is final (audit complete)

This ensures **accurate, real-time inventory tracking** throughout the entire workflow while maintaining a complete **audit trail** of all adjustments.