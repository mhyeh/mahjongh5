import Effect from "../../mahjongh5/component/Effect";
import { Delay } from "../../mahjongh5/System";
export default class RepeatEffect extends Effect {
    public onStartCallback: () => number;
    public onRepeatCallback: (repeatCount: number) => number;
    public onFinishCallback: (repeatCount: number) => void;
    private repeatCount: number;

    protected *RunEffect(): IterableIterator<Promise<void>> {
        this.repeatCount = -1;
        let delay = this.onStartCallback ? this.onStartCallback() : 0;
        while (delay > 0) {
            yield Delay(delay);
            delay = this.onRepeatCallback ? this.onRepeatCallback(++this.repeatCount) : -1;
        }
    }

    protected async EndEffect(): Promise<void> {
        if (this.onFinishCallback) {
            this.onFinishCallback(this.repeatCount);
        }
    }
}
