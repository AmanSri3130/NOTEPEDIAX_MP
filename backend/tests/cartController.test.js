import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCart } from '../controllers/cartController.js';

test('calculates coupon discount, tax, and total from cart items', () => {
  const result = calculateCart({
    items: [
      { itemId: 'course-1', itemType: 'course', price: 200, mrp: 500 },
      { itemId: 'note-1', itemType: 'note', price: 99, mrp: 149 },
    ],
    coupon: {
      code: 'FLAT50',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 100,
    },
  });

  assert.equal(result.itemCount, 2);
  assert.equal(result.subtotal, 299);
  assert.equal(result.discount, 50);
  assert.equal(result.gst, 44.82);
  assert.equal(result.total, 293.82);
});

test('does not apply a coupon below its minimum and returns a consistent empty cart', () => {
  const belowMinimum = calculateCart({
    items: [{ itemId: 'note-1', itemType: 'note', price: 49, mrp: 99 }],
    coupon: { code: 'FLAT50', discountType: 'flat', discountValue: 50, minOrderValue: 100 },
  });
  const empty = calculateCart(null);

  assert.equal(belowMinimum.discount, 0);
  assert.equal(belowMinimum.cart.coupon, null);
  assert.deepEqual(empty, {
    cart: { items: [], coupon: null },
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    gst: 0,
    total: 0,
  });
});
