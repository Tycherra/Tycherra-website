import { ImageResponse } from "next/og";

/*  Apple wants an opaque 180px square with no transparency and no
    rounding of its own — iOS applies the mask. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(220px 160px at 78% 112%, rgba(168,16,48,0.62), rgba(7,7,10,0) 70%)",
          }}
        />
        <svg width="112" height="112" viewBox="0 0 64 64" fill="none">
          <path d="M12 20h32" stroke="#f2eee6" strokeWidth="7" strokeLinecap="square" />
          <path d="M28 20v26" stroke="#f2eee6" strokeWidth="7" strokeLinecap="square" />
          <circle cx="49" cy="20" r="6" stroke="#a81030" strokeWidth="4" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
