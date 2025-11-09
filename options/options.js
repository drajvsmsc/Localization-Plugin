/**
 * LocalizationChecker Options Page Controller
 */

let currentSettings = {};
let regionLanguageMap = {};

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadRegionLanguageMap();
  await loadSettings();
  attachEventListeners();
});

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
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response.success && response.settings) {
      currentSettings = response.settings;
      applySettingsToUI();
    } else {
      // Use defaults
      currentSettings = getDefaultSettings();
      applySettingsToUI();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showToast('Failed to load settings', 'error');
  }
}

/**
 * Get default settings
 */
function getDefaultSettings() {
  return {
    targetRegion: 'India',
    targetLanguage: 'Hindi',
    detectionThreshold: 0.85,
    customExclusions: [],
    autoAnalyze: false,
    filteringMode: 'moderate',
    exclusionWords: [],
    exclusionPatterns: [],
    // Translation verification settings - ENABLED BY DEFAULT
    enableVerification: true,
    libretranslateUrl: 'http://localhost:5001',
    verificationApiKey: '',
    cacheTranslations: true,
    verificationMode: 'all',  // Full mode by default
    verificationType: 'language-only'  // Language detection only by default
  };
}

/**
 * Apply settings to UI
 */
function applySettingsToUI() {
  // General tab
  document.getElementById('default-region').value = currentSettings.targetRegion || 'India';
  updateLanguageOptions();
  document.getElementById('default-language').value = currentSettings.targetLanguage || 'Hindi';
  
  const threshold = Math.round((currentSettings.detectionThreshold || 0.85) * 100);
  document.getElementById('detection-threshold').value = threshold;
  document.getElementById('threshold-display').textContent = `${threshold}%`;
  
  document.getElementById('auto-analyze').checked = currentSettings.autoAnalyze || false;
  
  // Filtering tab
  document.getElementById('filtering-mode').value = currentSettings.filteringMode || 'moderate';
  
  // Exclusions tab
  const exclusionWords = currentSettings.exclusionWords || [];
  document.getElementById('exclusion-words').value = exclusionWords.join('\n');
  
  const exclusionPatterns = currentSettings.exclusionPatterns || [];
  document.getElementById('exclusion-patterns').value = exclusionPatterns.join('\n');
  
  // Translation Verification tab
  document.getElementById('enable-verification').checked = currentSettings.enableVerification !== false; // Default true
  document.getElementById('libretranslate-url').value = currentSettings.libretranslateUrl || 'http://localhost:5001';
  document.getElementById('verification-api-key').value = currentSettings.verificationApiKey || '';
  document.getElementById('cache-translations').checked = currentSettings.cacheTranslations !== false; // Default true
  document.getElementById('verification-mode').value = currentSettings.verificationMode || 'all'; // Default full mode
  
  // Toggle verification settings panel visibility
  toggleVerificationSettings();
}

/**
 * Update language options based on selected region
 */
function updateLanguageOptions() {
  const regionSelect = document.getElementById('default-region');
  const languageSelect = document.getElementById('default-language');
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
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  
  // Region change updates language options
  document.getElementById('default-region').addEventListener('change', updateLanguageOptions);
  
  // Threshold slider
  const slider = document.getElementById('detection-threshold');
  slider.addEventListener('input', (e) => {
    document.getElementById('threshold-display').textContent = `${e.target.value}%`;
  });
  
  // Pattern testing
  document.getElementById('test-patterns-btn').addEventListener('click', testPatterns);
  
  // Import/Export exclusions
  document.getElementById('import-exclusions-btn').addEventListener('click', importExclusions);
  document.getElementById('export-exclusions-btn').addEventListener('click', exportExclusions);
  
  // Translation Verification
  document.getElementById('enable-verification').addEventListener('change', toggleVerificationSettings);
  document.getElementById('test-verification').addEventListener('click', testVerificationConnection);
  
  // Save/Cancel/Reset buttons
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('cancel-btn').addEventListener('click', () => window.close());
  document.getElementById('reset-btn').addEventListener('click', resetSettings);
  
  // About links
  document.getElementById('documentation-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/localization-checker/docs' });
  });
  
  document.getElementById('changelog-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/localization-checker/CHANGELOG.md' });
  });
  
  document.getElementById('github-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/localization-checker' });
  });
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

/**
 * Test regex patterns
 */
function testPatterns() {
  const patternsText = document.getElementById('exclusion-patterns').value;
  const patterns = patternsText.split('\n').filter(p => p.trim());
  
  const resultsDiv = document.getElementById('pattern-test-results');
  resultsDiv.style.display = 'block';
  
  let html = '<h4>Pattern Test Results</h4>';
  
  if (patterns.length === 0) {
    html += '<p>No patterns to test</p>';
  } else {
    html += '<pre>';
    patterns.forEach((pattern, idx) => {
      try {
        const regex = new RegExp(pattern, 'i');
        html += `✓ Pattern ${idx + 1}: ${pattern} - Valid\n`;
        
        // Test with sample strings
        const samples = ['v1.0', '256GB', 'user@example.com', 'API', 'Hello World'];
        const matches = samples.filter(s => regex.test(s));
        if (matches.length > 0) {
          html += `  Matches: ${matches.join(', ')}\n`;
        }
      } catch (error) {
        html += `✗ Pattern ${idx + 1}: ${pattern} - Invalid (${error.message})\n`;
      }
    });
    html += '</pre>';
  }
  
  resultsDiv.innerHTML = html;
}

