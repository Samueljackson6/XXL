import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCS_DIR = path.join(__dirname, 'docs', 'wechat-official');

// Pages to fetch from developers.weixin.qq.com/minigame/dev/guide/
const PAGES = [
  // Main guide
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/', file: 'index.html' },

  // Engine adaptation
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/engine-overview.html', file: 'engine-overview.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/cocos-laya-egret.html', file: 'cocos-laya-egret.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform.html', file: 'unity-webgl-transform.html' },

  // Framework
  { url: 'https://developers.weixin.qq.com/minigame/dev/reference/', file: 'framework.html' },

  // API reference
  { url: 'https://developers.weixin.qq.com/minigame/dev/api/', file: 'api.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/api-backend/', file: 'api-backend.html' },

  // Developer tools
  { url: 'https://developers.weixin.qq.com/minigame/dev/devtools/devtools', file: 'devtools.html' },

  // Adaptation / capability
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/base-info/adaptation.html', file: 'adaptation.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/base-info/ability-rules.html', file: 'ability-rules.html' },

  // Performance
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/', file: 'performance.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/pain-point.html', file: 'performance-pain-point.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/fps.html', file: 'performance-fps.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/memory.html', file: 'performance-memory.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/overdraw.html', file: 'performance-overdraw.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/cpu.html', file: 'performance-cpu.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/device.html', file: 'performance-device.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/sdk.html', file: 'performance-sdk.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/guide.html', file: 'performance-guide.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/startup.html', file: 'performance-startup.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/download.html', file: 'performance-download.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/performance/experience.html', file: 'performance-experience.html' },

  // Render
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/', file: 'renderer.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/render.html', file: 'renderer-render.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/texture.html', file: 'renderer-texture.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/canvas.html', file: 'renderer-canvas.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/webgl.html', file: 'renderer-webgl.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/drawcall.html', file: 'renderer-drawcall.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/sprite.html', file: 'renderer-sprite.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/antialias.html', file: 'renderer-antialias.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/2d.html', file: 'renderer-2d.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/renderer/webgpu.html', file: 'renderer-webgpu.html' },

  // Environment
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/', file: 'environment.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/run.html', file: 'environment-run.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/version.html', file: 'environment-version.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/custom.html', file: 'environment-custom.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/container.html', file: 'environment-container.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/audio.html', file: 'environment-audio.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/media.html', file: 'environment-media.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/filesystem.html', file: 'environment-filesystem.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/network.html', file: 'environment-network.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/storage.html', file: 'environment-storage.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/open-type.html', file: 'environment-open-type.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/system.html', file: 'environment-system.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/sensor.html', file: 'environment-sensor.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/worker.html', file: 'environment-worker.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/wxml.html', file: 'environment-wxml.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/wxss.html', file: 'environment-wxss.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/wxs.html', file: 'environment-wxs.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/canvas.html', file: 'environment-canvas.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/video.html', file: 'environment-video.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment/webgl.html', file: 'environment-webgl.html' },

  // Environment 3D
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/', file: 'environment-3d.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/webgl.html', file: 'environment-3d-webgl.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/2d.html', file: 'environment-3d-2d.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/webgpu.html', file: 'environment-3d-webgpu.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/gltf.html', file: 'environment-3d-gltf.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/texture.html', file: 'environment-3d-texture.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/animation.html', file: 'environment-3d-animation.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/physics.html', file: 'environment-3d-physics.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/particle.html', file: 'environment-3d-particle.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/scene.html', file: 'environment-3d-scene.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/camera.html', file: 'environment-3d-camera.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/light.html', file: 'environment-3d-light.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/post-processing.html', file: 'environment-3d-post-processing.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/material.html', file: 'environment-3d-material.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/shader.html', file: 'environment-3d-shader.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/raycast.html', file: 'environment-3d-raycast.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/octree.html', file: 'environment-3d-octree.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/aabbtree.html', file: 'environment-3d-aabbtree.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/particle-shape.html', file: 'environment-3d-particle-shape.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/particle-system.html', file: 'environment-3d-particle-system.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/skinned-mesh.html', file: 'environment-3d-skinned-mesh.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/blend-shape.html', file: 'environment-3d-blend-shape.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/batch.html', file: 'environment-3d-batch.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/instancing.html', file: 'environment-3d-instancing.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/skinning.html', file: 'environment-3d-skinning.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/lod.html', file: 'environment-3d-lod.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/occlusion.html', file: 'environment-3d-occlusion.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/mesh.html', file: 'environment-3d-mesh.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/sub-mesh.html', file: 'environment-3d-sub-mesh.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/texture-2d.html', file: 'environment-3d-texture-2d.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/texture-cube.html', file: 'environment-3d-texture-cube.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/sampler.html', file: 'environment-3d-sampler.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/shader-variant.html', file: 'environment-3d-shader-variant.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/animator.html', file: 'environment-3d-animator.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/skeleton.html', file: 'environment-3d-skeleton.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/clip.html', file: 'environment-3d-clip.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/transform.html', file: 'environment-3d-transform.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/bone.html', file: 'environment-3d-bone.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/matrix.html', file: 'environment-3d-matrix.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/vector3.html', file: 'environment-3d-vector3.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/quaternion.html', file: 'environment-3d-quaternion.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/bounding-sphere.html', file: 'environment-3d-bounding-sphere.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/bounding-box.html', file: 'environment-3d-bounding-box.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/ray.html', file: 'environment-3d-ray.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/plane.html', file: 'environment-3d-plane.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/color.html', file: 'environment-3d-color.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/event.html', file: 'environment-3d-event.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/input.html', file: 'environment-3d-input.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/environment-3d/loader.html', file: 'environment-3d-loader.html' },

  // Game engine overview
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/engine-overview.html', file: 'game-engine-overview.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/SDKInstaller.html', file: 'unity-sdk-installer.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/Guide.html', file: 'unity-guide.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/Transform.html', file: 'unity-transform.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/ShowCase.html', file: 'unity-showcase.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/CHANGELOG.html', file: 'unity-changelog.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/TechSummary.html', file: 'unity-tech-summary.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/Evaluation.html', file: 'unity-evaluation.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/DevelopmentQAList.html', file: 'unity-qa.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-engine/unity-webgl-transform/Design/PerfOptimization.html', file: 'unity-perf.html' },

  // Game loop and input
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-loop/game-loop.html', file: 'game-loop.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-loop/frame.html', file: 'game-loop-frame.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-loop/input.html', file: 'game-loop-input.html' },
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/game-loop/touch.html', file: 'game-loop-touch.html' },

  // Storage
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/storage/', file: 'storage.html' },

  // Content security
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/security/content-security.html', file: 'security.html' },

  // Open data
  { url: 'https://developers.weixin.qq.com/minigame/dev/guide/open-ability/open-data.html', file: 'open-data.html' },
];

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': AGENT, 'Accept': 'text/html,application/xhtml+xml' },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout: ' + url)); });
  });
}

