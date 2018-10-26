import * as cc from "./cocosLib";
import { P, C, S } from "./cocosLib";
import Particle from "./Particle";

/** Mode A: Gravity + Tangential Acceleration + Radial Acceleration */
export class ParticleSystemModeA {
    /** Gravity value. Only available in 'Gravity' mode. */
    public gravity: P;
    /** speed of each particle. Only available in 'Gravity' mode.  */
    public speed: number;
    /** speed variance of each particle. Only available in 'Gravity' mode. */
    public speedVar: number;
    /** tangential acceleration of each particle. Only available in 'Gravity' mode. */
    public tangentialAcc: number;
    /** tangential acceleration variance of each particle. Only available in 'Gravity' mode. */
    public tangentialAccVar: number;
    /** radial acceleration of each particle. Only available in 'Gravity' mode. */
    public radialAcc: number;
    /** radial acceleration variance of each particle. Only available in 'Gravity' mode. */
    public radialAccVar: number;
    /** set the rotation of each particle to its direction Only available in 'Gravity' mode. */
    public rotationIsDir: boolean;
    constructor(gravity?: P, speed?: number, speedVar?: number, tangentialAcc?: number, tangentialAccVar?: number, radialAcc?: number, radialAccVar?: number, rotationIsDir?: boolean) {
        this.gravity = gravity ? gravity : cc.p(0, 0);
        this.speed = speed || 0;
        this.speedVar = speedVar || 0;
        this.tangentialAcc = tangentialAcc || 0;
        this.tangentialAccVar = tangentialAccVar || 0;
        this.radialAcc = radialAcc || 0;
        this.radialAccVar = radialAccVar || 0;
        this.rotationIsDir = rotationIsDir || false;
    }
}
/** Mode B: Circular Movement */
export class ParticleSystemModeB {
    /** The starting radius of the particles. Only available in 'Radius' mode. */
    public startRadius: number;
    /** The starting radius variance of the particles. Only available in 'Radius' mode. */
    public startRadiusVar: number;
    /** The ending radius of the particles. Only available in 'Radius' mode. */
    public endRadius: number;
    /** The ending radius variance of the particles. Only available in 'Radius' mode. */
    public endRadiusVar: number;
    /** Number of degrees to rotate a particle around the source pos per second. Only available in 'Radius' mode. */
    public rotatePerSecond: number;
    /** Variance in degrees for rotatePerSecond. Only available in 'Radius' mode. */
    public rotatePerSecondVar: number;
    constructor(startRadius?: number, startRadiusVar?: number, endRadius?: number, endRadiusVar?: number, rotatePerSecond?: number, rotatePerSecondVar?: number) {
        this.startRadius = startRadius || 0;
        this.startRadiusVar = startRadiusVar || 0;
        this.endRadius = endRadius || 0;
        this.endRadiusVar = endRadiusVar || 0;
        this.rotatePerSecond = rotatePerSecond || 0;
        this.rotatePerSecondVar = rotatePerSecondVar || 0;
    }
}
export enum EmitterMode {
    GRAVITY,
    RADIUS,
}
export enum PositionType {
    /** Living particles are attached to the world and are unaffected by emitter repositioning. */
    FREE,
    /**
     * * Living particles are attached to the world but will follow the emitter repositioning.
     * * Use case: Attach an emitter to an sprite, and you want that the emitter follows the sprite.
     */
    RELATIVE,
    /** Living particles are attached to the emitter and are translated along with it. */
    GROUPED,
}

