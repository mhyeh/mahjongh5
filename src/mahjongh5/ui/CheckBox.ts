import { default as MultiThemeButton, ButtonFrame } from "./MultiThemeButton";
export enum Mode {
    Check = 0,
    Radio = 1,
}
export default class CheckBox extends MultiThemeButton {
    public static readonly Mode = Mode;
    private checked: boolean;
    private mode: Mode;
    private checkedChangeSingal: Phaser.Signal = new Phaser.Signal();
    /**
     * Checkbox or Radiobutton constructor
     * @param checkedFrames 選取時按下或停用的frames
     * @param uncheckedFrames 沒選取時按下或停用的frames
     */
    constructor(game: Phaser.Game, mode: Mode, x?: number, y?: number, key?: string, callback?: () => void, callbackContext?: any, checkedFrames?: ButtonFrame, uncheckedFrames?: ButtonFrame, group?: Phaser.Group) {
        super(game, x, y, key, callback, callbackContext, undefined, group);
        if (uncheckedFrames) {
            super.AddStyle(uncheckedFrames);
            super.Style = 0;
        }
        if (checkedFrames) {
            super.AddStyle(checkedFrames);
        }
        this.mode = mode;
        this.onInputUp.add(() => {
            if (this.mode === Mode.Radio && this.checked) {
                return;
            }
            if (this.checked) {
                this.Checked = false;
            } else {
                this.Checked = true;
            }
            this.checkedChangeSingal.dispatch(this.Checked);
        });
    }
    /**
     * 取得事件Signal
     */
    public get onCheckedChange() {
        return this.checkedChangeSingal;
    }
    /**
     * 當mode===radiobutton時，所在group中mode===radiobutton的按鈕都會取消勾選
     * @param value 勾選或取消勾選
     */
    public set Checked(value: boolean) {
        if (this.checked !== value) {
            this.checked = value;
            super.Style = value ? 1 : 0;
            if (this.mode === Mode.Radio && value) {
                for (const checkbox of this.parent.children) {
                    if (checkbox instanceof CheckBox && checkbox.checked && checkbox.mode === Mode.Radio && checkbox !== this) {
                        checkbox.Checked = false;
                    }
                }
            }
            this.checkedChangeSingal.dispatch(this.Checked);
        }
    }
    /**
     * 取得當下按鈕是否被勾選
     */
    public get Checked(): boolean {
        return this.checked;
    }

    public setCheckFrames(checkedFrames?: ButtonFrame, uncheckedFrames?: ButtonFrame): void {
        if (checkedFrames) {
            this.UpdateStyle(checkedFrames, 1);
        }
        if (uncheckedFrames) {
            this.UpdateStyle(uncheckedFrames, 0);
        }
    }
}
