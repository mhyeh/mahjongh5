# 水滸英雄

## 開發環境配置

手動安裝

- 編輯器：[Visual Studio Code](https://code.visualstudio.com)
- 執行環境：[NodeJS](https://nodejs.org/en/download/)、npm(包含在NodeJS中)
- 樣式檢查：[TSLint for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)

自動安裝

- 程式語言：TypeScript
- 建置：webpack
- 轉譯：babel

## 建置方法

第一次建置前需要先安裝NodeJS Dependencies，dependencies不是安裝到系統中而是安裝到專案資料夾底下的`node_modules`資料夾

1. 在專案目錄下開啟終端機
1. 在終端機中輸入`npm install`開始安裝dependencies
1. 在終端機中輸入`npm run build`開始建置

- 建置後資料會在`dist`資料夾
- 如要輸出將程式碼與圖片壓縮的版本請改成執行`npm run build-min`
- 如要執行測試用伺服器請執行`npm run server`

## 目錄架構說明

- `assets`           : 遊戲素材
  - `WaterMarginAPP` : 水滸英雄專屬遊戲素材
  - `XSG`            : 共用遊戲素材
    - `Common`       : 共用遊戲介面素材
    - `GoldMiner`    : 金礦彩金素材
  - `test`           : 測試用素材
- `src`              : 遊戲原始碼
  - `WaterMarginAPP` : 水滸英雄專屬原始碼
  - `mahjongh5`         : 遊戲底層共同框架原始碼
  - `XSG`            : 遊戲共同原始碼
  - `DragonBones`    : DragonBones 動畫所需額外程式碼
  - `PhaserSpine`    : Spine 動畫所需額外程式碼
  - `CocosParticle`  : Cocos2D Particle 所需額外程式碼
- `test`             : 遊戲框架功能測試程式碼
- `tool`             : 素材處理小工具
- `.vscode`          : Visual Studio Code 專案設定資料夾
- `node_modules`     : NodeJS 套件資料夾，由 npm 自動產生

## Server 連線流程

遊戲初始化流程

  1. 取得遊戲資料
  2. 取得玩家資料
  3. 建立房間
  4. 連接彩金資料

Normal Game 流程

  5. 取得盤面資料
  6. 傳送spin參數
  7. 取得盤面資料，如中Free Game則到步驟9
  8. 取分，回步驟6

Free Game 流程

  9. 取得盤面資料
  10. 傳送spin參數
  11. 取得盤面資料
  12. 如還有下一局就回步驟10
  13. 遊戲結束，回步驟8

## 其他資訊

* 遊戲底層共同框架(`src/mahjongh5`)與原版相同，更新時可直接取代