export default abstract class ParticleSystem<ParticleType extends Particle = Particle> {
    public static DURATION_INFINITY = -1;
    public static START_SIZE_EQUAL_TO_END_SIZE = -1;
    public static START_RADIUS_EQUAL_TO_END_RADIUS = -1;
    protected duration: number = 0;
    protected life: number = 0;
    protected lifeVar: number = 0;
    protected particleCount: number = 0;
    protected angle: number = 0;
    protected angleVar: number = 0;
    protected emitterMode: EmitterMode = EmitterMode.GRAVITY;
    protected modeA: ParticleSystemModeA = new ParticleSystemModeA();
    protected modeB: ParticleSystemModeB = new ParticleSystemModeB();
    protected startSize: number = 0;
    protected startSizeVar: number = 0;
    protected endSize: number = 0;
    protected endSizeVar: number = 0;
    protected startSpin: number = 0;
    protected startSpinVar: number = 0;
    protected endSpin: number = 0;
    protected endSpinVar: number = 0;
    protected emissionRate: number = 0;
    protected autoRemoveOnFinish: boolean = false;
    protected positionType: PositionType = PositionType.FREE;
    protected _particles: ParticleType[] = [];
    protected _totalParticles: number = 0;
    protected _plistFile: string = "";
    protected _texture: any = null;
    // protected _sourcePosition: P = cc.p();
    protected _posVar: P = cc.p();
    protected _startColor: C = cc.color(255, 255, 255, 255);
    protected _startColorVar: C = cc.color(255, 255, 255, 255);
    protected _endColorVar: C = cc.color(255, 255, 255, 255);
    protected _endColor: C = cc.color(255, 255, 255, 255);
    protected _blendFunc: { src: number; dst: number; } = { src: cc.BLEND_SRC, dst: cc.BLEND_DST };
    protected _opacityModifyRGB: boolean = false;
    protected _isActive: boolean = false;
    protected _dontTint: boolean = false;
    protected _particleIdx: number = 0;
    protected _elapsed: number = 0;
    protected _emitCounter: number = 0;

