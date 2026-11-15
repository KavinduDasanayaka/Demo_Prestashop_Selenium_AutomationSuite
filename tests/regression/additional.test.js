'use strict';

const assert = require('assert');
const config = require('../../src/config/config');
const { pages } = require('../support/pages');

const MUG = 'Mug The best is yet to come';

describe('Additional automated test cases', function additional() {
  this.timeout(config.TEST_TIMEOUT);

  it('TC_002 [negative] search for a non-existent product shows no results message', async () => {
    const { search } = pages();
    await search.openHome();
    await search.search('xyz12345');
    assert.strictEqual(await search.getNoResultsMessage(), 'No search results for "xyz12345"');
  });

  it('TC_003 sort search results by "Price, low to high" and "Price, high to low"', async () => {
    const { search } = pages();
    await search.openHome();
    await search.search('mug');

    await search.sortBy('Price, low to high');
    const asc = await search.getProductPrices();
    assert.deepStrictEqual(asc, [...asc].sort((a, b) => a - b));

    await search.sortBy('Price, high to low');
    const desc = await search.getProductPrices();
    assert.deepStrictEqual(desc, [...desc].sort((a, b) => b - a));
  });

  it('TC_014 [boundary] quantity cannot go below 1 (decrement at 1, quantity 0 and negative)', async () => {
    const { search, product } = pages();
    await search.openHome();
    await search.search('mug');
    await search.openProduct(MUG);
    await product.waitUntilLoaded();

    await product.clickDecrement();
    assert.strictEqual(await product.getQuantity(), 1);

    await product.setQuantity(0);
    assert.ok((await product.getQuantity()) >= 1 || !(await product.isAddToCartEnabled()));

    await product.setQuantity(-5);
    assert.ok((await product.getQuantity()) >= 1 || !(await product.isAddToCartEnabled()));
  });

  it('TC_006 [boundary] a huge quantity (99999) is rejected by available stock', async () => {
    const { search, product } = pages();
    await search.openHome();
    await search.search('mug');
    await search.openProduct(MUG);
    await product.waitUntilLoaded();

    await product.setQuantity(99999);
    await product.driver.wait(
      async () => (await product.isDisplayed(product.errorAlert)) || !(await product.isAddToCartEnabled()),
      15000
    );
    assert.ok(!(await product.isAddToCartEnabled()), 'Add to cart button must be disabled when quantity exceeds stock');
  });

  it('TC_008 removing the only cart item leaves an empty cart with checkout disabled', async () => {
    const { search, product, cart } = pages();
    await search.openHome();
    await search.search('mug');
    await search.openProduct(MUG);
    await product.waitUntilLoaded();
    const modal = await product.addToCart();
    await modal.proceedToCheckout();

    await cart.removeFirstItem();
    assert.strictEqual(await cart.getEmptyCartMessage(), 'There are no more items in your cart');
    assert.ok(await cart.isCheckoutDisabled(), 'Checkout button must be disabled for an empty cart');
  });

  it('TC_012 [negative] invalid email format "gmail-at@s.commmt" triggers validation error and does not advance to Step 2', async () => {
    const { search, product, cart, checkout } = pages();
    await search.openHome();
    await search.search('mug');
    await search.openProduct(MUG);
    await product.waitUntilLoaded();
    const modal = await product.addToCart();
    await modal.proceedToCheckout();
    await cart.proceedToCheckout();

    await checkout.fillPersonalInfo({ ...config.CUSTOMER, email: 'gmail-at@s.commmt' });
    await checkout.acceptPrivacyCheckboxes();
    await checkout.submitPersonalInfo();

    await checkout.waitForVisible(checkout.address1);
    assert.ok(await checkout.isOnPersonalStep(), 'Checkout should stay on Step 1 (Personal Information)');
  });
});
