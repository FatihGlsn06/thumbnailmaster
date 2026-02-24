/**
 * Vite Server Plugin — Steam Game Verification via Playwright
 *
 * Provides /api/steam/verify endpoint that:
 * 1. Opens Steam store page with Playwright
 * 2. Extracts game name, screenshots, description
 * 3. Verifies the game matches the requested topic
 * 4. Takes a page screenshot for Gemini visual verification
 *
 * Usage in vite.config.js:
 *   import steamVerifyPlugin from './server/steam-verify-plugin.js'
 *   export default defineConfig({ plugins: [steamVerifyPlugin(), ...] })
 */

let chromiumPath = null;
let playwrightAvailable = false;

// Try to find the correct Playwright chromium binary
async function findChromium() {
  if (chromiumPath) return chromiumPath;

  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');

  const cacheDir = path.join(os.homedir(), '.cache', 'ms-playwright');

  try {
    const entries = fs.readdirSync(cacheDir);
    // Find the latest chromium version
    const chromiumDirs = entries
      .filter(e => e.startsWith('chromium-') && !e.includes('headless'))
      .sort()
      .reverse();

    for (const dir of chromiumDirs) {
      const chromeBin = path.join(cacheDir, dir, 'chrome-linux', 'chrome');
      if (fs.existsSync(chromeBin)) {
        chromiumPath = chromeBin;
        return chromiumPath;
      }
    }
  } catch {
    // Fallback: let Playwright find it automatically
  }
  return null;
}

// Fuzzy match: does the Steam game title match the user's topic?
function fuzzyMatch(steamTitle, userTopic) {
  if (!steamTitle || !userTopic) return { match: false, score: 0 };

  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nt = normalize(steamTitle);
  const nu = normalize(userTopic);

  // Exact match
  if (nt === nu) return { match: true, score: 1.0 };

  // One contains the other
  if (nt.includes(nu) || nu.includes(nt)) return { match: true, score: 0.9 };

  // Levenshtein-based similarity for typos (e.g., "Eldegarde" vs "Eldegard")
  const len = Math.max(nt.length, nu.length);
  if (len === 0) return { match: false, score: 0 };

  const dist = levenshtein(nt, nu);
  const similarity = 1 - dist / len;

  return { match: similarity >= 0.7, score: similarity };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export default function steamVerifyPlugin() {
  return {
    name: 'steam-verify',
    configureServer(server) {
      // ── /api/steam/verify?appId=2244820&topic=Eldegarde ──
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname !== '/api/steam/verify') return next();

        const appId = url.searchParams.get('appId');
        const topic = url.searchParams.get('topic');

        if (!appId || !topic) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing appId or topic parameter' }));
          return;
        }

        console.log(`[SteamVerify] 🔍 Verifying App ID ${appId} for topic "${topic}"...`);

        try {
          const result = await verifySteamApp(appId, topic);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          console.error(`[SteamVerify] ❌ Error:`, err.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message, verified: false }));
        }
      });

      console.log('[SteamVerify] ✅ Steam verification API ready at /api/steam/verify');
    }
  };
}