    public abstract initWithFile(plistFile: string): boolean;
    public initWithDictionary(dictionary: any) {
        let ret = false;
        const valueForKey = cc.valueForKey;

        const maxParticles = Number(valueForKey("maxParticles", dictionary));
        // self, not super
        if (this.initWithTotalParticles(maxParticles)) {
            // angle
            this.angle = parseFloat(valueForKey("angle", dictionary));
            this.angleVar = parseFloat(valueForKey("angleVariance", dictionary));

            // duration
            this.duration = parseFloat(valueForKey("duration", dictionary));

            // blend function
            this._blendFunc.src = Number(valueForKey("blendFuncSource", dictionary));
            this._blendFunc.dst = Number(valueForKey("blendFuncDestination", dictionary));

            // color
            const locStartColor = this._startColor;
            locStartColor.r = parseFloat(valueForKey("startColorRed", dictionary)) * 255;
            locStartColor.g = parseFloat(valueForKey("startColorGreen", dictionary)) * 255;
            locStartColor.b = parseFloat(valueForKey("startColorBlue", dictionary)) * 255;
            locStartColor.a = parseFloat(valueForKey("startColorAlpha", dictionary)) * 255;

            const locStartColorVar = this._startColorVar;
            locStartColorVar.r = parseFloat(valueForKey("startColorVarianceRed", dictionary)) * 255;
            locStartColorVar.g = parseFloat(valueForKey("startColorVarianceGreen", dictionary)) * 255;
            locStartColorVar.b = parseFloat(valueForKey("startColorVarianceBlue", dictionary)) * 255;
            locStartColorVar.a = parseFloat(valueForKey("startColorVarianceAlpha", dictionary)) * 255;

            const locEndColor = this._endColor;
            locEndColor.r = parseFloat(valueForKey("finishColorRed", dictionary)) * 255;
            locEndColor.g = parseFloat(valueForKey("finishColorGreen", dictionary)) * 255;
            locEndColor.b = parseFloat(valueForKey("finishColorBlue", dictionary)) * 255;
            locEndColor.a = parseFloat(valueForKey("finishColorAlpha", dictionary)) * 255;

            const locEndColorVar = this._endColorVar;
            locEndColorVar.r = parseFloat(valueForKey("finishColorVarianceRed", dictionary)) * 255;
            locEndColorVar.g = parseFloat(valueForKey("finishColorVarianceGreen", dictionary)) * 255;
            locEndColorVar.b = parseFloat(valueForKey("finishColorVarianceBlue", dictionary)) * 255;
            locEndColorVar.a = parseFloat(valueForKey("finishColorVarianceAlpha", dictionary)) * 255;

            // particle size
            this.startSize = parseFloat(valueForKey("startParticleSize", dictionary));
            this.startSizeVar = parseFloat(valueForKey("startParticleSizeVariance", dictionary));
            this.endSize = parseFloat(valueForKey("finishParticleSize", dictionary));
            this.endSizeVar = parseFloat(valueForKey("finishParticleSizeVariance", dictionary));

            // position, ignore sourcePosition
            // this.setPosition(parseFloat(valueForKey("sourcePositionx", dictionary)), parseFloat(valueForKey("sourcePositiony", dictionary)));
            // this.SourcePosition.x = parseFloat(valueForKey("sourcePositionx", dictionary));
            // this.SourcePosition.y = parseFloat(valueForKey("sourcePositiony", dictionary));
            this._posVar.x = parseFloat(valueForKey("sourcePositionVariancex", dictionary));
            this._posVar.y = parseFloat(valueForKey("sourcePositionVariancey", dictionary));

            // Spinning
            this.startSpin = parseFloat(valueForKey("rotationStart", dictionary));
            this.startSpinVar = parseFloat(valueForKey("rotationStartVariance", dictionary));
            this.endSpin = parseFloat(valueForKey("rotationEnd", dictionary));
            this.endSpinVar = parseFloat(valueForKey("rotationEndVariance", dictionary));

            this.emitterMode = Number(valueForKey("emitterType", dictionary));

            // Mode A: Gravity + tangential acc + radial acc
            if (this.emitterMode === EmitterMode.GRAVITY) {
                const locModeA = this.modeA;
                // gravity
                locModeA.gravity.x = parseFloat(valueForKey("gravityx", dictionary));
                locModeA.gravity.y = parseFloat(valueForKey("gravityy", dictionary));

                // speed
                locModeA.speed = parseFloat(valueForKey("speed", dictionary));
                locModeA.speedVar = parseFloat(valueForKey("speedVariance", dictionary));

                // radial acceleration
                let pszTmp = valueForKey("radialAcceleration", dictionary);
                locModeA.radialAcc = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = valueForKey("radialAccelVariance", dictionary);
                locModeA.radialAccVar = (pszTmp) ? parseFloat(pszTmp) : 0;

                // tangential acceleration
                pszTmp = valueForKey("tangentialAcceleration", dictionary);
                locModeA.tangentialAcc = (pszTmp) ? parseFloat(pszTmp) : 0;

                pszTmp = valueForKey("tangentialAccelVariance", dictionary);
                locModeA.tangentialAccVar = (pszTmp) ? parseFloat(pszTmp) : 0;

                // rotation is dir
                let locRotationIsDir = valueForKey("rotationIsDir", dictionary);
                if (locRotationIsDir !== null) {
                    locRotationIsDir = locRotationIsDir.toString().toLowerCase();
                    locModeA.rotationIsDir = (locRotationIsDir === "true" || locRotationIsDir === "1");
                } else {
                    locModeA.rotationIsDir = false;
                }
            } else if (this.emitterMode === EmitterMode.RADIUS) {
                // or Mode B: radius movement
                const locModeB = this.modeB;
                locModeB.startRadius = parseFloat(valueForKey("maxRadius", dictionary));
                locModeB.startRadiusVar = parseFloat(valueForKey("maxRadiusVariance", dictionary));
                locModeB.endRadius = parseFloat(valueForKey("minRadius", dictionary));
                locModeB.endRadiusVar = 0;
                locModeB.rotatePerSecond = parseFloat(valueForKey("rotatePerSecond", dictionary));
                locModeB.rotatePerSecondVar = parseFloat(valueForKey("rotatePerSecondVariance", dictionary));
            } else {
                console.log("ParticleSystem.initWithDictionary(): Invalid emitterType in config file");
                return false;
            }

            // life span
            this.life = parseFloat(valueForKey("particleLifespan", dictionary));
            this.lifeVar = parseFloat(valueForKey("particleLifespanVariance", dictionary));

            // emission Rate
            this.emissionRate = this._totalParticles / this.life;
            ret = true;
        }
        return ret;
    }
    /** Initializes a system with a fixed number of particles */
    public initWithTotalParticles(numberOfParticles: number) {
        this._totalParticles = numberOfParticles;

        let i;
        const locParticles = this._particles;
        locParticles.length = 0;
        for (i = 0; i < numberOfParticles; i++) {
            locParticles[i] = new Particle() as ParticleType;
        }

        if (!locParticles) {
            console.log("Particle system: not enough memory");
            return false;
        }

        // default, active
        this._isActive = true;

        // default blend function
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // default movement type;
        this.positionType = PositionType.FREE;

        // by default be in mode A:
        this.emitterMode = EmitterMode.GRAVITY;

        // default: modulate
        // XXX: not used
        //  colorModulate = YES;
        this.autoRemoveOnFinish = false;
        return true;
    }

