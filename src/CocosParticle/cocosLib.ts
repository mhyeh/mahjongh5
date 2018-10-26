import PlistDocParser from "./PlistDocParser";

interface Point {
    x: number;
    y: number;
}
export function p(x?: number | P, y?: number): P {
    if (x === undefined) {
        return { x: 0, y: 0 };
    }
    if (y === undefined) {
        return { x: (x as P).x, y: (x as P).y };
    }
    return { x: x as number, y: y as number };
}

export function pZeroIn(v: P) {
    v.x = 0;
    v.y = 0;
}
export function pIn(v1: P, v2: P) {
    v1.x = v2.x;
    v1.y = v2.y;
}
export function pMultIn(point: P, floatVar: number) {
    point.x *= floatVar;
    point.y *= floatVar;
}
export function pSubIn(v1: P, v2: P) {
    v1.x -= v2.x;
    v1.y -= v2.y;
}
export function pAddIn(v1: P, v2: P) {
    v1.x += v2.x;
    v1.y += v2.y;
}
export function pNormalizeIn(v: P) {
    pMultIn(v, 1.0 / Math.sqrt(v.x * v.x + v.y * v.y));
}

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}
export function color(r?: number | C, g?: number, b?: number, a?: number): C {
    if (r === undefined) {
        return { r: 0, g: 0, b: 0, a: 255 };
    }
    if (typeof r === "string") {
        return hexToColor(r);
    }
    if (typeof r === "object") {
        return { r: r.r, g: r.g, b: r.b, a: (r.a == null) ? 255 : r.a };
    }
    return { r, g, b, a: (a == null ? 255 : a) };
}
function hexToColor(hex: string) {
    hex = hex.replace(/^#?/, "0x");
    const c = Number(hex);
    const r = c >> 16;
    const g = (c >> 8) % 256;
    const b = c % 256;
    return color(r, g, b);
}

interface Size {
    width: number;
    height: number;
}
export function size(w?: number | S, h?: number): S {
    if (w === undefined) {
        return { width: 0, height: 0 };
    }
    if (h === undefined) {
        return { width: (w as S).width, height: (w as S).height };
    }
    return { width: w as number, height: h };
}

/** temp test */
export function loadPlist(plistFile: string) {
    const xmlDoc = _loadPlistFromCache(plistFile);
    return new PlistDocParser().parse(xmlDoc);
}
function _loadPlistFromCache(plistFile: string) {
    return {} as Document;
}

export function valueForKey(key: string | number, dict: { [x: string]: any; }) {
    if (dict) {
        const pString = dict[key];
        return pString != null ? pString : "";
    }
    return "";
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
export function degreesToRadians(angle: number) {
    return angle * RAD;
}
export function radiansToDegrees(angle: number) {
    return angle * DEG;
}

export function pToAngle(v: P) {
    return Math.atan2(v.y, v.x);
}

export function randomMinus1To1() {
    return (Math.random() - 0.5) * 2;
}

export function clampf(value: number, minInclusive: number, maxInclusive: number) {
    if (minInclusive > maxInclusive) {
        const temp = minInclusive;
        minInclusive = maxInclusive;
        maxInclusive = temp;
    }
    return value < minInclusive ? minInclusive : value < maxInclusive ? value : maxInclusive;
}

export const ONE = 1;
export const ZERO = 0;
export const SRC_ALPHA = 0x0302;
export const SRC_ALPHA_SATURATE = 0x308;
export const SRC_COLOR = 0x300;
export const DST_ALPHA = 0x304;
export const DST_COLOR = 0x306;
export const ONE_MINUS_SRC_ALPHA = 0x0303;
export const ONE_MINUS_SRC_COLOR = 0x301;
export const ONE_MINUS_DST_ALPHA = 0x305;
export const ONE_MINUS_DST_COLOR = 0x0307;
export const ONE_MINUS_CONSTANT_ALPHA = 0x8004;
export const ONE_MINUS_CONSTANT_COLOR = 0x8002;
export const BLEND_SRC = SRC_ALPHA;
export const BLEND_DST = ONE_MINUS_SRC_ALPHA;

export type P = Point;
export type C = Color;
export type S = Size;
