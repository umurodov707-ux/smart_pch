const https = require('https');
const data = `[out:json];(way["railway"="rail"](39.7, 60.5, 41.6, 64.6););out geom;`;

const options = {
    hostname: 'overpass-api.de',
    port: 443,
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let chunks = '';
    res.on('data', (d) => chunks += d);
    res.on('end', () => {
        try {
            const json = JSON.parse(chunks);
            const fs = require('fs');
            if (json.elements) {
                fs.writeFileSync('railways_overpass.json', JSON.stringify(json.elements));
                console.log('Saved ways:', json.elements.length);
            }
        } catch (e) {
            console.error(e.message);
        }
    });
});
req.write(data);
req.end();
