var fs = require("fs");
var plist = require("plist");

var obj = plist.parse(fs.readFileSync(process.argv[2], 'utf8'));
var atlas = { frames: [] };

// 大熊貓圖片格式
if (obj["texture"] && obj["metadata"]) {
    atlas["meta"] = {
        size: {
            w: obj.texture.width,
            h: obj.texture.height,
        }
    };
    for (const key in obj.frames) {
        // console.log(key);
        const frame = obj.frames[key];
        frame.frame = StringObject(frame.frame);
        frame.offset = StringObject(frame.offset);
        frame.sourceSize = StringObject(frame.sourceSize);
        frame.offset[0] = (frame.sourceSize[0] - frame.frame[1][0]) / 2 + frame.offset[0];
        frame.offset[1] = (frame.sourceSize[1] - frame.frame[1][1]) / 2 - frame.offset[1];
        frame.offset = frame.rotated ? [-frame.offset[1], frame.offset[0]] : frame.offset;
        atlas.frames.push({
            filename: key,
            frame: { x: frame.frame[0][0], y: frame.frame[0][1], w: frame.frame[1][0], h: frame.frame[1][1] },
            rotated: frame.rotated,
            trimmed: true,
            spriteSourceSize: { x: frame.offset[0], y: frame.offset[1], w: frame.sourceSize[0], h: frame.sourceSize[1] },
            sourceSize: { w: frame.sourceSize[0], h: frame.sourceSize[1] }
        });
    }
} else if (obj["texture"]) {
    atlas["meta"] = {
        size: {
            w: obj.texture.width,
            h: obj.texture.height,
        }
    };
    for (const key in obj.frames) {
        // console.log(key);
        const frame = obj.frames[key];
        atlas.frames.push({
            filename: key,
            frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
            rotated: false,
            trimmed: true,
            spriteSourceSize: { x: frame.offsetX, y: frame.offsetY, w: frame.width, h: frame.height },
            sourceSize: { w: frame.originalWidth, h: frame.originalHeight }
        });
    }
} else if (obj["metadata"]) {
    atlas["meta"] = { size: StringObject(obj.metadata.size) };
    atlas.meta.size = { w: atlas.meta.size[0], h: atlas.meta.size[1] };
    for (const key in obj.frames) {
        // console.log(key);
        const frame = obj.frames[key];
        frame.spriteColorRect = StringObject(frame.spriteColorRect);
        frame.spriteOffset = StringObject(frame.spriteOffset);
        frame.spriteSize = StringObject(frame.spriteSize);
        frame.spriteSourceSize = StringObject(frame.spriteSourceSize);
        frame.textureRect = StringObject(frame.textureRect);
        atlas.frames.push({
            filename: key,
            frame: { x: frame.textureRect[0][0], y: frame.textureRect[0][1], w: frame.textureRect[1][0], h: frame.textureRect[1][1] },
            rotated: frame.textureRotated, // 沒有針對有rotated的情況修改offset
            trimmed: frame.spriteTrimmed,
            spriteSourceSize: {
                x: (frame.spriteSourceSize[0] - frame.textureRect[1][0]) / 2 + frame.spriteOffset[0],
                y: (frame.spriteSourceSize[1] - frame.textureRect[1][1]) / 2 - frame.spriteOffset[1],
                w: frame.spriteSize[0],
                h: frame.spriteSize[1],
            },
            sourceSize: { w: frame.spriteSourceSize[0], h: frame.spriteSourceSize[1] }
        });
    }
} else {
    console.log("Unknow Plist Format");
}

fs.writeFileSync(process.argv[2].replace(/\.plist$/, ".json"), JSON.stringify(atlas));
// console.log(JSON.stringify(atlas));

function StringObject(str) {
    return str ? JSON.parse(str.replace(/{/g, "[").replace(/}/g, "]")) : undefined;
}
