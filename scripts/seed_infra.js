const db = require('../server/db');

const initialData = [
    { type: 'bridge', name: 'Zeravshan daryosi kôprigi', km: '4022.5', bolinma: 'bolinma1', spec: '120m' },
    { type: 'culvert', name: 'Temir-beton truba (d=1.5m)', km: '4035.8', bolinma: 'bolinma1', spec: '12m' },
    { type: 'pedestrian_bridge', name: 'Piyodalar kôprigi', km: '4056.2', bolinma: 'bolinma2', spec: '45m' },
    { type: 'tunnel', name: 'Qorlitog\' tonneli', km: '4120.4', bolinma: 'bolinma4', spec: '1200m' },
    { type: 'bridge', name: 'Amudaryo kanali kôprigi', km: '4285.6', bolinma: 'bolinma9', spec: '85m' },
    { type: 'culvert', name: 'Metall truba (d=2.0m)', km: '4150.2', bolinma: 'bolinma5', spec: '15m' },
    { type: 'bridge', name: 'Sel o\'tkazgich ko\'prik', km: '4180.7', bolinma: 'bolinma6', spec: '30m' }
];

async function seed() {
    console.log('Seeding infrastructure assets...');
    for (const item of initialData) {
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO infrastructure_assets (name, asset_type, km, bolinma_id, specification, install_date) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [item.name, item.type, item.km, item.bolinma, item.spec, '2020-01-01'],
                (err) => err ? reject(err) : resolve()
            );
        });
    }
    console.log('Seed completed successfully.');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
