const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

function ensureDirectory(dirPath) {
    try {
        fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

function findTemplates(dir, baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const templates = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subTemplates = findTemplates(fullPath, baseDir);
            templates.push(...subTemplates);
        } else if (entry.isFile() && /\.adoc$/.test(entry.name)) {
            templates.push({
                input: fullPath,
                relativePath: path.relative(baseDir, fullPath),
            });
        }
    }

    return templates;
}

function renderTemplates() {
    // Configure Nunjucks environment
    const env = nunjucks.configure(process.env.SRC_DIR, {
        watch: false,
        noCache: true,
        tags: {
            blockStart: '{%',
            blockEnd: '%}',
            variableStart: '{{',
            variableEnd: '}}',
            commentStart: '{#',
            commentEnd: '#}'
        },
        autoescape: true  // Use `safe` to circumvent this.
    });
    env.addGlobal('readFile', function (p) {
        const data = fs.readFileSync(path.join(process.env.SRC_DIR, p), 'utf-8');
        return data;
    });
    env.addFilter('xref', function (p) {
        return `xref:${p}`
    });
    env.addFilter('toJson', function (data) {
        return JSON.stringify(data, null, 2)
    });
    env.addFilter('parseYaml', function (data) {
        return yaml.load(data);
    });
    env.addFilter('writeFile', function (data, p) {
        ensureDirectory(path.join(process.env.BUILT_DIR, path.dirname(p)));
        fs.writeFileSync(path.join(process.env.BUILT_DIR, p), data);
    });

    // Add any global data/context here if needed
    // env.addGlobal('siteName', 'My Site');

    // Find all template files
    console.log(`🔍 Scanning ${process.env.SRC_DIR} for templates...`);
    const templates = findTemplates(process.env.SRC_DIR);
    console.log(`✅ Found ${templates.length} template(s)`);

    // Process each template
    for (const tmpl of templates) {
        try {
            // Read raw source
            const source = fs.readFileSync(tmpl.input, 'utf8');

            // Render the template
            const output = env.renderString(source, {});

            // Prepare destination path (mirror directory structure)
            const destRelativePath = tmpl.relativePath;
            const destFilePath = path.join(process.env.BUILT_DIR, destRelativePath);
            const destSubDir = path.dirname(destFilePath);

            // Ensure destination directory exists
            ensureDirectory(destSubDir);

            // Write rendered output
            fs.writeFileSync(destFilePath, output, 'utf8');
            console.log(`📝 Rendered: ${tmpl.relativePath}`);
        } catch (err) {
            console.error(`❌ Error processing ${tmpl.relativePath}:`, err.message);
        }
    }

    console.log(`🎉 Done! Output written to ${process.env.BUILT_DIR}`);
}

renderTemplates();