/**
 * Import exclusions from file
 */
function importExclusions() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.txt';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let data;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
          if (data.words) {
            document.getElementById('exclusion-words').value = data.words.join('\n');
          }
          if (data.patterns) {
            document.getElementById('exclusion-patterns').value = data.patterns.join('\n');
          }
        } else {
          // Plain text - assume words
          document.getElementById('exclusion-words').value = content;
        }
        
        showToast('Exclusions imported successfully');
      } catch (error) {
        showToast('Failed to import exclusions', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

/**
 * Export exclusions to file
 */
function exportExclusions() {
  const words = document.getElementById('exclusion-words').value
    .split('\n')
    .filter(w => w.trim());
  const patterns = document.getElementById('exclusion-patterns').value
    .split('\n')
    .filter(p => p.trim());
  
  const data = {
    words,
    patterns,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `localization-exclusions-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Exclusions exported successfully');
}

/**
 * Save settings
 */
async function saveSettings() {
  try {
    // Collect settings from UI
    const settings = {
      targetRegion: document.getElementById('default-region').value,
      targetLanguage: document.getElementById('default-language').value,
      detectionThreshold: parseInt(document.getElementById('detection-threshold').value) / 100,
      autoAnalyze: document.getElementById('auto-analyze').checked,
      filteringMode: document.getElementById('filtering-mode').value,
      exclusionWords: document.getElementById('exclusion-words').value
        .split('\n')
        .map(w => w.trim())
        .filter(w => w),
      exclusionPatterns: document.getElementById('exclusion-patterns').value
        .split('\n')
        .map(p => p.trim())
        .filter(p => p),
      customExclusions: [], // Combined for backward compatibility
      // Translation Verification settings
      enableVerification: document.getElementById('enable-verification').checked,
      libretranslateUrl: document.getElementById('libretranslate-url').value,
      verificationApiKey: document.getElementById('verification-api-key').value,
      cacheTranslations: document.getElementById('cache-translations').checked,
      verificationMode: document.getElementById('verification-mode').value,
      verificationType: document.getElementById('verification-type').value
    };
    
    // Combine words and patterns into customExclusions
    settings.customExclusions = [
      ...settings.exclusionWords,
      ...settings.exclusionPatterns
    ];
    
    // Validate patterns
    for (const pattern of settings.exclusionPatterns) {
      try {
        new RegExp(pattern);
      } catch (error) {
        showToast(`Invalid regex pattern: ${pattern}`, 'error');
        return;
      }
    }
    
    // Save to storage
    const response = await chrome.runtime.sendMessage({ 
      action: 'saveSettings', 
      settings 
    });
    
    if (response.success) {
      currentSettings = settings;
      showToast('Settings saved successfully');
    } else {
      showToast('Failed to save settings', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Failed to save settings', 'error');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    currentSettings = getDefaultSettings();
    applySettingsToUI();
    await saveSettings();
    showToast('Settings reset to defaults');
  }
}

/**
 * Toggle verification settings visibility
 */
function toggleVerificationSettings() {
  const checkbox = document.getElementById('enable-verification');
  const settingsPanel = document.getElementById('verification-settings');
  
  // Always show settings panel (since verification is enabled by default)
  // Users can configure even when unchecked
  settingsPanel.style.display = 'block';
}

/**
 * Test verification connection
 */
async function testVerificationConnection() {
  const button = document.getElementById('test-verification');
  const status = document.getElementById('verification-status');
  const apiUrl = document.getElementById('libretranslate-url').value;
  const apiKey = document.getElementById('verification-api-key').value || null;
  
  button.disabled = true;
  button.textContent = 'Testing...';
  status.textContent = 'Testing connection...';
  status.style.color = '#6c757d';
  
  try {
    const api = new LibreTranslateAPI(apiUrl, apiKey);
    const result = await api.testConnection();
    
    if (result.success) {
      status.textContent = `✓ Connected (Test: "Hello" → "${result.testTranslation}")`;
      status.style.color = '#28a745';
      showToast('Connection successful!', 'success');
    } else {
      status.textContent = `✗ Failed: ${result.message}`;
      status.style.color = '#dc3545';
      showToast(result.message, 'error');
    }
  } catch (error) {
    status.textContent = `✗ Error: ${error.message}`;
    status.style.color = '#dc3545';
    showToast(`Connection failed: ${error.message}`, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Test Connection';
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

