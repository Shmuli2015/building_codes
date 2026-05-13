import { ImageResponse } from "next/og";

const SIZES: Record<string, number> = {
  "32": 32,
  "192": 192,
  "512": 512,
};

export function generateImageMetadata() {
  return [
    {
      id: "32",
      size: { width: 32, height: 32 },
      contentType: "image/png",
      alt: "קודי בניין",
    },
    {
      id: "192",
      size: { width: 192, height: 192 },
      contentType: "image/png",
      alt: "קודי בניין",
    },
    {
      id: "512",
      size: { width: 512, height: 512 },
      contentType: "image/png",
      alt: "קודי בניין",
    },
  ];
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const rid = String(await id);
  const w = SIZES[rid] ?? 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
        }}
      >
        {w <= 48 ? (
          <div
            style={{
              width: Math.round(w * 0.42),
              height: Math.round(w * 0.42),
              borderRadius: Math.max(4, Math.round(w * 0.12)),
              background: "#fff",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              width: Math.round(w * 0.58),
              height: Math.round(w * 0.58),
            }}
          >
            <div
              style={{
                width: Math.round(w * 0.38),
                height: Math.round(w * 0.1),
                background: "#e2e8f0",
                borderRadius: Math.round(w * 0.02),
                marginBottom: -Math.round(w * 0.02),
              }}
            />
            <div
              style={{
                width: Math.round(w * 0.5),
                height: Math.round(w * 0.42),
                background: "#f8fafc",
                borderRadius: Math.round(w * 0.04),
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: Math.round(w * 0.06),
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: Math.round(w * 0.12),
                  height: Math.round(w * 0.2),
                  background: "#2563eb",
                  borderRadius: Math.round(w * 0.015),
                  opacity: 0.92,
                }}
              />
            </div>
          </div>
        )}
      </div>
    ),
    { width: w, height: w }
  );
}
