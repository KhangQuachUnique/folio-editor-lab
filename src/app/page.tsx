import Link from "next/link";

const editors = [
  {
    name: "Tiptap",
    href: "/lab/tiptap",
    version: "3.33.0",
    license: "MIT (core)",
    summary: "Headless, granular control, highest implementation workload.",
  },
  {
    name: "BlockNote",
    href: "/lab/blocknote",
    version: "0.57.0",
    license: "MPL-2.0; columns add-on GPL/commercial",
    summary: "Fastest Notion-like UX; opinionated block model and license caveat.",
  },
  {
    name: "Plate",
    href: "/lab/plate",
    version: "53.5.2",
    license: "MIT",
    summary: "Composable Slate stack; broad feature surface, more wiring required.",
  },
];

export default function Home() {
  return (
    <main className="home-shell">
      <header className="hero">
        <p className="eyebrow">Wridea · editor engine evaluation</p>
        <h1>Folio Editor Lab</h1>
        <p className="hero-copy">
          A controlled comparison of editor engines for a Notion-speed,
          magazine-quality publishing workflow.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#editors">Open prototypes</a>
          <Link className="button" href="/methodology">Test methodology</Link>
        </div>
      </header>

      <section className="principles" aria-label="Test principles">
        <article><span>01</span><h2>Same intent</h2><p>Equivalent content, core interactions, and long-document fixture.</p></article>
        <article><span>02</span><h2>Useful measurements</h2><p>Route load, editor readiness, typing latency, memory, and JS bytes.</p></article>
        <article><span>03</span><h2>Visible trade-offs</h2><p>Native features, extensions, custom code, gaps, and license cost.</p></article>
      </section>

      <section id="editors" className="editor-grid" aria-labelledby="editors-title">
        <div className="section-heading">
          <p className="eyebrow">Three isolated routes</p>
          <h2 id="editors-title">Choose an engine to test</h2>
        </div>
        {editors.map((editor, index) => (
          <Link className="editor-card" href={editor.href} key={editor.name}>
            <div className="card-index">0{index + 1}</div>
            <div><h3>{editor.name}</h3><p>{editor.summary}</p></div>
            <dl>
              <div><dt>Version</dt><dd>{editor.version}</dd></div>
              <div><dt>License</dt><dd>{editor.license}</dd></div>
            </dl>
            <span className="card-link">Launch lab →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
