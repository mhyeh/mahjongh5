import Button from "../ui/Button";
import MultiThemeButton from "../ui/MultiThemeButton";
import Input from "../input/Input";
/**
 * 控制按鈕的Enable，Style與Input
 */
export default class UIController {
    private buttons: Button[] = [];
    private modes: ModeConfig[] = [];
    private input: Input;

    public get Input(): Input {
        if (!this.input) {
            this.input = new Input();
        }
        return this.input;
    }

    public ResetButton() {
        this.buttons = [];
    }

    public DisableAll() {
        for (const button of this.buttons) {
            if (button) {
                button.enable = false;
            }
        }
    }

    public EnableAll() {
        for (const button of this.buttons) {
            if (button) {
                button.enable = true;
            }
        }
    }

    public SetButton(button: Button, index: number) {
        this.buttons[index] = button;
    }

    public GetButton(index: number) {
        return this.buttons[index];
    }

    public SetMode(enable?: number[], disable?: number[], setStyle?: Array<[number, number]>): number {
        return this.modes.push({ enable: enable ? enable : [], disable: disable ? disable : [], setStyle: setStyle ? setStyle : [] }) - 1;
    }

    public SetUI(index: number) {
        for (const button of this.modes[index].disable) {
            if (this.buttons[button]) {
                this.buttons[button].enable = false;
            }
        }
        for (const button of this.modes[index].enable) {
            if (this.buttons[button]) {
                this.buttons[button].enable = true;
            }
        }
        for (const value of this.modes[index].setStyle) {
            const button = this.buttons[value[0]];
            if (button instanceof MultiThemeButton) {
                button.Style = value[1];
            }
        }
    }

    /**
     * 重新整理全部UI，應該由子類別實作
     */
    public Refresh() {

    }
}

interface ModeConfig {
    enable: number[];
    disable: number[];
    setStyle: Array<[number, number]>;
}
