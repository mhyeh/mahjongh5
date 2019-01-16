// Definition
export interface SpineObjectCreator {
    spine: (x: number, y: number, key: string, group?: Phaser.Group) => Spine;
}

export interface SpineObjectFactory {
    spine: (x: number, y: number, key: string, group?: Phaser.Group) => Spine;
}

export interface SpineCache {
    addSpine: (key: string, data: SpineCacheData) => void;
    getSpine: (key: string) => SpineCacheData;
    spine: { [key: string]: SpineCacheData };
}

export interface SpineLoader {
    spine: (key: string, json: string, atlas: string, images: string | Array<{ url: string, name?: string }>) => void;
}

// Overwrite
export interface GameObjectCreator extends Phaser.GameObjectCreator, SpineObjectCreator {
    game: Game;
}

export interface GameObjectFactory extends Phaser.GameObjectFactory, SpineObjectFactory {
    game: Game;
}

export interface Cache extends Phaser.Cache, SpineCache {

}

export interface Loader extends Phaser.Loader, SpineLoader {
    cache: Cache;
    game: Game;
}

export interface Game extends Phaser.Game {
    add: GameObjectFactory;
    cache: Cache;
    load: Loader;
}

// Data
export interface SpineCacheData {
    atlas: string;
    pages: { [file: string]: string };
}

export class SpinePlugin extends Phaser.Plugin {
    constructor(game: Game, parent: Phaser.PluginManager) {
        super(game, parent);
        this.addSpineCache();
        this.addSpineFactory();
        this.addSpineLoader();
    }

    private addSpineLoader() {
        (Phaser.Loader.prototype as Loader).spine = function spineLoader(this: Loader, key: string, jsonUrl: string, atlasUrl: string, images: string | Array<{ url: string, name?: string }>) {

            const atlasKey: string = key + "Atlas";

            const cacheData: SpineCacheData = {
                atlas: atlasKey,
                pages: {},
            };

            this.json(key, jsonUrl);
            this.text(atlasKey, atlasUrl);

            if (typeof images === "string") {
                cacheData.pages[""] = this.game.rnd.uuid();
                this.image(cacheData.pages[""], images);
            } else {
                for (const image of images) {
                    cacheData.pages[image.name || ""] = this.game.rnd.uuid();
                    this.image(cacheData.pages[image.name || ""], image.url);
                }
            }

            this.game.cache.addSpine(key, cacheData);
        };
    }

    /**
     * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
     * game.add.spine();
     */
    private addSpineFactory() {
        (Phaser.GameObjectFactory.prototype as GameObjectFactory).spine = function spine(this: GameObjectCreator, x: number, y: number, key: string, group?: Phaser.Group): Spine {
            if (group === undefined) { group = this.world; }

            const spineObject = new Spine(this.game, key);

            spineObject.setToSetupPose();
            spineObject.position.x = x;
            spineObject.position.y = y;

            return group.add(spineObject);
        };

        (Phaser.GameObjectCreator.prototype as GameObjectCreator).spine = function spine(this: GameObjectCreator, x: number, y: number, key: string, group?: Phaser.Group): Spine {
            return new Spine(this.game, key);
        };
    }

    /**
     * Extends the Phaser.Cache prototype with spine properties
     */
    private addSpineCache(): void {
        // Create the cache space
        (Phaser.Cache.prototype as Cache).spine = {};

        // Method for adding a spine dict to the cache space
        (Phaser.Cache.prototype as Cache).addSpine = function addSpine(key: string, data: SpineCacheData) {
            this.spine[key] = data;
        };

        // Method for fetching a spine dict from the cache space
        (Phaser.Cache.prototype as Cache).getSpine = function getSpine(key: string): SpineCacheData {
            if (!this.spine.hasOwnProperty(key)) {
                console.warn('Phaser.Cache.getSpine: Key "' + key + '" not found in Cache.');
            }

            return this.spine[key];
        };
    }
}

class SpineTexture extends spine.Texture {
    public baseTexture: PIXI.BaseTexture;

    constructor(image: HTMLImageElement) {
        const baseTexture = new PIXI.BaseTexture(image, PIXI.scaleModes.DEFAULT);
        super(baseTexture.source);
        this.baseTexture = baseTexture;
    }

