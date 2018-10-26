import ParticleSystem, { EmitterMode, ParticleSystemModeA, ParticleSystemModeB, PositionType } from "./ParticleSystem";
import * as cc from "./cocosLib";
import Particle from "./Particle";
import PlistDocParser from "./PlistDocParser";

class PhaserCocosParticle extends Particle {
    public image: Phaser.Image;
    public originWidth: number;
    public originHeight: number;
}

export default class PhaserCocosEmitter extends ParticleSystem<PhaserCocosParticle> {
    private static plistDocParser: PlistDocParser = new PlistDocParser();
    public game: Phaser.Game;
    public position: Phaser.Point;
    private _visible: boolean = true;
    private _timeTween: Phaser.Tween;
    private _preTime: number = 0;

    constructor(game: Phaser.Game, plistFileKey: string, imageKey: string, x: number = 0, y: number = 0) {
        super();
        this.game = game;
        this.position = new Phaser.Point(x, y);
        this.initWithFile(plistFileKey);
        this.Texture = imageKey;
        this.Stop();
    }
    public initWithFile(plistFileKey: string): boolean {
        this._plistFile = plistFileKey;
        const dict = PhaserCocosEmitter.plistDocParser.parse(this.game.cache.getXML(plistFileKey));
        if (!dict) {
            console.log("ParticleSystem.initWithFile(): Particles: file not found");
            return false;
        }
        return this.initWithDictionary(dict);
    }
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
                locModeA.gravity.y = -parseFloat(valueForKey("gravityy", dictionary));  // for phaser

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
    public initWithTotalParticles(numberOfParticles: number) {
        this._totalParticles = numberOfParticles;

        let i;
        const locParticles = this._particles;
        locParticles.length = 0;
        for (i = 0; i < numberOfParticles; i++) {
            locParticles[i] = new PhaserCocosParticle();
        }

        if (!locParticles) {
            console.log("Particle system: not enough memory");
            return false;
        }

        // default, active
        this._isActive = false;

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
    public initParticle(particle: PhaserCocosParticle): void {
        const randomMinus1To1 = cc.randomMinus1To1;
        // timeToLive
        // no negative life. prevent division by 0
        particle.timeToLive = this.life + this.lifeVar * randomMinus1To1();
        particle.timeToLive = Math.max(0, particle.timeToLive);

        // position
        particle.pos.x = this.position.x + this._posVar.x * randomMinus1To1();
        particle.pos.y = this.position.y + this._posVar.y * randomMinus1To1();

        // Color
        let start;
        let end;
        const locStartColor = this._startColor;
        const locStartColorVar = this._startColorVar;
        const locEndColor = this._endColor;
        const locEndColorVar = this._endColorVar;
        start = {
            r: cc.clampf(locStartColor.r + locStartColorVar.r * randomMinus1To1(), 0, 255),
            g: cc.clampf(locStartColor.g + locStartColorVar.g * randomMinus1To1(), 0, 255),
            b: cc.clampf(locStartColor.b + locStartColorVar.b * randomMinus1To1(), 0, 255),
            a: cc.clampf(locStartColor.a + locStartColorVar.a * randomMinus1To1(), 0, 255),
        };
        end = {
            r: cc.clampf(locEndColor.r + locEndColorVar.r * randomMinus1To1(), 0, 255),
            g: cc.clampf(locEndColor.g + locEndColorVar.g * randomMinus1To1(), 0, 255),
            b: cc.clampf(locEndColor.b + locEndColorVar.b * randomMinus1To1(), 0, 255),
            a: cc.clampf(locEndColor.a + locEndColorVar.a * randomMinus1To1(), 0, 255),
        };

        particle.color = start;
        const locParticleDeltaColor = particle.deltaColor;
        const locParticleTimeToLive = particle.timeToLive;
        locParticleDeltaColor.r = (end.r - start.r) / locParticleTimeToLive;
        locParticleDeltaColor.g = (end.g - start.g) / locParticleTimeToLive;
        locParticleDeltaColor.b = (end.b - start.b) / locParticleTimeToLive;
        locParticleDeltaColor.a = (end.a - start.a) / locParticleTimeToLive;

        // size
        let startS = this.startSize + this.startSizeVar * randomMinus1To1();
        startS = Math.max(0, startS); // No negative value

        particle.size = cc.size(startS, startS);
        if (this.endSize === ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE) {
            particle.deltaSize = cc.size();
        } else {
            let endS = this.endSize + this.endSizeVar * randomMinus1To1();
            endS = Math.max(0, endS); // No negative values
            const tempSize = (endS - startS) / locParticleTimeToLive;
            particle.deltaSize = cc.size(tempSize, tempSize);
        }

        // rotation
        const startA = this.startSpin + this.startSpinVar * randomMinus1To1();
        const endA = this.endSpin + this.endSpinVar * randomMinus1To1();
        particle.rotation = startA;
        particle.deltaRotation = (endA - startA) / locParticleTimeToLive;

        // position, this emitter has no parent
        if (this.positionType === PositionType.FREE) {
            particle.startPos.x = this.position.x;
            particle.startPos.y = this.position.y;
        } else if (this.positionType === PositionType.RELATIVE) {
            particle.startPos.x = this.position.x;
            particle.startPos.y = this.position.y;
        }

        // direction
        const a = cc.degreesToRadians(this.angle + this.angleVar * randomMinus1To1());

        // Mode Gravity: A
        if (this.emitterMode === EmitterMode.GRAVITY) {
            const locModeA = this.modeA;
            const locParticleModeA = particle.modeA;
            const s = locModeA.speed + locModeA.speedVar * randomMinus1To1();

            // direction
            locParticleModeA.dir.x = Math.cos(a);
            locParticleModeA.dir.y = Math.sin(a);
            cc.pMultIn(locParticleModeA.dir, s);

            // radial acc
            locParticleModeA.radialAcc = locModeA.radialAcc + locModeA.radialAccVar * randomMinus1To1();

            // tangential acc
            locParticleModeA.tangentialAcc = locModeA.tangentialAcc + locModeA.tangentialAccVar * randomMinus1To1();

            // rotation is dir
            if (locModeA.rotationIsDir) {
                particle.rotation = -cc.radiansToDegrees(cc.pToAngle(locParticleModeA.dir));
            }
        } else {
            // Mode Radius: B
            const locModeB = this.modeB;
            const locParticleModeB = particle.modeB;

            // Set the default diameter of the particle from the source position
            const startRadius = locModeB.startRadius + locModeB.startRadiusVar * randomMinus1To1();
            const endRadius = locModeB.endRadius + locModeB.endRadiusVar * randomMinus1To1();

            locParticleModeB.radius = startRadius;
            locParticleModeB.deltaRadius = (locModeB.endRadius === ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS) ? 0 : (endRadius - startRadius) / locParticleTimeToLive;

            locParticleModeB.angle = a;
            locParticleModeB.degreesPerSecond = cc.degreesToRadians(locModeB.rotatePerSecond + locModeB.rotatePerSecondVar * randomMinus1To1());
        }

        particle.image.visible = true;
    }

    public update(dt: number) {
        if (this._isActive && this.emissionRate) {
            const rate = 1.0 / this.emissionRate;
            // issue #1201, prevent bursts of particles, due to too high emitCounter
            if (this.particleCount < this._totalParticles) {
                this._emitCounter += dt;
            }

            while ((this.particleCount < this._totalParticles) && (this._emitCounter > rate)) {
                this.addParticle();
                this._emitCounter -= rate;
            }

            this._elapsed += dt;
            if (this.duration !== -1 && this.duration < this._elapsed) {
                this.stopSystem();
            }
        }
        this._particleIdx = 0;

        const currentPosition = Particle.temporaryPoints[0];
        if (this.positionType === PositionType.FREE) {
            currentPosition.x = this.position.x;
            currentPosition.y = this.position.y;
        } else if (this.positionType === PositionType.RELATIVE) {
            currentPosition.x = this.position.x;
            currentPosition.y = this.position.y;
        }

        if (this._visible) {
            // Used to reduce memory allocation / creation within the loop
            const tpa = Particle.temporaryPoints[1];
            const tpb = Particle.temporaryPoints[2];
            const tpc = Particle.temporaryPoints[3];

            const locParticles = this._particles;
            while (this._particleIdx < this.particleCount) {

                // Reset the working particles
                cc.pZeroIn(tpa);
                cc.pZeroIn(tpb);
                cc.pZeroIn(tpc);

                const selParticle = locParticles[this._particleIdx];

                // life
                selParticle.timeToLive -= dt;

                if (selParticle.timeToLive > 0) {
                    // Mode A: gravity, direction, tangential acc & radial acc
                    if (this.emitterMode === EmitterMode.GRAVITY) {

                        const tmp = tpc;
                        const radial = tpa;
                        const tangential = tpb;

                        // radial acceleration
                        if (selParticle.pos.x || selParticle.pos.y) {
                            cc.pIn(radial, selParticle.pos);
                            cc.pNormalizeIn(radial);
                        } else {
                            cc.pZeroIn(radial);
                        }

                        cc.pIn(tangential, radial);
                        cc.pMultIn(radial, selParticle.modeA.radialAcc);

                        // tangential acceleration
                        const newy = tangential.x;
                        tangential.x = -tangential.y;
                        tangential.y = newy;

                        cc.pMultIn(tangential, selParticle.modeA.tangentialAcc);

                        cc.pIn(tmp, radial);
                        cc.pAddIn(tmp, tangential);
                        cc.pAddIn(tmp, this.modeA.gravity);
                        cc.pMultIn(tmp, dt);
                        cc.pAddIn(selParticle.modeA.dir, tmp);

                        cc.pIn(tmp, selParticle.modeA.dir);
                        cc.pMultIn(tmp, dt);
                        cc.pAddIn(selParticle.pos, tmp);
                    } else {
                        // Mode B: radius movement
                        const selModeB = selParticle.modeB;
                        // Update the angle and radius of the particle.
                        selModeB.angle += selModeB.degreesPerSecond * dt;
                        selModeB.radius += selModeB.deltaRadius * dt;

                        selParticle.pos.x = -Math.cos(selModeB.angle) * selModeB.radius;
                        selParticle.pos.y = -Math.sin(selModeB.angle) * selModeB.radius;
                    }

                    // color
                    // this._renderCmd._updateDeltaColor(selParticle, dt);
                    selParticle.color.r += selParticle.deltaColor.r * dt;
                    selParticle.color.g += selParticle.deltaColor.g * dt;
                    selParticle.color.b += selParticle.deltaColor.b * dt;
                    selParticle.color.a += selParticle.deltaColor.a * dt;

                    selParticle.image.tint = Phaser.Color.RGBArrayToHex([selParticle.color.r / 255, selParticle.color.g / 255, selParticle.color.b / 255]);
                    selParticle.image.alpha = selParticle.color.a;

                    selParticle.image.blendMode = this.isBlendAdditive() ? PIXI.blendModes.ADD : PIXI.blendModes.NORMAL;

                    // size
                    selParticle.size.width += selParticle.deltaSize.width * dt;
                    selParticle.size.height += selParticle.deltaSize.height * dt;
                    selParticle.size.width = Math.max(0, selParticle.size.width);
                    selParticle.size.height = Math.max(0, selParticle.size.height);

                    const w = selParticle.originWidth;
                    const h = selParticle.originHeight;
                    selParticle.image.scale.set(selParticle.size.width / w, selParticle.size.height / h);

                    // angle
                    selParticle.rotation += (selParticle.deltaRotation * dt);
                    selParticle.image.rotation = cc.degreesToRadians(selParticle.rotation);

                    //
                    // update values in quad
                    //
                    const newPos = tpa;
                    if (this.positionType === PositionType.FREE || this.positionType === PositionType.RELATIVE) {
                        const diff = tpb;
                        cc.pIn(diff, currentPosition);
                        cc.pSubIn(diff, selParticle.startPos);

                        cc.pIn(newPos, selParticle.pos);
                        cc.pSubIn(newPos, diff);
                    } else {
                        cc.pIn(newPos, selParticle.pos);
                    }

                    // translate newPos to correct position, since matrix transform isn't performed in batch node
                    // don't update the particle with the new position information, it will interfere with the radius and tangential calculations
                    // if (this._batchNode) {
                    // newPos.x += this.position.x;
                    // newPos.y += this.position.y;
                    // }
                    // this._renderCmd.updateParticlePosition(selParticle, newPos);
                    selParticle.image.position.set(newPos.x, newPos.y);

                    // update particle counter
                    ++this._particleIdx;
                } else {
                    // life <= 0
                    // const currentIndex = selParticle.atlasIndex;
                    if (this._particleIdx !== this.particleCount - 1) {
                        const deadParticle = locParticles[this._particleIdx];
                        locParticles[this._particleIdx] = locParticles[this.particleCount - 1];
                        locParticles[this.particleCount - 1] = deadParticle;
                        deadParticle.image.visible = false;
                    }
                    // if (this._batchNode) {
                    // disable the switched particle
                    // this._batchNode.disableParticle(this.atlasIndex + currentIndex);
                    // switch indexes
                    // locParticles[this.particleCount - 1].atlasIndex = currentIndex;
                    // }

                    --this.particleCount;
                    if (this.particleCount === 0 && this.autoRemoveOnFinish) {
                        // this.unscheduleUpdate();
                        // this._parent.removeChild(this, true);
                        this.stopSystem();
                        return;
                    }
                }
            }
            // this._transformSystemDirty = false;
        }

        // if (!this._batchNode) {
        //     this.postStep();
        // }
    }

    public setBlendAdditive(isBlendAdditive: boolean): void {
        const locBlendFunc = this._blendFunc;
        if (isBlendAdditive) {
            locBlendFunc.src = cc.SRC_ALPHA;
            locBlendFunc.dst = cc.ONE;
        } else { // I don't know
            locBlendFunc.src = cc.ONE;
            locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    }

    public Play() {
        this._isActive = true;
        this._elapsed = 0;
        const locParticles = this._particles;
        for (this._particleIdx = 0; this._particleIdx < this.particleCount; ++this._particleIdx) {
            locParticles[this._particleIdx].timeToLive = 0;
            locParticles[this._particleIdx].image.exists = true;
        }
        if (this._timeTween) {
            this._timeTween.stop();
        }
        this._timeTween = this.game.add.tween(this).to({ deltaTime: 1 }, 1000, undefined, true, 0, -1);
    }
    public Stop() {
        this.stopSystem();
        if (this._timeTween) {
            this._timeTween.stop();
        }
        this._preTime = 0;
        for (const p of this._particles) {
            p.image.exists = false;
            p.timeToLive = 0;
        }
    }

    public get Texture() {
        return this._texture;
    }
    public set Texture(textureKey: string) {
        this._texture = textureKey;
        for (const p of this._particles) {
            if (p.image) {
                p.image.key = textureKey;
            } else {
                p.image = this.game.add.image(0, 0, textureKey);
            }
            p.originWidth = p.image.width;
            p.originHeight = p.image.height;
            p.image.anchor.set(0.5, 0.5);
        }
    }

    protected _updateBlendFunc() {
        // throw new Error("Method not implemented.");
    }

    private get deltaTime() {
        return this._preTime;
    }
    private set deltaTime(curTime) {
        if (curTime > this._preTime) {
            this.update(curTime - this._preTime);
            this._preTime = curTime;
        } else if (curTime < this._preTime) {
            this.update(curTime + 1 - this._preTime);
            this._preTime = curTime;
        }
    }
}
