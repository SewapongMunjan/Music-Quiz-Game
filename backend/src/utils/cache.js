// Simple in-memory cache
const cache = new Map();

exports.get = (key) => {
  if (!cache.has(key)) return null;
  
  const item = cache.get(key);
  if (item.expiry && item.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
};

exports.set = (key, value, ttlSeconds = 3600) => {
  const expiry = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
  cache.set(key, { value, expiry });
};

exports.delete = (key) => {
  cache.delete(key);
};

exports.clear = () => {
  cache.clear();
};