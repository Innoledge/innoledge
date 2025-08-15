const puppeteer = require('puppeteer');

async function runExample() {
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 100 // Slow down by 100ms for demo purposes
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to your local site
    console.log('Navigating to http://localhost:8000...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    console.log('Screenshot saved as homepage-screenshot.png');
    
    // Get the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Example: Click on a service link
    const servicesLink = await page.$('a[href*="services"]');
    if (servicesLink) {
      console.log('Found services link, clicking...');
      await servicesLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const servicesTitle = await page.title();
      console.log('Services page title:', servicesTitle);
    }
    
    // Example: Test language switching
    const frenchFlag = await page.$('a[href*="/fr/"]');
    if (frenchFlag) {
      console.log('Testing French language switch...');
      await frenchFlag.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const frenchTitle = await page.title();
      console.log('French page title:', frenchTitle);
    }
    
  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    await browser.close();
  }
}

// Run the example
runExample().catch(console.error);