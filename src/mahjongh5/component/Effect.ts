export default class Effect extends Phaser.Group {
    private static stopSymbol = Symbol();
    private stopResolve: ((value?: any) => void) | undefined;
    private playFinishSignal: Phaser.Signal;

    public get onPlayFinish(): Phaser.Signal {
        if (!this.playFinishSignal) {
            this.playFinishSignal = new Phaser.Signal();
        }
        return this.playFinishSignal;
    }

    public get isPlaying(): boolean {
        return !!this.stopResolve;
    }

    public async Play(...args: any[]) {
        if (this.isPlaying) {
            return;
        }
        const stopPromise = new Promise<symbol>((resolve) => this.stopResolve = resolve);
        const stopResolve = this.stopResolve;
        const iter = this.RunEffect(...args);
        for (let iterResult = iter.next(), awaitResult; !iterResult.done; iterResult = iter.next(awaitResult)) {
            // 無法預測step會回傳什麼，所以保險起見用symbol
            awaitResult = await Promise.race([iterResult.value, stopPromise]);
            if (awaitResult === Effect.stopSymbol) {
                break;
            }
        }
        // 如果stopResolve被修改過則不執行，例如呼叫ForceStop後
        if (this.stopResolve === stopResolve) {
            await this.EndEffect();
            this.stopResolve = undefined;
            if (this.playFinishSignal) {
                this.playFinishSignal.dispatch();
            }
        }
    }

    /**
     * 要求Effect停止，呼叫完後有可能不會馬上停止
     */
    public Stop() {
        if (this.stopResolve) {
            this.stopResolve(Effect.stopSymbol);
        }
    }

    /**
     * 等待Effect停止
     */
    public WaitStop(): Promise<void> {
        if (this.isPlaying) {
            return new Promise((resolve) => this.onPlayFinish.addOnce(resolve));
        } else {
            return Promise.resolve();
        }
    }

    /**
     * 要求Effect馬上停止，呼叫完後可直接再呼叫Play
     */
    public ForceStop(): void {
        if (this.isPlaying) {
            this.Stop();
            this.EndImmediate();
            this.stopResolve = undefined;
            if (this.playFinishSignal) {
                this.playFinishSignal.dispatch();
            }
        }
    }

    public destroy(destroyChildren?: boolean, soft?: boolean): void {
        this.ForceStop();
        super.destroy(destroyChildren, soft);
    }

    /** 呼叫Play後執行，須把await改成yield */
    protected *RunEffect(...args: any[]): IterableIterator<Promise<any>> {

    }

    /** 在RunEffect結束時執行，呼叫Stop之後也會執行 */
    protected async EndEffect(): Promise<void> {

    }

    /** 在要求立即停止時呼叫，如果沒有override就是直接呼叫EndEffect */
    protected EndImmediate(): void {
        this.EndEffect();
    }
}
