'use strict';

const assert = require('assert');
const config = require('../../src/config/config');
const { pages } = require('../support/pages');

const PRODUCT_A = 'Mug The best is yet to come';
const PRODUCT_B = 'Mug The adventure begins';

describe('E2E - multi-product guest shopping flow', function e2e() {
  this.timeout(config.TEST_TIMEOUT);

  it('E2E: search -> product -> qty -> cart -> continue shopping -> 2nd product -> verify cart -> guest checkout -> order confirmation', async () => {
    const { search, product, cart, checkout } = pages();
    const customer = config.CUSTOMER;

    // 1. Search for first product (TC_001)
    await search.openHome();
    await search.search('mug');
    assert.ok((await search.getResultCount()) > 0, 'search for "mug" should return products');

    // 2. Select Product A and open product page (TC_004)
    await search.openProduct(PRODUCT_A);
    await product.waitUntilLoaded();
    assert.strictEqual(await product.getName(), PRODUCT_A);

    // 3. Increase quantity from 1 to 3 (TC_005)
    assert.strictEqual(await product.getQuantity(), 1);
    await product.clickIncrement(2);
    assert.strictEqual(await product.getQuantity(), 3);

    // 4. Add to cart and click Continue Shopping (TC_007, TC_009)
    const modalA = await product.addToCart();
    await modalA.continueShopping();
    assert.strictEqual(await product.getHeaderCartCount(), 3);

    // 5. Search for second product and add to cart
    await search.search('adventure');
    await search.openProduct(PRODUCT_B);
    await product.waitUntilLoaded();
    assert.strictEqual(await product.getName(), PRODUCT_B);
    const modalB = await product.addToCart();

    // 6. Go to cart page and verify total price (TC_010)
    await modalB.proceedToCheckout();
    assert.strictEqual(await cart.waitForCartSummaryValue('€57.12'), '€57.12');
    assert.ok(await cart.isCheckoutEnabled(), 'Proceed to checkout should be enabled');

    // 7. Proceed to checkout as guest and fill details (TC_011)
    await cart.proceedToCheckout();
    await checkout.continueAsGuest(customer);
    await checkout.fillAddress(customer);
    await checkout.submitAddress();

    // 8. Shipping, payment, and order confirmation (TC_013)
    await checkout.chooseFirstShippingAndContinue();
    assert.ok(!(await checkout.isPlaceOrderEnabled()), 'Place Order should be disabled initially');
    await checkout.selectPaymentMethod();
    assert.ok(await checkout.acceptTermsAndPlaceOrder(), 'Order confirmation page should be displayed');
  });
});
