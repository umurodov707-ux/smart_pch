const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if(msg.type() === 'error') console.error('PAGE ERROR LOG:', msg.text());
            else console.log('PAGE LOG:', msg.text());
        });
        page.on('pageerror', err => console.error('PAGE UNCAUGHT ERROR:', err.message));
        
        console.log("Navigating...");
        await page.goto('http://localhost:5503', {waitUntil: 'networkidle0', timeout: 10000});
        
        console.log("Evaluating body...");
        const text = await page.evaluate(() => document.body.innerHTML.substring(0, 50));
        console.log("BODY START:", text);
        
        await browser.close();
        console.log("Done");
    } catch(e) {
        console.error("Puppeteer Script Error:", e.message);
        process.exit(1);
    }
})();
