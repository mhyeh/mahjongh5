import State from "./../State";
export default class LoadState extends State {
    public loadQueue: Loadable[] = [];
    public parallel: boolean = false;
    public separateProgress: boolean = false;
    public loadMessage: string = "Loading";

    private loadingProgress: number = 0;
    private progressChangedSignal?: Phaser.Signal;
    private taskErrorSignal?: Phaser.Signal;
    private taskCompleteSignal?: Phaser.Signal;
    private allCompleteSignal?: Phaser.Signal;
    private preloadSprite?: {
        sprite: Phaser.Sprite | Phaser.Image;
        direction: number;
        width: number;
        height: number;
        rect: Phaser.Rectangle;
    };
    private messageText?: { text: string };

    public get progress(): number {
        return this.loadingProgress;
    }
    public set progress(value: number) {
        this.loadingProgress = value;
        this.OnProgressChangedHandler();
    }

    /** 當progress改變時，參數(自己, progress) */
    public get onProgressChanged(): Phaser.Signal {
        if (!this.progressChangedSignal) {
            this.progressChangedSignal = new Phaser.Signal();
        }
        return this.progressChangedSignal;
    }

    /** 當某東西載入失敗時，參數(自己, 錯誤, 失敗的東西) */
    public get onTaskError(): Phaser.Signal {
        if (!this.taskErrorSignal) {
            this.taskErrorSignal = new Phaser.Signal();
        }
        return this.taskErrorSignal;
    }

    /** 當某東西載入完成時，參數(自己, 失敗的東西) */
    public get onTaskComplete(): Phaser.Signal {
        if (!this.taskCompleteSignal) {
            this.taskCompleteSignal = new Phaser.Signal();
        }
        return this.taskCompleteSignal;
    }

    /** 當全部載入完成時，參數(自己) */
    public get onAllComplete(): Phaser.Signal {
        if (!this.allCompleteSignal) {
            this.allCompleteSignal = new Phaser.Signal();
        }
        return this.allCompleteSignal;
    }

    public create() {
        super.create();
        if (this.parallel) {
            this.LoadParallel();
        } else {
            this.LoadInOrder();
        }
    }

    private get progressWeightSum(): number {
        let progressWeightSum = 0;
        for (const task of this.loadQueue) {
            progressWeightSum += task.progressWeight ? task.progressWeight : 1;
        }
        return progressWeightSum !== 0 ? progressWeightSum : 1;
    }

    /** 依序載入所有東西 */
    public async LoadInOrder(): Promise<void> {
        this.progress = 0;
        const progressWeightSum = this.progressWeightSum;
        let completeProgress = 0;
        for (const task of this.loadQueue) {
            const progressWeight = task.progressWeight ? task.progressWeight : 1;
            if (this.messageText) {
                this.messageText.text = task.loadMessage;
            }
            try {
                if (this.separateProgress) {
                    await task.LoadStart((progress) => this.progress = progress);
                } else {
                    await task.LoadStart((progress) => this.progress = (completeProgress + progress * progressWeight) / progressWeightSum);
                }
                this.OnTaskCompleteHandler(task);
            } catch (reason) {
                this.OnTaskErrorHandler(reason, task);
                return;
            }
            completeProgress += progressWeight;
        }
        this.OnAllompleteHandler();
    }

    /** 一次載入所有東西(平行化) */
    public LoadParallel(): Promise<void> {
        this.progress = 0;
        const progressWeightSum = this.progressWeightSum;
        const taskProgresss: number[] = Array<number>(this.loadQueue.length);
        taskProgresss.fill(0);
        return Promise.all(this.loadQueue.map((loadTask, index) => {
            const progressWeight = loadTask.progressWeight ? loadTask.progressWeight : 1;
            return loadTask.LoadStart((progress) => {
                taskProgresss[index] = progress * progressWeight;
                let sum = 0;
                for (const prog of taskProgresss) {
                    sum += prog;
                }
                this.progress = sum / progressWeightSum;
            }).then(() => {
                this.OnTaskCompleteHandler(loadTask);
            }).catch((reason: any) => {
                this.OnTaskErrorHandler(reason, loadTask);
                taskProgresss[index] = 1;
            });
        })).then(() => {
            this.OnAllompleteHandler();
        });
    }

    public LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        return this.parallel ? this.LoadParallel() : this.LoadInOrder();
    }

    public SetPreloadSprite(sprite: Phaser.Sprite | Phaser.Image, direction?: number): void {
        direction = direction || 0;

        let rect: Phaser.Rectangle;
        if (direction === 0) {
            //  Horizontal rect
            rect = new Phaser.Rectangle(0, 0, 1, sprite.height);
        } else {
            //  Vertical rect
            rect = new Phaser.Rectangle(0, 0, sprite.width, 1);
        }

        this.preloadSprite = { sprite, direction, width: sprite.width, height: sprite.height, rect };

        (sprite as Phaser.Image).crop(this.preloadSprite.rect, false);

        sprite.visible = true;
    }

    public SetMessageText(text: { text: string }) {
        this.messageText = text;
    }

    protected OnProgressChangedHandler() {
        if (this.progressChangedSignal) {
            this.progressChangedSignal.dispatch(this, this.loadingProgress);
        }
        if (this.preloadSprite) {
            if (this.preloadSprite.direction === 0) {
                this.preloadSprite.rect.width = Math.floor((this.preloadSprite.width) * this.progress);
            } else {
                this.preloadSprite.rect.height = Math.floor((this.preloadSprite.height) * this.progress);
            }

            if (this.preloadSprite.sprite) {
                this.preloadSprite.sprite.updateCrop();
            } else {
                //  We seem to have lost our sprite - maybe it was destroyed?
                delete this.preloadSprite;
            }
        }
    }

    protected OnTaskErrorHandler(reason: any, loadTask: Loadable) {
        if (this.taskErrorSignal) {
            this.taskErrorSignal.dispatch(this, reason, loadTask);
        }
    }

    protected OnTaskCompleteHandler(loadTask: Loadable) {
        if (this.taskCompleteSignal) {
            this.taskCompleteSignal.dispatch(this, loadTask);
        }
    }

    protected OnAllompleteHandler() {
        if (this.allCompleteSignal) {
            this.allCompleteSignal.dispatch(this);
        }
        this.loadQueue = [];
    }
}

export interface Loadable {
    loadMessage: string;
    LoadStart: (progressCallback?: (progress: number) => void) => Promise<void>;
    progressWeight?: number;
}
