/**
 * DATA Layer: Modernization Repository
 * Handles all data fetching related to the 6 modernization modules.
 */

const ModernizationRepo = {
    getWarnings: async function() {
        return await ApiClient.get('/api/infrastructure/warnings');
    },

    getClosedTracks: async function() {
        return await ApiClient.get('/api/infrastructure/status');
    },

    getDefects: async function(bolinma_id) {
        return await ApiClient.get(`/api/defects/${bolinma_id}`);
    },

    getOKNOPlans: async function() {
        return await ApiClient.get('/api/okno');
    },

    getSandAnalysis: async function() {
        return await ApiClient.get('/api/sand');
    },

    getInfrastructureAssets: async function() {
        return await ApiClient.get('/api/infrastructure/assets');
    },

    getDefectForecast: async function() {
        return await ApiClient.post('/api/ai/chat', { task: 'predict_defects' });
    },

    // Save methods
    saveWarning: async function(data) {
        return await ApiClient.post('/api/infrastructure/warnings', data);
    },
    saveOKNO: async function(data) {
        return await ApiClient.post('/api/okno', data);
    },
    saveSandReport: async function(data) {
        return await ApiClient.post('/api/sand', data);
    },
    saveInfrastructureAsset: async function(data) {
        return await ApiClient.post('/api/infrastructure/assets', data);
    }
};

window.ModernizationRepo = ModernizationRepo;
