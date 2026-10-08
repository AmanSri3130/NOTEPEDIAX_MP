import assert from 'node:assert/strict';
import test from 'node:test';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { initiateCheckout } from '../controllers/checkoutController.js';
import { getPaymentStatus } from '../controllers/paymentController.js';

const invoke = async (handler, request) => {
  let statusCode = 200;
  let body;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };
  await handler(request, response);
  return { statusCode, body };
};

test('payment status is derived from the owned Mongo order rather than defaulting to paid', async () => {
  const originalFindOne = Order.model.findOne;
  let query;
  try {
    Order.model.findOne = (value) => {
      query = value;
      return { lean: async () => ({ status: 'submitted', expiresAt: new Date(Date.now() + 60_000) }) };
    };

    const result = await invoke(getPaymentStatus, {
      params: { sessionToken: 'session-token' },
      user: { id: 'student-id' },
    });

    assert.deepEqual(query, { sessionToken: 'session-token', userId: 'student-id' });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.status, 'submitted');
  } finally {
    Order.model.findOne = originalFindOne;
  }
});

test('payment status reports an expired pending session', async () => {
  const originalFindOne = Order.model.findOne;
  try {
    Order.model.findOne = () => ({
      lean: async () => ({ status: 'pending', expiresAt: new Date(Date.now() - 1_000) }),
    });

    const result = await invoke(getPaymentStatus, {
      params: { sessionToken: 'expired-session' },
      user: { id: 'student-id' },
    });

    assert.equal(result.body.status, 'expired');
  } finally {
    Order.model.findOne = originalFindOne;
  }
});

test('checkout refuses to create an order without a configured business UPI destination', async () => {
  const originalPayee = process.env.PAYMENT_UPI_VPA;
  const originalFindOne = Cart.model.findOne;
  try {
    delete process.env.PAYMENT_UPI_VPA;
    Cart.model.findOne = async () => {
      throw new Error('cart should not be read when checkout is unconfigured');
    };

    const result = await invoke(initiateCheckout, { user: { id: 'student-id' } });
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.success, false);
  } finally {
    if (originalPayee === undefined) delete process.env.PAYMENT_UPI_VPA;
    else process.env.PAYMENT_UPI_VPA = originalPayee;
    Cart.model.findOne = originalFindOne;
  }
});
