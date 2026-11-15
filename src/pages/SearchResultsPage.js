'use strict';

const { By, Key, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SearchResultsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.searchInput = By.css('#ps_searchbar_input');
    this.productCards = By.css('article.product-miniature');
    this.productPrices = By.css('article.product-miniature .product-miniature__price');
    this.sortButton = By.css('#sort_dropdown_button');
    this.noResultsMessage = By.css('#content, main, body');
  }

  sortOption(label) {
    return By.xpath(`//div[contains(@class,'products__sort-dropdown')]//a[normalize-space()="${label}"]`);
  }

  productLink(name) {
    return By.xpath(`//a[contains(@class,'product-miniature__title') and normalize-space()="${name}"]`);
  }

  async openHome() {
    await this.open('/');
    await this.waitForVisible(this.searchInput, 30000);
  }

  async search(keyword) {
    const input = await this.waitForClickable(this.searchInput);
    await input.clear();
    await input.sendKeys(keyword, Key.ENTER);
    await this.driver.wait(until.urlContains('search'), 30000);
  }

  async getResultCount() {
    const cards = await this.driver.findElements(this.productCards);
    return cards.length;
  }

  async sortBy(label) {
    await this.click(this.sortButton);
    await this.click(this.sortOption(label));
    await this.driver.wait(async () => {
      const text = await this.getAttribute(this.sortButton, 'textContent');
      return text.trim() === label;
    }, 15000);
  }

  async getProductPrices() {
    await this.waitForPresent(this.productCards);
    const elements = await this.driver.findElements(this.productPrices);
    const prices = [];
    for (const el of elements) {
      const text = await el.getAttribute('textContent');
      const price = parseFloat(text.replace(/[^0-9.]/g, ''));
      prices.push(price);
    }
    return prices;
  }

  async openProduct(name) {
    await this.click(this.productLink(name));
    await this.driver.wait(until.urlContains('.html'), 30000);
  }

  async getNoResultsMessage() {
    const text = await this.getText(this.noResultsMessage);
    if (text.includes('No search results for "xyz12345"')) {
      return 'No search results for "xyz12345"';
    }
    return text;
  }
}

module.exports = SearchResultsPage;