    /** Add a particle to the emitter */
    public addParticle() {
        if (this.isFull()) {
            return false;
        }

        const particle = this.findFirstDeadParticle();
        this.initParticle(particle);
        ++this.particleCount;
        return true;
    }
    public abstract initParticle(particle: ParticleType): void;
    public abstract update(dt: number): void;

    /** Stop emitting particles. Running particles will continue to run until they die */
    public stopSystem() {
        this._isActive = false;
        this._elapsed = this.duration;
        this._emitCounter = 0;
    }
    /** Kill all living particles */
    public resetSystem() {
        this._isActive = true;
        this._elapsed = 0;
        const locParticles = this._particles;
        for (this._particleIdx = 0; this._particleIdx < this.particleCount; ++this._particleIdx) {
            locParticles[this._particleIdx].timeToLive = 0;
        }
    }

    public isFull() {
        return this.particleCount >= this._totalParticles;
    }

    /**
     * * This is a hack function for performance, it's only available on Canvas mode.
     * * It's very expensive to change color on Canvas mode, so if set it to true, particle system will ignore the changing color operation.
     */
    public set IgnoreColor(ignore: boolean) {
        this._dontTint = ignore;
    }

    public get IsActive() {
        return this._isActive;
    }

    /** Quantity of particles that are being simulated at the moment */
    public get ParticleCount() {
        return this.particleCount;
    }
    public set ParticleCount(particleCount) {
        this.particleCount = particleCount;
    }

    /** How many seconds the emitter wil run. -1 means 'forever' */
    public get Duration() {
        return this.duration;
    }
    public set Duration(duration) {
        this.duration = duration;
    }

    // public get SourcePosition() {
    //     return this._sourcePosition;
    // }
    // public set SourcePosition(sourcePosition) {
    //     this._sourcePosition.x = sourcePosition.x;
    //     this._sourcePosition.y = sourcePosition.y;
    // }
    public get PosVar() {
        return this._posVar;
    }
    public set PosVar(posVar) {
        this._posVar.x = posVar.x;
        this._posVar.y = posVar.y;
    }

    /** Life of each particle */
    public get Life() {
        return this.life;
    }
    public set Life(life) {
        this.life = life;
    }
    public get LifeVar() {
        return this.lifeVar;
    }
    public set LifeVar(lifeVar) {
        this.lifeVar = lifeVar;
    }

    public get Angle() {
        return this.angle;
    }
    public set Angle(angle) {
        this.angle = angle;
    }
    public get AngleVar() {
        return this.angleVar;
    }
    public set AngleVar(angleVar) {
        this.angleVar = angleVar;
    }

    /** Start size in pixels of each particle */
    public get StartSize() {
        return this.startSize;
    }
    public set StartSize(startSize) {
        this.startSize = startSize;
    }
    public get StartSizeVar() {
        return this.startSizeVar;
    }
    public set StartSizeVar(startSizeVar) {
        this.startSizeVar = startSizeVar;
    }
    public get EndSize() {
        return this.endSize;
    }
    public set EndSize(endSize) {
        this.endSize = endSize;
    }
    public get EndSizeVar() {
        return this.endSizeVar;
    }
    public set EndSizeVar(endSizeVar) {
        this.endSizeVar = endSizeVar;
    }

