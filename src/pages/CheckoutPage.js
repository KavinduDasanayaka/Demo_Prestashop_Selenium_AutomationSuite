'use strict';

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class CheckoutPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    // Step 1: Personal Information
    this.genderMr = By.css('#field-id_gender_1');
    this.firstName = By.css('#field-firstname');
    this.lastName = By.css('#field-lastname');
    this.email = By.css('#field-email');
    this.termsPrivacy = By.css('#field-psgdpr');
    this.customerPrivacy = By.css('#field-customer_privacy');
    this.continuePersonal = By.css('[data-link-action="register-new-customer"]');

    // Step 2: Addresses
    this.address1 = By.css('#field-address1');
    this.postcode = By.css('#field-postcode');
    this.city = By.css('#field-city');
    this.country = By.css('#field-id_country');
    this.state = By.css('select[name="id_state"]');
    this.continueAddress = By.css('button[name="confirm-addresses"]');

    // Step 3: Shipping
    this.deliveryOptions = By.css('input[name^="delivery_option"]');
    this.continueShipping = By.css('button[name="confirmDeliveryOption"]');

    // Step 4: Payment
    this.codPaymentOption = By.css('#payment-option-2');
    this.termsCheckbox = By.css('input[id="conditions_to_approve[terms-and-conditions]"]');
    this.placeOrderButton = By.css('#payment-confirmation button[type="submit"].btn-primary');
    this.orderConfirmationHeading = By.xpath('//h1[contains(@class,"page-title-section") and normalize-space()="Your order is confirmed"]');
  }

  async fillPersonalInfo(customer) {
    await this.waitForVisible(this.firstName);
    await this.click(this.genderMr);
    await this.type(this.firstName, customer.firstName);
    await this.type(this.lastName, customer.lastName);
    await this.type(this.email, customer.email);
  }

  async acceptPrivacyCheckboxes() {
    const terms = await this.waitForPresent(this.termsPrivacy);
    await this.driver.executeScript('arguments[0].click();', terms);
    const privacy = await this.waitForPresent(this.customerPrivacy);
    await this.driver.executeScript('arguments[0].click();', privacy);
  }

  async submitPersonalInfo() {
    const btn = await this.waitForPresent(this.continuePersonal);
    await this.driver.executeScript('arguments[0].click();', btn);
  }

  async continueAsGuest(customer) {
    await this.fillPersonalInfo(customer);
    await this.acceptPrivacyCheckboxes();
    await this.submitPersonalInfo();
    await this.waitForVisible(this.address1);
  }

  async isOnPersonalStep() {
    return (await this.isDisplayed(this.firstName)) && !(await this.isDisplayed(this.address1));
  }

  async fillAddress(customer) {
    await this.type(this.address1, customer.address);
    await this.type(this.postcode, customer.postcode);
    await this.type(this.city, customer.city);

    const countrySelect = await this.waitForClickable(this.country);
    await countrySelect.sendKeys(customer.country);

    await this.driver.wait(async () => {
      const options = await this.driver.findElements(By.css('select[name="id_state"] option'));
      return options.length > 1;
    }, 15000);

    const stateSelect = await this.waitForClickable(this.state);
    await stateSelect.sendKeys(customer.state);
  }

  async submitAddress() {
    await this.click(this.continueAddress);
    await this.waitForPresent(this.deliveryOptions, config.TIMEOUT.LONG);
  }

  async chooseFirstShippingAndContinue() {
    await this.click(this.continueShipping);
    await this.waitForPresent(this.codPaymentOption, config.TIMEOUT.LONG);
  }

  async selectPaymentMethod() {
    const el = await this.waitForPresent(this.codPaymentOption);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async acceptTerms() {
    const el = await this.waitForPresent(this.termsCheckbox);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async isPlaceOrderEnabled() {
    const btn = await this.waitForPresent(this.placeOrderButton);
    const enabled = await btn.isEnabled();
    const className = await btn.getAttribute('class');
    return enabled && !className.includes('disabled');
  }

  async acceptTermsAndPlaceOrder() {
    await this.acceptTerms();
    await this.driver.wait(() => this.isPlaceOrderEnabled(), 15000);
    await this.click(this.placeOrderButton);
    await this.waitForVisible(this.orderConfirmationHeading, config.TIMEOUT.LONG);
    return (await this.getText(this.orderConfirmationHeading)) === 'Your order is confirmed';
  }
}

module.exports = CheckoutPage;
