import Account from "./Account";

export default class UserData {
    public userID: string;
    public userName: string;
    public currency: string;
    public account: Account;
    constructor(jsonData: any);
    constructor(data?: any) {
        if (data.UserID && data.UserName && data.AccountValue && data.AccountCurrency) {
            this.userID = data.UserID;
            this.userName = data.UserName;
            this.currency = data.AccountCurrency;
            this.account = new Account(data.AccountValue);
        }
    }
}
