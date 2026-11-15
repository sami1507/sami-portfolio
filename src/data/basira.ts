import type { Project } from "./projects";

export const basiraProject: Project = {
  slug: "basira",
  name: "Basira",
  number: "05",
  visual: "basira",
  category: {
    en: "Web application · Business planning",
    ar: "تطبيق ويب · تخطيط المشاريع",
    he: "יישום ווב · תכנון עסקי",
    de: "Webanwendung · Unternehmensplanung",
  },
  summary: {
    en: "A private planning workspace that connects business assumptions, cash-flow scenarios, source evidence, and monthly actuals in one reviewable model.",
    ar: "مساحة خاصة لتخطيط المشاريع، تربط افتراضات العمل بسيناريوهات التدفق النقدي وأدلة المصادر والنتائج الشهرية الفعلية في نموذج قابل للمراجعة.",
    he: "סביבת תכנון פרטית שמחברת הנחות עסקיות, תרחישי תזרים, מקורות מידע ותוצאות חודשיות בפועל למודל שאפשר לבחון.",
    de: "Ein privater Planungsbereich, der Geschäftsannahmen, Liquiditätsszenarien, Quellenbelege und monatliche Ist-Werte in einem nachvollziehbaren Modell verbindet.",
  },
  status: {
    en: "Solo personal project · Private prototype",
    ar: "مشروع شخصي فردي · نموذج أولي خاص",
    he: "פרויקט אישי עצמאי · אבטיפוס פרטי",
    de: "Eigenständiges persönliches Projekt · Privater Prototyp",
  },
  role: {
    en: "Full-stack development & financial modeling",
    ar: "تطوير الواجهات والخدمات والنموذج المالي",
    he: "פיתוח Full-stack ומידול פיננסי",
    de: "Full-Stack-Entwicklung und Finanzmodellierung",
  },
  roleNote: {
    en: "I built Basira independently as a personal project, covering the interface, calculation engine, and project persistence. Access remains private. The screenshot shows a clearly labeled synthetic example, with no customer records or verified market forecasts.",
    ar: "طوّرت بصيرة بصورة مستقلة كمشروع شخصي، من الواجهة إلى محرك الحسابات وحفظ المشاريع. الوصول إليه خاص. تعرض الصورة مثالًا اصطناعيًا معلّمًا بوضوح، دون بيانات عملاء أو توقعات سوق مثبتة.",
    he: "פיתחתי את Basira באופן עצמאי כפרויקט אישי: הממשק, מנוע החישוב ושמירת הפרויקטים. הגישה נשארת פרטית. צילום המסך מציג דוגמה סינתטית מסומנת בבירור, ללא נתוני לקוחות או תחזיות שוק מאומתות.",
    de: "Ich habe Basira als persönliches Projekt eigenständig entwickelt: Oberfläche, Rechenkern und Projektspeicherung. Der Zugang bleibt privat. Die Aufnahme zeigt ein klar gekennzeichnetes synthetisches Beispiel, keine Kundendaten oder bestätigten Marktprognosen.",
  },
  stack: [
    "TypeScript",
    "React",
    "Vinext",
    "Cloudflare D1",
    "Drizzle",
    "Decimal.js",
    "Zod",
  ],
  sections: [
    {
      title: {
        en: "The problem",
        ar: "المشكلة",
        he: "הבעיה",
        de: "Das Problem",
      },
      body: {
        en: "A business plan is difficult to evaluate when its costs, assumptions, and evidence live in separate places. A polished forecast can also hide missing inputs. Basira brings those pieces together while keeping assumptions and unknowns visible.",
        ar: "يصعب تقييم خطة مشروع عندما تتوزع التكاليف والافتراضات والأدلة بين أماكن مختلفة. وقد يخفي التوقع المنسّق مدخلات ناقصة. يجمع بصيرة هذه العناصر مع إبقاء الافتراضات والمعلومات المجهولة ظاهرة.",
        he: "קשה לבחון תוכנית עסקית כשהעלויות, ההנחות והמקורות מפוזרים. גם תחזית שנראית מסודרת עלולה להסתיר נתונים חסרים. Basira מרכז את החלקים האלה ומשאיר את ההנחות ואת המידע החסר גלויים.",
        de: "Ein Geschäftsplan lässt sich schwer beurteilen, wenn Kosten, Annahmen und Belege verstreut sind. Auch eine sauber dargestellte Prognose kann fehlende Eingaben verdecken. Basira führt diese Informationen zusammen und macht Annahmen sowie Unbekanntes sichtbar.",
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
        en: "An Arabic/English workspace combines project intake, itemized costs, an evidence register, and three 24-month scenarios. Owners can record permitted competitor material, plan 30/60/90-day actions, and compare monthly actuals with the original forecast. Results depend on entered assumptions; they are not market research or probabilities of success.",
        ar: "تجمع مساحة عمل عربية وإنجليزية بين إدخال تفاصيل المشروع وتفصيل التكاليف وسجل الأدلة وثلاثة سيناريوهات تمتد 24 شهرًا. يمكن تسجيل مواد منافسين مسموح باستخدامها، وتخطيط إجراءات لمدة 30 و60 و90 يومًا، ومقارنة النتائج الشهرية بالتوقع الأصلي. تعتمد النتائج على المدخلات، وليست دراسة سوق أو احتمالات نجاح.",
        he: "סביבת עבודה בערבית ובאנגלית משלבת אפיון פרויקט, פירוט עלויות, רישום מקורות ושלושה תרחישים ל־24 חודשים. אפשר לתעד חומר מותר לשימוש על מתחרים, לתכנן פעולות ל־30, 60 ו־90 יום ולהשוות תוצאות חודשיות לתחזית המקורית. התוצאות תלויות בהנחות שהוזנו; הן אינן מחקר שוק או הסתברות להצלחה.",
        de: "Der arabisch-englische Arbeitsbereich verbindet Projekterfassung, einzelne Kostenpositionen, Quellenbelege und drei Szenarien über 24 Monate. Erfasst werden können erlaubte Wettbewerberinformationen, Maßnahmen für 30, 60 und 90 Tage sowie monatliche Ist-Werte zum Vergleich mit dem ursprünglichen Plan. Die Ergebnisse beruhen auf Eingaben und sind weder Marktforschung noch Erfolgswahrscheinlichkeiten.",
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
        en: "The financial engine is a separate deterministic TypeScript module using Decimal.js. It models collection delays, inventory consumption, depreciation, loan repayments, and owner drawings without delegating arithmetic to generated text. Zod validates project data, and owner-filtered D1 queries keep saved projects scoped to the signed-in account.",
        ar: "محرك الحسابات وحدة TypeScript مستقلة بحسابات حتمية تستخدم Decimal.js. يمثّل تأخر التحصيل واستهلاك المخزون والإهلاك وسداد القروض ومسحوبات المالك، دون إسناد الحسابات إلى نص مولّد. يتحقق Zod من بيانات المشروع، وتربط استعلامات D1 المصفّاة بالمالك المشاريع المحفوظة بالحساب المسجّل.",
        he: "מנוע החישוב הוא מודול TypeScript דטרמיניסטי נפרד המשתמש ב־Decimal.js. הוא מדמה עיכובי גבייה, צריכת מלאי, פחת, החזרי הלוואות ומשיכות בעלים בלי להפקיד את החשבון בידי טקסט שנוצר אוטומטית. Zod מאמת נתוני פרויקט, ושאילתות D1 מסוננות לפי בעלים מגבילות פרויקטים שמורים לחשבון המחובר.",
        de: "Der Rechenkern ist ein separates deterministisches TypeScript-Modul mit Decimal.js. Er modelliert Zahlungsverzögerungen, Bestandsverbrauch, Abschreibungen, Tilgungen und Privatentnahmen, ohne die Berechnung generiertem Text zu überlassen. Zod prüft die Projektdaten; nach Eigentümer gefilterte D1-Abfragen begrenzen gespeicherte Projekte auf das angemeldete Konto.",
      },
    },
    {
      title: {
        en: "The challenge",
        ar: "التحدّي",
        he: "האתגר",
        de: "Die Herausforderung",
      },
      body: {
        en: "A plan loses its value as a reference if later edits silently rewrite it. Basira preserves a frozen forecast baseline for actual-versus-plan comparisons. Monthly imports require a preview and skip existing months; revision checks reject stale saves instead of overwriting newer changes.",
        ar: "تفقد الخطة قيمتها كمرجع إذا أعادت التعديلات اللاحقة كتابة أصلها بصمت. يحفظ بصيرة نسخة ثابتة من التوقع للمقارنة بين الفعلي والمخطط. يتطلب استيراد البيانات الشهرية معاينة مسبقة ويتجاوز الأشهر الموجودة؛ وترفض مراجعة الإصدارات الحفظ القديم بدل الكتابة فوق التعديلات الأحدث.",
        he: "תוכנית מאבדת מערכה כנקודת ייחוס אם שינויים מאוחרים משכתבים אותה בשקט. Basira שומר בסיס תחזית קבוע להשוואת ביצוע מול תכנון. יבוא נתונים חודשיים מחייב תצוגה מקדימה ומדלג על חודשים קיימים; בדיקת גרסאות דוחה שמירה ישנה במקום לדרוס שינויים חדשים יותר.",
        de: "Ein Plan verliert seinen Wert als Referenz, wenn spätere Änderungen ihn unbemerkt überschreiben. Basira bewahrt einen festen Prognosestand für Soll-Ist-Vergleiche. Monatsimporte erfordern eine Vorschau und überspringen vorhandene Monate; Versionsprüfungen weisen veraltete Speicheranfragen zurück, statt neuere Änderungen zu überschreiben.",
      },
    },
    {
      title: {
        en: "What works, and what comes next",
        ar: "ما تحقق، والخطوة التالية",
        he: "מה עובד ומה הלאה",
        de: "Was funktioniert und was folgt",
      },
      body: {
        en: "The implementation includes scenario comparisons, monthly tracking, spreadsheet export, and JSON backup/restore. The key design lesson is to make a calculation traceable without presenting its assumptions as facts. The prototype still uses one primary revenue unit and currency per project; broader business models and live AI-provider verification remain separate work.",
        ar: "يشمل التنفيذ مقارنة السيناريوهات والمتابعة الشهرية والتصدير إلى جداول البيانات والنسخ الاحتياطي والاستعادة بصيغة JSON. الدرس التصميمي هو جعل الحساب قابلًا للتتبع دون تقديم افتراضاته كحقائق. ما زال النموذج يستخدم وحدة إيراد رئيسية وعملة واحدة لكل مشروع؛ وتوسيع النماذج والتحقق الحي من مزوّد الذكاء الاصطناعي عمل منفصل.",
        he: "המימוש כולל השוואת תרחישים, מעקב חודשי, יצוא לגיליון נתונים וגיבוי ושחזור ב־JSON. העיקרון התכנוני הוא לאפשר מעקב אחר החישוב בלי להציג את הנחותיו כעובדות. האבטיפוס עדיין משתמש ביחידת הכנסה מרכזית ובמטבע אחד לכל פרויקט; הרחבת המודלים ואימות חי של ספק AI נשארים עבודה נפרדת.",
        de: "Die Umsetzung umfasst Szenariovergleiche, monatliche Erfassung, Tabellenexport und Sicherung/Wiederherstellung per JSON. Die zentrale Gestaltungsentscheidung: Berechnungen nachvollziehbar machen, ohne ihre Annahmen als Tatsachen darzustellen. Der Prototyp verwendet weiterhin eine zentrale Erlöseinheit und eine Währung je Projekt; umfassendere Geschäftsmodelle und die Live-Prüfung eines KI-Anbieters bleiben separate Aufgaben.",
      },
    },
  ],
  evidence: [],
};
