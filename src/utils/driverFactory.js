'use strict';

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/config');

/** Creates a Chrome WebDriver. Selenium Manager downloads the matching chromedriver automatically. */
async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--window-size=1440,1000', '--disable-notifications', '--lang=en-US');
  if (config.HEADLESS) options.addArguments('--headless=new');
  // 'eager' returns once the DOM is parsed - the demo's slow third-party assets are not needed.
  options.setPageLoadStrategy('normal');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  await driver.manage().setTimeouts({ pageLoad: 180000, script: 60000 });
  return driver;
}

module.exports = { createDriver };
