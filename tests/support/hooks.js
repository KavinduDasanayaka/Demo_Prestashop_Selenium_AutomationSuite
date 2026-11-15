'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../src/config/config');
const { createDriver } = require('../../src/utils/driverFactory');
const DemoLandingPage = require('../../src/pages/DemoLandingPage');

const state = { baseUrl: null, driver: null };

exports.state = state;

exports.mochaHooks = {
  async beforeEach() {
    this.timeout(config.TEST_TIMEOUT);
    state.driver = await createDriver();
    const landing = new DemoLandingPage(state.driver);
    if (!state.baseUrl) {
      state.baseUrl = await landing.resolveShopBaseUrl();
      console.log(`      [setup] using shop instance: ${state.baseUrl}`);
    }
    if (!(await landing.isShopAlive(state.baseUrl))) {
      console.log(`      [setup] instance ${state.baseUrl} is down - provisioning a new one`);
      state.baseUrl = await landing.resolveShopBaseUrl(true);
      console.log(`      [setup] now using: ${state.baseUrl}`);
    }
  },

  async afterEach() {
    if (!state.driver) return;
    try {
      if (this.currentTest && this.currentTest.state === 'failed') {
        const dir = path.join(__dirname, '..', '..', 'reports', 'screenshots');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${this.currentTest.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 60)}.png`);
        fs.writeFileSync(file, await state.driver.takeScreenshot(), 'base64');
        console.log(`      [screenshot] ${file}`);
      }
    } catch (e) { /* ignore screenshot errors */ } finally {
      await state.driver.quit();
      state.driver = null;
    }
  },
};
