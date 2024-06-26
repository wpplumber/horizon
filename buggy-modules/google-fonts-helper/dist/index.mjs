import { withHttps, withQuery, resolveURL, createURL } from 'ufo';
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, extname, basename, posix } from 'node:path';
import { ofetch } from 'ofetch';
import { Hookable } from 'hookable';
import deepmerge from 'deepmerge';

const GOOGLE_FONTS_DOMAIN = "fonts.googleapis.com";
function isValidDisplay(display) {
  return ["auto", "block", "swap", "fallback", "optional"].includes(display);
}
function parseStyle(style) {
  if (["wght", "regular", "normal"].includes(style.toLowerCase())) {
    return "wght";
  }
  if (["i", "italic", "ital"].includes(style.toLowerCase())) {
    return "ital";
  }
  return style;
}
function parseFamilyName(name) {
  return decodeURIComponent(name).replace(/\+/g, " ");
}

function constructURL({ families, display, subsets, text } = {}) {
  const subset = (Array.isArray(subsets) ? subsets : [subsets]).filter(Boolean);
  const prefix = subset.length > 0 ? "css" : "css2";
  const family = convertFamiliesToArray(families ?? {}, prefix.endsWith("2"));
  if (family.length < 1) {
    return false;
  }
  const query = {
    family
  };
  if (display && isValidDisplay(display)) {
    query.display = display;
  }
  if (subset.length > 0) {
    query.subset = subset.join(",");
  }
  if (text) {
    query.text = text;
  }
  return withHttps(withQuery(resolveURL(GOOGLE_FONTS_DOMAIN, prefix), query));
}
function convertFamiliesToArray(families, v2 = true) {
  const result = [];
  if (!v2) {
    Object.entries(families).forEach(([name, values]) => {
      if (!name) {
        return;
      }
      name = parseFamilyName(name);
      if (Array.isArray(values) && values.length > 0 || (values === true || values === 400)) {
        result.push(name);
        return;
      }
      if (values === 700) {
        result.push(`${name}:bold`);
        return;
      }
      if (Object.keys(values).length > 0) {
        const styles = [];
        Object.entries(values).sort(([styleA], [styleB]) => styleA.localeCompare(styleB)).forEach(([style, weight]) => {
          const styleParsed = parseStyle(style);
          if (styleParsed === "ital" && (weight === 700 || Array.isArray(weight) && weight.includes(700))) {
            styles.push("bolditalic");
            if (Array.isArray(weight) && weight.includes(400)) {
              styles.push(styleParsed);
            }
          } else if (styleParsed === "wght" && (weight === 700 || Array.isArray(weight) && weight.includes(700))) {
            styles.push("bold");
            if (Array.isArray(weight) && weight.includes(400)) {
              styles.push(styleParsed);
            }
          } else if (weight !== false) {
            styles.push(styleParsed);
          }
        });
        const stylesSortered = styles.sort(([styleA], [styleB]) => styleA.localeCompare(styleB)).reverse().join(",");
        if (stylesSortered === "wght") {
          result.push(name);
          return;
        }
        result.push(`${name}:${stylesSortered}`);
      }
    });
    return result.length ? [result.join("|")] : result;
  }
  if (v2) {
    Object.entries(families).forEach(([name, values]) => {
      if (!name) {
        return;
      }
      name = parseFamilyName(name);
      if (typeof values === "string" && String(values).includes("..")) {
        result.push(`${name}:wght@${values}`);
        return;
      }
      if (Array.isArray(values) && values.length > 0) {
        result.push(`${name}:wght@${values.join(";")}`);
        return;
      }
      if (Object.keys(values).length > 0) {
        const styles = [];
        const weights = [];
        let forceWght = false;
        Object.entries(values).sort(([styleA], [styleB]) => styleA.localeCompare(styleB)).forEach(([style, weight]) => {
          const styleParsed = parseStyle(style);
          styles.push(styleParsed);
          const weightList = Array.isArray(weight) ? weight : [weight];
          weightList.forEach((value) => {
            if (Object.keys(values).length === 1 && styleParsed === "wght") {
              weights.push(String(value));
            } else {
              const index = styleParsed === "wght" ? 0 : 1;
              if ((value.toString() === "true" || value === 1 || value === 400) && Object.entries(values).length === 1 && weightList.length === 1) {
                weights.push(`${index}`);
              } else if (value) {
                forceWght = true;
                weights.push(`${index},${value}`);
              }
            }
          });
        });
        if (!styles.includes("wght") && forceWght) {
          styles.push("wght");
        }
        const weightsSortered = weights.sort(([weightA], [weightB]) => weightA.localeCompare(weightB)).join(";");
        result.push(`${name}:${styles.join(",")}@${weightsSortered}`);
        return;
      }
      if (values) {
        result.push(name);
      }
    });
  }
  return result;
}

