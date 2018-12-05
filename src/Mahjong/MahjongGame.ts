import State from "mahjongh5/State";
import Game from "mahjongh5/Game";
import Input from "mahjongh5/input/Input";
import UIController from "./UIController";
import CommandTileList from "mahjongh5/component/tile/CommonTileList";
import * as System from "mahjongh5/System";
import * as io from "socket.io-client";
import { COMMAND_TYPE } from "./data/typeSM/MahjongArgs";
import ButtonKey from "mahjongh5/input/ButtonKey";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";
import NumberFormatter from "mahjongh5/ui/NumberFormatter";
import EffectController from "./EffectController";
import Timer from "mahjongh5/component/Timer";

export default class MahjongGame extends State {
    public loadMessage = "Loading Scene";

    public game: Game;

    public sea:  CommandTileList[];
    public door: CommandTileList[];
    public hand: CommandTileList[];
    public hu:   CommandTileList[];

    public choseLackDialog: ChoseLackDialog;
    public commandDialog:   CommandDialog;

    public lack:       Phaser.Image[];
    public name:       Phaser.Text[];
    public scoreText:  Phaser.Text[];
    public remainCard: Phaser.Text;

    public timer: Timer;
    public arrow: Phaser.Image[];

    public socket: SocketIOClient.Socket;

    private uiController:  UIController;

    private id: number;

    private effectController: EffectController;

    private score: number[] = [0, 0, 0, 0];

    public get effect(): EffectController {
        if (!this.effectController) {
            this.effectController = new EffectController();
        }
        return this.effectController;
    }

    public get ui(): UIController {
        if (!this.uiController) {
            this.uiController = new UIController();
        }
        return this.uiController;
    }

