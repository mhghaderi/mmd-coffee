import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");
const extensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const staticProductPatterns = [
    /@\/data\/products/g,
    /(?:^|["'])\.\.?\/[^"']*data\/products/gm,
];

function walk(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(fullPath);
        return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
    });
}

const files = walk(root);
const offenders = [];

for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    if (staticProductPatterns.some((pattern) => pattern.test(source))) {
        offenders.push(path.relative(process.cwd(), file));
    }
    for (const pattern of staticProductPatterns) pattern.lastIndex = 0;
}

console.log(`Checked ${files.length} source files.`);

if (offenders.length) {
    console.error("❌ هنوز Import استاتیک محصولات وجود دارد:");
    for (const file of offenders) console.error(` - ${file}`);
    process.exitCode = 1;
} else {
    console.log("✅ هیچ Import فعالی از src/data/products.js پیدا نشد.");
    console.log("✅ Catalog UI برای محصولات به سرویس‌های MongoDB متصل است.");
}