    public setFilters(minFilter: spine.TextureFilter, magFilter: spine.TextureFilter): void {
        if (magFilter === spine.TextureFilter.Linear) {
            // this.baseTexture.mipmap = true;
            this.baseTexture.scaleMode = PIXI.scaleModes.LINEAR;
        } else if (magFilter === spine.TextureFilter.Nearest) {
            this.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
        }
    }
    public setWraps(uWrap: spine.TextureWrap, vWrap: spine.TextureWrap): void {

    }
    public dispose(): void {
        this.baseTexture.destroy();
    }
}

class PhaserTile extends Phaser.Group {
    private static readonly blendMode = {
        [spine.BlendMode.Normal]: PIXI.blendModes.NORMAL,
        [spine.BlendMode.Additive]: PIXI.blendModes.ADD,
        [spine.BlendMode.Multiply]: PIXI.blendModes.MULTIPLY,
        [spine.BlendMode.Screen]: PIXI.blendModes.SCREEN,
    };
    public slot: spine.Tile;
    protected attachments: spine.Map<Phaser.Image | Phaser.Rope> = {};
    protected currentAttachmentName: string = "";
    private tintValue: number;

    constructor(game: Phaser.Game, slot: spine.Tile, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
        this.slot = slot;
    }

    public get tint(): number {
        return this.tintValue;
    }
    public set tint(value: number) {
        this.tintValue = value;
        for (const child of this.children) {
            if (child instanceof Phaser.Image) {
                child.tint = value;
            }
        }
    }

    public get currentAttachmen(): Phaser.Image | Phaser.Rope {
        return this.attachments[this.currentAttachmentName];
    }

