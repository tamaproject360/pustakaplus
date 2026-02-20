/**
 * Safely extract a single string value from query parameter
 * (handles both string and string[] from Express req.query)
 */
export function queryString(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

/**
 * Safely get IP address from request
 */
export function getIp(ip: string | string[] | undefined): string | undefined {
  if (Array.isArray(ip)) return ip[0];
  return ip;
}
