/**
 * Export Handler
 * Handles exporting results to Excel, Word, and PDF formats
 */

/**
 * Export results to Excel format
 */
export async function exportToExcel(results, settings, url) {
  try {
    // Import SheetJS (will be loaded via CDN in actual implementation)
    // For now, create a simple CSV fallback
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `localization-report_${settings.targetRegion}-${settings.targetLanguage}_${timestamp}.csv`;
    
    // Create CSV content
    let csv = 'Localization Report\n';
    csv += `URL:,${url}\n`;
    csv += `Region:,${settings.targetRegion}\n`;
    csv += `Language:,${settings.targetLanguage}\n`;
    csv += `Date:,${new Date().toLocaleString()}\n`;
    csv += '\n';
    
    csv += 'SUMMARY\n';
    csv += `Total Elements:,${results.totalElements}\n`;
    csv += `Localized:,${results.localizedCount},${Math.round((results.localizedCount / results.totalElements) * 100)}%\n`;
    csv += `Non-Localized:,${results.nonLocalizedCount},${Math.round((results.nonLocalizedCount / results.totalElements) * 100)}%\n`;
    csv += `Excluded:,${results.excludedCount || 0},${Math.round(((results.excludedCount || 0) / results.totalElements) * 100)}%\n`;
    csv += '\n';
    
    csv += 'DETAILED FINDINGS\n';
    csv += 'ID,Status,Text,Element Type,Location,Reason\n';
    
    results.findings.forEach(finding => {
      const text = finding.text.replace(/"/g, '""'); // Escape quotes
      csv += `${finding.id},"${finding.status}","${text}",${finding.elementType},${finding.location.section},"${finding.reason}"\n`;
    });
    
    // Download file
    downloadFile(csv, filename, 'text/csv');
    
    return { success: true };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
}

/**
 * Export results to Word format
 */
export async function exportToWord(results, settings, url) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `localization-report_${settings.targetRegion}-${settings.targetLanguage}_${timestamp}.doc`;
    
    // Create HTML document (will be opened as Word document)
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Localization Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    h2 { color: #495057; margin-top: 30px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metadata p { margin: 5px 0; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
    .stat-value { font-size: 24px; font-weight: bold; color: #212529; }
    .stat-label { color: #6c757d; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #dee2e6; }
    tr:hover { background: #f8f9fa; }
    .non-localized { color: #dc3545; font-weight: bold; }
    .localized { color: #28a745; font-weight: bold; }
    .excluded { color: #ffc107; font-weight: bold; }
  </style>
</head>
<body>
  <h1>LocalizationChecker Report</h1>
  
  <div class="metadata">
    <p><strong>URL:</strong> ${url}</p>
    <p><strong>Region:</strong> ${settings.targetRegion}</p>
    <p><strong>Language:</strong> ${settings.targetLanguage}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Executive Summary</h2>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Total Elements</div>
      <div class="stat-value">${results.totalElements}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Localized</div>
      <div class="stat-value">${results.localizedCount}</div>
      <div class="stat-label">${Math.round((results.localizedCount / results.totalElements) * 100)}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Non-Localized</div>
      <div class="stat-value">${results.nonLocalizedCount}</div>
      <div class="stat-label">${Math.round((results.nonLocalizedCount / results.totalElements) * 100)}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Excluded</div>
      <div class="stat-value">${results.excludedCount || 0}</div>
      <div class="stat-label">${Math.round(((results.excludedCount || 0) / results.totalElements) * 100)}%</div>
    </div>
  </div>
  
  <h2>Detailed Findings</h2>
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Text</th>
        <th>Element</th>
        <th>Location</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
`;

    results.findings.forEach(finding => {
      const statusIcons = {
        'localized': '✓',
        'non-localized': '✗',
        'excluded': '⊘'
      };
      
      html += `
      <tr>
        <td class="${finding.status}">${statusIcons[finding.status]} ${formatStatus(finding.status)}</td>
        <td>${escapeHtml(finding.text)}</td>
        <td>&lt;${finding.elementType}&gt;</td>
        <td>${finding.location.section}</td>
        <td>${finding.reason}</td>
      </tr>
`;
    });

    html += `
    </tbody>
  </table>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6; color: #6c757d; font-size: 12px;">
    <p>Generated by LocalizationChecker v1.0.0</p>
  </div>
</body>
</html>
`;

    // Download as HTML (can be opened in Word)
    downloadFile(html, filename, 'application/msword');
    
    return { success: true };
  } catch (error) {
    console.error('Word export failed:', error);
    throw error;
  }
}

/**
 * Export results to PDF format
 */
export async function exportToPDF(results, settings, url) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `localization-report_${settings.targetRegion}-${settings.targetLanguage}_${timestamp}.pdf`;
    
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Localization Report</title>
  <style>
    @media print {
      body { margin: 0; }
      .page-break { page-break-after: always; }
    }
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    h2 { color: #495057; margin-top: 30px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metadata p { margin: 5px 0; }
    .chart { width: 100%; max-width: 400px; margin: 20px auto; }
    .chart-bar { height: 30px; background: #667eea; color: white; padding: 5px; margin: 5px 0; border-radius: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
    th { background: #667eea; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #dee2e6; }
    .non-localized { color: #dc3545; }
    .localized { color: #28a745; }
    .excluded { color: #ffc107; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6; color: #6c757d; font-size: 10px; }
  </style>
</head>
<body>
  <h1>LocalizationChecker Report</h1>
  
  <div class="metadata">
    <p><strong>URL:</strong> ${url}</p>
    <p><strong>Region:</strong> ${settings.targetRegion}</p>
    <p><strong>Language:</strong> ${settings.targetLanguage}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Summary Statistics</h2>
  <div class="chart">
    <div class="chart-bar" style="width: ${(results.localizedCount / results.totalElements) * 100}%">
      Localized: ${results.localizedCount} (${Math.round((results.localizedCount / results.totalElements) * 100)}%)
    </div>
    <div class="chart-bar" style="width: ${(results.nonLocalizedCount / results.totalElements) * 100}%; background: #dc3545;">
      Non-Localized: ${results.nonLocalizedCount} (${Math.round((results.nonLocalizedCount / results.totalElements) * 100)}%)
    </div>
    <div class="chart-bar" style="width: ${((results.excludedCount || 0) / results.totalElements) * 100}%; background: #6c757d;">
      Excluded: ${results.excludedCount || 0} (${Math.round(((results.excludedCount || 0) / results.totalElements) * 100)}%)
    </div>
  </div>
  
  <h2>Detailed Findings</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 15%">Status</th>
        <th style="width: 40%">Text</th>
        <th style="width: 10%">Element</th>
        <th style="width: 15%">Location</th>
        <th style="width: 20%">Reason</th>
      </tr>
    </thead>
    <tbody>
`;

    let content = html;
    
    results.findings.forEach(finding => {
      const statusIcons = {
        'localized': '✓',
        'non-localized': '✗',
        'excluded': '⊘'
      };
      
      content += `
      <tr>
        <td class="${finding.status}">${statusIcons[finding.status]} ${formatStatus(finding.status)}</td>
        <td>${escapeHtml(finding.text.substring(0, 100))}${finding.text.length > 100 ? '...' : ''}</td>
        <td>&lt;${finding.elementType}&gt;</td>
        <td>${finding.location.section}</td>
        <td>${finding.reason}</td>
      </tr>
`;
    });

    content += `
    </tbody>
  </table>
  
  <div class="footer">
    <p>Generated by LocalizationChecker v1.0.0</p>
    <p>Report generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
`;

    printWindow.document.write(content);
    printWindow.document.close();
    
    return { success: true };
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

/**
 * Helper: Download file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Helper: Format status
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

