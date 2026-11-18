import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(".");
const port = 4173;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json"
};

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
    const relative = normalize(pathname).replace(/^([/\\\\])+/, "");
    let file = resolve(join(root, relative));
    if (!file.startsWith(root)) throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;

try {
  await new Promise(resolve => server.listen(port, "127.0.0.1", resolve));
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });

  // A repeatable random sequence keeps procedural game scenes consistent between builds.
  await context.addInitScript(() => {
    let seed = 2463534242;
    Math.random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
  });

  const captures = [
    {
      name: "Backrooms Brawl",
      path: "/games/backrooms-brawl/",
      file: "games/backrooms-brawl/preview.png",
      play: async page => {
        await page.locator("#go").click();
        await page.keyboard.down("d");
        await sleep(1500);
        await page.keyboard.up("d");
      }
    },
    {
      name: "Flappy Clucker",
      path: "/games/flappy-clucker/",
      file: "games/flappy-clucker/preview.png",
      play: async page => {
        const canvas = page.locator("#c");
        const bounds = await canvas.boundingBox();
        if (!bounds) throw new Error("Flappy Clucker canvas was not found");
        await page.mouse.click(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.52);
        await sleep(1200);
        for (let i = 0; i < 3; i++) {
          await page.mouse.click(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.52);
          await sleep(350);
        }
        await sleep(500);
      }
    },
    {
      name: "Headfirst",
      path: "/games/headfirst/",
      file: "games/headfirst/preview.png",
      play: async page => {
        await page.locator("#go").click();
        await page.keyboard.down("d");
        await sleep(1200);
        await page.keyboard.up("d");
        await page.mouse.click(850, 360);
        await sleep(900);
      }
    },
    {
      name: "Polyfall",
      path: "/games/polyfall/",
      file: "games/polyfall/preview.png",
      play: async page => {
        await page.locator("#start").click();
        for (const key of ["ArrowUp", "ArrowLeft", "Space", "ArrowRight", "ArrowUp", "Space"]) {
          await page.keyboard.press(key);
          await sleep(180);
        }
        await sleep(500);
      }
    }
  ];

  const requested = process.argv.slice(2);
  const selected = requested.length
    ? requested.flatMap(slug => {
        const known = captures.find(game => game.path === `/games/${slug}/`);
        return known ? [known] : [{
          name: slug,
          path: `/games/${slug}/`,
          file: `games/${slug}/preview.png`,
          play: async () => {}
        }];
      })
    : captures;

  for (const game of selected) {
    const page = await context.newPage();
    if (game.name === "Flappy Clucker") {
      await page.setViewportSize({ width: 390, height: 844 });
    }
    page.on("pageerror", error => console.error(`[${game.name}] ${error.message}`));
    await page.goto(`http://127.0.0.1:${port}${game.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.evaluate(() => document.fonts?.ready);
    await game.play(page);
    await page.screenshot({ path: game.file, fullPage: false, animations: "disabled" });
    console.log(`Captured ${game.name}: ${game.file}`);
    await page.close();
  }

  await context.close();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
