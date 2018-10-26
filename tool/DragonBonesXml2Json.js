var fs = require("fs");
var xml2js = require("xml2js");

var parser = new xml2js.Parser();

(function readDir(path) {
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, list) => {
            list.forEach((value) => readDir(path + "\\" + value));
        });
    } else if (fs.lstatSync(path).isFile() && /\.xml$/.test(path)) {
        readXML(path);
    }
})(process.argv[2]);

function readXML(path) {
    fs.readFile(path, (error, data) => {
        parser.parseString(data, (error, result) => {
            result = JSON.parse(JSON.stringify(result));
            if (result["dragonBones"]) {
                result = result["dragonBones"];
                fs.writeFileSync(path.replace(/\.xml$/, ".json"), JSON.stringify(xml2object(result)));
                console.log(path.replace(/\.xml$/, ".json"));
            } else if (result["TextureAtlas"]) {
                result = result["TextureAtlas"];
                fs.writeFileSync(path.replace(/\.xml$/, ".json"), JSON.stringify(xml2object(result)));
                console.log(path.replace(/\.xml$/, ".json"));
            }
        });
    });
}

function xml2object(xml) {
    let obj = xml["$"] || {};
    for (const key in obj) {
        if (key === "tweenEasing" && obj[key] === "NaN") {
            obj[key] = null;
        }
        // if (Number(obj[key]) !== Number.NaN && (key !== "name" && key !== "parent" && key !== "type" && key !== "imagePath")) {
        //     obj[key] = Number(obj[key]);
        // }
    }
    for (const key in xml) {
        if (key !== "$") {
            obj[key] = xml[key].map((value) => xml2object(value));
        }
        if (key === "transform") {
            obj[key] = obj[key][0];
        }
        if (key === "colorTransform") {
            obj[key] = obj[key][0];
        }
    }
    return obj;
}
