interface Token {
  value: string;
}
class Identification {
  private tokenKeyName = "token";
  token = "";
  constructor() {
    const token = window.localStorage.getItem(this.tokenKeyName) || "";
    try {
      const { value } = JSON.parse(token) as Token;
      if (value && typeof value === "string") {
        this.token = value;
      } else {
      }
    } catch (error) {
      //
    }
  }
  get isValidLogin() {
    return !!this.token;
  }
  removeToken() {
    this.token = "";
    window.localStorage.removeItem(this.tokenKeyName);
  }
  saveToken(token: string) {
    const info: Token = {
      value: token,
    };
    this.token = token;
    window.localStorage.setItem(this.tokenKeyName, JSON.stringify(info));
  }
}

export default Identification;
export const identificationInstance = new Identification();
