const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const yaml = require('js-yaml');


async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function findAssets(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const assets = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subAssets = await findAssets(fullPath, baseDir);
      assets.push(...subAssets);
    } else if (entry.isFile()) {
      const fileName = entry.name;
      let assetType = null;

      // Match *.ext.njk templates
      if (/\.[^.]+\.njk$/.test(fileName)) {
        assetType = 'template';
      }
      // Match *.yml or *.yaml
      else if (/\.ya?ml$/.test(fileName)) {
        assetType = 'yaml';
      }

      if (assetType) {
        assets.push({
          input: fullPath,
          relativePath: path.relative(baseDir, fullPath),
          assetType,
        });
      }
    }
  }

  return assets;
}

async function processAssets() {
  const env = nunjucks.configure(process.env.SRC_DIR, {
    watch: false,
    noCache: true,
    tags: {
      blockStart: '//{%',
      blockEnd: '%}',
      variableStart: '{{',
      variableEnd: '}}',
      commentStart: '{#',
      commentEnd: '#}'
    }
  });

  console.log(`🔍 Scanning ${process.env.SRC_DIR} for templates and YAML...`);
  const assets = await findAssets(process.env.SRC_DIR);
  console.log(`✅ Found ${assets.filter(a => a.assetType === 'template').length} template(s) and ${assets.filter(a => a.assetType === 'yaml').length} YAML file(s)`);

  for (const asset of assets) {
    try {
      const source = await fs.readFile(asset.input, 'utf8');
      const destSubDir = path.dirname(path.join(process.env.BUILT_DIR, asset.relativePath));
      await ensureDirectory(destSubDir);

      if (asset.assetType === 'template') {
        // Render Nunjucks template, strip .njk suffix
        const output = env.renderString(source, {});
        const destFilePath = path.join(process.env.BUILT_DIR, asset.relativePath.replace(/\.njk$/, ''));
        await fs.writeFile(destFilePath, output, 'utf8');
        console.log(`📝 Template: ${asset.relativePath}`);
      } else if (asset.assetType === 'yaml') {
        // Parse YAML, stringify JSON, replace extension with .json
        const data = yaml.load(source);
        const json = JSON.stringify(data, null, 2);
        const destFilePath = path.join(process.env.BUILT_DIR, asset.relativePath.replace(/\.(ya?ml)$/, '.json'));
        await fs.writeFile(destFilePath, json, 'utf8');
        console.log(`🔄 YAML→JSON: ${asset.relativePath}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${asset.relativePath}:`, err.message);
    }
  }

  console.log(`🎉 Done! Output written to ${process.env.BUILT_DIR}`);
}

processAssets().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
