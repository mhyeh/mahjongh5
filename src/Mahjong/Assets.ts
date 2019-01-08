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

export const image = {
    background: { type: "image", key: "backgorund", args: [require("assets/Mahjong/background.png")] },
    arrow: { type: "image", key: "", args: [require("assets/Mahjong/arrow.png")] },
    name_block: { type: "image", key: "", args: [require("assets/Mahjong/name_block.png")] },
    avatar: { type: "image", key: "", args: [require("assets/Mahjong/avatar.png")] },
};

export const tiles = {
    tiles: { type: "atlas", key: "tiles", args: [require("assets/Mahjong/tiles/tiles.png"), require("assets/Mahjong/tiles/tiles.json")] },
    tiles_config: { type: "json", key: "", args: [require("assets/Mahjong/tiles/tiles_config.json")] },
};

export const button = {
    ready: { type: "image", key: "", args: [require("assets/Mahjong/ready.png")] },
    bamboo: { type: "image", key: "bamboo", args: [require("assets/Mahjong/Bamboo.png")] },
    char: { type: "image", key: "char", args: [require("assets/Mahjong/Char.png")] },
    dot: { type: "image", key: "dot", args: [require("assets/Mahjong/Dot.png")] },
    check: { type: "image", key: "", args: [require("assets/Mahjong/Check.png")] },
    pon: { type: "image", key: "", args: [require("assets/Mahjong/Pon.png")] },
    gon: { type: "image", key: "", args: [require("assets/Mahjong/Gon.png")] },
    pongon: { type: "image", key: "", args: [require("assets/Mahjong/PonGon.png")] },
    ongon: { type: "image", key: "", args: [require("assets/Mahjong/OnGon.png")] },
    hu: { type: "image", key: "", args: [require("assets/Mahjong/Hu.png")] },
    none: { type: "image", key: "", args: [require("assets/Mahjong/None.png")] },
};

const atlas = {
    arialBoldNumber: {
        type: "atlas", key: "", args: [require("assets/XSG/Common/ArialBoldNumber.png"), require("assets/XSG/Common/ArialBoldNumber.json")],
    },
    stickybar: {
        type: "atlas", key: "", args: [require("assets/XSG/Common/zh_TW/stickybar/stickybar.png"), require("assets/XSG/Common/zh_TW/stickybar/stickybar.json")],
        system: {
            normal: ["system_top_btn_normal_0001.png", "system_top_btn_normal_0002.png"],
            dividerForRatio: "system_divider_for_ratio.png",
            topIconLaugbe: "system_top_icon_laugbe.png",
            topLaugbeBox: "system_top_laugbe_box.png",
            saveSeat: ["system_top_btn_save_seat_0001.png", "system_top_btn_save_seat_0002.png"],
            setting: ["system_top_btn_setting_0001.png", "system_top_btn_setting_0002.png"],
            windowBottomMainBox: "system_window_bottom_main_box.png",
            windowGrayBox: "system_window_gray_box.png",
            checkBox: ["system_btn_check_cube_0002.png", "system_btn_check_cube_0001.png"],
            setTimesBtn: ["system_window_set_times_btn_0001.png", "system_window_set_times_btn_0002.png"],
            confirm: ["system_btn_confirm_0001.png", "system_btn_confirm_0002.png"],
            cancel: ["system_btn_cancel_0001.png", "system_btn_cancel_0002.png"],
            dividerForWindow: "system_divider_for_window_bottom.png",
            dividerForWindowGray: "system_divider_for_window_gray.png",
            inputWindow: "system_window_input_for_bottom_main.png",
            setTimesTop: "system_window_set_times_top_arrow.png",
            setTimesBox: "system_window_set_times_box.png",
            setTimesPlus: "system_window_set_times_icon_plus.png",
            setTimesMinus: "system_window_set_times_icon_minus.png",
            closeWindow: "system_window_btn_close_window_60x.png",
        },
        option: {
            btnSwitch: ["option_btn_switch_left_0001.png", "option_btn_switch_left_0002.png"],
            windowBtnCenter: ["option_window_btn_white_center_0001.png", "option_window_btn_white_center_0002.png"],
            windowBtnTop: ["option_window_btn_white_top_0001.png", "option_window_btn_white_top_0002.png"],
            iconExitGame: "option_icon_exit_game.png",
            iconHelp: "option_icon_help.png",
            iconHold: "option_icon_hold.png",
            iconItems: "option_icon_items.png",
            iconMachineChip: "option_icon_machine_chip.png",
            iconMachineInfo: "option_icon_machine_info.png",
            iconPlatinum: "option_icon_platinum.png",
            iconRevolutions: "option_icon_revolutions.png",
            iconSound: "option_icon_sound.png",
        },
        number: {
            frameGifts: "frame_gifts_number.png",
            optionRpm: "option_rpm_number.png",
        },
        alert: "alert.png",
        black: "black.png",
    },
};

