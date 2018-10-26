import Effect from "../../mahjongh5/component/Effect";
import * as System from "../System";

export interface DragonBonesAssetConfig {
    skeleton: { type: string, key: string };
    texjson: { type: string, key: string };
    texture: { type: string, key: string };
}

export default class DragonBonesEffect extends Effect {
    public armatureDisplay: dragonBones.PhaserArmatureDisplay;
    private completeSignal: Phaser.Signal;
    private loopCompleteSignal: Phaser.Signal;

    protected get onComplete(): Phaser.Signal {
        if (!this.completeSignal) {
            this.completeSignal = new Phaser.Signal();
            this.armatureDisplay.addDBEventListener("complete", this.completeSignal.dispatch, this.completeSignal);
        }
        return this.completeSignal;
    }

    protected get onloopComplete(): Phaser.Signal {
        if (!this.loopCompleteSignal) {
            this.loopCompleteSignal = new Phaser.Signal();
            this.armatureDisplay.addDBEventListener("loopComplete", this.loopCompleteSignal.dispatch, this.loopCompleteSignal);
        }
        return this.loopCompleteSignal;
    }

    constructor(game: Phaser.Game, armatureName: string, assetConfig?: DragonBonesAssetConfig, parent?: PIXI.DisplayObjectContainer);
    constructor(game: Phaser.Game, armatureName: string, skeletonKey: string, textureDataKey: string, textureAtlasKey: string, parent?: PIXI.DisplayObjectContainer);
    constructor(game: Phaser.Game, armatureName: string, skeletonKey?: DragonBonesAssetConfig | string, textureDataKey?: PIXI.DisplayObjectContainer | string, textureAtlasKey?: string, parent?: PIXI.DisplayObjectContainer) {
        super(game, (typeof textureDataKey === "string") ? parent : textureDataKey);
        if (!dragonBones.PhaserFactory.factory.getArmatureData(armatureName)) {
            if (typeof skeletonKey !== "string" && skeletonKey) {
                textureAtlasKey = skeletonKey.texture.key;
                textureDataKey = skeletonKey.texjson.key;
                skeletonKey = skeletonKey.skeleton.key;
            }
            if ((typeof skeletonKey === "string") && (typeof textureDataKey === "string") && (typeof textureAtlasKey === "string")) {
                dragonBones.PhaserFactory.factory.parseDragonBonesData(game.cache.getJSON(skeletonKey));
                dragonBones.PhaserFactory.factory.parseTextureAtlasData(game.cache.getJSON(textureDataKey), (game.cache.getImage(textureAtlasKey, true) as any).base);
            }
        }
        const armatureDisplay = dragonBones.PhaserFactory.factory.buildArmatureDisplay(armatureName);
        if (armatureDisplay) {
            this.armatureDisplay = armatureDisplay;
            this.add(this.armatureDisplay);
            this.armatureDisplay.exists = false;
        } else {
            console.warn("no armature:" + armatureName);
        }
    }

    /**
     * 播放DragonBones動畫
     *
     * 判斷動畫結束的依據為觸發動畫的complete事件
     *
     * 有些一直重複播的動畫會觸發complete事件，
     * 但是判定動畫結束之後會呼叫動畫的stop，
     * 所以會導致動畫像是播不出來的樣子，
     * 這時候就要加入finishDelay讓他不要自動結束
     * @param animationName 播放的動畫名稱
     * @param playTimes 指定動畫的播放次數
     * @param fadeInTime 指定動畫的淡入時間
     * @param finishDelay 在動畫播完後繼續等待多久的時間才結束，小於0的話表示永不結束(還是可以手動呼叫Stop結束)
     */
    public async Play(animationName?: string, playTimes?: number, fadeInTime?: number, finishDelay?: number) {
        return super.Play(animationName, playTimes, fadeInTime, finishDelay);
    }

    protected *RunEffect(animationName?: string, playTimes?: number, fadeInTime?: number, finishDelay?: number): IterableIterator<Promise<void>> {
        this.armatureDisplay.exists = true;
        this.armatureDisplay.animation.fadeIn(animationName ? animationName : this.armatureDisplay.animation.animationNames[0], fadeInTime, playTimes);
        yield new Promise((resolve) => {
            this.onComplete.addOnce(resolve);
        });
        if (finishDelay) {
            if (finishDelay < 0) {
                yield new Promise(() => { });
            } else {
                yield System.Delay(finishDelay);
            }
        }
    }

    protected async EndEffect(): Promise<void> {
        this.armatureDisplay.animation.stop();
        this.armatureDisplay.exists = false;
    }
}
