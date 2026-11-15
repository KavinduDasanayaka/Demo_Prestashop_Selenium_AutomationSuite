'use strict';

/**
 * Central configuration. Everything can be overridden through environment variables.
 *   HEADLESS=true      run Chrome without a window
 *   BASE_URL=https://x.demo.prestashop.com   skip discovery and use a fixed shop instance
 */
module.exports = {
  DEMO_LANDING_URL: 'https://demo.prestashop.com/#/en/front',
  BASE_URL: process.env.BASE_URL || 'https://violent-trip.demo.prestashop.com/order',
  HEADLESS: String(process.env.HEADLESS || 'false').toLowerCase() === 'true',

  // Explicit-wait timeouts (ms). The demo store is slow, so these are generous.
  TIMEOUT: {
    SHORT: 5000,
    DEFAULT: 15000,
    LONG: 120000,
    INSTANCE_BOOT: 180000, // the demo provisions a fresh shop instance on first load
  },
  TEST_TIMEOUT: 240000,

  // Fake customer data - nothing here is real personal data.
  CUSTOMER: {
    gender: 'Mr.',
    firstName: 'Jae',
    lastName: 'Smith',
    email: 'qa.autotest@example.com',
    address: '123 Main St',
    city: 'New York',
    postcode: '10001',
    country: 'United States',
    state: 'New York',
  },
};
