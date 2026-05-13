import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const w = 180;

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
      </div>
    ),
    { ...size }
  );
}