    public update(dt?: number): void {
        const slot = this.slot;
        const attachment = slot.getAttachment();

        if (attachment instanceof spine.RegionAttachment) {
            if (this.currentAttachmentName !== attachment.name) {
                if (this.attachments[this.currentAttachmentName] !== undefined) {
                    this.attachments[this.currentAttachmentName].visible = false;
                }
                if (this.attachments[attachment.name] !== undefined) {
                    this.attachments[attachment.name].visible = true;
                } else {
                    const sprite = this.createRegion(slot, attachment);
                    this.attachments[attachment.name] = sprite;
                }

                this.currentAttachmentName = attachment.name;
            }
            const image = this.attachments[attachment.name] as Phaser.Image;

            const bone: spine.Bone = slot.bone;

            // Update positions
            this.position.x = attachment.x * bone.a + attachment.y * bone.b + bone.worldX;
            this.position.y = attachment.x * bone.c + attachment.y * bone.d + bone.worldY;
            // this.position.y = this.game.world.height - this.position.y;

            // Update scaling
            this.scale.x = bone.getWorldScaleX();
            this.scale.y = bone.getWorldScaleY();
            // Update rotation
            this.rotation = (bone.getWorldRotationX() - attachment.rotation) * Math.PI / 180;

            if (bone.getWorldScaleY() < 0) {
                this.scale.y = -this.scale.y;
            }
            if (bone.getWorldScaleX() < 0) {
                this.scale.x = -this.scale.x;
            }
            if (bone.getWorldScaleY() < 0 || bone.getWorldScaleX() < 0) {
                this.rotation = -this.rotation;
            }
            image.blendMode = PhaserTile.blendMode[slot.data.blendMode];
            if (!this.tintValue) {
                image.tint = slot.color.r * 0xFF0000 + slot.color.g * 0x00FF00 + slot.color.b * 0x0000FF;
            }
            this.alpha = slot.color.a;
            this.visible = true;
        } else if (attachment instanceof spine.MeshAttachment) {
            if (this.currentAttachmentName !== attachment.name) {
                if (this.attachments[this.currentAttachmentName] !== undefined) {
                    this.attachments[this.currentAttachmentName].visible = false;
                }
                if (this.attachments[attachment.name] !== undefined) {
                    this.attachments[attachment.name].visible = true;
                } else {
                    const mesh = this.createMesh(slot, attachment);
                    this.attachments[attachment.name] = mesh;
                }
                this.currentAttachmentName = attachment.name;
            }
            const rope = this.attachments[attachment.name] as Phaser.Rope;
            const vertices: number[] = (rope as any).vertices;
            attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, vertices, 0, 2);
            const point = new PIXI.Point();
            for (let i = 0; i < vertices.length / 2; i++) {
                point.set(vertices[i * 2], vertices[i * 2 + 1]);
                this.worldTransform.apply(point, point);
                vertices[i * 2] = point.x;
                vertices[i * 2 + 1] = point.y;
            }
            this.alpha = slot.color.a;
            this.visible = true;
        } else {
            this.visible = false;
        }
        super.update();
    }

    /**
     * Create a new sprite to be used with spine.RegionAttachment
     *
     * @method createSprite
     * @param slot {spine.Tile} The slot to which the attachment is parented
     * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
     * @private
     */
    public createRegion(slot: spine.Tile, attachment: spine.RegionAttachment): Phaser.Image {
        const descriptor = attachment.region as spine.TextureAtlasRegion;
        const baseTexture = (descriptor.texture as SpineTexture).baseTexture;
        const spriteRect: PIXI.Rectangle = new PIXI.Rectangle(
            descriptor.x, descriptor.y,
            descriptor.rotate ? descriptor.height : descriptor.width,
            descriptor.rotate ? descriptor.width : descriptor.height,
        );

        const spriteTexture: PIXI.Texture = new PIXI.Texture(baseTexture, spriteRect);
        const sprite: Phaser.Image = new Phaser.Image(this.game, 0, 0, spriteTexture);

        const baseRotation: number = descriptor.rotate ? Math.PI * 0.5 : 0.0;
        sprite.scale.x = descriptor.width / descriptor.originalWidth * attachment.scaleX;
        sprite.scale.y = descriptor.height / descriptor.originalHeight * attachment.scaleY;

        sprite.rotation = baseRotation;

        sprite.anchor.x = (0.5 * descriptor.originalWidth - descriptor.offsetX) / descriptor.width;
        sprite.anchor.y = 1.0 - ((0.5 * descriptor.originalHeight - descriptor.offsetY) / descriptor.height);

        sprite.alpha = attachment.color.a;

        if (descriptor.rotate) {
            const x1: number = sprite.scale.x;
            sprite.scale.x = sprite.scale.y;
            sprite.scale.y = x1;
        }

        this.add(sprite);
        return sprite;
    }

    public createMesh(slot: spine.Tile, attachment: spine.MeshAttachment): Phaser.Rope {
        const descriptor = attachment.region as spine.TextureAtlasRegion;
        const baseTexture = (descriptor.texture as SpineTexture).baseTexture;
        const texture: PIXI.Texture = new PIXI.Texture(baseTexture);
        const strip: Phaser.Rope = new Phaser.Rope(this.game, 0, 0, texture);

        (strip as any).drawMode = 1;
        (strip as any).canvasPadding = 1;

        (strip as any).vertices = new Float32Array(attachment.uvs.length);
        (strip as any).uvs = new Float32Array(attachment.uvs);
        (strip as any).indices = new Uint16Array(attachment.triangles);

        strip.alpha = attachment.color.a;

        this.add(strip);

        return strip;
    }
}

export class Spine extends Phaser.Group {
    public static globalAutoUpdate: boolean = true;

    public game: Game;
    public onStart: Phaser.Signal = new Phaser.Signal();
    public onInterrupt: Phaser.Signal = new Phaser.Signal();
    public onEnd: Phaser.Signal = new Phaser.Signal();
    public onDispose: Phaser.Signal = new Phaser.Signal();
    public onComplete: Phaser.Signal = new Phaser.Signal();
    public onEvent: Phaser.Signal = new Phaser.Signal();

    private skeleton: spine.Skeleton;
    private skeletonData: spine.SkeletonData;
    private state: spine.AnimationState;
    private stateData: spine.AnimationStateData;
    private slotContainers: PhaserTile[];
    private lastTime: number;
    private globalTint: number;
    private lastDrawOrder: spine.Tile[] = [];

