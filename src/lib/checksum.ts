/**
 * Deterministic 64-bit FNV-1a hex digest usable synchronously in browser,
 * Web Workers, and Node/Vitest without environment-specific crypto polyfills.
 */
export function computeDeterministicChecksum(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= (c + i) & 0xff;
    h2 = Math.imul(h2, 0x01000193);
  }
  const partA = (h1 >>> 0).toString(16).padStart(8, "0");
  const partB = (h2 >>> 0).toString(16).padStart(8, "0");
  return `fnv64_${partA}${partB}`;
}

export function computeCanonicalArchiveDigest(rec: {
  resourceId: string;
  title: string;
  originalSource: string;
  contentDigest: string;
  version: string;
}): string {
  return computeDeterministicChecksum(
    `${rec.resourceId}|${rec.title}|${rec.originalSource}|${rec.contentDigest}|${rec.version}`,
  );
}