export const font = {
    yahei52: { type: "bitmapFont", key: "", args: [require("assets/XSG/Common/zh_TW/yahei52_0.png"), require("assets/XSG/Common/zh_TW/yahei52.fnt")] },
    yaheiBold52: { type: "bitmapFont", key: "", args: [require("assets/XSG/Common/zh_TW/yaheiBold52_0.png"), require("assets/XSG/Common/zh_TW/yaheiBold52.fnt")] },
    arialBoldNumber: atlas.arialBoldNumber,
    arialBoldNumber20: { type: "atlasBitmapFont", key: "arialBoldNumber20", args: [require("assets/XSG/Common/ArialBoldNumber20.xml"), atlas.arialBoldNumber, "ArialBoldNumber20.png"] },
    arialBoldNumber24: { type: "atlasBitmapFont", key: "arialBoldNumber24", args: [require("assets/XSG/Common/ArialBoldNumber24.xml"), atlas.arialBoldNumber, "ArialBoldNumber24.png"] },
    arialBoldNumber28: { type: "atlasBitmapFont", key: "arialBoldNumber28", args: [require("assets/XSG/Common/ArialBoldNumber28.xml"), atlas.arialBoldNumber, "ArialBoldNumber28.png"] },
    arialBoldNumber32: { type: "atlasBitmapFont", key: "arialBoldNumber32", args: [require("assets/XSG/Common/ArialBoldNumber32.xml"), atlas.arialBoldNumber, "ArialBoldNumber32.png"] },
    arialBoldNumber36: { type: "atlasBitmapFont", key: "arialBoldNumber36", args: [require("assets/XSG/Common/ArialBoldNumber36.xml"), atlas.arialBoldNumber, "ArialBoldNumber36.png"] },
    arialBoldNumber40: { type: "atlasBitmapFont", key: "arialBoldNumber40", args: [require("assets/XSG/Common/ArialBoldNumber40.xml"), atlas.stickybar, "ArialBoldNumber40.png"] },
    arialBoldNumber44: { type: "atlasBitmapFont", key: "arialBoldNumber44", args: [require("assets/XSG/Common/ArialBoldNumber44.xml"), atlas.stickybar, "ArialBoldNumber44.png"] },
    arialBoldNumber48: { type: "atlasBitmapFont", key: "arialBoldNumber48", args: [require("assets/XSG/Common/ArialBoldNumber48.xml"), atlas.stickybar, "ArialBoldNumber48.png"] },
    arialBoldNumber52: { type: "atlasBitmapFont", key: "arialBoldNumber52", args: [require("assets/XSG/Common/ArialBoldNumber52.xml"), atlas.stickybar, "ArialBoldNumber52.png"] },
};

// 如果直接把上面的東西都加到這裡面不個別export的話，在別的地方import之後就要打Assets.assets.background這樣多包了一層
export const loadAssets: { [section: string]: any } = {
    ["preLoad"]: preload,
    image,
    tiles,
    button,
    font,
};
