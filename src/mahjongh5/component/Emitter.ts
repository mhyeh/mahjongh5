export default class Emitter<ParticleType extends Particle> extends Phaser.Group {
    /** 更新particle狀態用的function，如果回傳true就會提早將particle銷毀，time的單位是秒(因為用秒比較好計算) */
    public updateFunction: (particle: ParticleType, time: number) => (boolean | void);
    /** 當particle被發射出去時會呼叫的function */
    public activeFunction: ((particle: ParticleType) => void) | undefined;
    /** 自動發射particle時用的lifespan，單位是毫秒 */
    public lifespan = Number.POSITIVE_INFINITY;
    /** 自動發射particle的間隔時間，單位是毫秒 */
    public interval = Number.POSITIVE_INFINITY;
    /** 每次自動發射particle要發射幾個 */
    public quantity = 1;
    private particlePool: ParticleType[];
    /** Emitter active 後經過的時間，單位是秒 */
    private timeValue: number = 0;
    /** timeValue 的小數部分 */
    private timeInteger: number = 0;
    /** timeValue 的整數部分 */
    private timeFraction: number = 0;
    /** 增加 timeValue 用的 tween */
    private tween: Phaser.Tween | undefined;

    /**
     * 產生Emitter
     * @param game Phaser Game
     * @param createParticle 產生particle的function，包含particle的初始化
     * @param updateFunction 更新particle狀態用的function，如果回傳true就會提早將particle銷毀，time的單位是秒(因為用秒比較好計算)
     * @param activeFunction 當particle被發射出去時會呼叫的function
     * @param x x position
     * @param y y position
     * @param maxParticles 最大的particle數量
     * @param parent parent
     */
    constructor(game: Phaser.Game, createParticle: () => ParticleType, updateFunction: (particle: ParticleType, time: number) => (boolean | void), activeFunction?: (particle: ParticleType) => void, x: number = 0, y: number = 0, maxParticles: number = 1, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
        this.position.set(x, y);
        this.updateOnlyExistingChildren = true;
        this.particlePool = [];
        for (let i = 0; i < maxParticles; i++) {
            const particle = createParticle();
            particle.image.exists = false;
            this.add(particle.image);
            this.particlePool.push(particle);
        }
        this.updateFunction = updateFunction;
        this.activeFunction = activeFunction;
    }

    /** Emitter的時間，會用來更新particle */
    public get time(): number {
        return this.timeValue;
    }
    public set time(value: number) {
        // 判斷是否需要自動發射particle
        const emit = Math.trunc(this.timeValue * 1000 / this.interval) < Math.trunc(value * 1000 / this.interval);
        // 更新時間
        this.timeValue = value;
        if (value === 0) {
            this.timeInteger = this.timeFraction = 0;
        }
        // 自動發射particle
        if (emit) {
            this.explode(this.lifespan, this.quantity);
        }
        // 更新particle
        for (const particle of this.particlePool) {
            if (particle.image.exists) {
                const time = value - particle.activeTime;
                if (time * 1000 >= particle.lifespan || this.updateFunction(particle, time)) {
                    particle.image.exists = false;
                }
            }
        }
    }

    public get tweenTime(): number {
        return this.timeFraction;
    }
    public set tweenTime(value: number) {
        if (this.timeFraction > value) {
            this.timeInteger++;
        }
        this.timeFraction = value;
        this.time = this.timeInteger + this.timeFraction;
    }

    public get active() {
        return !!this.tween;
    }
    public set active(value: boolean) {
        if (this.active && this.active !== value) {
            this.tween.stop();
            this.tween = undefined;
            for (const particle of this.particlePool) {
                particle.image.exists = false;
            }
        } else if (!this.active && this.active !== value) {
            this.time = 0;
            this.tween = this.game.add.tween(this).to({ tweenTime: 1 }, 1000, undefined, true, 0, -1);
        }
    }

    public explode(lifespan: number, quantity: number) {
        for (let i = 0, count = 0; i < this.particlePool.length && count < quantity; i++) {
            if (!this.particlePool[i].image.exists) {
                this.particlePool[i].image.exists = true;
                this.particlePool[i].activeTime = this.time;
                this.particlePool[i].lifespan = lifespan;
                count++;
                if (this.activeFunction) {
                    this.activeFunction(this.particlePool[i]);
                }
            }
        }
    }
}

export interface Particle {
    image: Phaser.Image;
    activeTime: number;
    lifespan: number;
}
