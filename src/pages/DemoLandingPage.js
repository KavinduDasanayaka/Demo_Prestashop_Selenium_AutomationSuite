'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class DemoLandingPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.shopFrame = By.css('iframe#framelive');
    this.shopSearchBox = By.css('#ps_searchbar_input');
  }

  async isShopAlive(baseUrl) {
    try {
      await this.driver.get(`${baseUrl}/`);
      const found = await this.driver.findElements(this.shopSearchBox);
      return found.length > 0;
    } catch (e) {
      return false;
    }
  }

  async resolveShopBaseUrl(force = false) {
    if (config.BASE_URL && !force) return config.BASE_URL.replace(/\/$/, '');

    await this.driver.get(config.DEMO_LANDING_URL);
    const frame = await this.waitForPresent(this.shopFrame, config.TIMEOUT.LONG);
    const src = await this.driver.wait(async () => {
      const value = await frame.getAttribute('src');
      return value && value.includes('.demo.prestashop.com') ? value : false;
    }, config.TIMEOUT.INSTANCE_BOOT);
    return new URL(src).origin;
  }
}

module.exports = DemoLandingPage;
