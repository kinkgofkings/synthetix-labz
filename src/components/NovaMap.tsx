import { useEffect, useRef } from "react";
import * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

const WINCHESTER: Leaflet.LatLngTuple = [39.1857, -78.1633];
const MILE = 1609.34;

function destination(origin: Leaflet.LatLngTuple, miles: number, bearingDeg: number): Leaflet.LatLngTuple {
  const radius = 3958.7613;
  const distance = miles / radius;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin[0] * Math.PI) / 180;
  const lng1 = (origin[1] * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance) + Math.cos(lat1) * Math.sin(distance) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance) * Math.cos(lat1),
      Math.cos(distance) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

export function NovaMap() {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = node.current;
    if (!element) return;

    const map = Leaflet.map(element, {
      zoomControl: true,
      attributionControl: true,
      minZoom: 7,
      maxZoom: 16,
    });

    map.createPane("sat");
    const satPane = map.getPane("sat");
    if (satPane) satPane.style.zIndex = "200";

    map.createPane("places");
    const placesPane = map.getPane("places");
    if (placesPane) {
      placesPane.style.zIndex = "450";
      placesPane.style.pointerEvents = "none";
    }

    Leaflet.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
      maxZoom: 16,
      pane: "sat",
      className: "nova-sat",
    }).addTo(map);

    Leaflet.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      { pane: "places", maxZoom: 16, className: "nova-roads" },
    ).addTo(map);

    Leaflet.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { pane: "places", maxZoom: 16, className: "nova-places" },
    ).addTo(map);

    const arm = 36;
    Leaflet.polyline([destination(WINCHESTER, arm, 0), destination(WINCHESTER, arm, 180)], {
      color: "#b8fbff",
      weight: 1,
      opacity: 0.55,
      dashArray: "2 9",
      interactive: false,
    }).addTo(map);
    Leaflet.polyline([destination(WINCHESTER, arm, 270), destination(WINCHESTER, arm, 90)], {
      color: "#b8fbff",
      weight: 1,
      opacity: 0.55,
      dashArray: "2 9",
      interactive: false,
    }).addTo(map);

    Leaflet.circle(WINCHESTER, {
      radius: 2.4 * MILE,
      color: "#00f0ff",
      weight: 1.5,
      opacity: 0.95,
      fillColor: "#00f0ff",
      fillOpacity: 0.28,
      interactive: false,
    }).addTo(map);

    Leaflet.circle(WINCHESTER, {
      radius: 28 * MILE,
      color: "#00f0ff",
      weight: 12,
      opacity: 0.16,
      fillOpacity: 0,
      interactive: false,
    }).addTo(map);

    const rings = [
      { miles: 10, fill: 0.08, dash: "1 7", weight: 1.4, opacity: 0.9 },
      { miles: 20, fill: 0.035, dash: "8 10", weight: 1.6, opacity: 0.92 },
      { miles: 28, fill: 0.04, dash: "3 8", weight: 2.4, opacity: 1 },
    ];

    for (const ring of rings) {
      Leaflet.circle(WINCHESTER, {
        radius: ring.miles * MILE,
        color: "#7ef6ff",
        weight: ring.weight,
        opacity: ring.opacity,
        fillColor: "#00f0ff",
        fillOpacity: ring.fill,
        dashArray: ring.dash,
        interactive: false,
      }).addTo(map);

      const tag = Leaflet.divIcon({
        className: "radius-tag",
        html: `<span>${ring.miles} MI</span>`,
        iconSize: [46, 16],
        iconAnchor: [0, 8],
      });
      Leaflet.marker(destination(WINCHESTER, ring.miles + 0.8, 142), {
        icon: tag,
        interactive: false,
        keyboard: false,
      }).addTo(map);
    }

    const icon = Leaflet.divIcon({
      className: "bullet-icon",
      html: '<span class="bullet-ring"></span><span class="bullet-core"></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    Leaflet.marker(WINCHESTER, { icon, title: "Winchester, VA", zIndexOffset: 500 }).addTo(map);

    const frame = Leaflet.latLngBounds(destination(WINCHESTER, 34, 225), destination(WINCHESTER, 34, 45));
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(frame, { padding: [22, 22] });
    };
    fit();
    const timer = window.setTimeout(fit, 220);

    return () => {
      window.clearTimeout(timer);
      map.remove();
    };
  }, []);

  return (
    <div className="nova-map relative overflow-hidden border border-lab/40 shadow-[0_0_32px_rgba(0,240,255,0.16)]">
      <div ref={node} className="h-[460px] w-full" role="application" aria-label="Satellite map of Winchester, Virginia with a 28 mile target radius" />
      <p className="pointer-events-none absolute bottom-3 left-3 z-[500] border border-lab/40 bg-void/80 px-2 py-1 text-[10px] tracking-[0.18em] text-lab">
        28 MI TARGET · WINCHESTER VA
      </p>
    </div>
  );
}
