import type { Project } from "./projects";

export const mizanProject: Project = {
  slug: "mizan",
  name: "Mizan",
  number: "04",
  visual: "mizan",
  category: {
    en: "Web application · Personal finance",
    ar: "تطبيق ويب · إدارة الأموال الشخصية",
    he: "יישום רשת · ניהול כספים אישי",
    de: "Webanwendung · Persönliche Finanzen",
  },
  summary: {
    en: "A four-language workspace for accounts, budgets and savings, with a what-if simulator that keeps proposed decisions separate from real records.",
    ar: "مساحة عمل بأربع لغات للحسابات والميزانيات والادخار، مع محاكاة لقرارات مالية محتملة تبقى منفصلة عن السجلات الفعلية.",
    he: "סביבת עבודה בארבע שפות לחשבונות, תקציבים וחיסכון, עם סימולטור לבחינת החלטות כספיות בלי לשנות את הרישומים בפועל.",
    de: "Ein Arbeitsbereich in vier Sprachen für Konten, Budgets und Sparziele, mit einem Simulator, der mögliche Entscheidungen getrennt von tatsächlichen Buchungen betrachtet.",
  },
  status: {
    en: "Solo personal project · In development",
    ar: "مشروع شخصي فردي · قيد التطوير",
    he: "פרויקט אישי עצמאי · בפיתוח",
    de: "Persönliches Einzelprojekt · In Entwicklung",
  },
  role: {
    en: "Full-stack development",
    ar: "تطوير الواجهات والخدمات",
    he: "פיתוח צד לקוח ושרת",
    de: "Full-Stack-Entwicklung",
  },
  roleNote: {
    en: "A personal project I developed independently, covering the interface, server-side ledger, calculation tools and automated checks. The screenshots show the running application with isolated sample data.",
    ar: "مشروع شخصي طوّرته بشكل مستقل، ويشمل الواجهة والسجل المالي على الخادم وأدوات الحساب والفحوص الآلية. تعرض الصور التطبيق أثناء التشغيل ببيانات تجريبية معزولة.",
    he: "פרויקט אישי שפיתחתי באופן עצמאי, כולל הממשק, הרישום הכספי בצד השרת, כלי החישוב והבדיקות האוטומטיות. צילומי המסך מציגים את היישום בפעולה עם נתוני דוגמה מבודדים.",
    de: "Ein persönliches Projekt, das ich eigenständig entwickelt habe: Oberfläche, serverseitige Buchungsdaten, Berechnungswerkzeuge und automatisierte Prüfungen. Die Screenshots zeigen die laufende Anwendung mit isolierten Beispieldaten.",
  },
  stack: [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Drizzle ORM",
    "Better Auth",
    "Tailwind CSS",
  ],
  github: "https://github.com/sami1507/mizan-finance-web",
  sections: [
    {
      title: {
        en: "The problem",
        ar: "المشكلة",
        he: "הבעיה",
        de: "Das Problem",
      },
      body: {
        en: "A current balance does not explain upcoming commitments or how much money can be set aside. Planning a purchase also needs a clear distinction between recorded activity and assumptions about the future. Mizan brings those views together without treating a forecast as a real transaction.",
        ar: "الرصيد الحالي لا يوضّح الالتزامات القادمة أو المبلغ الممكن تخصيصه للادخار. كما يحتاج التخطيط لشراء إلى تمييز واضح بين الحركة المسجّلة وافتراضات المستقبل. يجمع ميزان هذه الرؤى دون اعتبار التوقّع معاملة مالية فعلية.",
        he: "היתרה הנוכחית לא מסבירה אילו התחייבויות צפויות או כמה כסף אפשר להפריש לחיסכון. גם תכנון רכישה דורש הבחנה ברורה בין פעילות שנרשמה לבין הנחות לגבי העתיד. Mizan מחבר בין התמונה הנוכחית לתכנון, בלי להפוך תחזית לתנועה כספית אמיתית.",
        de: "Der aktuelle Kontostand zeigt weder kommende Verpflichtungen noch den möglichen Sparbetrag. Auch die Planung eines Kaufs braucht eine klare Trennung zwischen erfassten Vorgängen und Annahmen über die Zukunft. Mizan verbindet diese Perspektiven, ohne eine Prognose als echte Buchung zu behandeln.",
      },
    },
    {
      title: {
        en: "The approach",
        ar: "الحل",
        he: "הגישה",
        de: "Der Ansatz",
      },
      body: {
        en: "Manual accounts, income and expenses feed budgets, savings goals and reports. A monthly savings calculator and a 30-, 60- or 90-day simulator explore decisions using explicit assumptions, charts and exact tables. Arabic, English, Hebrew and German interfaces support RTL/LTR layouts and light/dark themes. Scheduled items enter the ledger only when explicitly processed.",
        ar: "تغذّي الحسابات المدخلة يدويًا والإيرادات والمصروفات الميزانيات وأهداف الادخار والتقارير. وتتيح حاسبة ادخار شهرية ومحاكاة لمدة 30 أو 60 أو 90 يومًا دراسة القرارات بافتراضات معلنة ورسوم وجداول دقيقة. تدعم الواجهة العربية والإنجليزية والعبرية والألمانية، والاتجاهين والوضعين الفاتح والداكن. ولا تدخل البنود المجدولة السجل إلا عند معالجتها صراحةً.",
        he: "חשבונות שמוזנים ידנית, הכנסות והוצאות משמשים בסיס לתקציבים, יעדי חיסכון ודוחות. מחשבון חיסכון חודשי וסימולטור ל-30, 60 או 90 יום מאפשרים לבחון החלטות בעזרת הנחות מפורשות, תרשימים וטבלאות מדויקות. הממשק תומך בערבית, אנגלית, עברית וגרמנית, בשני כיווני כתיבה ובערכות נושא בהירות וכהות. פריטים מתוזמנים הופכים לרישומים כספיים רק בעקבות פעולה מפורשת.",
        de: "Manuell erfasste Konten, Einnahmen und Ausgaben bilden die Grundlage für Budgets, Sparziele und Berichte. Ein monatlicher Sparrechner und ein Simulator für 30, 60 oder 90 Tage untersuchen Entscheidungen anhand ausdrücklicher Annahmen, Diagramme und genauer Tabellen. Die Oberfläche unterstützt Arabisch, Englisch, Hebräisch und Deutsch, beide Schreibrichtungen sowie helle und dunkle Ansichten. Geplante Vorgänge werden erst durch eine ausdrückliche Verarbeitung verbucht.",
      },
    },
    {
      title: {
        en: "A decision that matters",
        ar: "قرار تقني مهم",
        he: "החלטה טכנית משמעותית",
        de: "Eine wichtige technische Entscheidung",
      },
      body: {
        en: "Amounts use integer minor units rather than floating-point arithmetic. Balances are derived from the ledger, and ILS, USD and EUR remain separate instead of being combined with an assumed exchange rate. Related database changes commit together; allocating money to a goal does not create an expense or reduce the account balance.",
        ar: "تُمثّل المبالغ بأعداد صحيحة لأصغر وحدة نقدية بدل حسابات الفاصلة العائمة. تُشتق الأرصدة من السجل، وتبقى الشيكل والدولار واليورو منفصلة دون جمعها بسعر صرف مفترض. تُحفظ التغييرات المترابطة معًا في معاملة قاعدة بيانات؛ وتخصيص مبلغ لهدف ادخاري لا ينشئ مصروفًا ولا يخفض رصيد الحساب.",
        he: "סכומים מיוצגים כמספרים שלמים ביחידות המטבע הקטנות ביותר, במקום בחישובי נקודה צפה. היתרות נגזרות מהרישומים, ושקל, דולר ואירו נשארים נפרדים במקום להתחבר לפי שער חליפין משוער. שינויים קשורים נשמרים יחד בעסקת מסד נתונים; הקצאת כסף ליעד חיסכון אינה יוצרת הוצאה ואינה מפחיתה את יתרת החשבון.",
        de: "Geldbeträge werden als ganze Zahlen in der kleinsten Währungseinheit verarbeitet, statt mit Gleitkommaarithmetik. Kontostände ergeben sich aus den Buchungen; ILS, USD und EUR bleiben getrennt, ohne angenommenen Wechselkurs. Zusammengehörige Datenbankänderungen werden gemeinsam gespeichert. Eine Zuweisung zu einem Sparziel erzeugt keine Ausgabe und verringert den Kontostand nicht.",
      },
    },
    {
      title: {
        en: "The hard part",
        ar: "التحدّي",
        he: "האתגר",
        de: "Die Herausforderung",
      },
      body: {
        en: "A server can save a transaction even when its response never reaches the browser. Repeating that request must not duplicate the entry. Mizan stores an owner-scoped request ID and payload hash in the same database transaction as the change. An unchanged retry reuses the recorded result; reusing that ID for different changes is rejected. Integration tests cover concurrent retries and rollback after a failed write.",
        ar: "قد يحفظ الخادم معاملة دون وصول الرد إلى المتصفح، ويجب ألا تؤدي إعادة الطلب إلى تكرار القيد. يحفظ ميزان معرّف طلب مرتبطًا بصاحب الحساب وبصمة لمحتواه ضمن معاملة قاعدة البيانات نفسها. تعيد المحاولة بالمحتوى ذاته استخدام النتيجة المحفوظة، ويُرفض استخدام المعرّف نفسه لتغييرات مختلفة. تغطي اختبارات التكامل المحاولات المتزامنة والتراجع عند فشل الحفظ.",
        he: "השרת יכול לשמור תנועה גם אם התשובה שלו לא מגיעה לדפדפן. שליחה חוזרת של הבקשה לא צריכה ליצור רישום כפול. Mizan שומר מזהה בקשה המשויך לבעל החשבון וחתימה של התוכן באותה עסקת מסד נתונים שבה נשמר השינוי. ניסיון חוזר ללא שינוי משתמש בתוצאה השמורה; שימוש באותו מזהה לשינוי אחר נדחה. בדיקות אינטגרציה מכסות ניסיונות חוזרים במקביל וביטול שינויים לאחר כתיבה שנכשלה.",
        de: "Der Server kann einen Vorgang speichern, obwohl seine Antwort den Browser nicht erreicht. Eine erneute Anfrage darf dann keinen doppelten Eintrag erzeugen. Mizan speichert eine kontoinhaberbezogene Anfrage-ID und einen Hash des Inhalts in derselben Datenbanktransaktion wie die Änderung. Eine unveränderte Wiederholung verwendet das gespeicherte Ergebnis; derselbe Schlüssel mit anderem Inhalt wird abgelehnt. Integrationstests prüfen parallele Wiederholungen und das Zurückrollen fehlgeschlagener Schreibvorgänge.",
      },
    },
    {
      title: {
        en: "Lessons and current limits",
        ar: "الدروس وحدود المشروع الحالية",
        he: "לקחים ומגבלות נוכחיות",
        de: "Erkenntnisse und aktuelle Grenzen",
      },
      body: {
        en: "Useful projections need visible assumptions. The simulator flags possible overlaps between manual entries and recurring schedules and waits for review before showing results. Accounts are manual: there is no bank connection, payment execution or currency conversion. The public source runs locally; hosted PostgreSQL, HTTPS and optional recovery email still require provider setup and live verification.",
        ar: "تحتاج التوقّعات المفيدة إلى افتراضات واضحة. تكشف المحاكاة التداخل المحتمل بين القيود اليدوية والجداول المتكررة، وتنتظر مراجعته قبل عرض النتائج. الحسابات يدوية؛ لا يوجد ربط بالبنوك أو تنفيذ مدفوعات أو تحويل عملات. يمكن تشغيل المصدر العام محليًا، بينما تتطلب استضافة PostgreSQL وHTTPS وبريد استعادة كلمة المرور الاختياري إعداد المزوّد والتحقق الفعلي.",
        he: "תחזיות מועילות דורשות הנחות גלויות. הסימולטור מסמן חפיפות אפשריות בין רישומים ידניים לפעולות מתוזמנות חוזרות, וממתין לבדיקה לפני הצגת התוצאות. החשבונות מנוהלים ידנית: אין חיבור לבנקים, ביצוע תשלומים או המרת מטבע. אפשר להריץ את הקוד הציבורי מקומית; מסד PostgreSQL מאוחסן, HTTPS ודוא״ל אופציונלי לשחזור סיסמה עדיין דורשים הגדרת ספק ואימות בסביבה חיה.",
        de: "Hilfreiche Prognosen brauchen sichtbare Annahmen. Der Simulator kennzeichnet mögliche Überschneidungen zwischen manuellen Einträgen und wiederkehrenden Vorgängen und wartet vor der Ergebnisanzeige auf deren Prüfung. Konten werden manuell geführt; es gibt keine Bankanbindung, Zahlungsabwicklung oder Währungsumrechnung. Der öffentliche Quellcode lässt sich lokal ausführen. Gehostetes PostgreSQL, HTTPS und optionale E-Mails zur Passwortwiederherstellung erfordern weiterhin die Einrichtung beim Anbieter und eine Prüfung im Livebetrieb.",
      },
    },
  ],
  evidence: [
    {
      label: {
        en: "README and real screenshots",
        ar: "وصف المشروع ولقطات فعلية",
        he: "תיאור הפרויקט וצילומי מסך אמיתיים",
        de: "Projektbeschreibung und echte Screenshots",
      },
      url: "https://github.com/sami1507/mizan-finance-web/blob/d1a65f380bea806dd3de4001eaec90ed3aea2c0d/README.md",
    },
    {
      label: {
        en: "Ledger and retry handling",
        ar: "السجل المالي ومعالجة إعادة المحاولة",
        he: "רישום כספי וטיפול בניסיונות חוזרים",
        de: "Buchungen und wiederholte Anfragen",
      },
      url: "https://github.com/sami1507/mizan-finance-web/blob/d1a65f380bea806dd3de4001eaec90ed3aea2c0d/src/server/finance-service.ts",
    },
    {
      label: {
        en: "Simulator model and assumptions",
        ar: "نموذج المحاكاة وافتراضاته",
        he: "מודל הסימולציה וההנחות שלו",
        de: "Simulationsmodell und Annahmen",
      },
      url: "https://github.com/sami1507/mizan-finance-web/blob/d1a65f380bea806dd3de4001eaec90ed3aea2c0d/docs/simulator-model.md",
    },
  ],
};
