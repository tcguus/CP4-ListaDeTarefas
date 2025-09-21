import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import pt from "./locales/pt.json";
import en from "./locales/en.json";

const locales = Localization.getLocales();
const deviceLang = (
  locales && locales.length > 0 ? locales[0].languageCode : "en"
).toLowerCase();
const initialLng = deviceLang.startsWith("pt") ? "pt" : "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: initialLng,
  fallbackLng: "en",
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
