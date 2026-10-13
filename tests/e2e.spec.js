const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5500';

// ═══ PAGE LOAD TESTS ═══

test.describe('Page Load Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/G Architects/);
  });

  test('Articles page loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/articles.html');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/Design Journal/);
  });

  test('Admin page loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/admin/');
    expect(response.status()).toBe(200);
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE_URL + '/');
    await page.waitForTimeout(3000);
    // Filter out expected 404s (favicon.ico is handled via data URI, noise SVG is inline)
    const realErrors = errors.filter(e => !e.includes('404'));
    expect(realErrors).toEqual([]);
  });
});

// ═══ CONTENT TESTS ═══

test.describe('Content Tests', () => {
  test('Hero section is visible', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('Navigation links are present', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('.nav-links a')).toHaveCount(7);
  });

  test('Services section has 6 cards', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('.service-card')).toHaveCount(6);
  });

  test('Process section has 5 steps', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('.step')).toHaveCount(5);
  });

  test('Footer is visible with contact info', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('+91 63740 48059');
    await expect(page.locator('footer')).toContainText('garchitects99@gmail.com');
  });

  test('CMS blog section loads content', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    const blogCards = await page.locator('.blog-card').count();
    expect(blogCards).toBeGreaterThan(0);
  });

  test('CMS reviews section loads content', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForSelector('.testi-card', { timeout: 10000 });
    const reviewCards = await page.locator('.testi-card').count();
    expect(reviewCards).toBeGreaterThan(0);
  });

  test('CMS projects section loads content', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForSelector('.cms-proj-card', { timeout: 10000 });
    const projectCards = await page.locator('.cms-proj-card').count();
    expect(projectCards).toBeGreaterThan(0);
  });
});

// ═══ NAVIGATION TESTS ═══

test.describe('Navigation Tests', () => {
  test('Nav links scroll to sections', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.click('a[href="#about"]');
    await page.waitForTimeout(1000);
    const aboutVisible = await page.locator('#about').isVisible();
    expect(aboutVisible).toBeTruthy();
  });

  test('Mobile hamburger menu toggles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL + '/');
    await page.waitForTimeout(1000);
    await page.click('#hamburger');
    await page.waitForTimeout(500);
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
    await page.click('#mobileClose');
    await page.waitForTimeout(500);
    await expect(page.locator('#mobileMenu')).not.toHaveClass(/open/);
  });
});

// ═══ FORM TESTS ═══

test.describe('Contact Form Tests', () => {
  test('Form is visible', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('#contactForm')).toBeVisible();
  });

  test('Form validation: empty name shows error', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('#inp-name', '');
    await page.fill('#inp-phone', '9876543210');
    await page.fill('#inp-email', 'test@example.com');
    await page.click('.btn-submit');
    await expect(page.locator('#fg-name')).toHaveClass(/has-error/);
  });

  test('Form validation: invalid phone shows error', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('#inp-name', 'Test User');
    await page.fill('#inp-phone', '123');
    await page.fill('#inp-email', 'test@example.com');
    await page.click('.btn-submit');
    await expect(page.locator('#fg-phone')).toHaveClass(/has-error/);
  });

  test('Form validation: invalid email shows error', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('#inp-name', 'Test User');
    await page.fill('#inp-phone', '9876543210');
    await page.fill('#inp-email', 'invalid-email');
    await page.click('.btn-submit');
    await expect(page.locator('#fg-email')).toHaveClass(/has-error/);
  });

  test('Form validation: valid data passes', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('#inp-name', 'Test User');
    await page.fill('#inp-phone', '9876543210');
    await page.fill('#inp-email', 'test@example.com');
    await page.click('.btn-submit');
    await expect(page.locator('#fg-name')).toHaveClass(/is-valid/);
    await expect(page.locator('#fg-phone')).toHaveClass(/is-valid/);
    await expect(page.locator('#fg-email')).toHaveClass(/is-valid/);
  });

  test('Phone input only accepts digits', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.fill('#inp-phone', 'abc1234567');
    const value = await page.inputValue('#inp-phone');
    expect(value).toBe('1234567');
  });
});

// ═══ VISUAL TESTS ═══

test.describe('Visual Tests', () => {
  test('Hero stats are visible', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('.hero-stats')).toBeVisible();
    await expect(page.locator('.stat')).toHaveCount(4);
  });

  test('WhatsApp float button is visible', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.locator('.wa-float')).toBeVisible();
  });

  test('Project filter buttons work', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForSelector('.cms-proj-card', { timeout: 10000 });
    await page.click('button[data-filter="residential"]');
    await page.waitForTimeout(500);
    const visibleCards = await page.locator('.cms-proj-card:visible').count();
    expect(visibleCards).toBeGreaterThan(0);
  });
});
