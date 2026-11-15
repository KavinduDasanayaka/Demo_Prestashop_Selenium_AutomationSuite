'use strict';

const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class CartModal extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.root = By.css('#blockcart-modal');
    this.continueShoppingButton = By.css('#blockcart-modal button.btn-outline-primary[data-bs-dismiss="modal"]');
    this.proceedToCheckoutLink = By.css('#blockcart-modal a.btn.btn-primary');
  }

  async waitUntilVisible() {
    await this.driver.wait(async () => {
      const className = await this.getAttribute(this.root, 'class');
      return className.includes('show');
    }, 15000);
    await this.waitForClickable(this.continueShoppingButton);
  }

  async continueShopping() {
    await this.driver.wait(async () => {
      const found = await this.driver.findElements(this.continueShoppingButton);
      if (found.length > 0 && await found[0].isDisplayed()) {
        await this.driver.executeScript('arguments[0].click();', found[0]);
      }
      return !(await this.isDisplayed(this.root));
    }, 20000);
  }

  async proceedToCheckout() {
    const link = await this.waitForClickable(this.proceedToCheckoutLink);
    await this.driver.executeScript('arguments[0].click();', link);
    await this.driver.wait(until.urlContains('cart'), 30000);
  }
}

module.exports = CartModal;
