// filepath: src/services/inaturalist.js
/**
 * iNaturalist API Service
 * Provides typed methods for interacting with the iNaturalist API
 * Includes caching and error handling
 */

const BASE_URL = 'https://api.inaturalist.org/v1';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint, params) {
  return `${endpoint}?${new URLSearchParams(params).toString()}`;
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache(endpoint, params = {}) {
  const key = getCacheKey(endpoint, params);
  
  // Check cache first
  const cached = getFromCache(key);
  if (cached) {
    return cached;
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, v);
    }
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  setCache(key, data);
  return data;
}

/**
 * Get observations with filters
 * @param {Object} options - Query options
 * @param {number|string} options.taxonId - Taxon ID to filter by
 * @param {string} options.placeId - Place ID to filter by
 * @param {number} options.page - Page number
 * @param {number} options.perPage - Results per page
 * @param {string} options.orderBy - Order field (e.g., 'votes')
 * @param {string} options.qualityGrade - Quality grade (e.g., 'research')
 */
export async function getObservations({
  taxonId,
  placeId = '',
  page = 1,
  perPage = 10,
  orderBy = 'votes',
  qualityGrade = 'research',
  verifiable = true,
  photos = true,
  hrank = 'species',
  lrank = 'species'
} = {}) {
  return fetchWithCache('observations', {
    verifiable,
    photos,
    hrank,
    lrank,
    taxon_id: taxonId,
    place_id: placeId,
    order_by: orderBy,
    quality_grade: qualityGrade,
    page,
    per_page: perPage
  });
}

/**
 * Get total observation count for a taxon
 * @param {number|string} taxonId - Taxon ID
 */
export async function getObservationCount(taxonId) {
  const data = await fetchWithCache('observations', {
    verifiable: true,
    photos: true,
    hrank: 'species',
    lrank: 'species',
    taxon_id: taxonId,
    place_id: '',
    order_by: 'votes',
    quality_grade: 'research',
    page: 1,
    per_page: 1
  });
  return data.total_results;
}

/**
 * Get taxon details by ID
 * @param {number|string} taxonId - Taxon ID
 */
export async function getTaxon(taxonId) {
  return fetchWithCache(`taxa/${taxonId}`);
}

/**
 * Search for taxa
 * @param {string} query - Search query
 * @param {number} limit - Max results
 */
export async function searchTaxa(query, limit = 10) {
  return fetchWithCache('taxa', {
    q: query,
    limit
  });
}

/**
 * Get taxa by IDs
 * @param {number[]|string[]} ids - Array of taxon IDs
 */
export async function getTaxaByIds(ids) {
  if (!ids.length) return [];
  return fetchWithCache('taxa', {
    ids: ids.join(',')
  });
}

/**
 * Clear the cache
 */
export function clearCache() {
  cache.clear();
}

export default {
  getObservations,
  getObservationCount,
  getTaxon,
  searchTaxa,
  getTaxaByIds,
  clearCache
};