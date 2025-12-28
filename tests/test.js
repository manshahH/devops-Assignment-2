const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// We use 'expense-app-pipeline' because that's the container name in docker-compose
// If running locally, change this to 'localhost'
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Expense App Automation Tests', function() {
    let driver;
    // Random user to ensure fresh data every time
    const username = 'user' + Math.floor(Math.random() * 10000); 
    const password = 'password123';

    before(async function() {
        // Setup Headless Chrome
        let options = new chrome.Options();
        options.addArguments('--headless'); // Required for EC2/Jenkins
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    after(async function() {
        await driver.quit();
    });

    // Test 1: Load Page
    it('1. Should load the homepage', async function() {
        await driver.get(APP_URL);
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Expense Manager');
    });

    // Test 2: Check Auth Section Visibility
    it('2. Should show login form initially', async function() {
        const authSection = await driver.findElement(By.id('auth-section'));
        const isDisplayed = await authSection.isDisplayed();
        assert.strictEqual(isDisplayed, true);
    });

    // Test 3: Register a User
    it('3. Should register a new user', async function() {
        await driver.findElement(By.id('username')).sendKeys(username);
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.findElement(By.css('.secondary-btn')).click(); // Click Register
        
        await driver.sleep(1000); // Wait for alert/response
        const msg = await driver.findElement(By.id('auth-msg')).getText();
        assert.strictEqual(msg, 'User created successfully.');
    });

    // Test 4: Login
    it('4. Should login successfully', async function() {
        // Clear inputs first
        await driver.findElement(By.id('username')).clear();
        await driver.findElement(By.id('password')).clear();
        
        await driver.findElement(By.id('username')).sendKeys(username);
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.findElement(By.xpath("//button[text()='Login']")).click();
        
        await driver.wait(until.elementLocated(By.id('dashboard-section')), 5000);
    });

    // Test 5: Verify Welcome Message
    it('5. Should display correct username', async function() {
        const userDisplay = await driver.findElement(By.id('user-display')).getText();
        assert.strictEqual(userDisplay, username);
    });

    // Test 6: Verify Initial Balance is 0
    it('6. Should have 0 initial balance', async function() {
        const budget = await driver.findElement(By.id('total-budget')).getText();
        assert.strictEqual(budget, '0');
    });

    // Test 7: Add Budget
    it('7. Should add budget', async function() {
        await driver.findElement(By.id('budget-amount')).sendKeys('1000');
        await driver.findElement(By.xpath("//button[text()='Add Funds']")).click();
        await driver.sleep(1000);
        
        const budget = await driver.findElement(By.id('total-budget')).getText();
        assert.strictEqual(budget, '1000');
    });

    // Test 8: Add Expense
    it('8. Should add an expense', async function() {
        await driver.findElement(By.id('expense-desc')).sendKeys('Groceries');
        await driver.findElement(By.id('expense-amount')).sendKeys('200');
        await driver.findElement(By.css('.danger-btn')).click(); // Add Expense Button
        await driver.sleep(1000);
        
        const expense = await driver.findElement(By.id('total-expense')).getText();
        assert.strictEqual(expense, '200');
    });

    // Test 9: Verify Remaining Balance Calculation
    it('9. Should calculate remaining balance correctly', async function() {
        // 1000 - 200 = 800
        const remaining = await driver.findElement(By.id('remaining-balance')).getText();
        assert.strictEqual(remaining, '800');
    });

    // Test 10: Logout
    it('10. Should logout and return to login screen', async function() {
        await driver.findElement(By.xpath("//button[text()='Logout']")).click();
        const authSection = await driver.findElement(By.id('auth-section'));
        const isDisplayed = await authSection.isDisplayed();
        assert.strictEqual(isDisplayed, true);
    });
});