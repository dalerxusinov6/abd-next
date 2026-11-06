import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

/* 180×180 home-screen icon: the logo on the site's dark background (built once at deploy). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(path.join(process.cwd(), "public/img/logo.svg"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#04060f" }}>
        <img src={`data:image/svg+xml;base64,${svg.toString("base64")}`} width={132} height={68} alt="" />
      </div>
    ),
    size,
  );
}
