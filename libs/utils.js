/**
 * Utility functions for LocalizationChecker
 */

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleString();
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format status text
 */
export function formatStatus(status) {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get status icon
 */
export function getStatusIcon(status) {
  const icons = {
    'correctly-translated': '✓✓',
    'incorrectly-translated': '⚠️',
    'localized': '✓',
    'non-localized': '✗',
    'excluded': '⊘'
  };
  return icons[status] || '•';
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  const colors = {
    'correctly-translated': '#17a2b8',
    'incorrectly-translated': '#ff9800',
    'localized': '#28a745',
    'non-localized': '#dc3545',
    'excluded': '#ffc107'
  };
  return colors[status] || '#6c757d';
}