    /**
     * @class Spine
     * @extends Phaser.Group
     * @constructor
     * @param game {Phaser.Game} the game reference to add this object
     * @param key {String} the key to find the assets for this object
     */
    constructor(game: Game, key: string) {
        super(game);

        const data: SpineCacheData = this.game.cache.getSpine(key);

        // create a spine atlas using the loaded text and a spine texture loader instance //
        const spineAtlas = new spine.TextureAtlas(game.cache.getText(data.atlas), (path: string) => {
            const pages = this.game.cache.getSpine(key).pages;
            return new SpineTexture(this.game.cache.getImage(pages[path] || pages[""]));
        });
        // now we use an atlas attachment loader //
        const attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas);
        // spine animation
        const spineJsonParser = new spine.SkeletonJson(attachmentLoader);

        // get the Skeleton Data
        this.skeletonData = spineJsonParser.readSkeletonData(game.cache.getJSON(key));
        if (!this.skeletonData) {
            throw new Error("Spine data must be preloaded using Loader.spine");
        }
        this.skeleton = new spine.Skeleton(this.skeletonData);
        this.skeleton.flipY = true;
        this.skeleton.updateWorldTransform();

        this.stateData = new spine.AnimationStateData(this.skeletonData);
        this.state = new spine.AnimationState(this.stateData);
        this.state.addListener({
            start: this.onStart.dispatch.bind(this.onStart),
            interrupt: this.onInterrupt.dispatch.bind(this.onInterrupt),
            end: this.onEnd.dispatch.bind(this.onEnd),
            dispose: this.onDispose.dispatch.bind(this.onDispose),
            complete: this.onComplete.dispatch.bind(this.onComplete),
            event: this.onEvent.dispatch.bind(this.onEvent),
        });

        this.slotContainers = [];
        for (const slot of this.skeleton.slots) {
            this.slotContainers.push(new PhaserTile(game, slot, this));
        }

