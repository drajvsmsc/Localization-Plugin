/**
 * LocalizationChecker Popup Controller
 */

// Global state
let currentResults = null;
let currentSettings = {};
let currentPage = 1;
const itemsPerPage = 10;
let filteredFindings = [];
let regionLanguageMap = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadRegionLanguageMap();
  await loadCurrentUrl();
  await loadPreviousResults();
  attachEventListeners();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response.success && response.settings) {
      currentSettings = response.settings;
      applySettings();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Load region-language mapping
 */
async function loadRegionLanguageMap() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getRegionLanguageMap' });
    if (response.success) {
      regionLanguageMap = response.map;
    }
  } catch (error) {
    console.error('Error loading region-language map:', error);
  }
}

/**
 * Apply settings to UI
 */
function applySettings() {
  document.getElementById('region-select').value = currentSettings.targetRegion || 'India';
  updateLanguageOptions();
  document.getElementById('language-select').value = currentSettings.targetLanguage || 'Hindi';
}

/**
 * Update language dropdown based on selected region
 */
function updateLanguageOptions() {
  const regionSelect = document.getElementById('region-select');
  const languageSelect = document.getElementById('language-select');
  const selectedRegion = regionSelect.value;
  
  // Clear existing options
  languageSelect.innerHTML = '';
  
  // Add language options for selected region
  const languages = regionLanguageMap[selectedRegion] || ['Hindi'];
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    languageSelect.appendChild(option);
  });
  
  // Select first language by default
  if (languages.length > 0) {
    languageSelect.value = languages[0];
  }
}

/**
 * Load current tab URL
 */
async function loadCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const urlElement = document.getElementById('current-url');
      urlElement.textContent = `✓ ${new URL(tab.url).hostname}`;
      urlElement.title = tab.url;
    }
  } catch (error) {
    console.error('Error loading URL:', error);
  }
}

/**
 * Load previous analysis results
 */
async function loadPreviousResults() {
  try {
    const result = await chrome.storage.local.get(['analysisResults', 'analysisUrl', 'analysisTimestamp']);
    if (result.analysisResults) {
      currentResults = result.analysisResults;
      displayResults(currentResults);
      enableExportButtons();
    }
  } catch (error) {
    console.error('Error loading previous results:', error);
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Region selection changes language options
  document.getElementById('region-select').addEventListener('change', updateLanguageOptions);
  
  // Analyze button
  document.getElementById('analyze-btn').addEventListener('click', runAnalysis);
  
  // Clear button
  document.getElementById('clear-btn').addEventListener('click', clearResults);
  
  // Export buttons
  document.getElementById('export-excel-btn').addEventListener('click', () => exportResults('excel'));
  document.getElementById('export-word-btn').addEventListener('click', () => exportResults('word'));
  document.getElementById('export-pdf-btn').addEventListener('click', () => exportResults('pdf'));
  
  // Settings button
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  
  // Search and filter
  document.getElementById('search-input').addEventListener('input', filterFindings);
  document.getElementById('filter-select').addEventListener('change', filterFindings);
  document.getElementById('content-type-filter').addEventListener('change', filterFindings);
  
  // Pagination
  document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
  document.getElementById('next-page').addEventListener('click', () => changePage(1));
}

/**
 * Run localization analysis
 */
async function runAnalysis() {
  showLoading(true);
  
  try {
    // Get current settings from UI
    const settings = {
      targetRegion: document.getElementById('region-select').value,
      targetLanguage: document.getElementById('language-select').value,
      customExclusions: currentSettings.customExclusions || []
    };
    
    // Save settings
    await chrome.runtime.sendMessage({ action: 'saveSettings', settings });
    currentSettings = settings;
    
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send analysis message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'analyze',
      settings: settings
    });
    
    if (response.success) {
      currentResults = response.results;
      displayResults(currentResults);
      enableExportButtons();
    } else {
      showError('Analysis failed: ' + response.error);
    }
  } catch (error) {
    console.error('Error during analysis:', error);
    showError('Failed to analyze page. Please refresh and try again.');
  } finally {
    showLoading(false);
  }
}

/**
 * Display analysis results
 */
