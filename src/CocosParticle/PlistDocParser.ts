export default class PlistDocParser {
    public parse(xmlDoc: Document) {
        const plist = xmlDoc.documentElement;
        if (plist.tagName !== "plist") {
            console.warn("Not a plist file!");
            return {};
        }
        let node = null;
        for (let i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType === 1) {
                break;
            }
        }
        xmlDoc = null;
        return this._parseNode(node);
    }
    private _parseNode(node: any) {
        let data = null;
        const tagName = node.tagName;
        if (tagName === "dict") {
            data = this._parseDict(node);
        } else if (tagName === "array") {
            data = this._parseArray(node);
        } else if (tagName === "string") {
            if (node.childNodes.length === 1) {
                data = node.firstChild.nodeValue;
            } else {
                data = "";
                for (const nodeValue of node.childNodes) {
                    data += nodeValue;
                }
            }
        } else if (tagName === "false") {
            data = false;
        } else if (tagName === "true") {
            data = true;
        } else if (tagName === "real") {
            data = parseFloat(node.firstChild.nodeValue);
        } else if (tagName === "integer") {
            data = parseInt(node.firstChild.nodeValue, 10);
        }
        return data;
    }
    private _parseArray(node: any): any[] {
        const data = [];
        for (let i = 0, len = node.childNodes.length; i < len; i++) {
            const child = node.childNodes[i];
            if (child.nodeType !== 1) {
                continue;
            }
            data.push(this._parseNode(child));
        }
        return data;
    }
    private _parseDict(node: any) {
        const data: any = {};
        let key = null;
        for (let i = 0, len = node.childNodes.length; i < len; i++) {
            const child = node.childNodes[i];
            if (child.nodeType !== 1) {
                continue;
            }
            if (child.tagName === "key") {
                key = child.firstChild.nodeValue;
            } else {
                data[key] = this._parseNode(child);
            }
        }
        return data;
    }
}
