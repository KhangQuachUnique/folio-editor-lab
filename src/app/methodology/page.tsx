import Link from "next/link";

export default function MethodologyPage() {
  return (
    <main className="prose-page">
      <Link className="back-link" href="/">← Folio Editor Lab</Link>
      <p className="eyebrow">Benchmark contract</p>
      <h1>Methodology</h1>
      <p>
        Every engine runs as a separate production route in the same Next.js app,
        using equivalent semantic content and the same 250-paragraph stress fixture.
      </p>
      <h2>Measured</h2>
      <ul>
        <li>Navigation-to-ready time from an isolated browser context.</li>
        <li>JavaScript resources transferred and decoded per route.</li>
        <li>Median and p95 latency while typing into a long document.</li>
        <li>Chromium heap estimate when the browser exposes it.</li>
        <li>Production build output and implementation footprint.</li>
      </ul>
      <h2>Not claimed</h2>
      <p>
        Synthetic results are directional, not universal. They do not replace
        testing on target devices, real documents, IME input, accessibility tools,
        or production upload and collaboration backends.
      </p>
    </main>
  );
}
