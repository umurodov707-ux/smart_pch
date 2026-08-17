/**
 * SMART PCH - Global Search System
 */

function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const resultsDropdown = document.getElementById('searchResults');

    if (!input || !resultsDropdown) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            resultsDropdown.classList.remove('active');
            return;
        }

        const results = searchEverything(query);
        displaySearchResults(results, resultsDropdown);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.global-search-container')) {
            resultsDropdown.classList.remove('active');
        }
    });
}

async function searchEverything(query) {
    try {
        // Check local data first for speed (Workers/Trains)
        let localResults = [];
        if (typeof hrData !== 'undefined' && hrData.employees) {
            hrData.employees.forEach(emp => {
                if (emp.name.toLowerCase().includes(query)) {
                    localResults.push({ type: 'worker', name: emp.name, meta: emp.position, icon: 'fa-user-tie' });
                }
            });
        }

        // Call Server for Deep Search (Reports, PU-74, etc.)
        const serverResults = await SmartUtils.fetchAPI(`/search?q=${encodeURIComponent(query)}`);
        
        // Merge and deduplicate
        const combined = [...localResults, ...serverResults];
        const unique = Array.from(new Set(combined.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
        
        displaySearchResults(unique.slice(0, 10), document.getElementById('searchResults'));
    } catch (err) {
        console.error('Search error:', err);
    }
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-item"><div class="search-item-info"><span class="search-item-name">Hech narsa topilmadi</span></div></div>';
    } else {
        container.innerHTML = results.map(item => `
            <div class="search-item" onclick="handleSearchClick('${item.type}', '${item.name}')">
                <i class="fas ${item.icon}"></i>
                <div class="search-item-info">
                    <span class="search-item-name">${item.name}</span>
                    <span class="search-item-meta">${item.meta}</span>
                </div>
            </div>
        `).join('');
    }
    container.classList.add('active');
}

function handleSearchClick(type, name) {
    showToast(`Navigatsiya: ${name}`, 'info');
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('globalSearchInput').value = '';

    if (type === 'train') {
        if (typeof openRailwayMapModal === 'function') openRailwayMapModal();
    }
}

// Global initialization
window.initGlobalSearch = initGlobalSearch;
window.handleSearchClick = handleSearchClick;
