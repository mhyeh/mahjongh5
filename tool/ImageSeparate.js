var fs = require("fs");
var jimp = require("jimp");
var xml2js = require("xml2js");
var plist = require("plist");

var parser = new xml2js.Parser();
var texturePath = process.argv[2];
var dataPath = process.argv[3];

if (/\.png$/.test(texturePath)) {
    jimp.read(texturePath).then((texture) => {
        if (/\.xml$/.test(dataPath)) {
            fs.readFile(dataPath, (error, data) => {
                parser.parseString(data, (error, result) => {
                    for (const subtexture of result.TextureAtlas.SubTexture) {
                        console.log(subtexture["$"].name, Number(subtexture["$"].x), Number(subtexture["$"].y), Number(subtexture["$"].width), Number(subtexture["$"].height));
                        try {
                            if (!/\.png$/.test(subtexture["$"].name)) {
                                subtexture["$"].name += ".png";
                            }
                            texture.clone().crop(Number(subtexture["$"].x), Number(subtexture["$"].y), Number(subtexture["$"].width), Number(subtexture["$"].height)).write(subtexture["$"].name);
                        } catch (error) {
                            console.error("crop fail", error);
                        }
                    }
                })
            });
        } else if (/\.json$/.test(dataPath)) {
            fs.readFile(dataPath, (error, data) => {
                data = JSON.parse(data);
                for (const subtexture of data.SubTexture) {
                    console.log(subtexture.name, Number(subtexture.x), Number(subtexture.y), Number(subtexture.width), Number(subtexture.height));
                    try {
                        if (!/\.png$/.test(subtexture.name)) {
                            subtexture.name += ".png";
                        }
                        texture.clone().crop(Number(subtexture.x), Number(subtexture.y), Number(subtexture.width), Number(subtexture.height)).write(subtexture.name);
                    } catch (error) {
                        console.error("crop fail", error);
                    }
                }
            });
        } else if (/\.plist$/.test(dataPath)) {
            fs.readFile(dataPath, "utf8", (error, data) => {
                data = plist.parse(data);
                if (data["texture"] && data["metadata"]) {
                    for (const key in data.frames) {
                        console.log(key);
                        const frame = data.frames[key];
                        frame.frame = StringObject(frame.frame);
                        frame.offset = StringObject(frame.offset);
                        frame.sourceSize = StringObject(frame.sourceSize);
                        frame.offset[0] = (frame.sourceSize[0] - frame.frame[1][0]) / 2 + frame.offset[0];
                        frame.offset[1] = (frame.sourceSize[1] - frame.frame[1][1]) / 2 - frame.offset[1];
                        frame.sourceSize[0] = frame.frame[1][0];
                        frame.sourceSize[1] = frame.frame[1][1];
                        if (frame.rotated) frame.frame[1].reverse();
                        (new jimp(frame.sourceSize[0], frame.sourceSize[1]))
                            .composite(texture.clone().crop(frame.frame[0][0], frame.frame[0][1], frame.frame[1][0], frame.frame[1][1])
                                .rotate(frame.rotated ? -90 : 0), 0, 0)
                            .write(key);
                        // (new jimp(frame.sourceSize[0], frame.sourceSize[1]))
                        //     .composite(texture.clone().crop(frame.frame[0][0], frame.frame[0][1], frame.frame[1][0], frame.frame[1][1])
                        //         .rotate(frame.rotated ? -90 : 0), frame.offset[0], frame.offset[1])
                        //     .write(key);
                    }
                } else if (data["texture"]) {
                    for (const key in data.frames) {
                        console.log(key);
                        const frame = data.frames[key];
                        (new jimp(frame.originalWidth, frame.originalHeight))
                            .composite(texture.clone().crop(frame.x, frame.y, frame.width, frame.height), frame.offsetX, frame.offsetY)
                            .write(key);
                    }
                } else if (data["metadata"]) {
                    for (const key in data.frames) {
                        console.log(key);
                        const frame = data.frames[key];
                        // frame.spriteColorRect = StringObject(frame.spriteColorRect);
                        frame.spriteOffset = StringObject(frame.spriteOffset);
                        frame.spriteSize = StringObject(frame.spriteSize);
                        frame.spriteSourceSize = StringObject(frame.spriteSourceSize);
                        frame.textureRect = StringObject(frame.textureRect);
                        (new jimp(frame.spriteSourceSize[0], frame.spriteSourceSize[1]))
                            .composite(texture.clone().crop(frame.textureRect[0][0], frame.textureRect[0][1], frame.textureRect[1][0], frame.textureRect[1][1]),
                                (frame.spriteSourceSize[0] - frame.textureRect[1][0]) / 2 + frame.spriteOffset[0],
                                (frame.spriteSourceSize[1] - frame.textureRect[1][1]) / 2 - frame.spriteOffset[1])
                            .write(key);
                    }
                } else {
                    console.log("Unknow Plist Format: ", dataPath);
                }
            });
        } else {
            console.log("Error Data Path: ", dataPath);
        }
    });
} else {
    console.log("Error Texture Path: ", texturePath);
}

function StringObject(str) {
    return str ? JSON.parse(str.replace(/{/g, "[").replace(/}/g, "]")) : undefined;
}
