import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import zhCN from "./locales/zhHansCN";
import en from "./locales/en";

const resources = {
  "zh-CN": zhCN,
  en,
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "zh-CN",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
