import { ButtonEvent } from "./Button";
export default class DragonBonesButton extends Phaser.Group implements ButtonEvent {
    private armature: dragonBones.PhaserArmatureDisplay;
    private alphaThresholdValue: number = 0;
    private bitmapData?: Phaser.BitmapData;

    public get onInputDown(): Phaser.Signal {
        return this.onChildInputDown;
    }

    public get onInputUp(): Phaser.Signal {
        return this.onChildInputUp;
    }

    public get onInputOver(): Phaser.Signal {
        return this.onChildInputOver;
    }

    public get onInputOut(): Phaser.Signal {
        return this.onChildInputOut;
    }

    public get enable(): boolean {
        return this.armature.inputEnabled;
    }
    public set enable(value: boolean) {
        this.armature.inputEnabled = value;
    }

    public get alphaThreshold(): number {
        return this.alphaThresholdValue;
    }
    public set alphaThreshold(value: number) {
        this.alphaThresholdValue = value;
        const left = this.left;
        const top = this.top;
        if (this.alphaThresholdValue > 0) {
            if (this.bitmapData === undefined) {
                this.bitmapData = new Phaser.BitmapData(this.game, this.game.rnd.uuid(), this.width, this.height);
                const draw = (target: PIXI.DisplayObject, x: number, y: number) => {
                    if (target instanceof PIXI.Sprite) {
                        this.bitmapData.draw(target, x, y);
                    }
                    if (target instanceof PIXI.DisplayObjectContainer) {
                        for (const child of target.children) {
                            draw(child, x + child.position.x, y + child.position.y);
                        }
                    }
                };
                draw(this, -left, -top);
                this.bitmapData.update();
            }
            this.armature.hitArea = {
                contains: (x: number, y: number): boolean => {
                    x -= left;
                    y -= top;
                    const hex = this.bitmapData.getPixel32(Math.trunc(x), Math.trunc(y));
                    const a = (hex >> 24) & 0xFF; // get the alpha
                    return a >= this.alphaThreshold * 0xFF;
                },
            };
        } else {
            this.armature.hitArea = undefined;
        }
    }

    constructor(game: Phaser.Game, armatureName: string, x?: number, y?: number, overAnimate?: string, outAnimate?: string, downAnimate?: string, upAnimate?: string, parent?: PIXI.DisplayObjectContainer, skeletonKey?: any, textureDataKey?: any, textureAtlasKey?: any, name?: string, addToStage?: boolean) {
        super(game, parent ? parent : game.world, name);
        this.position.set(x ? x : 0, y ? y : 0);
        if (!dragonBones.PhaserFactory.factory.getArmatureData(armatureName) && skeletonKey && textureDataKey && textureAtlasKey) {
            dragonBones.PhaserFactory.factory.parseDragonBonesData(game.cache.getJSON(skeletonKey));
            dragonBones.PhaserFactory.factory.parseTextureAtlasData(game.cache.getJSON(textureDataKey), (game.cache.getImage(textureAtlasKey, true) as any).base);
        }
        const armatureDisplay = dragonBones.PhaserFactory.factory.buildArmatureDisplay(armatureName);
        if (armatureDisplay) {
            this.armature = armatureDisplay;
            this.armature.inputEnabled = true;
            this.armature.input.useHandCursor = true;
            this.add(this.armature);
        } else {
            console.warn("no armature:" + armatureName);
        }
        if (downAnimate) {
            this.onInputDown.add(() => {
                this.armature.animation.play(downAnimate);
            });
        }
        if (upAnimate) {
            this.onInputUp.add(() => {
                this.armature.animation.play(upAnimate);
            });
        }
        if (overAnimate) {
            this.onInputOver.add(() => {
                this.armature.animation.play(overAnimate);
            });
        }
        if (outAnimate) {
            this.onInputOut.add(() => {
                this.armature.animation.play(outAnimate);
            });
        } else {
            this.onInputOut.add(() => {
                this.armature.animation.play(upAnimate);
            });
        }
        this.alphaThreshold = 0.8;
        this.armature.input.priorityID = this.parent.getChildIndex(this);
    }
}
