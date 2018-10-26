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
        this.socket = io.connect("localhost");
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

        this.ui.Refresh();

        this.name     = localStorage.getItem("name");
        this.roomName = localStorage.getItem("room");
        this.players  = JSON.parse(localStorage.getItem("players"));
        this.hand[0].SetImmediate(JSON.parse(localStorage.getItem("hand")));

        // this.socket.on("join", (data: {uuid: string, roomID: string}) => {
        //     this.ID     = data.uuid;
        //     this.roomID = data.roomID;
        // });
        // this.socket.on("start", (data: string[]) => {
        //     this.hand[0].SetImmediate(data);
        //     this.hand[0].Disable();
        // });
        this.socket.on("change", async (data: string[]) => {
            this.hand[0].Enable();
            const choseLackCard = async function(self: MahjongGame) {
                const count: {[key: string]: number} = {
                    B: 0,
                    C: 0,
                    D: 0,
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
                        break;
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
            const defaultChange = System.DelayValue(30000, data);
            this.ui.checkButton.visible = true;
            const chandCard = await Promise.race([choseLackCard(this), defaultChange]);
            this.ui.checkButton.visible = false;
            this.socket.emit("change", { name: this.name, roomName: this.roomName, Card: chandCard });
            this.hand[0].Disable();
        });
        this.socket.on("afterChange", (data: string[]) => {
            for (let i = 0; i < 3; i++) {
                this.hand[0].AddTile(data[i]);
            }
        });
        this.socket.on("lack", async (data: number) => {
            this.choseLackDialog.Show();
            const defaultColor = System.DelayValue(10000, data);
            const lackColor = await Promise.race([this.ui.Input.WaitKeyUp(Input.key.lack), defaultColor]);
            this.choseLackDialog.Hide();
            this.socket.emit("lack", { name: this.name, roomName: this.roomName, Color: lackColor });
        });
        this.socket.on("afterLack", (data: Array<{name: string, lackColor: number}>) => {
            console.log(data);
        });
        this.socket.on("draw", (data: string) => {
            this.hand[0].AddTile(data);
        });
        this.socket.on("throw", async (data: string) => {
            this.hand[0].Enable();
            const defaultCard = System.DelayValue(10000, data);
            const throwCard = await Promise.race([this.hand[0].getClickCardID(), defaultCard]);
            this.socket.emit("throwCard", { name: this.name, roomName: this.roomName, Card: throwCard });
            this.hand[0].Disable();
        });
        this.socket.on("command", async (data: {command: number, card: string}) => {
            if (data.command | Input.key.Hu) {
                this.commandDialog.hu.visible = true;
                this.commandDialog.hu.enable  = true;
            } else {
                this.commandDialog.hu.visible = false;
                this.commandDialog.hu.enable  = false;
            }

            if (data.command | Input.key.Pon) {
                this.commandDialog.pon.visible = true;
                this.commandDialog.pon.enable  = true;
            } else {
                this.commandDialog.pon.visible = false;
                this.commandDialog.pon.enable  = false;
            }

            if (data.command | Input.key.Gon) {
                this.commandDialog.gon.visible = true;
                this.commandDialog.gon.enable  = true;
            } else {
                this.commandDialog.gon.visible = false;
                this.commandDialog.gon.enable  = false;
            }

            const defaultCommand = System.DelayValue(10000, COMMAND_TYPE.NONE);
            const action = await Promise.race([this.ui.Input.WaitKeyUp(Input.key.command), defaultCommand]);
            this.socket.emit("command", { name: this.name, roomName: this.roomName, Command: action & data.command, Card: data.card });
        });
        this.socket.on("success", (data: {fromName: string, command: number, card: string, score: number}) => {
            if (data.command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(0, this.getID(data.fromName), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(0, data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(0, this.getID(data.fromName), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(0, data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(0, data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(0, this.getID(data.fromName), data.card);
            }
        });
        this.socket.on("othersThrow", (data: {name: string, card: string}) => {
            this.hand[this.getID(data.name)].RemoveTile("None");
            this.sea[this.getID(data.name)].AddTile(data.card);
        });
        this.socket.on("othersCommand", (data: {name: string, fromName: string, command: number, card: string, score: number}) => {
            if (data.command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(this.getID(data.name), this.getID(data.fromName), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(this.getID(data.name), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(this.getID(data.name), this.getID(data.fromName), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(this.getID(data.name), "None");
            } else if (data.command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(this.getID(data.name), data.card);
            } else if (data.command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(this.getID(data.name), this.getID(data.fromName), data.card);
            }
        });
        this.socket.on("end", (data: Array<{name: string, score: number}>) => {
            for (let i = 0; i < 4; i++) {
                console.log(data[i]);
            }
        });

        // this.StartMainLoop();
    }

    private getID(name: string) {
        for (let i = 0; i < 4; i++) {
            if (this.players[i] === name) {
                return i;
            }
        }
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
