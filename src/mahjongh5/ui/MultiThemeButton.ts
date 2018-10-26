import Button from "./Button";
import { ButtonEvent, ButtonFrame, ButtonTint, ButtonSound } from "./Button";
export { ButtonEvent, ButtonFrame, ButtonTint, ButtonSound } from "./Button";

export default class MultiThemeButton extends Button {
    private styleEvents: ButtonEvent[] = [];
    private styleFrames: ButtonFrame[] = [];
    // private styleTints: ButtonSound[] = [];
    private styleSounds: ButtonSound[] = [];
    private styleIndex: number;
    private styleChangedSignal?: Phaser.Signal;
    constructor(game: Phaser.Game, x?: number, y?: number, key?: string, callback?: () => void, callbackContext?: any, buttonFrames?: ButtonFrame[], group?: Phaser.Group) {
        super(game, x, y, key, callback, callbackContext, undefined, undefined, undefined, undefined, undefined, group);
        if (buttonFrames && buttonFrames.length > 0) {
            this.styleFrames = buttonFrames;
            this.Style = 0;
            for (const i of buttonFrames) {
                this.styleEvents.push({ onInputDown: new Phaser.Signal(), onInputUp: new Phaser.Signal() });
            }
        }
        this.onInputDown.add(() => {
            this.styleEvents[this.styleIndex].onInputDown.dispatch();
            const buttonSound = this.styleSounds[this.styleIndex];
            if (buttonSound && buttonSound.downSound) {
                buttonSound.downSound.play();
            }
        });
        this.onInputUp.add(() => {
            this.styleEvents[this.styleIndex].onInputUp.dispatch();
            const buttonSound = this.styleSounds[this.styleIndex];
            if (buttonSound && buttonSound.upSound) {
                buttonSound.upSound.play();
            }
        });
    }

    public get style(): number {
        return this.styleIndex;
    }
    public set style(value: number) {
        if (value >= 0 && value < this.styleFrames.length && this.styleIndex !== value) {
            if (this.input.pointerDown()) {
                this.styleEvents[this.styleIndex].onInputUp.dispatch();
                this.styleEvents[value].onInputDown.dispatch();
            }
            this.styleIndex = value;
            this.setFrames(this.styleFrames[this.styleIndex]);
            if (this.styleChangedSignal) {
                this.styleChangedSignal.dispatch(this.styleIndex);
            }
        }
    }

    public get onStyleChanged(): Phaser.Signal {
        if (!this.styleChangedSignal) {
            this.styleChangedSignal = new Phaser.Signal();
        }
        return this.styleChangedSignal;
    }

    public GetStyleEvent(idx: number): ButtonEvent {
        return this.styleEvents[idx];
    }

    public get Style(): number {
        return this.style;
    }
    public set Style(value: number) {
        this.style = value;
    }

    public GetStyle(idx: number): ButtonFrame | undefined {
        if (idx >= 0 && idx < this.styleFrames.length) {
            return this.styleFrames[idx];
        }
        return undefined;
    }
    public AddStyle(buttonframe: ButtonFrame, idx?: number) {
        if (idx) {
            if (idx >= 0 && idx < this.styleFrames.length) {
                this.styleFrames.splice(idx, 0, buttonframe);
                this.styleEvents.splice(idx, 0, { onInputDown: new Phaser.Signal(), onInputUp: new Phaser.Signal() });
            }
        } else {
            this.styleFrames.push(buttonframe);
            this.styleEvents.push({ onInputDown: new Phaser.Signal(), onInputUp: new Phaser.Signal() });
        }
    }
    public UpdateStyle(buttonframe: ButtonFrame, idx: number) {
        if (idx >= 0 && idx < this.styleFrames.length) {
            this.styleFrames[idx].disableFrame = buttonframe.disableFrame;
            this.styleFrames[idx].downFrame = buttonframe.downFrame;
            this.styleFrames[idx].outFrame = buttonframe.outFrame;
            this.styleFrames[idx].overFrame = buttonframe.overFrame;
            this.styleFrames[idx].upFrame = buttonframe.upFrame;
            if (this.styleIndex === idx) {
                this.setFrames(this.styleFrames[this.styleIndex]);
            }
        }
    }
    public DeleteStyle(idx: number) {
        if (idx >= 0 && idx < this.styleFrames.length) {
            this.styleFrames.splice(idx, 1);
        }
    }

    public setDownSound(sound: Phaser.Sound, marker?: string, index?: number): void {
        if (index === undefined) {
            super.setDownSound(sound, marker);
        } else {
            this.styleSounds[index] = this.styleSounds[index] || {};
            this.styleSounds[index].downSound = sound;
        }
    }

    public setUpSound(sound: Phaser.Sound, marker?: string, index?: number): void {
        if (index === undefined) {
            super.setUpSound(sound, marker);
        } else {
            this.styleSounds[index] = this.styleSounds[index] || {};
            this.styleSounds[index].upSound = sound;
        }
    }
}
