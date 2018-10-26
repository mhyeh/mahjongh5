import { DataConstructType, DelayReject, Delay } from "../System";

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export default class NetRequest {
    // public static type = RequestMethod;
    public static readonly GET: "GET" = "GET";
    public static readonly POST: "POST" = "POST";
    public static readonly PUT: "PUT" = "PUT";
    public static readonly PATCH: "PATCH" = "PATCH";
    public static readonly DELETE: "DELETE" = "DELETE";

    public bearer: string;
    public timeout: number;
    public retryTimes: number;
    public retryInterval: number;
    public useFetch = true;
    public onNetworkError: Phaser.Signal = new Phaser.Signal();

    constructor(bearer?: string, timeout: number = 3000, retryTimes: number = 10, retryInterval = 500) {
        if (bearer) {
            this.bearer = bearer;
        }
        this.timeout = timeout;
        this.retryTimes = retryTimes;
        this.retryInterval = retryInterval;
        this.useFetch = !!self.fetch;
    }

    public BuildURL(host: string, ...args: string[]): string {
        let url = host;
        for (const str of args) {
            url += url[url.length - 1] === "/" ? "" : "/";
            url += str[0] === "/" ? str.substr(1) : str;
        }
        return url;
    }

    public BuildRequest(method: RequestMethod): any {
        const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
        if (this.bearer) {
            headers.append("Authorization", "Bearer " + this.bearer);
        }
        return { method, headers };
    }

    public RequestRaw(url: string, method: RequestMethod, postData?: any, getHeaders: boolean = true, noDispatchError: boolean = false): Promise<[string, { [key: string]: string }]> {
        const headers: { [key: string]: string } = {};
        if (this.useFetch) {
            const requestOption = this.BuildRequest(method);
            if (postData && method !== NetRequest.GET) {
                requestOption.body = JSON.stringify(postData);
            }
            return this.FetchWithException(url, requestOption)
                .catch((reason) => {
                    if (!noDispatchError) {
                        this.onNetworkError.dispatch(reason);
                    }
                    throw reason;
                })
                .then((response) => {
                    if (getHeaders) {
                        const keys = [...response.headers.keys()];
                        for (const key of response.headers.keys()) {
                            const content = response.headers.get(key);
                            if (content) {
                                headers[key] = content;
                            }
                        }
                    }
                    return Promise.all([response.text(), headers]);
                });
        } else {
            return this.XHRWithException(url, method, postData)
                .catch((reason) => {
                    if (!noDispatchError) {
                        this.onNetworkError.dispatch(reason);
                    }
                    throw reason;
                }).then((response) => {
                    if (getHeaders) {
                        response.getAllResponseHeaders().split("\u000d\u000a")
                            .forEach((line) => {
                                if (line.length > 0) {
                                    const header = line.split("\u003a\u0020");
                                    headers[header[0]] = header[1];
                                }
                            });
                    }
                    return [response.responseText, headers] as [string, {}];
                });
        }
    }

    public RequestData<T>(url: string, method: RequestMethod, postData?: any, dataType?: DataConstructType<T>, noDispatchError: boolean = false): Promise<T> {
        return this.RequestRaw(url, method, postData, false, noDispatchError)
            .then(([text]) => {
                if (dataType) {
                    return new dataType(JSON.parse(text));
                } else {
                    return JSON.parse(text);
                }
            });
    }

    private FetchWithException(input: RequestInfo, init?: RequestInit, retry: number = this.retryTimes, timeout: number = this.timeout, retryInterval = this.retryInterval): Promise<Response> {
        return Promise.race([fetch(input, init), DelayReject<Response>(timeout, new Error("Timeout"))])
            .then((response) => {
                if (response.ok) {
                    return response;
                } else {
                    throw new Error(response.statusText);
                }
            })
            .catch((reason) => {
                if (retry <= 0) {
                    throw reason;
                } else {
                    return Delay(retryInterval).then(() => this.FetchWithException(input, init, retry - 1, timeout));
                }
            });
    }

    private XHRWithException(url: string, method: string, postData?: any, retry: number = this.retryTimes, timeout: number = this.timeout, retryInterval = this.retryInterval): Promise<XMLHttpRequest> {
        return new Promise<XMLHttpRequest>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(method, url);
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            request.setRequestHeader("Authorization", "Bearer " + this.bearer);
            request.timeout = timeout;
            request.onreadystatechange = (event: any) => {
                if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
                    resolve(request);
                } else if (request.readyState === XMLHttpRequest.DONE) {
                    if (request.statusText) {
                        reject(new Error(request.statusText));
                    } else {
                        reject(new Error("Connect server fail!"));
                    }
                }
            };
            request.send((postData && method !== NetRequest.GET) ? JSON.stringify(postData) : undefined);
        })
            .catch((reason) => {
                if (retry <= 0) {
                    throw reason;
                } else {
                    return Delay(retryInterval).then(() => this.XHRWithException(url, method, postData, retry - 1, timeout));
                }
            });
    }
}
