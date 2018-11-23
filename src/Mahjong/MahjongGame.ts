import State from "mahjongh5/State";
import Game from "mahjongh5/Game";
import GameClientSM from "./net/typeSM/GameClientSM";
import Input from "mahjongh5/input/Input";
import Account from "mahjongh5/data/Account";
import MahjongResult from "./net/typeSM/MahjongResult";
import MahjongArgs from "./data/typeSM/MahjongArgs";
import UIController from "./UIController";
import CommandTileList from "mahjongh5/component/tile/CommonTileList";
import * as System from "mahjongh5/System";
import * as io from "socket.io-client";
import { COMMAND_TYPE } from "./data/typeSM/MahjongArgs";
import ImageTile from "mahjongh5/component/tile/ImageTile";
import ButtonKey from "mahjongh5/input/ButtonKey";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";

export default class MahjongGame extends State {
    public loadMessage = "Loading Scene";

    public game: Game;

    public sea:  CommandTileList[];
    public door: CommandTileList[];
    public hand: CommandTileList[];
    public hu:   CommandTileList[];

    public choseLackDialog: ChoseLackDialog;
    public commandDialog:   CommandDialog;

    // public bottomMain:
    // public setting:
    // public saveSeat:
    private socket: SocketIOClient.Socket;
    private uiController:  UIController;

    private mahjongArgs:   MahjongArgs;
    private mahjongResult: MahjongResult;

    private mainLoopIterator: IterableIterator<Promise<any>> | undefined;
    private mainLoopStop:     ((value?: any) => void) | undefined;