function displayResults(results) {
  // Show summary and findings sections
  document.getElementById('summary-section').style.display = 'block';
  document.getElementById('findings-section').style.display = 'block';
  
  // Update summary statistics
  document.getElementById('total-elements').textContent = results.totalElements;
  
  // Count localized items (correctly translated + localized)
  const localizedCount = (results.correctlyTranslatedCount || 0) + (results.localizedCount || 0);
  document.getElementById('localized-count').textContent = localizedCount;
  
  // Non-localized count (non-localized + incorrectly-translated)
  const nonLocalizedCount = (results.nonLocalizedCount || 0) + (results.incorrectlyTranslatedCount || 0);
  document.getElementById('non-localized-count').textContent = nonLocalizedCount;
  
  // Calculate percentages
  const total = results.totalElements || 1;
  const localizedPct = Math.round((localizedCount / total) * 100);
  const nonLocalizedPct = Math.round((nonLocalizedCount / total) * 100);
  
  document.getElementById('localized-percentage').textContent = `${localizedPct}%`;
  document.getElementById('non-localized-percentage').textContent = `${nonLocalizedPct}%`;
  
  // Calculate proper noun count (from all findings)
  const properNounCount = results.findings.filter(f => f.contentType === 'proper-noun').length;
  document.getElementById('proper-noun-count').textContent = properNounCount;
  const properNounPct = Math.round((properNounCount / total) * 100);
  document.getElementById('proper-noun-percentage').textContent = `${properNounPct}%`;
  
  // Display findings
  filteredFindings = results.findings || [];
  filterFindings(); // Apply current filters
}

/**
 * Filter findings based on search and filter criteria
 */
