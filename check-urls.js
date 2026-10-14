const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const jsonld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (jsonld) {
  const data = JSON.parse(jsonld[1]);
  console.log('JSON-LD URLs:');
  if (data['@graph']) {
    data['@graph'].forEach(item => {
      if (item.url) console.log('  ', item['@type'], ':', item.url);
      if (item.address) console.log('  ', 'address:', item.address.addressLocality, item.address.addressRegion);
    });
  }
}

// Check canonical
const canonical = html.match(/rel="canonical" href="([^"]+)"/);
console.log('Canonical:', canonical ? canonical[1] : 'NOT FOUND');

// Check og:url
const ogUrl = html.match(/property="og:url" content="([^"]+)"/);
console.log('og:url:', ogUrl ? ogUrl[1] : 'NOT FOUND');