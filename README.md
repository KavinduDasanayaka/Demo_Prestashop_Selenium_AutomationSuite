



# PrestaShop Demo Store – Test Case Design & Selenium Automation

QA Intern take-home task – **Kavindu Dasanayaka🏏😊**

Automated checks for the guest shopping flow of the official PrestaShop demo store
(<https://demo.prestashop.com/#/en/front>), written in **JavaScript** with **Selenium WebDriver** and **Mocha**,
structured with the **Page Object Model**.

> The demo store is a public sandbox. **No order is ever placed and no payment is made** – the end-to-end test stops
> on the Payment step with *Place Order* enabled but untouched.

---
##  Main end to end workflow

https://github.com/user-attachments/assets/c957cbe0-6710-4dda-9d23-b3637d8ec674

---

## 1. Deliverables

| Part | What | Where |
|---|---|---|
| Part 1 | Manual test cases (15 cases: happy path, negative, boundary/edge, mobile) | [`test-cases/Demo_Prestashop_Testcases.xlsx`](test-cases/Demo_Prestashop_Testcases.xlsx) |
| Part 2 | Selenium automation (7 automated tests) | [`src/`](src) and [`tests/`](tests) |
| – | This README | `README.md` |

---

## 2. Prerequisites

- **Node.js 18+** (developed on Node 25) and npm
- **Google Chrome** (installed normally). ChromeDriver is downloaded automatically by Selenium Manager, so no manual driver setup is needed.
- Internet access (the tests run against the live demo).

## 3. Setup

```bash
git clone <repo-url>
cd Demo_Prestashop_Selenium_AutomationSuite
npm install
```

## 4. Running the tests

| Command | What it does |
|---|---|
| `npm test` | Runs all 7 tests (Chrome window visible) |
| `npm run test:e2e` | Runs only the full multi-product end-to-end test |
| `npm run test:regression` | Runs only the 6 additional tests |
| `npm run test:headless` | Runs all tests without a browser window (Windows `cmd` syntax) |
| `npx mocha tests/regression -g "TC_002"` | Runs a single test by (part of) its title |

## Environment variables / Fast Setup (recommended):

The PrestaShop demo site (`https://demo.prestashop.com/#/en/front`) wraps a temporary store instance inside an `<iframe>` (`iframe#framelive`), which takes 30–90 seconds to provision on first visit.
To skip the waiting time and run tests immediately against an active store instance:
1. Open <https://demo.prestashop.com/#/en/front> in Chrome and wait for the store to load.
2. Add a item to the cart and click **Inspect** in Chrome DevTools.
3. Copy the generated store domain (e.g., `https://internal-toothpaste.demo.prestashop.com`) from link `href` in Cart page "Proceed to checkout" button .
4. Set it in `src/config/config.js` (`BASE_URL`) or pass it in the terminal before running:

```powershell
$env:BASE_URL="https://<your-instance>.demo.prestashop.com"   # PowerShell: use an active shop instance directly
$env:HEADLESS="true"                                          # PowerShell: hide the browser
```
*(If `BASE_URL` is not updated or has expired, `DemoLandingPage.js` automatically falls back to opening the demo wrapper and reading a fresh store URL from `iframe#framelive`.)*

## 5. Project structure

```
src/
  config/config.js          URLs, timeouts, fake customer data
  utils/driverFactory.js    Chrome WebDriver creation
  pages/
    BasePage.js             explicit-wait helpers (no sleeps), safe click/type, price parsing
    DemoLandingPage.js      resolves the per-session shop instance URL (iframe#framelive)
    SearchResultsPage.js    search box, results grid, sort dropdown
    ProductPage.js          quantity (+/-/typed), add to cart, header cart counter
    CartModal.js            "Added to your cart" pop-up (Continue shopping / Proceed)
    CartPage.js             cart lines, quantities, line totals, order summary, remove
    CheckoutPage.js         guest checkout: personal info → address → shipping → payment
tests/
  support/hooks.js          Mocha root hooks: shop instance discovery, fresh browser per test, screenshots
  support/pages.js          builds the page objects for the current test
  e2e/fullFlow.test.js      the full end-to-end test
  regression/additional.test.js   6 additional tests

```

**Design rules followed**

- **Page Object Model** – every locator lives in `src/pages/*`; test files contain only actions and assertions.
- **Assertions on outcomes** – names, quantities, prices (computed from the page, not hard-coded), ordering, enabled/disabled states, URLs and messages are all asserted.
- **Proper waits only** – every wait is an explicit Selenium wait (`until.*` / polling conditions). There are no `sleep()` calls.
- **Independent tests** – each test gets its own browser, so there is no shared cart/session state.

---

## 6. What each test covers

| # | Test | Spreadsheet TC | Type | What it verifies |
|---|---|---|---|---|
| 1 | **E2E – multi-product guest flow** | TC_001, 004, 005, 007, 009, 010, 011, 013 | Happy path | Search "mug" → open product A → quantity 1→3 with (+) → add to cart → *Continue shopping* (header counter = 3) → search/add a second product B → verify cart summary total (`€57.12`) and checkout enabled → guest checkout (personal info, privacy boxes, US address with state) → shipping → payment (Cash on Delivery, accept terms, place order and verify confirmation). |
| 2 | TC_002 | TC_002 | **Positive** | Searching `xyz12345` shows `No search results for "xyz12345"` |
| 3 | TC_003 | TC_003 | Happy path | Search results re-sort ascending **and** descending by price |
| 4 | TC_014 | TC_014 | **Boundary** | Decrement at 1 stays 1; typing `0` or `-5` is corrected to ≥1 or *Add to cart* is disabled |
| 5 | TC_006 | TC_006 | **Boundary** | Quantity `99999` (> stock) is rejected/limited – 99999 units never reach the cart |
| 6 | TC_008 | TC_008 | **Positive** | Removing the only item shows `There are no more items in your cart` and disables checkout |
| 7 | TC_012 | TC_012 | **Negative** | Invalid email format (`gmail-at@s.commmt`) – verifies whether checkout stays on Step 1 (fails as documented in the test case sheet because the store accepts the invalid TLD `.commmt` and progresses to Step 2) |

---

## 7. Known limitations & flaky areas

1. **Demo instances are ephemeral and sometimes die.** The shop is served from a per-session sub-domain
   (e.g. `internal-toothpaste.demo.prestashop.com`) that is created on first load, can take **20–90 s** to provision, and
   occasionally returns Cloudflare **502 Bad gateway** or expires mid-run.
2. **Personal information & Payment checkboxes scrolling.** On the guest checkout page, the GDPR/privacy checkboxes, the *Continue* button, and the payment terms checkbox can sit below the viewport fold or be intercepted during scrolling, so `scrollIntoView` + click is used.
3. **TC_012 data in the spreadsheet.** The spreadsheet uses `gmail-at@s.commmt`, which is syntactically a valid email address (the store performs no TLD check).
4. May need to cancel pop-up if chrome asked to save the address.

