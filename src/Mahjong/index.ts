import * as Mahjongh5 from "mahjongh5/Mahjongnh5";
import * as Assets from "./Assets";
import LoadState from "mahjongh5/load/LoadState";
import MahjongGame from "./MahjongGame";
import ImageTileTable from "mahjongh5/component/tile/ImageTileTable";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
import Button from "mahjongh5/ui/Button";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";

export default function WaterMarginStart() {
    const GAME_WIDTH  = 1920;
    const GAME_HEIGHT = 1080;
    let renderer = Phaser.CANVAS;
    if (window.location.href.indexOf("render=AUTO") !== -1) {
        renderer = Phaser.AUTO;
    }
    if (window.location.href.indexOf("render=WEBGL") !== -1) {
        renderer = Phaser.WEBGL;
    }
    if (window.location.href.indexOf("render=CANVAS") !== -1) {
        renderer = Phaser.CANVAS;
    }
    Mahjongh5.StartGame((game) => {
        // game setting
        game.assets    = Assets;
        game.loadState = new LoadState(game);
        const mahjong  = new MahjongGame(game);
        game.gameStates.push(mahjong);
        if (window.location.href.indexOf("lang=TW") !== -1) {
            game.language = "TW";
            console.log("set language to TW");
        }
        if (window.location.href.indexOf("lang=CN") !== -1) {
            game.language = "CN";
            console.log("set language to CN");
        }

        // load state setting
        game.loadState.onCreate.add((load: LoadState) => {
            // 這裡使用的資源必須要是preload的喔
            // load.separateProgress = true;
            const loadBar = game.add.image(game.world.centerX, game.world.centerY, Assets.preload.loadBar.key);
            loadBar.x -= loadBar.width / 2;
            loadBar.anchor.set(0, 0.5);
            const loadText = game.add.text(game.world.centerX, game.world.height * 0.8, "", { font: "24px Arial", fill: "#FFFFFF" });
            loadText.anchor.set(0.5, 0.5);
            const loadProgress = game.add.text(game.world.centerX, game.world.height * 0.9, "", { font: "24px Arial", fill: "#FFFFFF" });
            loadProgress.anchor.set(0.5, 0.5);
            load.SetPreloadSprite(loadBar, 0);
            load.SetMessageText(loadText);
            load.onProgressChanged.add((sender: any, value: number) => loadProgress.text = (value * 100).toFixed(3) + "%");
        });

        mahjong.onCreate.add(() => {
            const bg = game.add.image(0, 0, Assets.background.key, Assets.background);
            bg.scale.set(game.width, game.height);

            const tileTable = new ImageTileTable(game.cache.getJSON(Assets.tiles.tiles_config.key), Assets.tiles.tiles.key);
            const sea  = [];
            const hand = [];
            const door = [];
            const hu   = [];
            for (let i = 0; i < 4; i++) {
                sea.push(new  CommonTileList(game, 0,  tileTable, undefined, 40, 60, i, false, 10));
                hand.push(new CommonTileList(game, 13, tileTable, undefined, 50, 75, i, true,  16));
                door.push(new CommonTileList(game, 0,  tileTable, undefined, 50, 75, i, false, 16));
                hu.push(new   CommonTileList(game, 0,  tileTable, undefined, 50, 75, i, false, 16));

                sea[i].TileAnchor  = new Phaser.Point(0.5, 0.5);
                hand[i].TileAnchor = new Phaser.Point(0.5, 0.5);
                door[i].TileAnchor = new Phaser.Point(0.5, 0.5);
                hu[i].TileAnchor   = new Phaser.Point(0.5, 0.5);

                hand[i].SetImmediate(["B1", "B2", "B3", "C1", "C1", "C1", "D4", "D5", "D7", "D8", "D8", "Red", "Green", "Green", "Green", "White", "B1", "B2", "B3", "C1", "C1", "C1", "D4", "D5", "D7", "D8", "D8", "Red", "Green"]);
                door[i].SetImmediate(["B1", "B2", "B3", "C1", "C1", "C1", "D4", "D5", "D7", "D8", "D8", "Red", "Green", "Green", "Green", "White", "B1", "B2", "B3", "C1", "C1", "C1", "D4", "D5", "D7", "D8", "D8", "Red", "Green"]);
            }
            hand[0].position = new Phaser.Point(550,  980);
            hand[1].position = new Phaser.Point(1770, 80);
            hand[2].position = new Phaser.Point(490,  100);
            hand[3].position = new Phaser.Point(150,  130);

            door[0].position = new Phaser.Point(550,  890);
            door[1].position = new Phaser.Point(1680, 80);
            door[2].position = new Phaser.Point(490,  190);
            door[3].position = new Phaser.Point(240,  130);

            sea[0].position = new Phaser.Point(705,  650);
            sea[1].position = new Phaser.Point(1370, 350);
            sea[2].position = new Phaser.Point(650,  450);
            sea[3].position = new Phaser.Point(550,  200);

            hu[0].position = new Phaser.Point(550,  800);
            hu[1].position = new Phaser.Point(1590, 80);
            hu[2].position = new Phaser.Point(490,  280);
            hu[3].position = new Phaser.Point(330,  130);

            const checkButton = new Button(game, 1350, 980, Assets.button.check.key);
            checkButton.width  = 150;
            checkButton.height = 80;
            checkButton.anchor.set(0.5, 0.5);
            checkButton.visible = false;

            const choseLackDialog = new ChoseLackDialog(game, (dialog: ChoseLackDialog) => {
                dialog.char   = new Button(game, 130,  40, Assets.button.char.key);
                dialog.dot    = new Button(game, 190,  40, Assets.button.dot.key);
                dialog.bamboo = new Button(game, 250,  40, Assets.button.bamboo.key);
                dialog.char.width    = 50;
                dialog.char.height   = 50;
                dialog.char.anchor.set(0.5, 0.5);
                dialog.dot.width     = 50;
                dialog.dot.height    = 50;
                dialog.dot.anchor.set(0.5, 0.5);
                dialog.bamboo.width  = 50;
                dialog.bamboo.height = 50;
                dialog.bamboo.anchor.set(0.5, 0.5);
                dialog.text = game.add.text(10, 40, "定缺:", { font: "32px Arial", fill: "#FFFFFF" });
                dialog.text.anchor.set(0, 0.5);
            });
            choseLackDialog.position = new Phaser.Point(500, 850);
            choseLackDialog.backgroundAlpha = 0;

            const commandDialog = new CommandDialog(game, (dialog: CommandDialog) => {
                dialog.pon  = new Button(game, 60,   50, Assets.button.pon.key);
                dialog.gon  = new Button(game, 150,  50, Assets.button.gon.key);
                dialog.hu   = new Button(game, 240,  50, Assets.button.hu.key);
                dialog.none = new Button(game, 330,  50, Assets.button.none.key);
                dialog.pon.width   = 80;
                dialog.pon.height  = 80;
                dialog.pon.anchor.set(0.5, 0.5);
                dialog.gon.width   = 80;
                dialog.gon.height  = 80;
                dialog.gon.anchor.set(0.5, 0.5);
                dialog.hu.width    = 80;
                dialog.hu.height   = 80;
                dialog.hu.anchor.set(0.5, 0.5);
                dialog.none.width  = 80;
                dialog.none.height = 80;
                dialog.none.anchor.set(0.5, 0.5);
            });
            commandDialog.position = new Phaser.Point(1100, 800);
            commandDialog.backgroundAlpha = 0;

            mahjong.sea  = sea;
            mahjong.door = door;
            mahjong.hand = hand;
            mahjong.hu   = hu;

            mahjong.ui.checkButton = checkButton;

            mahjong.choseLackDialog = choseLackDialog;
            mahjong.commandDialog   = commandDialog;
        });

    }, GAME_WIDTH, GAME_HEIGHT, renderer, "game");
}