        this.autoUpdate = true;
    }

    public get autoUpdate(): boolean {
        return (this.updateTransform === Spine.prototype.autoUpdateTransform);
    }
    public set autoUpdate(value: boolean) {
        this.updateTransform = value ? Spine.prototype.autoUpdateTransform : PIXI.DisplayObjectContainer.prototype.updateTransform;
    }

    public get tint(): number {
        return this.globalTint;
    }
    public set tint(value: number) {
        this.globalTint = value;
        for (const slot of this.slotContainers) {
            slot.tint = value;
        }
    }

    /**
     * Update the spine skeleton and its animations by delta time (dt)
     *
     * @method update
     * @param dt {Number} Delta time. Time by which the animation should be updated
     */
    public update(dt?: number): void {
        if (dt === undefined) {
            return;
        }

        this.state.update(dt);
        this.state.apply(this.skeleton);
        this.skeleton.updateWorldTransform();

        const drawOrder: spine.Tile[] = this.skeleton.drawOrder;
        const lastDrawOrderLength = this.lastDrawOrder.length;
        for (let i = 0, drawOrderLength = drawOrder.length; i < drawOrderLength; i++) {
            if (i >= lastDrawOrderLength || drawOrder[i] !== this.lastDrawOrder[i]) {
                for (const slot of this.slotContainers) {
                    if (slot.slot === drawOrder[i]) {
                        this.setChildIndex(slot, i);
                    }
                }
            }
        }
        this.lastDrawOrder = drawOrder;
        super.update();
        let batchs: Phaser.Rope[] = [];
        let lastMesh: any;
        for (const slot of this.children) {
            if (slot instanceof PhaserTile && slot.currentAttachmen instanceof Phaser.Rope) {
                batchs.push(slot.currentAttachmen);
                lastMesh = slot.currentAttachmen;
                lastMesh.batch = 1;
                lastMesh.batchs = undefined;
            } else if (slot instanceof PhaserTile && slot.currentAttachmen && lastMesh) { // 應該還要判斷texture、alpha、blend mode比較好
                lastMesh.batchs = batchs;
                batchs = [];
                lastMesh = undefined;
            }
        }
        if (lastMesh) {
            lastMesh.batchs = batchs;
            batchs = [];
            lastMesh = undefined;
        }
    }

    /**
     * Children should always be destroyed
     *
     * @param destroyChildren
     * @param soft
     */
    public destroy(destroyChildren?: boolean, soft?: boolean): void {
        super.destroy(true, soft);
    }

    /**
     * When autoupdate is set to yes this function is used as pixi's updateTransform function
     *
     * @method autoUpdateTransform
     * @private
     */
    public autoUpdateTransform() {
        if (Spine.globalAutoUpdate) {
            this.lastTime = this.lastTime || Date.now();
            const timeDelta = (Date.now() - this.lastTime) * 0.001;
            this.lastTime = Date.now();

            this.update(timeDelta);
        } else {
            this.lastTime = 0;
        }

        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    }

    /**
     * [setMixByName wrap to stateData.setMixByName]
     * @param {String} fromName [source animation name]
     * @param {String} toName   [target animation name]
     * @param {Float} duration [Duration in the transition of the animations]
     */
    public setMixByName(fromName: string, toName: string, duration: number): void {
        this.stateData.setMix(fromName, toName, duration);
    }

    /**
     * exposing the state's setAnimation
     * We override the original runtime's error because warnings dont stop the VM
     *
     * @param {number}  trackIndex
     * @param {string}  animationName
     * @param {boolean} loop
     * @param {number}  delay
     * @returns {any}
     */
    public setAnimationByName(trackIndex: number, animationName: string, loop: boolean = false): spine.TrackEntry {
        const animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
        if (!animation) {
            console.warn("Animation not found: " + animationName);
            return null;
        }

        return this.state.setAnimationWith(trackIndex, animation, loop);
    }

    /**
     * exposing the state's addAnimation
     * We override the original runtime's error because warnings dont stop the VM
     *
     * @param {number}  trackIndex
     * @param {string}  animationName
     * @param {boolean} loop
     * @param {number}  delay
     * @returns {any}
     */
    public addAnimationByName(trackIndex: number, animationName: string, loop: boolean = false, delay: number = 0): spine.TrackEntry {
        const animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
        if (!animation) {
            console.warn("Animation not found: " + animationName);
            return null;
        }
        return this.state.addAnimationWith(trackIndex, animation, loop, delay);
    }

    /**
     * get the name of the animation currently playing
     *
     * @param {number}  trackIndex
     * @returns {string}
     */
    public getCurrentAnimationForTrack(trackIndex: number): string {
        return this.state.tracks[trackIndex].animation.name;
    }

    /**
     * Exposing the skeleton's method to change the skin by skinName
     * We override the original runtime's error because warnings dont stop the VM
     *
     * @param {string}  skinName  The name of the skin we'd like to set
     */
    public setSkinByName(skinName: string): void {
        const skin: spine.Skin = this.skeleton.data.findSkin(skinName);
        if (!skin) {
            console.warn("Skin not found: " + skinName);
            return;
        }
        this.skeleton.setSkin(skin);
    }

    /**
     * Exposing the skeleton's method to change the skin
     *
     * @param skin
     */
    public setSkin(skin: spine.Skin): void {
        this.skeleton.setSkin(skin);
    }

    /**
     * Set to initial setup pose
     */
    public setToSetupPose(): void {
        this.skeleton.setToSetupPose();
    }

    /**
     * You can combine skins here by supplying a name for the new skin, and then a nummer of existing skins names that needed to be combined in the new skin
     * If the skins that will be combined contain any double attachment, only the first attachment will be added to the newskin.
     * any subsequent attachment that is double will not be added!
     *
     * @param newSkinName
     * @param skinNames
     */
    public createCombinedSkin(newSkinName: string, ...skinNames: string[]): spine.Skin {
        if (skinNames.length === 0) {
            console.warn("Unable to combine skins when no skins are passed...");
            return;
        }

        const newSkin: spine.Skin = new spine.Skin(newSkinName);

        for (const skinName of skinNames) {
            const skin = this.skeleton.data.findSkin(skinName);
            if (!skin) {
                console.warn("Skin not found: " + skinName);
                return;
            }

            for (const [slotIndex, attachments] of skin.attachments.entries()) {
                for (const attachmentName in attachments) {
                    if (attachments.hasOwnProperty(attachmentName)) {
                        if (newSkin.getAttachment(slotIndex, attachmentName) !== undefined) {
                            console.warn("Found double attachment for: " + skinName + ". Skipping");
                            continue;
                        }

                        newSkin.addAttachment(slotIndex, attachmentName, attachments[attachmentName]);
                    }
                }
            }
        }

        this.skeleton.data.skins.push(newSkin);

        return newSkin;
    }
}
