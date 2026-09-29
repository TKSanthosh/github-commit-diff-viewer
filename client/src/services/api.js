import axios from 'axios';

// Backend base URL (uses relative URL for Vite proxy in development, fallback to localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json'
  }
});

/**
 * Fetches commit metadata for a specific repository and commit SHA.
 *
 * @param {string} owner
 * @param {string} repository
 * @param {string} commitSHA
 * @returns {Promise<Object>} Commit object
 */
export async function fetchCommitMetadata(owner, repository, commitSHA) {
  try {
    const response = await apiClient.get(
      `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits/${encodeURIComponent(commitSHA)}`
    );
    // OpenAPI specifies the 200 response as an array of Commit objects
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * Fetches commit diff hunks for a specific repository and commit SHA.
 *
 * @param {string} owner
 * @param {string} repository
 * @param {string} commitSHA
 * @returns {Promise<Array<Object>>} Array of CombinedFileDifference
 */
export async function fetchCommitDiff(owner, repository, commitSHA) {
  try {
    const response = await apiClient.get(
      `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits/${encodeURIComponent(commitSHA)}/diff`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * Fetches both commit metadata and diff in parallel.
 *
 * @param {string} owner
 * @param {string} repository
 * @param {string} commitSHA
 * @returns {Promise<{ commit: Object, diff: Array<Object> }>}
 */
export async function fetchCommitDetails(owner, repository, commitSHA) {
  const [commit, diff] = await Promise.all([
    fetchCommitMetadata(owner, repository, commitSHA),
    fetchCommitDiff(owner, repository, commitSHA)
  ]);
  return { commit, diff };
}

/**
 * Normalizes HTTP/network errors into user-friendly error objects.
 */
function normalizeApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data?.error || {};
    const message = errorData.message || error.message || 'Server error occurred.';
    const code = errorData.code || `HTTP_${status}`;

    return {
      status,
      code,
      message
    };
  }

  if (error.request) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach backend server. Please verify the server is running on port 5000.'
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred.'
  };
}
