"use client";
import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// Publicly hosted TopoJSON world atlas (110m resolution, lightweight)
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO numeric → alpha-2 mapping for the countries in the atlas
// We ship a small inline lookup so we don't need an extra network request.
// (Covers the most common attacker countries; falls back to circle markers for the rest.)
const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  "004": "AF", "008": "AL", "012": "DZ", "024": "AO", "032": "AR",
  "036": "AU", "040": "AT", "050": "BD", "056": "BE", "076": "BR",
  "100": "BG", "116": "KH", "124": "CA", "144": "LK", "152": "CL",
  "156": "CN", "170": "CO", "191": "HR", "192": "CU", "203": "CZ",
  "208": "DK", "818": "EG", "231": "ET", "246": "FI", "250": "FR",
  "276": "DE", "288": "GH", "300": "GR", "344": "HK", "356": "IN",
  "360": "ID", "364": "IR", "368": "IQ", "372": "IE", "376": "IL",
  "380": "IT", "392": "JP", "400": "JO", "398": "KZ", "404": "KE",
  "408": "KP", "410": "KR", "414": "KW", "422": "LB", "458": "MY",
  "484": "MX", "504": "MA", "528": "NL", "566": "NG", "578": "NO",
  "586": "PK", "604": "PE", "608": "PH", "616": "PL", "620": "PT",
  "630": "PR", "634": "QA", "642": "RO", "643": "RU", "682": "SA",
  "694": "SL", "706": "SO", "710": "ZA", "724": "ES", "752": "SE",
  "756": "CH", "760": "SY", "158": "TW", "764": "TH", "792": "TR",
  "800": "UG", "804": "UA", "784": "AE", "826": "GB", "840": "US",
  "858": "UY", "704": "VN", "887": "YE", "716": "ZW",
};

export interface CountryAttackData {
  countryCode: string;
  country: string;
  count: number;
  latitude: number;
  longitude: number;
  topIPs: string[];
}

interface WorldHeatmapProps {
  data: CountryAttackData[];
}

function interpolateColor(t: number): string {
  // Gradient: slate-100 → orange → red
  if (t < 0.5) {
    const r = Math.round(241 + (251 - 241) * (t / 0.5));
    const g = Math.round(245 + (146 - 245) * (t / 0.5));
    const b = Math.round(249 + (60  - 249) * (t / 0.5));
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) / 0.5;
    const r = Math.round(251 + (185 - 251) * s);
    const g = Math.round(146 + (28  - 146) * s);
    const b = Math.round(60  + (26  -  60) * s);
    return `rgb(${r},${g},${b})`;
  }
}

export default function WorldHeatmap({ data }: WorldHeatmapProps) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  // Build fast lookup: alpha2 → normalized count (0-1)
  const countryScore = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.countryCode, d.count / maxCount));
    return map;
  }, [data, maxCount]);

  // Top 5 countries for markers
  const top5 = useMemo(() => data.slice(0, 5), [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-400">
        No GeoIP Data
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 100, center: [15, 20] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = String(geo.id).padStart(3, "0");
                const alpha2 = ISO_NUMERIC_TO_ALPHA2[numericId];
                const score = alpha2 ? (countryScore.get(alpha2) ?? 0) : 0;
                const fill = score > 0 ? interpolateColor(score) : "#e2e8f0";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#cbd5e1"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none", fill: score > 0 ? interpolateColor(Math.min(score + 0.2, 1)) : "#cbd5e1", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Pulsing markers for top 5 attack origins */}
          {top5.map((d) => (
            <Marker key={d.countryCode} coordinates={[d.longitude, d.latitude]}>
              <circle r={4} fill="#ef4444" fillOpacity={0.8} stroke="#fff" strokeWidth={1} />
              <circle r={7} fill="none" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.5} />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-1 left-2 flex items-center gap-1.5 text-[9px] text-slate-500">
        <span>Low</span>
        <div
          className="h-2 w-16 rounded-sm"
          style={{
            background: "linear-gradient(to right, #f1f5f9, #fb9233, #b91c1a)",
          }}
        />
        <span>High</span>
      </div>

      {/* Top country tooltip-style list */}
      <div className="absolute right-1 top-0 flex flex-col gap-0.5 text-[9px]">
        {top5.map((d, i) => (
          <div key={d.countryCode} className="flex items-center gap-1">
            <span className="font-bold text-red-500">{i + 1}.</span>
            <span className="text-slate-600 dark:text-slate-400">{d.country}</span>
            <span className="ml-auto font-semibold text-slate-700 dark:text-slate-300">
              {d.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
