const fs = require('fs');
const elements = JSON.parse(fs.readFileSync('railways_overpass.json', 'utf8'));

// Each element is a way with geometry: {lat, lon}
let polylines = [];
for (const el of elements) {
    if (el.type === 'way' && el.geometry) {
        let line = el.geometry.map(pt => [pt.lat, pt.lon]);
        polylines.push(line);
    }
}

// Buxoro-Miskin railway covers Buxoro (39.7) to Turon (41.5).
// Let's dump all these railways into a js file that the map can load, or just the continuous ones.
// To keep it light, let's just write the coordinates out to a separate file that can be included.
fs.writeFileSync('pch16_geo.js', `window.PCH16_REAL_GEOMETRY = ${JSON.stringify(polylines)};`);
console.log('Processed polylines:', polylines.length);