    /**
     * 載入及初始化場景
     * 正常此function只會在loading時被呼叫一次
     * 而且這裡不是產生場景UI物件，所以不能在這建立Phaser的UI物件
     * @param progressCallback 回傳載入進度的callback function
     * @returns 此任務的Promise
     */
    public async LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        // 連線取得現在盤面資料
        if (progressCallback) {
            progressCallback(0.8);
        }
    }

    public init() {
        super.init();
    }

    public async create() {
        super.create();
        this.ui.Input.AddButton(this.choseLackDialog.char,   Input.key.lack, undefined, 0);
        this.ui.Input.AddButton(this.choseLackDialog.dot,    Input.key.lack, undefined, 1);
        this.ui.Input.AddButton(this.choseLackDialog.bamboo, Input.key.lack, undefined, 2);

        this.ui.Input.AddButton(this.ui.checkButton, Input.key.enter, undefined);

        this.ui.Input.AddButton(this.commandDialog.pon,  Input.key.command, undefined, Input.key.Pon);
        this.ui.Input.AddButton(this.commandDialog.gon,  Input.key.command, undefined, Input.key.Gon);
        this.ui.Input.AddButton(this.commandDialog.hu,   Input.key.command, undefined, Input.key.Hu);
        this.ui.Input.AddButton(this.commandDialog.none, Input.key.command, undefined, Input.key.None);

        this.ui.Input.AddButton(this.commandDialog.pongon, Input.key.Gon, undefined, COMMAND_TYPE.COMMAND_PONGON);
        this.ui.Input.AddButton(this.commandDialog.ongon,  Input.key.Gon, undefined, COMMAND_TYPE.COMMAND_ONGON);

        this.ui.Refresh();

        this.id = Number(localStorage.getItem("ID"));

        const playerList = JSON.parse(localStorage.getItem("players"));
        for (let i = 0; i < 4; i++) {
            this.name[this.getID(i)].text += playerList[this.getID(i)];
            this.scoreText[i].text = "score:   " + this.score[i];
        }

        this.socket.on("remainCard", (num: number) => { this.remainCard.text = "剩餘張數: " + num; });

        this.socket.on("dealCard", (hand: string[]) => this.hand[0].SetImmediate(hand));

        this.socket.on("change", (defaultCard: string[], time: number) => this.ChangeCard(defaultCard, time));
        this.socket.on("broadcastChange", (id: number) => this.BroadcastChange(id));
        this.socket.on("afterChange", (card: string[], turn: number) => this.AfterChange(card, turn));

        this.socket.on("lack", (color: number, time: number) => this.ChooseLack(color, time));
        this.socket.on("afterLack", (data: number[]) => this.AfterLack(data));

        this.socket.on("draw", (card: string) => this.hand[0].AddTile(card));
        this.socket.on("broadcastDraw", (id: number) => this.BroadcastDraw(id));

        this.socket.on("throw", async (card: string, time: number) => this.Throw(card, time));
        this.socket.on("broadcastThrow", (id: number, card: string) => this.BroadcastThrow(id, card));

        this.socket.on("command", async (cardMap: string, command: COMMAND_TYPE, time: number) => this.Command(cardMap, command, time));
        this.socket.on("success", (from: number, command: number, card: string, score: number) => this.Success(from, command, card, score));
        this.socket.on("broadcastCommand", (from: number, to: number, command: number, card: string, score: number) => this.BroadcastSuccess(from, to, command, card, score));

        this.socket.on("end", (data: Array<{hand: string, score: number}>) => this.End(data));
    }

    private getID(id: number) {
        return (4 + id - this.id) % 4;
    }

    private async ChangeCard(defaultCard: string[], time: number) {
        this.hand[0].EnableAll();

        const defaultChange = System.DelayValue(time, defaultCard);
        this.ui.checkButton.visible = true;

        this.timer.timeStart(time);
        const changedCard = await Promise.race([this.ChoseLackCard(), defaultChange]);
        this.timer.timeStop();

        this.ui.checkButton.visible = false;
        for (let i = 0; i < 3; i++) {
            this.hand[0].RemoveTile(changedCard[i]);
        }
        this.socket.emit("changeCard", changedCard);
        this.hand[0].DisableAll();
    }

    private async ChoseLackCard(): Promise<string[]> {
        const count: {[key: string]: number} = { b: 0, c: 0, d: 0 };
        for (const tile of this.hand[0].tiles) {
            count[tile.color]++;
        }
        for (const tile of this.hand[0].tiles) {
            if (count[tile.color] < 3) {
                tile.enable = false;
            }
        }
        const changeCard: string[] = [];
        while (1) {
            let index = 0;
            if (changeCard.length === 3) {
                for (const tile of this.hand[0].tiles) {
                    if (!tile.isClick) {
                        tile.enable = false;
                    }
                }
                this.ui.checkButton.enable = true;
                index = await Promise.race([this.hand[0].getClickCardIndex(), this.ui.Input.WaitKeyUp(Input.key.enter)]);
            } else {
                this.ui.checkButton.enable = false;
                index = await this.hand[0].getClickCardIndex();
            }
            if (index === Input.key.enter) {
                return changeCard;
            }
            if (this.hand[0].tiles[index].isClick) {
                const removeIndex = changeCard.findIndex((value) => value === this.hand[0].tiles[index].ID);
                changeCard.splice(removeIndex, 1);
                this.hand[0].tiles[index].isClick = false;
                this.hand[0].tiles[index].position.y += 10;
                if (changeCard.length === 0) {
                    for (const tile of this.hand[0].tiles) {
                        if (count[tile.color] >= 3) {
                            tile.enable = true;
                        }
                    }
                } else {
                    for (const tile of this.hand[0].tiles) {
                        if (tile.color === this.hand[0].tiles[index].color) {
                            tile.enable = true;
                        }
                    }
                }
            } else {
                changeCard.push(this.hand[0].tiles[index].ID);
                this.hand[0].tiles[index].isClick = true;
                this.hand[0].tiles[index].position.y -= 10;
                for (const tile of this.hand[0].tiles) {
                    if (tile.color !== this.hand[0].tiles[index].color) {
                        tile.enable = false;
                    }
                }
            }
        }
    }

    private BroadcastChange(id: number) {
        this.effect.changeCardEffect.Play(0, this.getID(id));
        if (this.getID(id) !== 0) {
            this.hand[this.getID(id)].RemoveTile("None");
            this.hand[this.getID(id)].RemoveTile("None");
            this.hand[this.getID(id)].RemoveTile("None");
        }
    }

    private async AfterChange(card: string[], turn: number) {
        await System.Delay(1500);
        this.effect.changeCardEffect.Play(1, turn);
        await System.Delay(2000);
        for (let i = 0; i < 3; i++) {
            this.hand[0].AddTile(card[i]);
        }
        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.hand[i].AddTile("None");
            }
        }
        this.hand[0].DisableAll();
    }

    private async ChooseLack(color: number, time: number) {
        this.choseLackDialog.Show();
        const defaultColor = System.DelayValue(time, color);

        this.timer.timeStart(time);
        const lackColor = await Promise.race([this.ui.Input.WaitKeyUp(Input.key.lack), defaultColor]);
        this.timer.timeStop();

        this.choseLackDialog.Hide();
        this.socket.emit("chooseLack", lackColor);
    }

    private AfterLack(data: number[]) {
        const mapping = ["char", "dot", "bamboo"];
        for (let i = 0; i < 4; i++) {
            this.lack[this.getID(i)].loadTexture(mapping[data[i]]);
            this.lack[i].visible = true;
        }
    }

    private BroadcastDraw(id: number) {
        for (let i = 0; i < 4; i++) {
            if (this.getID(id) === i) {
                this.arrow[i].tint = 0xFFFFFF;
            } else {
                this.arrow[i].tint = 0x808080;
            }
        }
        if (this.getID(id) !== 0) {
            this.hand[this.getID(id)].AddTile("None");
        }
    }

    private async Throw(card: string, time: number) {
        this.hand[0].EnableAll();
        const defaultCard = System.DelayValue(time, card);

        this.timer.timeStart(time);
        const throwCard = await Promise.race([this.hand[0].getClickCardID(), defaultCard]);
        this.timer.timeStop();

        this.socket.emit("throwCard", throwCard);
        this.hand[0].DisableAll();
    }

    private BroadcastThrow(id: number, card: string) {
        if (this.getID(id) === 0) {
            this.hand[this.getID(id)].RemoveTile(card);
            this.hand[0].DisableAll();
        } else {
            this.hand[this.getID(id)].RemoveTile("None");
        }
        this.sea[this.getID(id)].AddTile(card);
    }

    private async Command(cardMap: string, command: COMMAND_TYPE, time: number) {
        const json = JSON.parse(cardMap);
        const map: Map<COMMAND_TYPE, string[]> = new Map<COMMAND_TYPE, string[]>();
        for (const row of json) {
            map.set(row.Key, row.Value);
        }

        this.commandDialog.Show();
        if (command & Input.key.Hu) {
            this.commandDialog.hu.enable  = true;
        }
        if (command & Input.key.Pon) {
            this.commandDialog.pon.enable = true;
        }
        if (command & Input.key.Gon) {
            this.commandDialog.gon.enable = true;
        }

        for (const [key, value] of map) {
            for (const id of value) {
                this.hand[0].Enable(id);
            }
        }

        const defaultCommand = System.DelayValue(time, { cmd: COMMAND_TYPE.NONE, card: "" });

        this.timer.timeStart(time);
        const result = await Promise.race([this.ChooseCommand(map, command), defaultCommand]);
        this.timer.timeStop();

        this.hand[0].DisableAll();
        this.socket.emit("sendCommand", result.cmd, result.card);
        this.commandDialog.Hide();
    }

    private async ChooseCommand(cards: Map<COMMAND_TYPE, string[]>, commands: COMMAND_TYPE): Promise<{cmd: COMMAND_TYPE, card: string}> {
        const action = await this.ui.Input.WaitKeyUp(Input.key.command);
        let resultCard = "";
        let resultCommand = COMMAND_TYPE.NONE;
        if (action === ButtonKey.Hu) {
            if (commands & COMMAND_TYPE.COMMAND_HU) {
                resultCommand = COMMAND_TYPE.COMMAND_HU;
            } else {
                resultCommand = COMMAND_TYPE.COMMAND_ZIMO;
            }
            resultCard = cards.get(resultCommand)[0];
        } else if (action === ButtonKey.Pon) {
            resultCommand = COMMAND_TYPE.COMMAND_PON;
            resultCard    = cards.get(resultCommand)[0];
        } else {
            const isOnGon  = Boolean(commands & COMMAND_TYPE.COMMAND_ONGON);
            const isPonGon = Boolean(commands & COMMAND_TYPE.COMMAND_PONGON);

            if (isOnGon && isPonGon) {
                this.commandDialog.pongon.visible = true;
                this.commandDialog.ongon.visible  = true;

                this.hand[0].DisableAll();
                for (const [key, value] of cards) {
                    if (key === COMMAND_TYPE.COMMAND_ONGON || key === COMMAND_TYPE.COMMAND_PONGON) {
                        for (const id of value) {
                            this.hand[0].Enable(id);
                        }
                    }
                }

                resultCommand = await this.ui.Input.WaitKeyUp(Input.key.Gon);
            } else {
                if (!isOnGon && !isPonGon) {
                    resultCommand = COMMAND_TYPE.COMMAND_GON;
                } else if (isOnGon && !isPonGon) {
                    resultCommand = COMMAND_TYPE.COMMAND_ONGON;
                } else {
                    resultCommand = COMMAND_TYPE.COMMAND_PONGON;
                }
            }

            if (cards.get(resultCommand).length > 1) {
                resultCard = await this.hand[0].getClickCardID();
            } else {
                resultCard = cards.get(resultCommand)[0];
            }
        }

        return {cmd: resultCommand, card: resultCard};
    }

    private Success(from: number, command: number, card: string, score: number) {
        console.log("success", from, command, card, score);
        if (command & COMMAND_TYPE.COMMAND_HU) {
            this.HU(0, this.getID(from), card, score);
        } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
            this.ZEMO(0, card, score);
        } else if (command & COMMAND_TYPE.COMMAND_GON) {
            this.GON(0, this.getID(from), card, score);
        } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
            this.ONGON(0, card, score);
        } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
            this.PONGON(0, card, score);
        } else if (command & COMMAND_TYPE.COMMAND_PON) {
            this.PON(0, this.getID(from), card);
        }
    }

    private BroadcastSuccess(from: number, to: number, command: number, card: string, score: number) {
        console.log("broadcastCommand", from, to, command, card, score);
        if (this.getID(to) !== 0) {
            if (command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(this.getID(to), this.getID(from), card, score);
            } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(this.getID(to), card, score);
            } else if (command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(this.getID(to), this.getID(from), card, score);
            } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(this.getID(to), "None", score);
            } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(this.getID(to), card, score);
            } else if (command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(this.getID(to), this.getID(from), card);
            }
        }
        this.updateScore();
    }

    private End(data: Array<{hand: string, score: number}>) {
        console.log("end");
        for (let i = 0; i < 4; i++) {
            console.log(data[i]);
        }
        System.Delay(5000);
        window.location.href = "./index.html";
        // window.location.href = "./index.html?state=WAITING";
    }

    private updateScore() {
        for (let i = 0; i < 4; i++) {
            this.scoreText[i].text = "score:   " + this.score[i];
        }
    }
    private HU(id: number, fromId: number, card: string, score: number) {
        this.sea[fromId].RemoveTile(card);
        this.hu[id].AddTile(card);
        this.score[id]     += score;
        this.score[fromId] -= score;
    }

    private ZEMO(id: number, card: string, score: number) {
        this.hand[id].RemoveTile(id === 0 ? card : "None");
        this.hu[id].AddTile(card);
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
    }

    private GON(id: number, fromId: number, card: string, score: number) {
        this.sea[fromId].RemoveTile(card);
        for (let i = 0; i < 3; i++) {
            this.hand[id].RemoveTile(id === 0 ? card : "None");
        }
        for (let i = 0; i < 4; i++) {
            this.door[id].AddTile(card);
        }
        this.score[id]     += score;
        this.score[fromId] -= score;
    }

    private ONGON(id: number, card: string, score: number) {
        for (let i = 0; i < 4; i++) {
            this.hand[id].RemoveTile(id === 0 ? card : "None");
            this.door[id].AddTile("None");
        }
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
    }

    private PONGON(id: number, card: string, score: number) {
        this.hand[id].RemoveTile(id === 0 ? card : "None");
        this.door[id].AddTile(card);
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
    }

    private PON(id: number, fromId: number, card: string) {
        this.sea[fromId].RemoveTile(card);
        for (let i = 0; i < 2; i++) {
            this.hand[id].RemoveTile(id === 0 ? card : "None");
        }
        for (let i = 0; i < 3; i++) {
            this.door[id].AddTile(card);
        }
    }
}