    public get StartColor() {
        return this._startColor;
    }
    public set StartColor(startColor) {
        this._startColor.r = startColor.r;
        this._startColor.g = startColor.g;
        this._startColor.b = startColor.b;
        this._startColor.a = startColor.a;
    }
    public get StartColorVar() {
        return this._startColorVar;
    }
    public set StartColorVar(startColorVar) {
        this._startColorVar.r = startColorVar.r;
        this._startColorVar.g = startColorVar.g;
        this._startColorVar.b = startColorVar.b;
        this._startColorVar.a = startColorVar.a;
    }
    public get EndColor() {
        return this._endColor;
    }
    public set EndColor(endColor) {
        this._endColor.r = endColor.r;
        this._endColor.g = endColor.g;
        this._endColor.b = endColor.b;
        this._endColor.a = endColor.a;
    }
    public get EndColorVar() {
        return this._endColorVar;
    }
    public set EndColorVar(endColorVar) {
        this._endColorVar.r = endColorVar.r;
        this._endColorVar.g = endColorVar.g;
        this._endColorVar.b = endColorVar.b;
        this._endColorVar.a = endColorVar.a;
    }

    /** initial angle of each particle */
    public get StartSpin() {
        return this.startSpin;
    }
    public set StartSpin(startSpin) {
        this.startSpin = startSpin;
    }
    public get StartSpinVar() {
        return this.startSpinVar;
    }
    public set StartSpinVar(startSpinVar) {
        this.startSpinVar = startSpinVar;
    }
    public get EndSpin() {
        return this.endSpin;
    }
    public set EndSpin(endSpin) {
        this.endSpin = endSpin;
    }
    public get EndSpinVar() {
        return this.endSpinVar;
    }
    public set EndSpinVar(endSpinVar) {
        this.endSpinVar = endSpinVar;
    }

    public get EmissionRate() {
        return this.emissionRate;
    }
    public set EmissionRate(emissionRate) {
        this.emissionRate = emissionRate;
    }

    /** Maximum particles of the system */
    public get TotalParticles() {
        return this._totalParticles;
    }
    public set TotalParticles(tp) {
        this._totalParticles = tp;
    }

    public abstract get Texture();
    public abstract set Texture(texture: any);

    public get BlendFunc() {
        return this._blendFunc;
    }
    public set BlendFunc({ src, dst }) {
        if (dst === undefined) {
            if (this._blendFunc.src !== src) {
                this._blendFunc = { src, dst: src };
                this._updateBlendFunc();
            }
        } else {
            if (this._blendFunc.src !== src || this._blendFunc.dst !== dst) {
                this._blendFunc = { src, dst };
                this._updateBlendFunc();
            }
        }
    }

    /** Does the alpha value modify color */
    public get OpacityModifyRGB() {
        return this._opacityModifyRGB;
    }
    public set OpacityModifyRGB(newValue) {
        this._opacityModifyRGB = newValue;
    }

    /**
     * * whether or not the particles are using blend additive.
     * * If enabled, the following blending function will be used.
     * @example
     *    source blend function = GL_SRC_ALPHA;
     *    dest blend function = GL_ONE;
     */
    public isBlendAdditive() {
        return ((this._blendFunc.src === cc.SRC_ALPHA && this._blendFunc.dst === cc.ONE) || (this._blendFunc.src === cc.ONE && this._blendFunc.dst === cc.ONE));
    }
    public abstract setBlendAdditive(isBlendAdditive: boolean): void;

    /** Particles movement type: Free or Grouped */
    public get PositionType() {
        return this.positionType;
    }
    public set PositionType(positionType) {
        this.positionType = positionType;
    }

    /**
     * * whether or not the node will be auto-removed when it has no particles left.
     * * By default it is false.
     */
    public get AutoRemoveOnFinish() {
        return this.autoRemoveOnFinish;
    }
    public set AutoRemoveOnFinish(isAutoRemoveOnFinish) {
        this.autoRemoveOnFinish = isAutoRemoveOnFinish;
    }

    public get EmitterMode() {
        return this.emitterMode;
    }
    public set EmitterMode(emitterMode) {
        this.emitterMode = emitterMode;
    }

