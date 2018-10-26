var fs = require("fs");
var jimp = require("jimp");
var xml2js = require("xml2js");
var plist = require("plist");

if (process.argv[2] === "b") {
    const parser = new xml2js.Parser();
    const texturePath = process.argv[3];
    const dataPath = process.argv[4];

    if (/\.png$/.test(texturePath)) {
        jimp.read(texturePath).then((texture) => {
            var output = {
                map: {},
                dataPath,
            };
            if (/\.xml$/.test(dataPath)) {
                output.dataPath.replace(/\.xml$/, ".json")
                fs.readFile(dataPath, (error, data) => {
                    parser.parseString(data, (error, result) => {
                        output.name = result.TextureAtlas["$"].name;
                        output.imagePath = result.TextureAtlas["$"].imagePath;
                        const prefix = output.name.match(/[^\\/:*?"<>|\r\n]*$/)[0];
                        for (const subtexture of result.TextureAtlas.SubTexture) {
                            const frame = {
                                name: subtexture["$"].name,
                                x: Number(subtexture["$"].x),
                                y: Number(subtexture["$"].y),
                                width: Number(subtexture["$"].width),
                                height: Number(subtexture["$"].height),
                            }
                            console.log(frame.name, frame.x, frame.y, frame.width, frame.height);
                            try {
                                ExportImage(output, texture.clone().crop(frame.x, frame.y, frame.width, frame.height), frame.name, prefix);
                            } catch (error) {
                                console.error("crop fail", error);
                            }
                        }
                        fs.writeFileSync(dataPath + "_map.json", JSON.stringify(output), "utf8");
                    })
                });
            } else if (/\.json$/.test(dataPath)) {
                fs.readFile(dataPath, (error, data) => {
                    data = JSON.parse(data);
                    output.name = data.name;
                    output.imagePath = data.imagePath;
                    const prefix = output.name.match(/[^\\/:*?"<>|\r\n]*$/)[0];
                    for (const subtexture of data.SubTexture) {
                        const frame = {
                            name: subtexture.name,
                            x: subtexture.x,
                            y: subtexture.y,
                            width: subtexture.width,
                            height: subtexture.height,
                        }
                        console.log(frame.name, frame.x, frame.y, frame.width, frame.height);
                        try {
                            ExportImage(output, texture.clone().crop(frame.x, frame.y, frame.width, frame.height), frame.name, prefix);
                        } catch (error) {
                            console.error("crop fail", error);
                        }
                    }
                    fs.writeFileSync(dataPath + "_map.json", JSON.stringify(output), "utf8");
                });
            }
        });
    } else {
        console.log("Error Texture Path: ", texturePath);
    }
} else {
    const mapPath = process.argv[3];
    const atlasPath = process.argv[4];
    const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
    const data = {
        name: map.name,
        imagePath: map.imagePath,
        SubTexture: [],
    };
    if (atlas.frames instanceof Array) {
        const frames = [];
        for (const frame of atlas.frames) {
            if (map.map[frame.filename]) {
                if (frame.trimmed || frame.rotated) {
                    console.warn(map.map[frame.filename] + ": trimmed or rotated maybe has error");
                }
                data.SubTexture.push({
                    x: frame.frame.x,
                    y: frame.frame.y,
                    width: frame.frame.w,
                    height: frame.frame.h,
                    name: map.map[frame.filename],
                });
            } else {
                frames.push(frame);
            }
        }
        atlas.frames = frames;
    } else {
        for (const key in atlas.frames) {
            if (atlas.frames.hasOwnProperty(key) && map.map[key]) {
                if (atlas.frames[key].trimmed || atlas.frames[key].rotated) {
                    console.warn(map.map[key] + ": trimmed or rotated maybe has error");
                }
                data.SubTexture.push({
                    x: atlas.frames[key].frame.x,
                    y: atlas.frames[key].frame.y,
                    width: atlas.frames[key].frame.w,
                    height: atlas.frames[key].frame.h,
                    name: map.map[key],
                });
                atlas.frames[key] = undefined;
            }
        }
    }
    fs.writeFileSync(map.dataPath, JSON.stringify(data), "utf8");
    // fs.writeFileSync(atlasPath, JSON.stringify(atlas), "utf8");
}

function ExportImage(map, image, name, prefix) {
    const fileName = (prefix || "") + "_" + uuid() + ".png";
    map.map[fileName] = name;
    image.write(fileName);
}

function uuid() {
    let a = '';
    let b = '';
    for (b = a = ''; a++ < 8; b += ~a % 5 | a * 3 & 4 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
    return b;
}