function filterFindings() {
  if (!currentResults) return;
  
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filterType = document.getElementById('filter-select').value;
  const contentTypeFilter = document.getElementById('content-type-filter').value;
  
  filteredFindings = currentResults.findings.filter(finding => {
    // Apply status filter
    if (filterType === 'localized') {
      // Include both 'localized' and 'correctly-translated' statuses
      if (finding.status !== 'localized' && finding.status !== 'correctly-translated') {
        return false;
      }
    } else if (filterType === 'non-localized') {
      // Include both 'non-localized' and 'incorrectly-translated' statuses
      if (finding.status !== 'non-localized' && finding.status !== 'incorrectly-translated') {
        return false;
      }
    } else if (filterType === 'proper-noun') {
      // Filter by proper noun content type
      if (finding.contentType !== 'proper-noun') {
        return false;
      }
    } else if (filterType !== 'all') {
      // For backward compatibility
      if (finding.status !== filterType) {
        return false;
      }
    }
    
    // Apply content type filter
    if (contentTypeFilter !== 'all') {
      const findingContentType = finding.contentType || 'text';
      if (findingContentType !== contentTypeFilter) {
        return false;
      }
    }
    
    // Apply search filter
    if (searchTerm && !finding.text.toLowerCase().includes(searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  currentPage = 1;
  renderFindings();
}

/**
 * Render findings list with pagination
 */
function renderFindings() {
  const findingsList = document.getElementById('findings-list');
  findingsList.innerHTML = '';
  
  if (filteredFindings.length === 0) {
    findingsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No findings match your criteria</div>
      </div>
    `;
    updatePagination(0);
    return;
  }
  
  // Calculate pagination
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, filteredFindings.length);
  const pageFindings = filteredFindings.slice(startIdx, endIdx);
  
  // Render findings
  pageFindings.forEach(finding => {
    const item = createFindingElement(finding);
    findingsList.appendChild(item);
  });
  
  updatePagination(filteredFindings.length);
}

/**
 * Create finding element
 */
function createFindingElement(finding) {
  const div = document.createElement('div');
  div.className = `finding-item ${finding.status}`;
  
  // Simplified status icons
  let statusIcon;
  if (finding.status === 'correctly-translated' || finding.status === 'localized') {
    statusIcon = '✓'; // Localized
  } else if (finding.status === 'incorrectly-translated' || finding.status === 'non-localized') {
    statusIcon = '✗'; // Non-Localized
  } else if (finding.contentType === 'proper-noun') {
    statusIcon = '🔤'; // Proper Noun
  } else if (finding.status === 'excluded') {
    statusIcon = '⊗'; // Excluded
  } else {
    statusIcon = '•'; // Default
  }
  
  const contentTypeBadge = {
    'proper-noun': '<span class="content-type-badge proper-noun-badge">Proper Noun</span>',
    'common-noun': '<span class="content-type-badge common-noun-badge">Common Noun</span>',
    'text': ''
  }[finding.contentType || 'text'] || '';
  
  // Show expected translation if available
  const expectedInfo = finding.expectedTranslation 
    ? `<div class="verification-info">Expected: "${escapeHtml(finding.expectedTranslation)}" (${Math.round((finding.similarity || 0) * 100)}% match)</div>`
    : '';
  
  div.innerHTML = `
    <div class="finding-status">${statusIcon} ${formatStatus(finding.status)} ${contentTypeBadge}</div>
    <div class="finding-text">"${escapeHtml(finding.text)}"</div>
    ${expectedInfo}
    <div class="finding-meta">
      <span>📍 ${finding.location.section}</span>
      <span>🏷️ &lt;${finding.elementType}&gt;</span>
      ${finding.reason ? `<span>💡 ${finding.reason}</span>` : ''}
    </div>
  `;
  
  return div;
}

/**
 * Format status text
 */
function formatStatus(status) {
  // Map the status to the simplified categories
  if (status === 'correctly-translated' || status === 'localized') {
    return 'Localized';
  } else if (status === 'incorrectly-translated' || status === 'non-localized') {
    return 'Non-Localized';
  } else if (status === 'proper-noun' || (typeof status === 'object' && status.contentType === 'proper-noun')) {
    return 'Proper Noun';
  } else {
    // Fallback to original formatting
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prev-page').disabled = currentPage <= 1;
  document.getElementById('next-page').disabled = currentPage >= totalPages;
}

/**
 * Change page
 */
function changePage(delta) {
  currentPage += delta;
  renderFindings();
}

/**
 * Clear results
 */
async function clearResults() {
  currentResults = null;
  filteredFindings = [];
  
  document.getElementById('summary-section').style.display = 'none';
  document.getElementById('findings-section').style.display = 'none';
  
  disableExportButtons();
  
  await chrome.runtime.sendMessage({ action: 'clearResults' });
}

/**
 * Enable export buttons
 */
function enableExportButtons() {
  document.getElementById('export-excel-btn').disabled = false;
  document.getElementById('export-word-btn').disabled = false;
  document.getElementById('export-pdf-btn').disabled = false;
}

/**
 * Disable export buttons
 */
function disableExportButtons() {
  document.getElementById('export-excel-btn').disabled = true;
  document.getElementById('export-word-btn').disabled = true;
  document.getElementById('export-pdf-btn').disabled = true;
}

/**
 * Export results
 */
async function exportResults(format) {
  if (!currentResults) return;
  
  showLoading(true, `Generating ${format.toUpperCase()} report...`);
  
  try {
    // Get current URL
    const result = await chrome.storage.local.get(['analysisUrl']);
    const url = result.analysisUrl || 'unknown';
    
    // Import export handler
    const module = await import('../libs/export-handler.js');
    
    switch (format) {
      case 'excel':
        await module.exportToExcel(currentResults, currentSettings, url);
        break;
      case 'word':
        await module.exportToWord(currentResults, currentSettings, url);
        break;
      case 'pdf':
        await module.exportToPDF(currentResults, currentSettings, url);
        break;
    }
  } catch (error) {
    console.error(`Export to ${format} failed:`, error);
    showError(`Failed to export to ${format.toUpperCase()}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Show/hide loading overlay
 */
function showLoading(show, text = 'Analyzing page...') {
  const overlay = document.getElementById('loading-overlay');
  overlay.style.display = show ? 'flex' : 'none';
  
  if (show) {
    document.querySelector('.loading-text').textContent = text;
  }
}

/**
 * Show error message
 */
function showError(message) {
  alert(message); // Simple alert for now, can be enhanced with custom modal
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

