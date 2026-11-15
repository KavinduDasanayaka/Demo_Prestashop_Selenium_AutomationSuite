'use strict';

const { By, Key } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const CartModal = require('./CartModal');

class ProductPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.name = By.css('h1.product__name');
    this.quantityInput = By.css('#quantity_wanted');
    this.incrementButton = By.css('button.js-increment-button');
    this.decrementButton = By.css('button.js-decrement-button');
    this.addToCartButton = By.css('button.product__add-to-cart-button');
    this.errorAlert = By.css('i.product__availability-icon');
    this.headerCartLink = By.css('a.header-block__action-btn[href*="cart?action=show"]');
  }

  async waitUntilLoaded() {
    await this.waitForVisible(this.name);
    await this.waitForPresent(this.quantityInput);
  }

  async getName() {
    return this.getText(this.name);
  }

  async getQuantity() {
    const val = await this.getAttribute(this.quantityInput, 'value');
    return parseInt(val, 10);
  }

  async clickIncrement(times = 1) {
    for (let i = 0; i < times; i += 1) {
      const before = await this.getQuantity();
      await this.click(this.incrementButton);
      await this.driver.wait(async () => (await this.getQuantity()) === before + 1, 15000);
      await this.driver.wait(async () => this.isAddToCartEnabled(), 15000);
    }
  }

  async clickDecrement() {
    await this.click(this.decrementButton);
  }

  async setQuantity(value) {
    const input = await this.waitForClickable(this.quantityInput);
    await input.sendKeys(Key.chord(Key.CONTROL, 'a'), String(value), Key.TAB);
  }

  async isAddToCartEnabled() {
    const btn = await this.waitForPresent(this.addToCartButton);
    const enabled = await btn.isEnabled();
    const className = await btn.getAttribute('class');
    return enabled && !className.includes('disabled');
  }

  async addToCart() {
    await this.click(this.addToCartButton);
    const modal = new CartModal(this.driver, this.baseUrl);
    await modal.waitUntilVisible();
    return modal;
  }

  async getHeaderCartCount() {
    const text = await this.getAttribute(this.headerCartLink, 'textContent');
    return parseInt(text.replace(/\D/g, ''), 10) || 0;
  }
}

module.exports = ProductPage;
