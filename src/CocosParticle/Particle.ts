import * as cc from "./cocosLib";
import { P, C, S } from "./cocosLib";

export default class Particle {
    /**
     * Array of Point instances used to optimize particle updates
     */
    public static temporaryPoints: P[] = [cc.p(), cc.p(), cc.p(), cc.p()];
    public pos: P;
    public startPos: P;
    public color: C;
    public deltaColor: C;
    public size: S;
    public deltaSize: S;
    public rotation: number;
    public deltaRotation: number;
    public timeToLive: number;
    // public atlasIndex: number;
    public modeA: ParticleModeA;
    public modeB: ParticleModeB;
    public isChangeColor: boolean;
    public drawPos: P;
    constructor(pos?: P, startPos?: P, color?: C, deltaColor?: C, size?: S, deltaSize?: S, rotation?: number, deltaRotation?: number, timeToLive?: number, atlasIndex?: number, modeA?: ParticleModeA, modeB?: ParticleModeB) {
        this.pos = pos ? pos : cc.p(0, 0);
        this.startPos = startPos ? startPos : cc.p(0, 0);
        this.color = color ? color : { r: 0, g: 0, b: 0, a: 255 };
        this.deltaColor = deltaColor ? deltaColor : { r: 0, g: 0, b: 0, a: 255 };
        this.size = size || cc.size();
        this.deltaSize = deltaSize || cc.size();
        this.rotation = rotation || 0;
        this.deltaRotation = deltaRotation || 0;
        this.timeToLive = timeToLive || 0;
        // this.atlasIndex = atlasIndex || 0;
        this.modeA = modeA ? modeA : new ParticleModeA();
        this.modeB = modeB ? modeB : new ParticleModeB();
        this.isChangeColor = false;
        this.drawPos = cc.p(0, 0);
    }
}
class ParticleModeA {
    public dir: P;
    public radialAcc: number;
    public tangentialAcc: number;
    constructor(dir?: P, radialAcc?: number, tangentialAcc?: number) {
        this.dir = dir ? dir : cc.p(0, 0);
        this.radialAcc = radialAcc || 0;
        this.tangentialAcc = tangentialAcc || 0;
    }
}
class ParticleModeB {
    public angle: number;
    public degreesPerSecond: number;
    public radius: number;
    public deltaRadius: number;
    constructor(angle?: number, degreesPerSecond?: number, radius?: number, deltaRadius?: number) {
        this.angle = angle || 0;
        this.degreesPerSecond = degreesPerSecond || 0;
        this.radius = radius || 0;
        this.deltaRadius = deltaRadius || 0;
    }
}
