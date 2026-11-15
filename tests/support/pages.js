'use strict';

const { state } = require('./hooks');
const SearchResultsPage = require('../../src/pages/SearchResultsPage');
const ProductPage = require('../../src/pages/ProductPage');
const CartPage = require('../../src/pages/CartPage');
const CheckoutPage = require('../../src/pages/CheckoutPage');

/** Builds the page objects for the current test's browser. Call inside a test / hook, not at load time. */
function pages() {
  const { driver, baseUrl } = state;
  return {
    search: new SearchResultsPage(driver, baseUrl),
    product: new ProductPage(driver, baseUrl),
    cart: new CartPage(driver, baseUrl),
    checkout: new CheckoutPage(driver, baseUrl),
  };
}

module.exports = { pages };
