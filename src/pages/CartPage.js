'use strict';

const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class CartPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.removeLinks = By.css('a.js-remove-from-cart, a.remove-from-cart, [data-link-action="delete-from-cart"]');
    this.checkoutLink = By.css('.cart-summary a.btn-primary[href*="order"]');
    this.checkoutDisabledButton = By.css('.cart-summary button.btn-primary[disabled], .cart-summary .btn-primary.disabled');
    this.cartSummaryValue = By.css('.cart-summary__value');
    this.emptyMessage = By.css('p.cart__empty');
  }

  async getCartSummaryValue() {
    return this.getText(this.cartSummaryValue);
  }

  async waitForCartSummaryValue(expected) {
    await this.driver.wait(async () => (await this.getCartSummaryValue()) === expected, 15000);
    return this.getCartSummaryValue();
  }

  async removeFirstItem() {
    await this.click(this.removeLinks);
    await this.waitForVisible(this.emptyMessage);
  }

  async isCheckoutEnabled() {
    const links = await this.driver.findElements(this.checkoutLink);
    return links.length > 0;
  }

  async isCheckoutDisabled() {
    const disabled = await this.driver.findElements(this.checkoutDisabledButton);
    const links = await this.driver.findElements(this.checkoutLink);
    return disabled.length > 0 || links.length === 0;
  }

  async getEmptyCartMessage() {
    return this.getText(this.emptyMessage);
  }

  async proceedToCheckout() {
    await this.click(this.checkoutLink);
    await this.driver.wait(until.urlContains('order'), 30000);
  }
}

module.exports = CartPage;
