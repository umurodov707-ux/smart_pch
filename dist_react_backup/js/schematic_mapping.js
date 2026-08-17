/**
 * STATION SCHEMATIC MAPPING DATA
 * Stores coordinates (hotspots) for switches on station images
 */

(function () {
    'use strict';

    window.StationSchematics = {
        // Data structure: subdivisionId -> Array of Switch Hotspots
        mappings: {
            'bolinma1': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '250', y: '200' }, { sw: '3', x: '350', y: '200' }, { sw: '5', x: '450', y: '200' }, { sw: '100', x: '550', y: '200' }],
            'bolinma2': [{ sw: '1', x: '100', y: '200' }, { sw: '2', x: '200', y: '200' }, { sw: '3', x: '300', y: '200' }, { sw: '4', x: '400', y: '200' }, { sw: '5', x: '500', y: '200' }, { sw: '6', x: '600', y: '200' }, { sw: '10', x: '700', y: '200' }, { sw: '100', x: '800', y: '200' }, { sw: '102', x: '900', y: '200' }],
            'bolinma3': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '300', y: '200' }, { sw: '3', x: '450', y: '200' }, { sw: '100', x: '600', y: '200' }, { sw: '101', x: '750', y: '200' }],
            'bolinma4': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '300', y: '200' }, { sw: '4', x: '450', y: '200' }, { sw: '5', x: '600', y: '200' }, { sw: '6', x: '750', y: '200' }, { sw: '100', x: '900', y: '200' }],
            'bolinma5': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '350', y: '200' }, { sw: '3', x: '550', y: '200' }, { sw: '201', x: '800', y: '200' }],
            'bolinma6': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '300', y: '200' }, { sw: '3', x: '450', y: '200' }, { sw: '5', x: '600', y: '200' }, { sw: '6', x: '750', y: '200' }],
            'bolinma7': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '350', y: '200' }, { sw: '4', x: '550', y: '200' }, { sw: '100', x: '750', y: '200' }, { sw: '101', x: '900', y: '200' }],
            'bolinma8': [{ sw: '1', x: '200', y: '200' }, { sw: '2', x: '400', y: '200' }, { sw: '3', x: '600', y: '200' }, { sw: '4', x: '800', y: '200' }],
            'bolinma9': [{ sw: '1', x: '100', y: '200' }, { sw: '2', x: '200', y: '200' }, { sw: '3', x: '300', y: '200' }, { sw: '4', x: '400', y: '200' }, { sw: '5', x: '500', y: '200' }, { sw: '6', x: '600', y: '200' }, { sw: '8', x: '700', y: '200' }, { sw: '10', x: '800', y: '200' }],
            'bolinma10': [{ sw: '1', x: '150', y: '200' }, { sw: '2', x: '350', y: '200' }, { sw: '3', x: '550', y: '200' }, { sw: '201', x: '750', y: '200' }, { sw: '203', x: '950', y: '200' }]
        },

        getHotspots: function (bolinmaId) {
            return this.mappings[bolinmaId] || [];
        },

        addMapping: function (bolinmaId, switchNum, x, y) {
            if (!this.mappings[bolinmaId]) this.mappings[bolinmaId] = [];
            
            // Remove existing if any
            this.mappings[bolinmaId] = this.mappings[bolinmaId].filter(m => m.sw !== switchNum);
            
            this.mappings[bolinmaId].push({ sw: switchNum, x, y, type: 'circle' });
            this.save();
        },

        save: function () {
            localStorage.setItem('station_schematic_mappings', JSON.stringify(this.mappings));
        },

        load: function () {
            const saved = localStorage.getItem('station_schematic_mappings');
            if (saved) {
                try {
                    this.mappings = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading mappings:', e);
                }
            }
        }
    };

    // Load on init
    window.StationSchematics.load();

})();
