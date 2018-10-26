// 空白的範例
import AssetLoadTask from "../mahjongh5/load/AssetLoadTask";
/**
 * 產生載入資源的任務
 * @param game 當前的遊戲
 * @param section 如果不指定就是載入所有section，如果是string或string[]就是直接指定要載入的一個或多個section，如果是包含flag的物件就是以flag為filter載入符合條件的section
 */
export function CreateLoadTask(game: Phaser.Game, section?: string | string[] | any, version?: any): AssetLoadTask {
    return AssetLoadTask.CreateLoadTask(game, loadAssets, section, version);
}

export const sectionFlag = {
    preload: Symbol("preload"),
};

// 如果直接把上面的東西都加到這裡面不個別export的話，在別的地方import之後就要打Assets.assets.background這樣多包了一層
export const loadAssets: { [section: string]: any } = {
    // ["loadingBar"]: loadingBar,
};
