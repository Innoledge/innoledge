const puppeteer = require('puppeteer');

async function screenshotServiceIcons() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
    
    // Wait for service icons to load
    await page.waitForSelector('.services-grid', { timeout: 5000 });
    
    // Take screenshot of the entire services section
    const servicesSection = await page.$('.services-grid');
    if (servicesSection) {
      await servicesSection.screenshot({ 
        path: 'service-icons-before.png',
        type: 'png'
      });
      console.log('Screenshot saved as service-icons-before.png');
    } else {
      // Try alternative selectors
      const altSection = await page.$('.services-section') || await page.$('#services');
      if (altSection) {
        await altSection.screenshot({ 
          path: 'service-icons-before.png',
          type: 'png'
        });
        console.log('Screenshot saved as service-icons-before.png (alternative selector)');
      } else {
        // Take full page screenshot if we can't find specific section
        await page.screenshot({ 
          path: 'homepage-full-before.png',
          fullPage: true
        });
        console.log('Full page screenshot saved as homepage-full-before.png');
      }
    }
    
    // Get information about service icons
    const serviceInfo = await page.evaluate(() => {
      const services = document.querySelectorAll('.service-item, .service-card, .services-grid > *');
      return Array.from(services).map((el, index) => ({
        index,
        tagName: el.tagName,
        className: el.className,
        text: el.textContent?.trim().substring(0, 50) || '',
        hasImage: !!el.querySelector('img'),
        imageInfo: el.querySelector('img') ? {
          src: el.querySelector('img').src,
          alt: el.querySelector('img').alt
        } : null
      }));
    });
    
    console.log('Service elements found:', serviceInfo);
    
  } catch (error) {
    console.error('Error during screenshot:', error);
  } finally {
    await browser.close();
  }
}

screenshotServiceIcons().catch(console.error);