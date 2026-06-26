import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const root = fileURLToPath(new URL(".", import.meta.url));
const projectsDir = path.join(root, "public", "projects");
const writingDir = path.join(root, "public", "writing");

function watchPublicMarkdown() {
  return {
    name: "watch-public-markdown",
    configureServer(server) {
      server.watcher.add(projectsDir);
      server.watcher.add(writingDir);

      const shouldReload = (file) => {
        const normalized = file.split(path.sep).join("/");
        return (
          (normalized.includes("/public/projects/") || normalized.includes("/public/writing/")) &&
          normalized.endsWith(".md")
        );
      };

      const reload = (file) => {
        if (!shouldReload(file)) return;
        server.ws.send({ type: "full-reload", path: "*" });
      };

      server.watcher.on("change", reload);
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
    },
  };
}

export default defineConfig({
  site: "https://example.com",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), watchPublicMarkdown()],
  },
});
