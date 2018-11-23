// 未來希望能用工具產生，現在先手動修改
import AssetLoadTask from "mahjongh5/load/AssetLoadTask";
import * as DefaultAssets from "mahjongh5/Assets";
/**
 * 產生載入資源的任務
 * @param game 當前的遊戲
 * @param section 如果不指定就是載入所有section，如果是string或string[]就是直接指定要載入的一個或多個section，如果是包含flag的物件就是以flag為filter載入符合條件的section
 */
export function CreateLoadTask(game: Phaser.Game, section?: string | string[] | any, version?: any): AssetLoadTask {
    return AssetLoadTask.CreateLoadTask(game, loadAssets, section, version);
}

export const sectionFlag = {
    preload: DefaultAssets.sectionFlag.preload,
};

export const preload = {
    [sectionFlag.preload]: true,
    loadBar: { type: "image", key: "picturep", args: [require("assets/XSG/xsg.png")] },
};

export const background = { type: "image", key: "backgorund", args: [require("assets/Mahjong/background.png")] };

export const tiles = {
    tiles: { type: "atlas", key: "tiles", args: [require("assets/Mahjong/tiles/tiles.png"), require("assets/Mahjong/tiles/tiles.json")] },
    tiles_config: { type: "json", key: "", args: [require("assets/Mahjong/tiles/tiles_config.json")] },
};

export const button = {
    bamboo: { type: "image", key: "", args: [require("assets/Mahjong/Bamboo.png")] },
    char: { type: "image", key: "", args: [require("assets/Mahjong/Char.png")] },
    dot: { type: "image", key: "", args: [require("assets/Mahjong/Dot.png")] },
    check: { type: "image", key: "", args: [require("assets/Mahjong/Check.png")] },
    pon: { type: "image", key: "", args: [require("assets/Mahjong/Pon.png")] },
    gon: { type: "image", key: "", args: [require("assets/Mahjong/Gon.png")] },
    pongon: { type: "image", key: "", args: [require("assets/Mahjong/PonGon.png")] },
    ongon: { type: "image", key: "", args: [require("assets/Mahjong/OnGon.png")] },
    hu: { type: "image", key: "", args: [require("assets/Mahjong/Hu.png")] },
    none: { type: "image", key: "", args: [require("assets/Mahjong/None.png")] },
};

// 如果直接把上面的東西都加到這裡面不個別export的話，在別的地方import之後就要打Assets.assets.background這樣多包了一層
export const loadAssets: { [section: string]: any } = {
    ["preLoad"]: preload,
    background,
    tiles,
    button,
};
