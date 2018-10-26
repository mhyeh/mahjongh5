var fs = require("fs");
var convert = require('xml-js');

(function readDir(path) {
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, list) => {
            list.forEach((value) => readDir(path + "\\" + value));
        });
    } else if (fs.lstatSync(path).isFile() && /\.fnt$/.test(path)) {
        readFNT(path);
    }
})(process.argv[2]);

function readFNT(path) {
    fs.readFile(path, "utf8", (error, rawData) => {
        const lines = rawData.split(/\r\n|\r|\n/);
        const data = {
            _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
            font: {
                info: { _attributes: { size: 32 } },
                common: { _attributes: { lineHeight: 32 } },
                pages: { _attributes: {}, page: [] },
                chars: { _attributes: {}, char: [] },
                kernings: { _attributes: { count: 0 }, kerning: [] },
            }
        };
        for (const line of lines) {
            let object;
            const texts = line.split(" ");
            if (texts.length > 0) {
                if (texts[0] === "info") {
                    object = data.font.info;
                } else if (texts[0] === "common") {
                    object = data.font.common;
                } else if (texts[0] === "page") {
                    object = { _attributes: {} };
                    data.font.pages.page.push(object);
                } else if (texts[0] === "chars") {
                    object = data.font.chars;
                } else if (texts[0] === "char") {
                    object = { _attributes: {} };
                    data.font.chars.char.push(object);
                } else if (texts[0] === "kernings") {
                    object = data.font.kernings;
                } else if (texts[0] === "kerning") {
                    object = { _attributes: {} };
                    data.font.kernings.kerning.push(object);
                }
            }
            const attributes = line.match(/\w+=((-?\d+)|("[^"]*"))/g);
            if (attributes) {
                for (const attribute of attributes) {
                    const name = attribute.split("=")[0];
                    const value = attribute.split("=").slice(1).join("=");
                    if (/^"[^"]*"$/.test(value)) {
                        object._attributes[name] = value.substring(1, value.length - 1);
                    } else {
                        object._attributes[name] = Number(value);
                    }
                }
            }
        }
        fs.writeFileSync(path.replace(/\.fnt$/, ".xml"), convert.js2xml(data, { compact: true, spaces: 2 }), "utf8");
        console.log(path.replace(/\.fnt$/, ".xml"));
    });
}