import { ImageResponse } from "next/og";

export const alt = "VOID ARCHIVE — six impossible objects held in a dark archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#030303",
          color: "#f4f4ef",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div style={{ background: "linear-gradient(90deg, transparent, #32383a, transparent)", height: 1, left: 78, opacity: 0.8, position: "absolute", right: 78, top: 78 }} />
        <div style={{ border: "1px solid rgba(200,210,212,.18)", borderRadius: 999, height: 410, position: "absolute", right: 96, transform: "rotate(-12deg)", width: 410 }} />
        <div style={{ border: "2px solid rgba(214,220,221,.32)", borderRadius: 999, height: 330, position: "absolute", right: 138, transform: "rotate(18deg)", width: 330 }} />
        <div style={{ background: "radial-gradient(circle at 38% 34%, #adb8bb 0%, #273033 17%, #07090a 48%, #000 74%)", border: "1px solid rgba(255,255,255,.28)", borderRadius: 999, boxShadow: "0 0 90px rgba(171,187,190,.16)", height: 220, position: "absolute", right: 194, width: 220 }} />
        <div style={{ display: "flex", flexDirection: "column", left: 84, position: "absolute", top: 170, width: 690 }}>
          <div style={{ color: "rgba(255,255,255,.48)", fontSize: 18, letterSpacing: 10, marginBottom: 25 }}>ARCHIVE / OBSERVATION SYSTEM</div>
          <div style={{ fontSize: 66, fontWeight: 600, letterSpacing: 17, lineHeight: 1 }}>VOID ARCHIVE</div>
          <div style={{ color: "rgba(255,255,255,.52)", fontSize: 18, letterSpacing: 6, marginTop: 30 }}>SIX IMPOSSIBLE OBJECTS / ONE CONTINUING RECORD</div>
        </div>
        <div style={{ bottom: 69, color: "rgba(255,255,255,.32)", display: "flex", fontSize: 15, justifyContent: "space-between", left: 84, letterSpacing: 5, position: "absolute", right: 84 }}>
          <span>SUBJECT INDEX / 07</span><span>OBSERVATION CONTINUES</span>
        </div>
      </div>
    ),
    size,
  );
}
