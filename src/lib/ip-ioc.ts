import "server-only";
import { isIP } from "net";

const EXCLUDED_IPV4_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 8],
  [0x0a000000, 8],
  [0x64400000, 10],
  [0x7f000000, 8],
  [0xa9fe0000, 16],
  [0xac100000, 12],
  [0xc0000000, 24],
  [0xc0000200, 24],
  [0xc0a80000, 16],
  [0xc6120000, 15],
  [0xc6336400, 24],
  [0xcb007100, 24],
  [0xe0000000, 4],
  [0xf0000000, 4],
];

function ipv4ToNumber(ip: string): number {
  return ip.split(".").reduce((value, octet) => ((value << 8) | Number(octet)) >>> 0, 0);
}

function isInCidr(value: number, network: number, prefix: number): boolean {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) >>> 0 === (network & mask) >>> 0;
}

/** Returns a canonical public IPv4 candidate, or null when it must not leave the server. */
export function normalizePublicIpv4(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (isIP(candidate) !== 4) return null;
  const normalized = candidate.split(".").map((octet) => String(Number(octet))).join(".");
  const numeric = ipv4ToNumber(normalized);
  if (numeric === 0xffffffff) return null;
  if (EXCLUDED_IPV4_RANGES.some(([network, prefix]) => isInCidr(numeric, network, prefix))) return null;
  return normalized;
}
