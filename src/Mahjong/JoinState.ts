import State from "mahjongh5/State";
import Game from "mahjongh5/Game";
import Input from "mahjongh5/input/Input";
import UIController from "./UIController";
import MahjongGame from "./MahjongGame";

export default class JoinState extends State {
    public loadMessage = "Loading Scene";

    public game: Game;
    public mahjongGame: MahjongGame;

    public name:      Phaser.Text[];
    public nameBlock: Phaser.Image[];

    public socket: SocketIOClient.Socket;

    private uiController:  UIController;

    private mainLoopIterator: IterableIterator<Promise<any>> | undefined;
    private mainLoopStop:     ((value?: any) => void) | undefined;

    private uuid: string;
    private room: string;
    private ID:   number;

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

        this.ui.Input.AddButton(this.ui.readyButton, Input.key.enter, undefined);
        this.ui.Refresh();

        this.uuid = localStorage.getItem("uuid");
        this.room = localStorage.getItem("room");

        const state = localStorage.getItem("state");

        const list = JSON.parse(localStorage.getItem("players"));
        for (let i = 0; i < 4; i++) {
            this.name[i].text = list[i];
        }

        this.socket.emit("getReadyPlayer", this.room, (nameList: string[]) => {
            if (nameList !== null) {
                for (const name of nameList) {
                    let index = 0;
                    for (let i = 0; i < 4; i++) {
                        if (list[i] === name) {
                            index = i;
                        }
                    }
                    this.nameBlock[index].tint = 0XFFFF33;
                }
            }
        });

        if (state === "2") {
            this.ui.readyButton.visible = false;
            this.socket.emit("getID", this.uuid, this.room, (res: number) => {
                if (res === -1) {
                    window.location.href = "./index.html";
                    return;
                }
                this.ID = res;
                localStorage.setItem("ID", res.toString());
            });
        }

        this.socket.on("broadcastReady", (name: string) => {
            let index = 0;
            for (let i = 0; i < 4; i++) {
                if (list[i] === name) {
                    index = i;
                }
            }
            this.nameBlock[index].tint = 0XFFFF33;
            console.log(name, "ready");
        });

        this.socket.on("broadcastGameStart", (playerList: string[]) => {
            const players = [];
            for (let i = 0; i < 4; i++) {
                players.push(playerList[(i + this.ID) % 4]);
            }
            localStorage.setItem("players", JSON.stringify(players));
            this.state.start(this.mahjongGame.key);
        });

        this.StartMainLoop();
    }

    public shutdown() {
        this.StopMainLoop();
    }

    private async StartMainLoop(forceRestart: boolean = false) {
        const stopSymbol = Symbol();
        const stopPromise = new Promise<symbol>((resolve) => this.mainLoopStop = () => resolve(stopSymbol));
        if (!this.mainLoopIterator || forceRestart) {
            this.mainLoopIterator = this.MainLoop();
        }
        for (let iterResult = this.mainLoopIterator.next(), awaitResult; !iterResult.done; iterResult = this.mainLoopIterator.next(awaitResult)) {
            awaitResult = await Promise.race([iterResult.value, stopPromise]);
            if (awaitResult === stopSymbol) {
                break;
            }
        }
    }

    private StopMainLoop(freeThread: boolean = true) {
        if (this.mainLoopStop) {
            this.mainLoopStop();
            this.mainLoopStop = undefined;
            if (freeThread) {
                this.mainLoopIterator = undefined;
            }
        }
    }

    private *MainLoop(): IterableIterator<Promise<any>> {
        yield this.ui.Input.WaitKeyUp(Input.key.enter);
        this.ui.readyButton.visible = false;
        this.socket.emit("ready", this.uuid, this.room, (res: number) => {
            if (res === -1) {
                window.location.href = "./index.html";
                return;
            }
            this.ID = res;
            localStorage.setItem("ID", res.toString());
        });
    }
}