function extractText(html) {
  // Remove scripts, styles, nav elements
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Try to extract from Vue-rendered content
  // The content is usually in a div with class containing 'main-container' or 'content'
  const contentMatch = text.match(/<div class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
  if (contentMatch) {
    text = contentMatch[1];
  }

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Remove excessive spaces around punctuation
  text = text.replace(/\s*([，。！？、；：""''【】《》（）…—\s])\s*/g, '$1');
  return text;
}

async function main() {
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  console.log(`Fetching ${PAGES.length} pages from WeChat official docs...\n`);

  let success = 0, fail = 0;

  for (const page of PAGES) {
    try {
      const html = await fetch(page.url);
      const text = extractText(html);

      // Skip pages that returned error or are too short (likely error pages)
      if (text.length < 200) {
        console.log(`  SKIP (too short): ${page.file} — ${text.substring(0, 100)}`);
        fail++;
        continue;
      }

      // Save both raw HTML and extracted text
      fs.writeFileSync(path.join(DOCS_DIR, page.file + '.html'), html, 'utf-8');
      fs.writeFileSync(path.join(DOCS_DIR, page.file + '.txt'), text, 'utf-8');

      console.log(`  OK (${text.length} chars): ${page.file}`);
      success++;
    } catch (e) {
      console.log(`  FAIL: ${page.file} — ${e.message}`);
      fail++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone: ${success} succeeded, ${fail} failed/skipped`);
  console.log(`Saved to: ${DOCS_DIR}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
