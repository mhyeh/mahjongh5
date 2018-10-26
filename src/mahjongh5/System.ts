export interface DataConstructType<T = any> {
    new(data: any): T;
}

/**
 * 過一段時間後會fulfilled的promise
 * @param ms 要延遲的時間，單位為毫秒
 */
export function Delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * 過一段時間後會fulfilled並回傳一個值的promise
 * @param ms 要延遲的時間，單位為毫秒
 * @param value 要回傳的值
 */
export function DelayValue<T>(ms: number, value: T): Promise<T> {
    return new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * 過一段時間後會rejected的promise
 * @param ms 要延遲的時間，單位為毫秒
 * @param reason 要回傳錯誤
 */
export function DelayReject<T = any>(ms: number, reason: any): Promise<T> {
    return new Promise<T>((resolve, reject) => setTimeout(() => reject(reason), ms));
}

/**
 * 當Signal被dispatch會被resolve的promise
 * @param signal 目標Phaser.Signal
 */
export function WaitSignal(signal: Phaser.Signal): Promise<void> {
    return new Promise<void>((resolve, reject) => signal.addOnce(resolve));
}

/**
 * 可以把any型態的陣列轉成指定型態的陣列
 * @param datas 要轉的資料
 * @param dataType 要轉的型態
 */
export function DataArrayToTypeArray<T = any>(datas: any[], dataType: DataConstructType<T>): T[] {
    const array: T[] = [];
    try {
        for (const itr of datas) {
            array.push(new dataType(itr));
        }
    } catch (error) {
        console.error(error);
    }
    return array;
}
