import { absoluteUrl } from "../data/apps";
import type { Profile } from "../data/profile";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function downloadCv(profile: Profile) {
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
        `<li><strong>${escapeHtml(project.name)}</strong> — ${escapeHtml(project.description)} <a href="${escapeHtml(absoluteUrl(project.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(absoluteUrl(project.url))}</a></li>`,
    )
    .join("");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(profile.name)} — CV</title>
  <style>
    body { font-family: Georgia, serif; color: #12141a; max-width: 760px; margin: 40px auto; line-height: 1.45; }
    h1 { font-family: "Segoe UI", sans-serif; letter-spacing: 0.04em; margin-bottom: 0; }
    h2 { font-family: "Segoe UI", sans-serif; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #222; margin-top: 28px; }
    .meta { color: #333; }
    a { color: #0b5; }
  </style>
</head>
<body>
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
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "James-Elton-Coffman-III-CV.html";
  link.click();
  URL.revokeObjectURL(url);
}
