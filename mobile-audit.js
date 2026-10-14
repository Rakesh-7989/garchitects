const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/styles.css', 'utf8');

console.log('=== MOBILE RESPONSIVENESS DEEP-DIVE AUDIT ===\n');

// 1. Viewport & Meta
console.log('1. VIEWPORT & META');
console.log('  viewport meta:', html.includes('name="viewport"') ? 'YES' : 'NO');
console.log('  charset:', html.includes('charset="UTF-8"') ? 'YES' : 'NO');

// 2. Media Queries Analysis
const mediaQueries = [...css.matchAll(/@media\s*\([^)]+\)\s*\{([\s\S]*?)\n\}/g)];
console.log('\n2. MEDIA QUERIES FOUND:', mediaQueries.length);
const breakpoints = new Set();
mediaQueries.forEach(m => {
  const match = m[0].match(/@media\s*\(([^)]+)\)/);
  if (match) breakpoints.add(match[1]);
});
console.log('  Breakpoints:', Array.from(breakpoints).join(', '));

// 3. Mobile-Specific Classes
console.log('\n3. MOBILE-SPECIFIC CLASSES');
console.log('  hamburger:', html.includes('hamburger') ? 'YES' : 'NO');
console.log('  mobile-menu:', html.includes('mobile-menu') ? 'YES' : 'NO');
console.log('  responsive grid:', css.includes('1fr') ? 'YES' : 'NO');
console.log('  flex-wrap:', css.includes('flex-wrap') ? 'YES' : 'NO');
console.log('  clamp() usage:', (css.match(/clamp\(/g) || []).length, 'occurrences');

// 4. Touch Targets
console.log('\n4. TOUCH TARGETS (44px minimum)');
const touchElements = ['.btn-primary', '.btn-ghost', '.nav-links a', '.filter-btn', '.wa-float', '.mobile-close'];
touchElements.forEach(sel => {
  const inHtml = html.includes(sel.replace('.', ''));
  const inCss = css.includes(sel);
  console.log(`  ${sel}: HTML=${inHtml} CSS=${inCss}`);
});

// 5. Image Responsiveness
console.log('\n5. IMAGE RESPONSIVENESS');
console.log('  max-width:100%:', css.includes('max-width: 100%') || css.includes('max-width:100%') ? 'YES' : 'NO');
console.log('  height:auto:', css.includes('height: auto') ? 'YES' : 'NO');
console.log('  object-fit:', css.includes('object-fit') ? 'YES' : 'NO');
console.log('  loading=lazy:', (html.match(/loading="lazy"/g) || []).length, 'images');

// 6. Typography Responsiveness
console.log('\n6. TYPOGRAPHY RESPONSIVENESS');
const clampUsage = css.match(/clamp\([^)]+\)/g) || [];
console.log('  clamp() count:', clampUsage.length);
clampUsage.forEach(c => console.log('   ', c.substring(0, 80)));

// 7. Navigation Mobile
console.log('\n7. MOBILE NAVIGATION');
console.log('  hamburger button:', html.includes('id="hamburger"') ? 'YES' : 'NO');
console.log('  mobile menu overlay:', html.includes('class="mobile-menu"') ? 'YES' : 'NO');
console.log('  mobile close button:', html.includes('id="mobileClose"') ? 'YES' : 'NO');
console.log('  body overflow control:', css.includes('body.style.overflow') || css.includes('overflow: hidden') ? 'CHECK JS' : 'IN CSS');

// 8. Layout Grid Responsiveness
console.log('\n8. GRID RESPONSIVENESS');
const gridTemplates = css.match(/grid-template-columns:[^;]+/g) || [];
console.log('  grid-template-columns:', gridTemplates.length, 'definitions');
gridTemplates.slice(0, 10).forEach(g => console.log('   ', g.trim()));

// 9. Flexbox Responsiveness
console.log('\n9. FLEXBOX RESPONSIVENESS');
console.log('  flex-wrap:', (css.match(/flex-wrap/g) || []).length);
console.log('  flex-direction column mobile:', css.includes('flex-direction: column') ? 'YES' : 'NO');

// 10. Horizontal Scroll Prevention
console.log('\n10. HORIZONTAL SCROLL PREVENTION');
console.log('  overflow-x:hidden on html:', css.includes('overflow-x: hidden') ? 'YES' : 'NO');
console.log('  max-width containers:', (css.match(/max-width:\s*\d+/g) || []).length);

// 11. Font Size Minimums
console.log('\n11. FONT SIZE ACCESSIBILITY');
const fontSizes = css.match(/font-size:\s*[\d.]+(rem|px)/g) || [];
const smallFonts = fontSizes.filter(f => {
  const val = parseFloat(f);
  const unit = f.includes('rem') ? 'rem' : 'px';
  const px = unit === 'rem' ? val * 16 : val;
  return px < 16;
});
console.log('  Sizes < 16px:', smallFonts.length);
smallFonts.slice(0, 10).forEach(f => console.log('   ', f));

// 12. Tap Highlight / Focus States
console.log('\n12. FOCUS/TAP STATES');
console.log('  :focus styles:', (css.match(/:focus[^{]*\{/g) || []).length);
console.log('  :focus-visible:', (css.match(/:focus-visible/g) || []).length);
console.log('  -webkit-tap-highlight-color:', css.includes('-webkit-tap-highlight-color') ? 'YES' : 'NO');

// 13. Form Mobile UX
console.log('\n13. FORM MOBILE UX');
console.log('  inputmode:', (html.match(/inputmode=/g) || []).length);
console.log('  autocomplete:', (html.match(/autocomplete=/g) || []).length);
console.log('  type=tel:', (html.match(/type="tel"/g) || []).length);
console.log('  type=email:', (html.match(/type="email"/g) || []).length);

// 14. WhatsApp Float Mobile
console.log('\n14. WHATSAPP FLOAT MOBILE');
console.log('  wa-float bottom/right:', css.includes('.wa-float') ? 'YES' : 'NO');
console.log('  mobile position adjustment:', css.includes('.wa-float') && css.includes('480px') ? 'YES' : 'NO');

// 15. Performance Mobile
console.log('\n15. MOBILE PERFORMANCE');
console.log('  External CSS:', (html.match(/<link rel="stylesheet"/g) || []).length);
console.log('  External JS:', (html.match(/<script src=/g) || []).length);
console.log('  Preconnect hints:', (html.match(/rel="preconnect"/g) || []).length);
console.log('  DNS prefetch:', (html.match(/rel="dns-prefetch"/g) || []).length);

console.log('\n=== AUDIT COMPLETE ===');