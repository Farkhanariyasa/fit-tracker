import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false }); // See what's happening
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173');
  
  // Wait for manual intervention/observation for 30s
  console.log("Browser open for 30s. Please interact or observe.");
  await page.waitForTimeout(30000);
  
  await browser.close();
})();
