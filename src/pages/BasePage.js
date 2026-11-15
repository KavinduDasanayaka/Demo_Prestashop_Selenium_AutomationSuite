'use strict';

const { until } = require('selenium-webdriver');
const config = require('../config/config');

class BasePage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async open(path = '/') {
    await this.driver.get(this.baseUrl + path);
  }

  async waitForPresent(locator, timeout = config.TIMEOUT.DEFAULT) {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForVisible(locator, timeout = config.TIMEOUT.DEFAULT) {
    const el = await this.waitForPresent(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async waitForClickable(locator, timeout = config.TIMEOUT.DEFAULT) {
    const el = await this.waitForVisible(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    return el;
  }

  async click(locator, timeout = config.TIMEOUT.DEFAULT) {
    await this.driver.wait(async () => {
      try {
        const el = await this.waitForClickable(locator, timeout);
        await this.driver.executeScript('arguments[0].scrollIntoView({block:"center"});', el);
        await el.click();
        return true;
      } catch (e) {
        return false;
      }
    }, timeout);
  }

  async type(locator, text) {
    const el = await this.waitForClickable(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await this.waitForVisible(locator);
    return (await el.getText()).trim();
  }

  async getAttribute(locator, name) {
    const el = await this.waitForPresent(locator);
    return el.getAttribute(name);
  }

  async isDisplayed(locator) {
    const found = await this.driver.findElements(locator);
    if (found.length === 0) return false;
    try { return await found[0].isDisplayed(); } catch (e) { return false; }
  }
}

module.exports = BasePage;
