/**
 * CORE Layer: API Client
 * Markaziy fetch — JWT va CSRF headerlari bilan.
 */

const ApiClient = {
    get: async function (url) {
        const response = await window.SmartPCH.secureFetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },

    post: async function (url, data) {
        const response = await window.SmartPCH.secureFetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },

    put: async function (url, data) {
        const response = await window.SmartPCH.secureFetch(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },

    patch: async function (url, data) {
        const response = await window.SmartPCH.secureFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    },

    delete: async function (url) {
        const response = await window.SmartPCH.secureFetch(url, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }
};

window.ApiClient = ApiClient;
