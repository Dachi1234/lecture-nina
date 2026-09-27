import localFont from "next/font/local";

export const firago = localFont({
  src: [
    { path: "./firago-georgian-400.woff2", weight: "400", style: "normal" },
    { path: "./firago-georgian-500.woff2", weight: "500", style: "normal" },
    { path: "./firago-georgian-600.woff2", weight: "600", style: "normal" },
    { path: "./firago-georgian-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-firago",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+10A0-10FF, U+1C90-1CBF, U+2D00-2D2F" }],
});

export const montserrat = localFont({
  src: [
    { path: "./montserrat-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./montserrat-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./montserrat-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./montserrat-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./montserrat-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./montserrat-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./montserrat-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./montserrat-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const caveat = localFont({
  src: [
    { path: "./caveat-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./caveat-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./caveat-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});
