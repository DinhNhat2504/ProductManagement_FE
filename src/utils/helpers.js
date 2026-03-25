const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7278';

/**
 * Ensures the image URL is fully qualified with the API base domain.
 * Use this for src={} in <img> tags when images come from the backend.
 * 
 * @param {string} path - The relative path or absolute URL of the image
 * @returns {string} The fully qualified image URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';

  // If the path already includes http/https, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure we don't double up slashes if baseURL ends with / and path starts with /
  const sanitizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${sanitizedBase}${sanitizedPath}`;
};
