import { observable, makeObservable, action, computed } from "mobx";
import dayjs from "dayjs";
import { createContext } from "react";

interface Token {
  value: string;
  expired: number;
}
class Login {
  private tokenMaxAge = 7; // 单位：天
  private tokenKeyName = "token";
  constructor() {
    const token = window.localStorage.getItem(this.tokenKeyName);
    if (token) {
      window.sessionStorage.setItem(this.tokenKeyName, token);
    }
  }
  get token() {
    const token = window.sessionStorage.getItem(this.tokenKeyName);
    if (!token) return "";
    let isTokenValid = true;
    let _token = "";
    try {
      const { value, expired } = JSON.parse(token) as Token;
      if (value && expired && typeof expired === "number" && typeof value === "string") {
        const isExpired = expired < Date.now();
        isTokenValid = !isExpired;
      } else {
        isTokenValid = false;
      }
      _token = value;
    } catch (error) {
      isTokenValid = false;
    }
    if (!isTokenValid) {
      this.removeToken();
    }
    return isTokenValid ? _token : "";
  }
  removeToken() {
    window.localStorage.removeItem(this.tokenKeyName);
  }
  saveToken(token: string, rememberme: boolean) {
    const info: Token = {
      value: token,
      expired: dayjs().add(this.tokenMaxAge, "day").toDate().getTime(),
    };
    const code = JSON.stringify(info);
    window.sessionStorage.setItem(this.tokenKeyName, code);
    if (rememberme) {
      window.localStorage.setItem(this.tokenKeyName, code);
    }
  }
}

export const login = new Login();

export class AppStore {
  @observable token = login.token;
  @computed get isLogin() {
    return !!this.token;
  }
  constructor() {
    makeObservable(this);
  }
  @action setToken({ token, rememberme }: { token: string; rememberme: boolean }) {
    this.token = token;
    login.saveToken(token, rememberme);
  }
  @action logout() {
    this.token = "";
    login.removeToken();
    window.location.href = "/login";
  }
}

export const AppStoreContext = createContext({} as AppStore);
