/**
 * Formats an ISO date string into a human-readable relative time string.
 * Examples: "just now", "5 minutes ago", "2 hours ago", "yesterday", "four days ago", "2 weeks ago".
 *
 * @param {string|Date} dateInput - ISO date string or Date instance
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  const numberWords = {
    1: 'yesterday',
    2: 'two days ago',
    3: 'three days ago',
    4: 'four days ago',
    5: 'five days ago',
    6: 'six days ago',
    7: 'a week ago'
  };

  if (numberWords[diffInDays]) {
    return numberWords[diffInDays];
  }

  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Formats an ISO date into full readable date for tooltips.
 *
 * @param {string|Date} dateInput
 * @returns {string} e.g. "October 22, 2020, 4:45 PM UTC"
 */
export function formatFullDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toUTCString();
}
