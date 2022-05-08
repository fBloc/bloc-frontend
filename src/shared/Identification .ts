import dayjs from "dayjs";

interface Token {
  value: string;
  expired: number;
  rememberMe: boolean;
}
class Identification {
  private tokenMaxAge = 7; // 单位：天
  private tokenKeyName = "token";
  expired = 0;
  token = "";
  constructor() {
    const token = window.localStorage.getItem(this.tokenKeyName) || "";
    try {
      const { value, expired } = JSON.parse(token) as Token;
      if (value && expired && typeof expired === "number" && typeof value === "string") {
        this.expired = expired;
        this.token = value;
      } else {
      }
    } catch (error) {
      //
    }
  }
  get isValidLogin() {
    return this.token && Date.now() < this.expired;
  }
  removeToken() {
    this.token = "";
    this.expired = 0;
    window.localStorage.removeItem(this.tokenKeyName);
  }
  saveToken(token: string, rememberMe = false) {
    const info: Token = {
      value: token,
      expired: dayjs().add(this.tokenMaxAge, "day").toDate().getTime(),
      rememberMe,
    };
    this.token = token;
    this.expired = info.expired;
    window.localStorage.setItem(this.tokenKeyName, JSON.stringify(info));
  }
}

export default Identification;
export const identificationInstance = new Identification();
