import type { Locale } from "./site";

type Preview = {
  src: string;
  width: number;
  height: number;
  label: string;
  alt: Record<Locale, string>;
  caption: Record<Locale, string>;
};

// Genuine repository captures; the financial figures belong to demo fixtures.
export const projectPreviews: Record<"mizan" | "basira", Preview> = {
  mizan: {
    src: "/images/mizan.webp",
    width: 1440,
    height: 1050,
    label: "Mizan / ميزان",
    alt: {
      en: "Mizan's actual dashboard with sample accounts, balances and spending charts",
      ar: "لوحة ميزان الفعلية بحسابات وأرصدة ورسوم إنفاق تجريبية",
      he: "לוח הבקרה של Mizan עם חשבונות לדוגמה, יתרות ותרשימי הוצאות",
      de: "Das tatsächliche Mizan-Dashboard mit Beispielkonten, Kontoständen und Ausgabendiagrammen",
    },
    caption: {
      en: "Mizan · Actual application capture · Sample data",
      ar: "ميزان · لقطة فعلية للتطبيق · بيانات تجريبية",
      he: "Mizan · צילום מסך אמיתי · נתוני דוגמה",
      de: "Mizan · Tatsächliche App-Aufnahme · Beispieldaten",
    },
  },
  basira: {
    src: "/images/basira.webp",
    width: 1348,
    height: 926,
    label: "Basira / بصيرة",
    alt: {
      en: "Basira's actual Arabic planning dashboard with explicitly synthetic café figures and cash-flow scenarios",
      ar: "لوحة بصيرة العربية الفعلية بمثال مقهى وأرقام اصطناعية معلّمة وسيناريوهات التدفق النقدي",
      he: "לוח התכנון בערבית של Basira עם נתוני בית קפה סינתטיים מסומנים ותרחישי תזרים מזומנים",
      de: "Das tatsächliche arabische Basira-Dashboard mit gekennzeichneten synthetischen Café-Daten und Liquiditätsszenarien",
    },
    caption: {
      en: "Basira · Actual application capture · Synthetic demo",
      ar: "بصيرة · لقطة فعلية للتطبيق · مثال ببيانات اصطناعية",
      he: "Basira · צילום מסך אמיתי · הדגמה בנתונים סינתטיים",
      de: "Basira · Tatsächliche App-Aufnahme · Synthetische Demo",
    },
  },
};
