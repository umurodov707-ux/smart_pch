const https = require('https');
const data = `[out:json];(way["railway"="rail"](37.0, 56.0, 45.6, 73.2););out geom;`;

const options = {
    hostname: 'overpass-api.de',
    port: 443,
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let chunks = [];
    res.on('data', (d) => chunks.push(d));
    res.on('end', () => {
        try {
            const buffer = Buffer.concat(chunks);
            const json = JSON.parse(buffer.toString());
            const fs = require('fs');
            if (json.elements) {

                let polylines = [];
                for (const el of json.elements) {
                    if (el.type === 'way' && el.geometry) {
                        let line = el.geometry.map(pt => [pt.lat, pt.lon]);
                        polylines.push(line);
                    }
                }

                fs.writeFileSync('js/uzb_railways_geo.js', `window.UZB_RAILWAYS_GEO = ${JSON.stringify(polylines)};`);
                console.log('Saved ways Uzb geometries:', polylines.length);
            }
        } catch (e) {
            console.error(e.message);
        }
    });
});
req.write(data);
req.end();