    private id:       number;
    private name:     string;
    private roomName: string;
    private players:  string[];

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
        console.log(this.mahjongResult);
        if (progressCallback) {
            progressCallback(0.8);
        }
    }

    public init(mahjongResult?: MahjongResult) {
        super.init();
        this.socket = io.connect("http://140.118.127.157:3000");
        // this.socket = io.connect("http://140.118.127.169:1234");
    }

    public create() {
        super.create();
        // this.pointSelector.minValue = 50;
        // this.pointSelector.maxValue = Math.trunc(this.game.client.UserData.account.Credit);

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

        this.id       = Number(localStorage.getItem("ID"));
        this.name     = localStorage.getItem("Username");
        this.roomName = localStorage.getItem("Room");
        this.players  = JSON.parse(localStorage.getItem("players"));
        console.log(JSON.parse(localStorage.getItem("hand")));
        this.hand[0].SetImmediate(JSON.parse(localStorage.getItem("hand")));

        this.socket.emit("login", this.id, this.roomName, (err: string) => {
            if (err) {
                console.log(err);
            }
        });

        this.socket.on("change", async (defaultCard: string[], time: number) => {
            console.log("change");
            this.hand[0].Enable();
            const choseLackCard = async function(self: MahjongGame): Promise<string[]> {
                const count: {[key: string]: number} = {
                    b: 0,
                    c: 0,
                    d: 0,
                };
                for (const tile of self.hand[0].tiles) {
                    count[tile.color]++;
                }
                for (const tile of self.hand[0].tiles) {
                    if (count[tile.color] < 3) {
                        tile.enable = false;
                    }
                }
                const changeCard: string[] = [];
                while (1) {
                    let index = 0;
                    if (changeCard.length === 3) {
                        for (const tile of self.hand[0].tiles) {
                            if (!tile.isClick) {
                                tile.enable = false;
                            }
                        }
                        self.ui.checkButton.enable = true;
                        index = await Promise.race([self.hand[0].getClickCardIndex(), self.ui.Input.WaitKeyUp(Input.key.enter)]);
                    } else {
                        self.ui.checkButton.enable = false;
                        index = await self.hand[0].getClickCardIndex();
                    }
                    if (index === Input.key.enter) {
                        return changeCard;
                    }
                    if (self.hand[0].tiles[index].isClick) {
                        const removeIndex = changeCard.findIndex((value) => value === self.hand[0].tiles[index].ID);
                        changeCard.splice(removeIndex, 1);
                        self.hand[0].tiles[index].isClick = false;
                        self.hand[0].tiles[index].position.y += 10;
                        if (changeCard.length === 0) {
                            for (const tile of self.hand[0].tiles) {
                                if (count[tile.color] >= 3) {
                                    tile.enable = true;
                                }
                            }
                        } else {
                            for (const tile of self.hand[0].tiles) {
                                if (tile.color === self.hand[0].tiles[index].color) {
                                    tile.enable = true;
                                }
                            }
                        }
                    } else {
                        changeCard.push(self.hand[0].tiles[index].ID);
                        self.hand[0].tiles[index].isClick = true;
                        self.hand[0].tiles[index].position.y -= 10;
                        for (const tile of self.hand[0].tiles) {
                            if (tile.color !== self.hand[0].tiles[index].color) {
                                tile.enable = false;
                            }
                        }
                    }
                }
            };
            const defaultChange = System.DelayValue(time, defaultCard);
            this.ui.checkButton.visible = true;
            const changedCard = await Promise.race([choseLackCard(this), defaultChange]);
            this.ui.checkButton.visible = false;
            for (let i = 0; i < 3; i++) {
                this.hand[0].RemoveTile(changedCard[i]);
            }
            this.socket.emit("changeCard", changedCard);
            console.log("change", changedCard);
            this.hand[0].Disable();
        });

        this.socket.on("afterChange", (card: string[], turn: number) => {
            for (let i = 0; i < 3; i++) {
                this.hand[0].AddTile(card[i]);
            }
            this.hand[0].Disable();
            console.log("afterChange", card, turn);
        });

        this.socket.on("lack", async (color: number, time: number) => {
            console.log("lack");
            this.choseLackDialog.Show();
            const defaultColor = System.DelayValue(time, color);
            const lackColor = await Promise.race([this.ui.Input.WaitKeyUp(Input.key.lack), defaultColor]);
            this.choseLackDialog.Hide();
            console.log("lack", lackColor);
            this.socket.emit("chooseLack", lackColor);
        });

        this.socket.on("afterLack", (data: number[]) => {
            console.log("afterLack", data);
        });

        this.socket.on("throw", async (tile: string, time: number) => {
            console.log("throw");
            this.hand[0].Enable();
            const defaultCard = System.DelayValue(time, tile);
            const throwCard = await Promise.race([this.hand[0].getClickCardID(), defaultCard]);
            this.socket.emit("throwCard", throwCard);
            console.log("throw", throwCard);
            this.hand[0].Disable();
        });

        this.socket.on("command", async (cardMap: Map<COMMAND_TYPE, string[]>, command: COMMAND_TYPE, time: number) => {
            console.log("command");
            if (command & Input.key.Hu) {
                this.commandDialog.hu.visible = true;
                this.commandDialog.hu.enable  = true;
            }

            if (command & Input.key.Pon) {
                this.commandDialog.pon.visible = true;
                this.commandDialog.pon.enable  = true;
            }

            if (command & Input.key.Gon) {
                this.commandDialog.gon.visible = true;
                this.commandDialog.gon.enable  = true;
            }

            this.commandDialog.Show();

            const chooseCommand = async function(self: MahjongGame, cards: Map<COMMAND_TYPE, string[]>, commands: COMMAND_TYPE): Promise<{cmd: COMMAND_TYPE, card: string}> {
                const action = await self.ui.Input.WaitKeyUp(Input.key.command);
                let resultCard = "";
                let resultCommand = COMMAND_TYPE.NONE;
                if (action === ButtonKey.Hu) {
                    if (commands & COMMAND_TYPE.COMMAND_HU) {
                        resultCommand = COMMAND_TYPE.COMMAND_HU;
                    } else {
                        resultCommand = COMMAND_TYPE.COMMAND_ZIMO;
                    }
                    resultCard    = cards.get(resultCommand)[0];
                } else if (action === ButtonKey.Pon) {
                    resultCommand = COMMAND_TYPE.COMMAND_PON;
                    resultCard    = cards.get(resultCommand)[0];
                } else {
                    const isOnGon  = Boolean(commands & COMMAND_TYPE.COMMAND_ONGON);
                    const isPonGon = Boolean(commands & COMMAND_TYPE.COMMAND_PONGON);
                    if (isOnGon && isPonGon) {
                        self.commandDialog.pongon.visible = true;
                        self.commandDialog.pongon.enable  = true;
                        self.commandDialog.ongon.visible  = true;
                        self.commandDialog.ongon.enable   = true;
                        resultCommand = await self.ui.Input.WaitKeyUp(Input.key.Gon);
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
                        self.commandDialog.setCardButton(cards.get(resultCommand));
                        for (const button of self.commandDialog.cards) {
                            self.ui.Input.AddButton(button, ButtonKey.chooseCard, undefined, button.frameName);
                        }
                        resultCard = await self.ui.Input.WaitKeyUp(Input.key.chooseCard);
                    } else {
                        resultCard = cards.get(resultCommand)[0];
                    }
                    self.commandDialog.Hide();
                }

                return {cmd: resultCommand, card: resultCard};
            };

            const defaultCommand = System.DelayValue(time, { cmd: COMMAND_TYPE.NONE, card: "" });
            const result = await Promise.race([chooseCommand(this, cardMap, command), defaultCommand]);

            this.socket.emit("sendCommand", result.cmd, result.card);
            console.log("command", result.cmd, result.card);
            this.commandDialog.Hide();
        });

        this.socket.on("success", (from: number, command: number, card: string, score: number) => {
            console.log("success", from, command, card, score);
            if (command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(0, this.getID(from), card);
            } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(0, card);
            } else if (command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(0, this.getID(from), card);
            } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(0, card);
            } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(0, card);
            } else if (command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(0, this.getID(from), card);
            }
        });

        this.socket.on("othersThrow", (id: number, card: string) => {
            console.log("othersThrow", id, card);
            if (this.getID(id) === 0) {
                this.hand[this.getID(id)].RemoveTile(card);
            } else {
                this.hand[this.getID(id)].RemoveTile("None");
            }
            this.sea[this.getID(id)].AddTile(card);
        });

        this.socket.on("othersCommand", (from: number, to: number, command: number, card: string, score: number) => {
            console.log("othersCommand", from, to, command, card, score);
            if (command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(this.getID(to), this.getID(from), card);
            } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(this.getID(to), card);
            } else if (command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(this.getID(to), this.getID(from), card);
            } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(this.getID(to), "None");
            } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(this.getID(to), card);
            } else if (command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(this.getID(to), this.getID(from), card);
            }
        });

        this.socket.on("end", (data: Array<{hand: string, score: number}>) => {
            console.log("end");
            for (let i = 0; i < 4; i++) {
                console.log(data[i]);
            }
        });

        // this.StartMainLoop();
    }

    private getID(id: number) {
        return (this.id + id) % 4;
    }

    private HU(id: number, fromId: number, card: string) {
        this.sea[fromId].RemoveTile(card);
        this.hu[id].AddTile(card);
    }

    private ZEMO(id: number, card: string) {
        this.hand[id].RemoveTile(id === 0 ? card : "None");
        this.hu[id].AddTile(card);
    }

    private GON(id: number, fromId: number, card: string) {
        this.sea[fromId].RemoveTile(card);
        for (let i = 0; i < 3; i++) {
            this.hand[id].RemoveTile(id === 0 ? card : "None");
        }
        for (let i = 0; i < 4; i++) {
            this.door[id].AddTile(card);
        }
    }

    private ONGON(id: number, card: string) {
        for (let i = 0; i < 4; i++) {
            this.hand[id].RemoveTile(card);
            this.door[id].AddTile(card);
        }
    }

    private PONGON(id: number, card: string) {
        this.hand[id].RemoveTile(id === 0 ? card : "None");
        this.door[id].AddTile(card);
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
