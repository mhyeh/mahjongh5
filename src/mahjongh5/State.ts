import Game from "./Game";
import { Loadable } from "./load/LoadState";
/** 取代Phaser原本的State，多加入一些功能 */
export default class State<GameType extends Game = Game> extends Phaser.State implements Loadable {
    private static stateCount = 0;
    private static fpsText?: Phaser.BitmapText;
    /** 重新定義state的game為我們自己的game，這樣才能使用自訂義game的功能 */
    public game: GameType;
    public loadMessage = "Loading Scene...";
    private initSignal?: Phaser.Signal;
    private preloadSignal?: Phaser.Signal;
    private createSignal?: Phaser.Signal;

    constructor(game: GameType) {
        super();
        this.game = game;
        this.key = "state" + State.stateCount++;
        game.state.add(this.key, this);
    }

    /** Signal參數:這個state */
    public get onInit(): Phaser.Signal {
        if (!this.initSignal) {
            this.initSignal = new Phaser.Signal();
        }
        return this.initSignal;
    }

    /** Signal參數:這個state */
    public get onPreload(): Phaser.Signal {
        if (!this.preloadSignal) {
            this.preloadSignal = new Phaser.Signal();
        }
        return this.preloadSignal;
    }

    /** Signal參數:這個state */
    public get onCreate(): Phaser.Signal {
        if (!this.createSignal) {
            this.createSignal = new Phaser.Signal();
        }
        return this.createSignal;
    }

    public init() {
        if (this.initSignal) {
            this.initSignal.dispatch(this);
        }
    }

    public preload() {
        if (this.preloadSignal) {
            this.preloadSignal.dispatch(this);
        }
    }

    public create() {
        if (this.createSignal) {
            this.createSignal.dispatch(this);
        }
        if (this.game.showFPS && !State.fpsText) {
            State.fpsText = this.game.stage.add(new Phaser.BitmapText(this.game, 0, 0, "arial"));
            State.fpsText.tint = 0x00ff00;
        }
    }

    public shutdown() {

    }

    public render() {
        if (this.game.showFPS && State.fpsText) {
            State.fpsText.text = "FPS " + this.game.time.fps;
        }
        // document.getElementById("FPS").innerText = this.game.time.fps.toString();
    }

    public LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        if (progressCallback) {
            progressCallback(1);
        }
        return Promise.resolve();
    }
}
