import * as Mahjongh5 from "mahjongh5/Mahjongnh5";
import * as Assets from "./Assets";
import LoadState from "mahjongh5/load/LoadState";
import MahjongGame from "./MahjongGame";
import ImageTileTable from "mahjongh5/component/tile/ImageTileTable";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
import Button from "mahjongh5/ui/Button";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";
import NumberFormatter from "mahjongh5/ui/NumberFormatter";
import ChangeCardEffect from "./effect/ChangeCardEffect";
import Timer from "mahjongh5/component/Timer";
import JoinState from "./JoinState";
import * as io from "socket.io-client";

export default function MahjingStart() {
    const GAME_WIDTH  = 2000;
    const GAME_HEIGHT = 1500;
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

    const socket = io.connect("http://140.118.127.157:3000");
    Mahjongh5.StartGame((game) => {
        // game setting
        game.assets     = Assets;
        game.loadState  = new LoadState(game);
        const joinState = new JoinState(game);
        const mahjong   = new MahjongGame(game);
        game.gameStates.push(joinState);
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

        joinState.onCreate.add(() => {
            const title = game.add.text(game.width / 2, 300, "配對成功", { font: "200px Arial", fill: "#FFFFFF" });
            title.anchor.set(0.5);

            const nameBlock = [];
            const idLabel   = [];
            const name      = [];
            for (let i = 0; i < 4; i++) {
                nameBlock.push(game.add.image(400 * (i + 1), game.height / 2, Assets.image.name_block.key));
                nameBlock[i].anchor.set(0.5);
                nameBlock[i].width  = 300;
                nameBlock[i].height = 300;

                idLabel.push(game.add.text(nameBlock[i].x, nameBlock[i].y - 60, "ID", { font: "50px Arial" }));
                idLabel[i].anchor.set(0.5);
                name.push(game.add.text(nameBlock[i].x, nameBlock[i].y + 20, "", { font: "32px Arial" }));
                name[i].anchor.set(0.5);
            }

            const ready = new Button(game, game.width / 2, 1200, Assets.button.ready.key);
            ready.anchor.set(0.5);
            ready.stateTint.down = 0x808080;
            ready.stateTint.up   = 0xFFFFFF;

            joinState.socket = socket;

            joinState.ui.readyButton = ready;

            joinState.name      = name;
            joinState.nameBlock = nameBlock;

            joinState.mahjongGame = mahjong;
        });

        mahjong.onCreate.add(() => {
            const bg = game.add.image(0, 0, Assets.image.background.key);
            bg.scale.set(game.width, game.height);

            const tileTable = new ImageTileTable(game.cache.getJSON(Assets.tiles.tiles_config.key), Assets.tiles.tiles.key);
            const sea   = [];
            const hand  = [];
            const door  = [];
            const hu    = [];
            const arrow = [];
            const lack  = [];
            const name  = [];
            for (let i = 0; i < 4; i++) {
                hand.push(new CommonTileList(game, 13, tileTable, undefined, 50, 75, i, i === 0, 16));
                door.push(new CommonTileList(game, 0,  tileTable, undefined, 50, 75, i, false,   16));
                hu.push(new   CommonTileList(game, 0,  tileTable, undefined, 50, 75, i, false,   16, false));
                sea.push(new  CommonTileList(game, 0,  tileTable, undefined, 40, 60, i, false,   13, false));

                hand[i].TileAnchor = new Phaser.Point(0.5, 0.5);
                door[i].TileAnchor = new Phaser.Point(0.5, 0.5);
                hu[i].TileAnchor   = new Phaser.Point(0.5, 0.5);
                sea[i].TileAnchor  = new Phaser.Point(0.5, 0.5);

                arrow.push(game.add.image(0, 0, Assets.image.arrow.key));
                arrow[i].anchor = new Phaser.Point(0.5, 0.5);
                arrow[i].angle  = 180 - i * 90;
                arrow[i].width  = 80;
                arrow[i].height = 30;
                arrow[i].tint   = 0x808080;

                lack.push(game.add.image(0, 0, Assets.button.char.key));
                lack[i].anchor = new Phaser.Point(0.5, 0.5);
                lack[i].width  = 50;
                lack[i].height = 50;
                lack[i].visible = false;

                name.push(game.add.text(0, 0, "ID:   ", { font: "32px Arial", fill: "#FFFFFF" }));
            }

            hand[0].position = new Phaser.Point(700, 1400);
            door[0].position = new Phaser.Point(700, 1260);
            hu[0].position   = new Phaser.Point(700, 1170);
            sea[0].position  = new Phaser.Point(730, 950);
            lack[0].position = new Phaser.Point(550, 1350);
            name[0].position = new Phaser.Point(450, 1390);

            hand[1].position = new Phaser.Point(1850, 100);
            door[1].position = new Phaser.Point(1710, 100);
            hu[1].position   = new Phaser.Point(1620, 100);
            sea[1].position  = new Phaser.Point(1400, 400);
            lack[1].position = new Phaser.Point(1650, 1080);
            name[1].position = new Phaser.Point(1700, 1040);

            hand[2].position = new Phaser.Point(490,  100);
            door[2].position = new Phaser.Point(490,  240);
            hu[2].position   = new Phaser.Point(490,  330);
            sea[2].position  = new Phaser.Point(685,  550);
            lack[2].position = new Phaser.Point(1500, 60);
            name[2].position = new Phaser.Point(1550, 80);

            hand[3].position = new Phaser.Point(150, 400);
            door[3].position = new Phaser.Point(290, 400);
            hu[3].position   = new Phaser.Point(380, 400);
            sea[3].position  = new Phaser.Point(600, 430);
            lack[3].position = new Phaser.Point(90,  250);
            name[3].position = new Phaser.Point(120, 290);

            arrow[0].position = new Phaser.Point(game.width / 2, game.height / 2 + 70);
            arrow[1].position = new Phaser.Point(game.width / 2 + 90, game.height / 2);
            arrow[2].position = new Phaser.Point(game.width / 2, game.height / 2 - 70);
            arrow[3].position = new Phaser.Point(game.width / 2 - 90, game.height / 2);

            const timer = new Timer(new NumberFormatter(game.add.text(game.width / 2, game.height / 2, "0", { font: "100px Arial", fill: "#FFFFFF" })), undefined, 0x808080);
            timer.Text.anchor.set(0.5);

            const checkButton = new Button(game, 1500, 1400, Assets.button.check.key);
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
                dialog.char.stateTint.down = 0x707070;
                dialog.dot.width     = 50;
                dialog.dot.height    = 50;
                dialog.dot.anchor.set(0.5, 0.5);
                dialog.dot.stateTint.down = 0x707070;
                dialog.bamboo.width  = 50;
                dialog.bamboo.height = 50;
                dialog.bamboo.anchor.set(0.5, 0.5);
                dialog.bamboo.stateTint.down = 0x707070;
                dialog.text = game.add.text(10, 40, "定缺:", { font: "32px Arial", fill: "#FFFFFF" });
                dialog.text.anchor.set(0, 0.5);
            });
            choseLackDialog.position = new Phaser.Point(300, 1250);
            choseLackDialog.backgroundAlpha = 0;

            const commandDialog = new CommandDialog(game, (dialog: CommandDialog) => {
                dialog.pon  = new Button(game, 60,   50, Assets.button.pon.key);
                dialog.gon  = new Button(game, 140,  50, Assets.button.gon.key);
                dialog.hu   = new Button(game, 220,  50, Assets.button.hu.key);
                dialog.none = new Button(game, 480,  50, Assets.button.none.key);
                dialog.pon.width   = 80;
                dialog.pon.height  = 80;
                dialog.pon.anchor.set(0.5, 0.5);
                dialog.pon.stateTint.down    = 0x707070;
                dialog.pon.stateTint.disable = 0x707070;
                dialog.gon.width   = 80;
                dialog.gon.height  = 80;
                dialog.gon.anchor.set(0.5, 0.5);
                dialog.gon.stateTint.down    = 0x707070;
                dialog.gon.stateTint.disable = 0x707070;
                dialog.hu.width    = 80;
                dialog.hu.height   = 80;
                dialog.hu.anchor.set(0.5, 0.5);
                dialog.hu.stateTint.down    = 0x707070;
                dialog.hu.stateTint.disable = 0x707070;
                dialog.none.width  = 80;
                dialog.none.height = 80;
                dialog.none.anchor.set(0.5, 0.5);
                dialog.pon.stateTint.down    = 0x707070;

                dialog.pongon  = new Button(game, 300, 50, Assets.button.pongon.key);
                dialog.ongon   = new Button(game, 380, 50, Assets.button.ongon.key);
                dialog.pongon.width  = 80;
                dialog.pongon.height = 80;
                dialog.pongon.anchor.set(0.5, 0.5);
                dialog.pongon.stateTint.down = 0x707070;
                dialog.ongon.width   = 80;
                dialog.ongon.height  = 80;
                dialog.ongon.anchor.set(0.5, 0.5);
                dialog.ongon.stateTint.down = 0x707070;
            });
            commandDialog.position = new Phaser.Point(1400, 1310);
            commandDialog.backgroundAlpha = 0;

            mahjong.socket = socket;

            mahjong.sea  = sea;
            mahjong.door = door;
            mahjong.hand = hand;
            mahjong.hu   = hu;

            mahjong.lack = lack;
            mahjong.name = name;

            mahjong.timer = timer;
            mahjong.arrow = arrow;

            mahjong.effect.changeCardEffect = new ChangeCardEffect(game, tileTable);

            mahjong.ui.checkButton = checkButton;

            mahjong.choseLackDialog = choseLackDialog;
            mahjong.commandDialog   = commandDialog;
        });

    }, GAME_WIDTH, GAME_HEIGHT, renderer, "game");
}
