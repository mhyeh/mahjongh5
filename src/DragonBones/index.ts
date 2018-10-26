// Definition
export interface GameObjectCreator {
    dragonBones: (x: number, y: number, armatureName: string, dragonBonesName?: string, skinName?: string, textureAtlasName?: string) => dragonBones.PhaserArmatureDisplay;
}

export interface GameObjectFactory {
    dragonBones: (x: number, y: number, armatureName: string, dragonBonesName?: string, skinName?: string, textureAtlasName?: string, group?: Phaser.Group) => dragonBones.PhaserArmatureDisplay;
}

export interface Cache {
    addDragonBones: (key: string, data: CacheData) => void;
    getDragonBones: (key: string) => CacheData;
    dragonBones: { [key: string]: CacheData };
}

export interface Loader {
    dragonBones(key: string, skeletonUrl: string, atlasUrl: string, imageUrl: string): void;
    dragonBones(key: string, skeletonUrl: string, atlasUrl: string, image: { type: string, key: string }, frame?: string | number): void;
}

// Overwrite
interface DBGameObjectCreator extends Phaser.GameObjectCreator, GameObjectCreator {
    game: DBGame;
}

interface DBGameObjectFactory extends Phaser.GameObjectFactory, GameObjectFactory {
    game: DBGame;
}

interface DBCache extends Phaser.Cache, Cache {

}

interface DBLoader extends Phaser.Loader, Loader {
    cache: DBCache;
    game: DBGame;
}

interface DBGame extends Phaser.Game {
    add: DBGameObjectFactory;
    cache: DBCache;
    load: DBLoader;
}

// Data
export interface CacheData {
    skeleton: string;
    atlas: string;
    image: string;
    frame?: string | number;
    dragonBonesDataName: string;
    textureAtlasDataName: string;
}

export class Plugin extends Phaser.Plugin {
    public game: DBGame;

    constructor(game: DBGame, parent: Phaser.PluginManager) {
        super(game, parent);
        dragonBones.PhaserFactory.init(game);
        this.addCache();
        this.addFactory();
        this.addLoader();
    }

    public render(): void {
        dragonBones.PhaserFactory.factory.dragonBones.advanceTime(-1.0);
    }

    private addLoader() {
        let loadQueue: Array<{ cacheData: CacheData, key: string }> = [];
        (Phaser.Loader.prototype as DBLoader).dragonBones = function dragonBonesLoader(key: string, skeletonUrl: string, atlasUrl: string, image: string | { type: string, key: string }, frame?: string | number) {
            const cacheData: CacheData = {
                skeleton: this.game.rnd.uuid(),
                atlas: this.game.rnd.uuid(),
                image: "",
                dragonBonesDataName: "",
                textureAtlasDataName: "",
            };
            this.json(cacheData.skeleton, skeletonUrl);
            this.json(cacheData.atlas, atlasUrl);
            if (typeof image === "string") {
                cacheData.image = this.game.rnd.uuid();
                this.image(cacheData.image, image);
            } else {
                cacheData.image = image.key;
                cacheData.frame = frame;
            }
            loadQueue.push({ cacheData, key });
        };
        this.game.load.onLoadComplete.add(() => {
            for (const data of loadQueue) {
                this.game.cache.addDragonBones(data.key, data.cacheData);
            }
            loadQueue = [];
        });
    }

    private addFactory() {
        (Phaser.GameObjectFactory.prototype as DBGameObjectFactory).dragonBones = function(x: number, y: number, armatureName: string, dragonBonesName?: string, skinName?: string, textureAtlasName?: string, group?: Phaser.Group): dragonBones.PhaserArmatureDisplay {
            group = group || this.world;
            const object = dragonBones.PhaserFactory.factory.buildArmatureDisplay(armatureName, dragonBonesName, skinName, textureAtlasName);
            object.position.x = x;
            object.position.y = y;
            return group.add(object);
        };

        (Phaser.GameObjectCreator.prototype as DBGameObjectCreator).dragonBones = function(x: number, y: number, armatureName: string, dragonBonesName?: string, skinName?: string, textureAtlasName?: string): dragonBones.PhaserArmatureDisplay {
            return dragonBones.PhaserFactory.factory.buildArmatureDisplay(armatureName, dragonBonesName, skinName, textureAtlasName);
        };
    }

    private addCache(): void {
        (Phaser.Cache.prototype as DBCache).dragonBones = {};

        (Phaser.Cache.prototype as DBCache).addDragonBones = function addDragonBones(key: string, data: CacheData) {
            this.dragonBones[key] = data;
            const skeleton = this.game.cache.getJSON(data.skeleton);
            data.dragonBonesDataName = skeleton.name;
            if (!dragonBones.PhaserFactory.factory.getDragonBonesData(skeleton.name)) {
                dragonBones.PhaserFactory.factory.parseDragonBonesData(this.game.cache.getJSON(data.skeleton));
            }
            const atlas = this.game.cache.getJSON(data.atlas);
            data.textureAtlasDataName = atlas.name;
            if (!dragonBones.PhaserFactory.factory.getTextureAtlasData(atlas.name)) {
                const image = (this.game.cache.getImage(data.image, true) as any);
                if (data.frame !== undefined) {
                    const frame: Phaser.Frame = image.frameData._frames[typeof data.frame === "string" ? image.frameData._frameNames[data.frame] : data.frame];
                    for (const subTexture of atlas.SubTexture) {
                        subTexture.x = (Number(subTexture.x) + frame.x).toString();
                        subTexture.y = (Number(subTexture.y) + frame.y).toString();
                    }
                }
                dragonBones.PhaserFactory.factory.parseTextureAtlasData(atlas, image.base);
            }
        };

        (Phaser.Cache.prototype as DBCache).getDragonBones = function getDragonBones(key: string): CacheData {
            if (!this.dragonBones.hasOwnProperty(key)) {
                console.warn('Phaser.Cache: Key "' + key + '" not found in Cache.');
            }
            return this.dragonBones[key];
        };
    }
}