async function verifySteamApp(appId, topic) {
  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
    playwrightAvailable = true;
  } catch {
    playwrightAvailable = false;
    return { verified: false, error: 'Playwright not available', screenshots: [] };
  }

  const execPath = await findChromium();
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (execPath) launchOptions.executablePath = execPath;

  const browser = await chromium.launch(launchOptions);

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
      // Accept Steam's age gate cookies
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    // Set Steam cookies to bypass age verification
    await context.addCookies([
      { name: 'birthtime', value: '631152001', domain: 'store.steampowered.com', path: '/' },
      { name: 'wants_mature_content', value: '1', domain: 'store.steampowered.com', path: '/' },
      { name: 'Steam_Language', value: 'english', domain: 'store.steampowered.com', path: '/' },
      { name: 'lastagecheckage', value: '1-0-1990', domain: 'store.steampowered.com', path: '/' },
    ]);

    const page = await context.newPage();

    // Navigate to Steam store page
    const storeUrl = `https://store.steampowered.com/app/${appId}`;
    console.log(`[SteamVerify] 🌐 Opening ${storeUrl}...`);

    await page.goto(storeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    // Wait for the main content to load
    await page.waitForTimeout(2000);

    // ── Extract game data ──
    const gameData = await page.evaluate(() => {
      const data = {
        title: '',
        description: '',
        screenshots: [],
        headerImage: '',
        tags: [],
        developer: '',
        genres: [],
      };

      // Game title
      const titleEl = document.querySelector('#appHubAppName') ||
        document.querySelector('.apphub_AppName') ||
        document.querySelector('[itemprop="name"]');
      data.title = titleEl?.textContent?.trim() || '';

      // Description
      const descEl = document.querySelector('.game_description_snippet') ||
        document.querySelector('[itemprop="description"]');
      data.description = descEl?.textContent?.trim() || '';

      // Header image
      const headerEl = document.querySelector('.game_header_image_full') ||
        document.querySelector('img.game_header_image');
      data.headerImage = headerEl?.src || '';

      // Screenshots from the highlight strip
      const screenshotEls = document.querySelectorAll(
        '.highlight_strip_screenshot img, .screenshot_holder img, #highlight_strip img'
      );
      screenshotEls.forEach(img => {
        // Get the full-size URL from data attributes or src
        const fullUrl = img.dataset?.screenshotid
          ? `https://cdn.akamai.steamstatic.com/steam/apps/${window.location.pathname.split('/')[2]}/ss_${img.dataset.screenshotid}.jpg`
          : (img.src || '');
        if (fullUrl && !data.screenshots.includes(fullUrl)) {
          data.screenshots.push(fullUrl);
        }
      });

      // Also try to get screenshots from the highlight player area
      const highlightScreenshots = document.querySelectorAll('.highlight_screenshot img');
      highlightScreenshots.forEach(img => {
        const src = img.src?.replace('116x65', '1920x1080')
          ?.replace('.116x65', '')
          ?.replace('capsule_184x69', '');
        if (src && !data.screenshots.includes(src)) {
          data.screenshots.push(src);
        }
      });

      // Tags
      const tagEls = document.querySelectorAll('.app_tag');
      tagEls.forEach(el => {
        const tag = el.textContent?.trim();
        if (tag && tag !== '+') data.tags.push(tag);
      });

      // Developer
      const devEl = document.querySelector('#developers_list a');
      data.developer = devEl?.textContent?.trim() || '';

      // Genres
      const genreEls = document.querySelectorAll('.details_block a[href*="genre"]');
      genreEls.forEach(el => {
        data.genres.push(el.textContent?.trim());
      });

      return data;
    });

    // ── Take page screenshot for visual verification ──
    let pageScreenshot = null;
    try {
      // Scroll to top to capture the main banner area
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 70,
        clip: { x: 0, y: 0, width: 1280, height: 700 }, // Top portion with game banner
      });
      pageScreenshot = screenshotBuffer.toString('base64');
      console.log(`[SteamVerify] 📸 Page screenshot captured (${Math.round(pageScreenshot.length / 1024)}KB)`);
    } catch (e) {
      console.warn(`[SteamVerify] ⚠️ Screenshot failed:`, e.message);
    }

    // ── Also try the Steam Store API for additional screenshots ──
    let apiScreenshots = [];
    try {
      const apiResponse = await page.evaluate(async (id) => {
        const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`);
        return res.json();
      }, appId);

      const appData = apiResponse?.[appId]?.data;
      if (appData) {
        apiScreenshots = (appData.screenshots || []).map(s => s.path_full);
        // Override title if API has it (more reliable)
        if (appData.name) gameData.title = appData.name;
        if (appData.short_description) gameData.description = appData.short_description;
        if (appData.header_image) gameData.headerImage = appData.header_image;
      }
    } catch (e) {
      console.warn(`[SteamVerify] ⚠️ Steam API call failed:`, e.message);
    }

    // Merge screenshots (API + page scraping, deduplicated)
    const allScreenshots = [...new Set([...apiScreenshots, ...gameData.screenshots])];

    // ── Verify title matches topic ──
    const titleMatch = fuzzyMatch(gameData.title, topic);
    console.log(`[SteamVerify] 📋 Steam title: "${gameData.title}" vs topic: "${topic}" → score: ${titleMatch.score.toFixed(2)} match: ${titleMatch.match}`);

    const result = {
      verified: titleMatch.match,
      matchScore: titleMatch.score,
      gameName: gameData.title,
      description: gameData.description,
      headerImage: gameData.headerImage,
      screenshots: allScreenshots.slice(0, 10), // Max 10 screenshots
      tags: gameData.tags.slice(0, 10),
      developer: gameData.developer,
      genres: gameData.genres,
      pageScreenshot, // base64 JPEG of the Steam page (top section)
      appId,
      storeUrl: `https://store.steampowered.com/app/${appId}`,
    };

    console.log(`[SteamVerify] ${result.verified ? '✅' : '🚫'} App ${appId}: "${gameData.title}" → ${result.verified ? 'VERIFIED' : 'REJECTED'} (score: ${titleMatch.score.toFixed(2)}, ${allScreenshots.length} screenshots)`);

    return result;
  } finally {
    await browser.close();
  }
}
