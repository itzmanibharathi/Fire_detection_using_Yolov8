export function groupDetections(detections) {
  if (!detections || detections.length === 0) return [];

  const events = [];
  const sorted = [...detections].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let current = null;

  for (const d of sorted) {
    const dt = new Date(d.timestamp);
    const validLoc = d.latitude != null && d.longitude != null;

    if (!current ||
        (dt - current.startDt) / 1000 > 60 ||
        d.label !== current.label) {
      if (current) events.push(current);
      current = {
        label: d.label,
        eventStartTime: d.timestamp,
        detections: [d],
        images: [d.image_url],
        eventLocation: validLoc ? { lat: d.latitude, lng: d.longitude } : null,
        startDt: dt,
        location: d.location
      };
    } else {
      current.detections.push(d);
      current.images.push(d.image_url);
      if (!current.eventLocation && validLoc) {
        current.eventLocation = { lat: d.latitude, lng: d.longitude };
      }
    }
  }
  if (current) events.push(current);
  return events;
}