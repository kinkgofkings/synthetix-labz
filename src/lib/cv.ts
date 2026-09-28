import { absoluteUrl } from "../data/apps";
import type { Profile } from "../data/profile";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function cvDocument(profile: Profile) {
  const skills = profile.skills
    .map((group) => `<h2>${escapeHtml(group.label)}</h2><p>${escapeHtml(group.items)}</p>`)
    .join("");
  const roles = profile.roles
    .map((role) => {
      const points = role.points
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");
      return `<h2>${escapeHtml(role.title)}</h2><p><strong>${escapeHtml(role.org)}</strong> · ${escapeHtml(role.place)} · ${escapeHtml(role.dates)}</p><ul>${points}</ul>`;
    })
    .join("");
  const projects = profile.projects
    .map(
      (project) =>
        `<li><strong>${escapeHtml(project.name)}</strong> — ${escapeHtml(project.description)} <a href="${escapeHtml(absoluteUrl(project.url))}">${escapeHtml(absoluteUrl(project.url))}</a></li>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(profile.name)} — CV</title>
  <meta name="description" content="${escapeHtml(profile.title)}. ${escapeHtml(profile.location)}." />
  <link rel="canonical" href="https://synthetix-labz.cloud/resume.html" />
  <style>
    body { font-family: Georgia, serif; color: #12141a; background: #f4f1ea; margin: 0; line-height: 1.5; }
    .bar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: center; padding: 14px 24px; background: #12141a; color: #f4f1ea; font-family: "Segoe UI", sans-serif; }
    .bar-inner { width: 100%; max-width: 760px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .crumb { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; letter-spacing: 0.08em; }
    .crumb a { color: #f4f1ea; text-decoration: none; }
    .crumb a:hover { text-decoration: underline; }
    .crumb span[aria-current] { color: #c8c2b4; }
    .bar div { display: flex; gap: 8px; }
    .bar button { border: 1px solid #f4f1ea; background: transparent; color: #f4f1ea; font: inherit; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; }
    .bar button.primary { background: #f4f1ea; color: #12141a; }
    main { max-width: 760px; margin: 0 auto; padding: 40px 24px 72px; background: #fff; min-height: 100vh; }
    h1 { font-family: "Segoe UI", sans-serif; letter-spacing: 0.04em; margin: 0 0 4px; font-size: 32px; }
    h2 { font-family: "Segoe UI", sans-serif; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #222; margin-top: 28px; }
    .meta { color: #333; margin: 4px 0; }
    a { color: #0a6b4a; }
    ul { padding-left: 1.2rem; }
    @page { margin: 0.7in; }
    @media print {
      body { background: #fff; }
      .bar { display: none; }
      main { padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
<div class="bar">
  <div class="bar-inner">
    <nav class="crumb" aria-label="Breadcrumb">
      <a href="/">Synthetix Labz</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Resume</span>
    </nav>
    <div>
      <button class="primary" type="button" onclick="window.print()">Save as PDF</button>
      <button type="button" onclick="window.print()">Print</button>
    </div>
  </div>
</div>
<main>
  <h1>${escapeHtml(profile.name)}</h1>
  <p class="meta">${escapeHtml(profile.title)}</p>
  <p class="meta">${escapeHtml(profile.phone)} · ${escapeHtml(profile.email)} · ${escapeHtml(profile.location)} · ${escapeHtml(profile.hub)}</p>
  <h2>Summary</h2>
  <p>${escapeHtml(profile.summary)}</p>
  ${skills}
  <h2>Selected systems</h2>
  <ul>${projects}</ul>
  ${roles}
  <h2>Education</h2>
  ${profile.education
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => `<p>${escapeHtml(line.trim())}</p>`)
    .join("")}
</main>
</body>
</html>`;
}

export function downloadCv(profile: Profile) {
  const html = cvDocument(profile);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "James-Elton-Coffman-III-CV.html";
  link.click();
  URL.revokeObjectURL(url);
}