    // mode A
    public get Gravity() {
        this.checkGravityMode();
        return this.modeA.gravity;
    }
    public set Gravity(gravity) {
        this.checkGravityMode();
        this.modeA.gravity = gravity;
    }

    public get Speed() {
        this.checkGravityMode();
        return this.modeA.speed;
    }
    public set Speed(speed) {
        this.checkGravityMode();
        this.modeA.speed = speed;
    }
    public get SpeedVar() {
        this.checkGravityMode();
        return this.modeA.speedVar;
    }
    public set SpeedVar(speedVar) {
        this.checkGravityMode();
        this.modeA.speedVar = speedVar;
    }

    public get TangentialAcc() {
        this.checkGravityMode();
        return this.modeA.tangentialAcc;
    }
    public set TangentialAcc(tangentialAcc) {
        this.checkGravityMode();
        this.modeA.tangentialAcc = tangentialAcc;
    }

    public get TangentialAccVar() {
        this.checkGravityMode();
        return this.modeA.tangentialAccVar;
    }
    public set TangentialAccVar(tangentialAccVar) {
        this.checkGravityMode();
        this.modeA.tangentialAccVar = tangentialAccVar;
    }

    public get RadialAcc() {
        this.checkGravityMode();
        return this.modeA.radialAcc;
    }
    public set RadialAcc(radialAcc) {
        this.checkGravityMode();
        this.modeA.radialAcc = radialAcc;
    }
    public get RadialAccVar() {
        this.checkGravityMode();
        return this.modeA.radialAccVar;
    }
    public set RadialAccVar(radialAccVar) {
        this.checkGravityMode();
        this.modeA.radialAccVar = radialAccVar;
    }

    public get RotationIsDir() {
        this.checkGravityMode();
        return this.modeA.rotationIsDir;
    }
    public set RotationIsDir(rotationIsDir) {
        this.checkGravityMode();
        this.modeA.rotationIsDir = rotationIsDir;
    }

    // mode B
    public get StartRadius() {
        this.checkRadiusMode();
        return this.modeB.startRadius;
    }
    public set StartRadius(startRadius) {
        this.checkRadiusMode();
        this.modeB.startRadius = startRadius;
    }
    public get StartRadiusVar() {
        this.checkRadiusMode();
        return this.modeB.startRadiusVar;
    }
    public set StartRadiusVar(startRadiusVar) {
        this.checkRadiusMode();
        this.modeB.startRadiusVar = startRadiusVar;
    }

    public get EndRadius() {
        this.checkRadiusMode();
        return this.modeB.endRadius;
    }
    public set EndRadius(endRadius) {
        this.checkRadiusMode();
        this.modeB.endRadius = endRadius;
    }
    public get EndRadiusVar() {
        this.checkRadiusMode();
        return this.modeB.endRadiusVar;
    }
    public set EndRadiusVar(endRadiusVar) {
        this.checkRadiusMode();
        this.modeB.endRadiusVar = endRadiusVar;
    }

    public get RotatePerSecond() {
        this.checkRadiusMode();
        return this.modeB.rotatePerSecond;
    }
    public set RotatePerSecond(rotatePerSecond) {
        this.checkRadiusMode();
        this.modeB.rotatePerSecond = rotatePerSecond;
    }
    public get RotatePerSecondVar() {
        this.checkRadiusMode();
        return this.modeB.rotatePerSecondVar;
    }
    public set RotatePerSecondVar(rotatePerSecondVar) {
        this.checkRadiusMode();
        this.modeB.rotatePerSecondVar = rotatePerSecondVar;
    }

    protected abstract _updateBlendFunc(): any;

    protected findFirstDeadParticle(): ParticleType {
        for (const p of this._particles) {
            if (p.timeToLive <= 0) {
                return p;
            }
        }
    }

    private checkGravityMode() {
        if (this.emitterMode !== EmitterMode.GRAVITY) {
            console.log("Particle Mode should be Gravity");
        }
    }
    private checkRadiusMode() {
        if (this.emitterMode !== EmitterMode.RADIUS) {
            console.log("Particle Mode should be Radius");
        }
    }
}
