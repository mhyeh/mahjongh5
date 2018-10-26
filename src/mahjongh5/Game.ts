import LoadState from "./load/LoadState";
import State from "./State";
import * as Assets from "./Assets";
import ErrorHandler from "./ErrorHandler";
import * as PhaserSpine from "../PhaserSpine/PhaserSpine";
import * as arial from "./arial";
import * as AtlasBitmapFont from "./ui/AtlasBitmapFont";
import * as DragonBones from "../DragonBones";
export default class Game extends Phaser.Game {
    public error: ErrorHandler = new ErrorHandler(this);
    public assets: typeof Assets | Array<typeof Assets> = Assets;
    public gameStates: State[] = [];

    // setting
    public showFPS: boolean = (window.location.href.indexOf("fps=1") !== -1);
    public rwd: boolean = !(window.location.href.indexOf("rwd=0") !== -1);
    public unfocusStop: boolean = (window.location.href.indexOf("ufs=1") !== -1);
    public antialias: boolean = (window.location.href.indexOf("aa=1") !== -1);
    public language: string = "";
    public dragonBonesSupport: boolean = true;
    public spineSupport: boolean = true;

    // for support spine
    public add: GameObjectFactory;
    public make: GameObjectCreator;
    public load: Loader;
    public cache: Cache;

    // state
    private reconnecting = false;

    // getter setter value
    private loadStateValue?: LoadState;

    public get loadState(): LoadState {
        if (!this.loadStateValue) {
            this.loadStateValue = new LoadState(this);
        }
        return this.loadStateValue;
    }
    public set loadState(value: LoadState) {
        this.loadStateValue = value;
    }

    public Start() {
        // 遊戲設定
        this.loadState.onInit.add(() => {
            this.world.updateOnlyExistingChildren = true;
            this.clearBeforeRender = false;
            this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            if (!this.unfocusStop) {
                this.stage.disableVisibilityChange = true;
            }
            if (this.rwd) {
                if (typeof this.parent === "string") {
                    document.getElementById(this.parent).style.position = "fixed";
                } else if (this.parent instanceof HTMLElement) {
                    this.parent.style.position = "fixed";
                }
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.parentIsWindow = true;
            }
            if (this.showFPS) {
                this.time.advancedTiming = true;
            }
            // plugins
            this.plugins.add(AtlasBitmapFont.Plugin);
            if (this.dragonBonesSupport) {
                this.plugins.add(DragonBones.Plugin);
            }
            if (this.spineSupport) {
                this.plugins.add(PhaserSpine.SpinePlugin);
            }
        });
        // 設定網路出錯時重新連線

        // 顯示載入畫面之前載入preload資源
        this.loadState.onPreload.add(() => {
            this.load.bitmapFont(arial.key, arial.texture, undefined, arial.atlas);
            if (this.assets instanceof Array) {
                for (const asset of this.assets) {
                    asset.CreateLoadTask(this, { [asset.sectionFlag.preload]: true }, this.language).AddToLoader();
                }
            } else {
                this.assets.CreateLoadTask(this, { [this.assets.sectionFlag.preload]: true }, this.language).AddToLoader();
            }
        });
        // 加入載入任務
        if (this.assets instanceof Array) {
            for (const asset of this.assets) {
                this.loadState.loadQueue.push(asset.CreateLoadTask(this, { [asset.sectionFlag.preload]: false }, this.language));
            }
        } else {
            this.loadState.loadQueue.push(this.assets.CreateLoadTask(this, { [this.assets.sectionFlag.preload]: false }, this.language));
        }

        for (const scene of this.gameStates) {
            scene.game = this;
            this.loadState.loadQueue.push(scene);
        }
        // 設定載入完成後顯示的場景以及錯誤時的處理然後開始載入
        if (this.gameStates.length > 0) {
            this.loadState.onAllComplete.add(() => this.state.start(this.gameStates[0].key));
            this.gameStates[0].onCreate.addOnce(() => {
                if (this.sound.usingWebAudio && this.sound.context.state === "suspended") {
                    this.input.onTap.addOnce(this.sound.context.resume, this.sound.context);
                }
            });
        }
        this.loadState.onTaskError.add((sender: any, error: any) => this.error.ShowError(error).then(() => window.location.reload()));
        this.state.add("load", this.loadState, true);
    }
}

export interface GameObjectFactory extends Phaser.GameObjectFactory, PhaserSpine.SpineObjectFactory, DragonBones.GameObjectFactory {
    game: Game;
}

export interface GameObjectCreator extends Phaser.GameObjectCreator, PhaserSpine.SpineObjectCreator, DragonBones.GameObjectCreator {
    game: Game;
}

export interface Cache extends Phaser.Cache, PhaserSpine.SpineCache, DragonBones.Cache, AtlasBitmapFont.Cache {
    game: Game;
}

export interface Loader extends Phaser.Loader, PhaserSpine.SpineLoader, DragonBones.Loader, AtlasBitmapFont.Loader {
    cache: Cache;
    game: Game;
}
