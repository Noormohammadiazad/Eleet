/** CRC-32 (IEEE 802.3, reflected polynomial 0xEDB88320) — the checksum of ZIP, PNG and Ethernet. */
const TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): Uint8Array {
  let crc = 0xffffffff;
  for (const byte of data) crc = TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;
  return Uint8Array.of(crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff);
}