function isValidURL(url) {
  return RegExp(GOOGLE_FONTS_DOMAIN).test(url);
}

class Downloader extends Hookable {
  constructor(url, options) {
    super();
    this.url = url;
    this.config = {
      base64: false,
      overwriting: false,
      outputDir: "./",
      stylePath: "fonts.css",
      fontsDir: "fonts",
      fontsPath: "./fonts",
      headers: [["user-agent", [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "AppleWebKit/537.36 (KHTML, like Gecko)",
        "Chrome/98.0.4758.102 Safari/537.36"
      ].join(" ")]],
      ...options
    };
  }
  async execute() {
    if (!isValidURL(this.url)) {
      throw new Error("Invalid Google Fonts URL");
    }
    const { outputDir, stylePath, headers, fontsPath } = this.config;
    const cssPath = resolve(outputDir, stylePath);
    let overwriting = this.config.overwriting;
    if (!overwriting && existsSync(cssPath)) {
      const currentCssContent = readFileSync(cssPath, "utf-8");
      const currentUrl = (currentCssContent.split(/\r?\n/, 1).shift() || "").replace("/*", "").replace("*/", "").trim();
      overwriting = currentUrl !== this.url;
    }
    // if (overwriting) {
    //   rmSync(outputDir, { recursive: true, force: true });
    // }
    await this.callHook("download-css:before", this.url);
    const cssContent = await ofetch(this.url, { headers });
    const fontsFromCss = parseFontsFromCss(cssContent, fontsPath);
    await this.callHook("download-css:done", this.url, cssContent, fontsFromCss);
    const fonts = (await Promise.all(this.downloadFonts(fontsFromCss))).filter((font) => font.inputText);
    await this.callHook("write-css:before", cssPath, cssContent, fonts);
    const newContent = this.writeCss(cssPath, `/* ${this.url} */
${cssContent}`, fonts);
    await this.callHook("write-css:done", cssPath, newContent, cssContent);
  }
  downloadFonts(fonts) {
    const { headers, base64, outputDir, fontsDir } = this.config;
    return fonts.map(async (font) => {
      await this.callHook("download-font:before", font);
      const response = await ofetch.raw(font.inputFont, { headers, responseType: "arrayBuffer" });
      if (!response?._data) {
        return {};
      }
      const buffer = Buffer.from(response?._data);
      if (base64) {
        const mime = response.headers.get("content-type") ?? "font/woff2";
        font.outputText = `url('data:${mime};base64,${buffer.toString("base64")}')`;
      } else {
        const fontPath = resolve(outputDir, fontsDir, font.outputFont);
        mkdirSync(dirname(fontPath), { recursive: true });
        writeFileSync(fontPath, buffer, "utf-8");
      }
      await this.callHook("download-font:done", font);
      return font;
    });
  }
  writeCss(path, content, fonts) {
    for (const font of fonts) {
      content = content.replace(font.inputText, font.outputText);
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf-8");
    return content;
  }
}
function parseFontsFromCss(content, fontsPath) {
  const fonts = [];
  const re = {
    face: /\s*(?:\/\*\s*(.*?)\s*\*\/)?[^@]*?@font-face\s*{(?:[^}]*?)}\s*/gi,
    family: /font-family\s*:\s*(?:'|")?([^;]*?)(?:'|")?\s*;/i,
    weight: /font-weight\s*:\s*([^;]*?)\s*;/i,
    url: /url\s*\(\s*(?:'|")?\s*([^]*?)\s*(?:'|")?\s*\)\s*?/gi
  };
  let i = 1;
  let match1;
  while ((match1 = re.face.exec(content)) !== null) {
    const [fontface, comment] = match1;
    const familyRegExpArray = re.family.exec(fontface);
    const family = familyRegExpArray ? familyRegExpArray[1] : "";
    const weightRegExpArray = re.weight.exec(fontface);
    const weight = weightRegExpArray ? weightRegExpArray[1] : "";
    let match2;
    while ((match2 = re.url.exec(fontface)) !== null) {
      const [forReplace, url] = match2;
      const urlPathname = new URL(url).pathname;
      const ext = extname(urlPathname);
      if (ext.length < 2) {
        continue;
      }
      const filename = basename(urlPathname, ext) || "";
      const newFilename = formatFontFileName("{_family}-{weight}-{i}.{ext}", {
        comment: comment || "",
        family,
        weight: weight || "",
        filename,
        _family: family.replace(/\s+/g, "_"),
        ext: ext.replace(/^\./, "") || "",
        i: String(i++)
      }).replace(/\.$/, "");
      fonts.push({
        inputFont: url,
        outputFont: newFilename,
        inputText: forReplace,
        outputText: `url('${posix.join(fontsPath, newFilename)}')`
      });
    }
  }
  return fonts;
}
function formatFontFileName(template, values) {
  return Object.entries(values).filter(([key]) => /^[a-z0-9_-]+$/gi.test(key)).map(([key, value]) => [new RegExp(`([^{]|^){${key}}([^}]|$)`, "g"), `$1${value}$2`]).reduce((str, [regexp, replacement]) => str.replace(regexp, String(replacement)), template).replace(/({|}){2}/g, "$1");
}

function download(url, options) {
  return new Downloader(url, options);
}

function merge(...fonts) {
  return deepmerge.all(fonts);
}

function parse(url) {
  const result = {};
  if (!isValidURL(url)) {
    return result;
  }
  const { searchParams, pathname } = createURL(url);
  if (!searchParams.has("family")) {
    return result;
  }
  const families = convertFamiliesObject(searchParams.getAll("family"), pathname.endsWith("2"));
  if (Object.keys(families).length < 1) {
    return result;
  }
  result.families = families;
  const display = searchParams.get("display");
  if (display && isValidDisplay(display)) {
    result.display = display;
  }
  const subsets = searchParams.get("subset");
  if (subsets) {
    result.subsets = subsets.split(",");
  }
  const text = searchParams.get("text");
  if (text) {
    result.text = text;
  }
  return result;
}
function convertFamiliesObject(families, v2 = true) {
  const result = {};
  families.flatMap((family) => family.split("|")).forEach((family) => {
    if (!family) {
      return;
    }
    if (!family.includes(":")) {
      result[family] = true;
      return;
    }
    const parts = family.split(":");
    if (!parts[1]) {
      return;
    }
    const values = {};
    if (!v2) {
      parts[1].split(",").forEach((style) => {
        const styleParsed = parseStyle(style);
        if (styleParsed === "wght") {
          values.wght = true;
        }
        if (styleParsed === "ital") {
          values.ital = true;
        }
        if (styleParsed === "bold" || styleParsed === "b") {
          values.wght = 700;
        }
        if (styleParsed === "bolditalic" || styleParsed === "bi") {
          values.ital = 700;
        }
      });
    }
    if (v2) {
      let [styles, weights] = parts[1].split("@");
      if (!weights) {
        weights = String(styles).replace(",", ";");
        styles = "wght";
      }
      styles.split(",").forEach((style) => {
        const styleParsed = parseStyle(style);
        values[styleParsed] = weights.split(";").map((weight) => {
          if (/^\+?\d+$/.test(weight)) {
            return parseInt(weight);
          }
          const [pos, w] = weight.split(",");
          const index = styleParsed === "wght" ? 0 : 1;
          if (!w) {
            return weight;
          }
          if (parseInt(pos) !== index) {
            return 0;
          }
          if (/^\+?\d+$/.test(w)) {
            return parseInt(w);
          }
          return w;
        }).filter((v) => parseInt(v.toString()) > 0 || v.toString().includes(".."));
        if (!values[styleParsed].length) {
          values[styleParsed] = true;
          return;
        }
        if (values[styleParsed].length > 1) {
          return;
        }
        const first = values[styleParsed][0];
        if (String(first).includes("..")) {
          values[styleParsed] = first;
        }
        if (first === 1 || first === true) {
          values[styleParsed] = true;
        }
      });
    }
    result[parseFamilyName(parts[0])] = values;
  });
  return result;
}

export { Downloader, constructURL, download, isValidURL, merge, parse };
