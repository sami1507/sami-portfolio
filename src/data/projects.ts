import type { Locale } from "./site";
type Localized = Record<Locale, string>;

export interface Project {
  slug: string;
  name: string;
  number: string;
  category: Localized;
  summary: Localized;
  status: Localized;
  role: Localized;
  roleNote: Localized;
  stack: string[];
  github: string;
  live?: string;
  visual: "pathy" | "travel" | "taskflow";
  sections: { title: Localized; body: Localized }[];
  evidence: { label: Localized; url: string }[];
}

export const projects: Project[] = [
  {
    slug: "pathy",
    name: "PATHY",
    number: "01",
    visual: "pathy",
    category: {
      en: "Android · Outdoor exploration",
      ar: "أندرويد · استكشاف الطبيعة",
      he: "Android · טיולים בטבע",
      de: "Android · Draußen unterwegs",
    },
    summary: {
      en: "A hiking companion built around the realities of the trail: unreliable signal, interrupted recordings, and routes worth understanding before you go.",
      ar: "رفيق للمشي يتعامل مع واقع الرحلة: اتصال متقطع، وتسجيل قد ينقطع، ومسارات تحتاج إلى فهمها قبل الانطلاق.",
      he: "אפליקציית טיולים שנבנתה למציאות שבשטח: קליטה לא יציבה, הקלטות שנקטעות ומסלולים שכדאי להכיר לפני שיוצאים.",
      de: "Ein Begleiter für Wanderungen, entwickelt für die Realität unterwegs: schwacher Empfang, unterbrochene Aufzeichnungen und Wege, die man vor dem Start verstehen möchte.",
    },
    status: {
      en: "Academic team project · In development",
      ar: "مشروع أكاديمي جماعي · قيد التطوير",
      he: "פרויקט אקדמי בצוות · בפיתוח",
      de: "Akademisches Teamprojekt · In Entwicklung",
    },
    role: {
      en: "Android development",
      ar: "تطوير تطبيق أندرويد",
      he: "פיתוח Android",
      de: "Android-Entwicklung",
    },
    roleNote: {
      en: "An academic project built by a two-person team, with programming responsibilities divided between us. I contributed to Android development; the technical decisions below describe the shared project. My repository history documents contributions without attributing my teammate’s work to me.",
      ar: "مشروع أكاديمي طوّرناه ضمن فريق من شخصين، مع تقسيم مسؤوليات البرمجة بيننا. ساهمت في تطوير تطبيق Android، وتصف القرارات التقنية أدناه المشروع المشترك. يوثّق سجل المستودع مساهماتي دون نسبة عمل زميلي إليّ.",
      he: "פרויקט אקדמי שפיתחנו בצוות של שניים, עם חלוקת אחריות על עבודת התכנות. תרמתי לפיתוח אפליקציית Android; ההחלטות הטכניות בהמשך מתארות את הפרויקט המשותף. היסטוריית המאגר מתעדת את תרומותיי בלי לייחס לי את עבודתו של שותפי לצוות.",
      de: "Ein akademisches Projekt, das wir zu zweit mit aufgeteilter Programmierarbeit entwickelt haben. Ich habe zur Android-Entwicklung beigetragen; die folgenden technischen Entscheidungen beschreiben das gemeinsame Projekt. Der Verlauf des Repositorys dokumentiert meine Beiträge, ohne mir die Arbeit meines Teampartners zuzuschreiben.",
    },
    stack: [
      "Kotlin",
      "Jetpack Compose",
      "Room",
      "WorkManager",
      "Mapbox",
      "Firebase",
    ],
    github: "https://github.com/sami1507/pathy",
    sections: [
      {
        title: {
          en: "The problem",
          ar: "المشكلة",
          he: "הבעיה",
          de: "Das Problem",
        },
        body: {
          en: "A walk does not stop when a connection drops or Android closes an app. Hikers need their recorded route to persist, their saved trail to remain accessible, and the app to be honest about the quality of map data.",
          ar: "لا تتوقف الرحلة بانقطاع الشبكة أو إغلاق أندرويد للتطبيق. يحتاج المتنزّه إلى حفظ مساره، والوصول إلى المسارات المحفوظة، ومعلومات واضحة عن جودة بيانات الخريطة.",
          he: "הטיול לא נעצר כשהחיבור מתנתק או כש-Android סוגר את האפליקציה. מטיילים צריכים שהמסלול שהקליטו יישמר, שהמסלולים השמורים יישארו נגישים ושהאפליקציה תציג בכנות את איכות נתוני המפה.",
          de: "Eine Wanderung endet nicht, wenn die Verbindung abbricht oder Android eine App beendet. Wandernde müssen sich darauf verlassen können, dass ihre Aufzeichnung erhalten bleibt, gespeicherte Wege zugänglich sind und die App die Qualität der Kartendaten ehrlich darstellt.",
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
          en: "PATHY combines trail discovery from OpenStreetMap with GPS recording, saved trails, offline maps, and route guidance. English, Arabic, and Hebrew interfaces include right-to-left layouts. Trail details distinguish known data from missing information.",
          ar: "يجمع PATHY بين اكتشاف المسارات من OpenStreetMap، وتسجيل GPS، وحفظ المسارات والخرائط دون اتصال، والإرشاد على الطريق. يدعم الإنجليزية والعربية والعبرية، مع تخطيط من اليمين إلى اليسار، ويميّز بين المعلومات المتاحة والبيانات المفقودة.",
          he: "PATHY משלב גילוי מסלולים מ-OpenStreetMap עם הקלטת GPS, שמירת מסלולים, מפות ללא חיבור והנחיות ניווט. הממשק זמין באנגלית, בערבית ובעברית, עם תמיכה בפריסה מימין לשמאל. פרטי המסלול מבדילים בין נתונים ידועים למידע חסר.",
          de: "PATHY verbindet die Wegsuche über OpenStreetMap mit GPS-Aufzeichnung, gespeicherten Routen, Offline-Karten und Navigation. Die Oberfläche ist auf Englisch, Arabisch und Hebräisch verfügbar und unterstützt Rechts-nach-links-Layouts. Die Routendetails unterscheiden bekannte Daten von fehlenden Informationen.",
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
          en: "Recording is local first. A foreground service writes accepted GPS points to Room as they arrive; WorkManager uploads finished walks when connectivity returns. Route and recording logic live in a plain Kotlin module, separate from Android and map SDKs, so those decisions can be tested independently.",
          ar: "يبدأ التسجيل محليًا: تحفظ خدمة أمامية نقاط GPS المقبولة في Room عند وصولها، ويرفع WorkManager الرحلات المكتملة عند عودة الاتصال. منطق المسارات والتسجيل موجود في وحدة Kotlin مستقلة عن أندرويد ومكتبات الخرائط لتسهيل اختباره.",
          he: "ההקלטה נשמרת קודם במכשיר. שירות בחזית כותב נקודות GPS תקינות ל-Room מיד כשהן מגיעות; WorkManager מעלה טיולים שהסתיימו כשהחיבור חוזר. לוגיקת המסלולים וההקלטה נמצאת במודול Kotlin עצמאי, בנפרד מ-Android ומספריות המפות, כדי שאפשר יהיה לבדוק אותה בנפרד.",
          de: "Die Aufzeichnung wird zuerst lokal gespeichert. Ein Vordergrunddienst schreibt akzeptierte GPS-Punkte direkt nach ihrem Eingang in Room; WorkManager lädt abgeschlossene Wanderungen hoch, sobald die Verbindung wieder verfügbar ist. Die Routen- und Aufzeichnungslogik liegt in einem reinen Kotlin-Modul, getrennt von Android und Karten-SDKs, und lässt sich dadurch unabhängig testen.",
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
          en: "Recovering after process death means restoring more than a line on a map: an active pause and the recording state must come back too. Persistent points and session state let the service reconstruct the outing. Separately, trail availability filters exclude routes marked closed, private, abandoned, or planned instead of treating every map line as a usable trail.",
          ar: "استعادة التسجيل بعد إيقاف العملية تتطلب أكثر من إعادة رسم خط على الخريطة؛ يجب أيضًا استعادة حالة الرحلة والتوقف المؤقت. تتيح النقاط وحالة الجلسة المحفوظة إعادة بناء التسجيل. وتستبعد مرشّحات توافر المسارات الطرق المعلّمة كمغلقة أو خاصة أو مهجورة أو مخططة.",
          he: "שחזור אחרי סיום תהליך דורש יותר מציור מחדש של קו במפה: צריך לשחזר גם השהיה פעילה ואת מצב ההקלטה. שמירה מתמשכת של הנקודות ושל מצב ההקלטה מאפשרת לשירות לבנות מחדש את הטיול. בנפרד מכך, מסנני זמינות מוציאים מסלולים שסומנו כסגורים, פרטיים, נטושים או מתוכננים, במקום להניח שכל קו במפה הוא שביל שאפשר ללכת בו.",
          de: "Die Wiederherstellung nach dem Ende eines Prozesses umfasst mehr als eine Linie auf der Karte: Auch eine laufende Pause und der Aufzeichnungszustand müssen zurückkehren. Gespeicherte Punkte und Sitzungsdaten ermöglichen es dem Dienst, die Wanderung wiederherzustellen. Zusätzlich schließen Verfügbarkeitsfilter Wege aus, die als gesperrt, privat, aufgegeben oder geplant markiert sind, statt jede Kartenlinie als begehbaren Weg zu behandeln.",
        },
      },
      {
        title: {
          en: "What works, and what comes next",
          ar: "ما تحقق، والخطوة التالية",
          he: "מה עובד, ומה השלב הבא",
          de: "Was funktioniert und was noch folgt",
        },
        body: {
          en: "The repository includes emulator evidence of a restored recording and saved trail maps, details, and guidance in airplane mode. The practical lesson is to design recovery and uncertainty into the flow from the start. Offline behavior on physical phones and real-world walkie-talkie connectivity still need further testing; this is an active project, not a claim of field-proven reliability.",
          ar: "يتضمن المستودع صورًا من المحاكي لاستعادة تسجيل، وفتح خرائط المسارات المحفوظة وتفاصيلها وإرشاداتها في وضع الطيران. الدرس العملي هو تصميم الاستعادة والتعامل مع نقص البيانات منذ البداية. ما زال العمل دون اتصال على هواتف فعلية واتصال اللاسلكي بحاجة إلى اختبارات إضافية.",
          he: "המאגר כולל תיעוד מהאמולטור של שחזור הקלטה ושל פתיחת מפות, פרטי מסלול והנחיות במצב טיסה. הלקח המעשי הוא לתכנן שחזור והתמודדות עם מידע לא ודאי כבר מההתחלה. עבודה ללא חיבור בטלפונים פיזיים וקשר ווקי-טוקי בתנאי שטח עדיין דורשים בדיקות נוספות; זהו פרויקט בפיתוח, ולא טענה לאמינות שהוכחה בשטח.",
          de: "Das Repository enthält Emulator-Nachweise für eine wiederhergestellte Aufzeichnung sowie gespeicherte Karten, Routendetails und Navigation im Flugmodus. Die praktische Erkenntnis: Wiederherstellung und der Umgang mit Unsicherheit gehören von Anfang an in den Ablauf. Der Offline-Betrieb auf physischen Geräten und die Walkie-Talkie-Verbindung im Alltag benötigen weitere Tests. Das Projekt wird aktiv entwickelt; eine im Gelände bewiesene Zuverlässigkeit wird nicht behauptet.",
        },
      },
    ],
    evidence: [
      {
        label: {
          en: "README & screenshots",
          ar: "وصف المشروع ولقطات التطبيق",
          he: "תיאור הפרויקט וצילומי מסך",
          de: "Projektbeschreibung und Screenshots",
        },
        url: "https://github.com/sami1507/pathy#readme",
      },
      {
        label: {
          en: "Architecture",
          ar: "بنية التطبيق",
          he: "ארכיטקטורה",
          de: "Architektur",
        },
        url: "https://github.com/sami1507/pathy/blob/main/docs/ARCHITECTURE.md",
      },
    ],
  },
  {
    slug: "travelscan-ai",
    name: "TravelScan AI",
    number: "02",
    visual: "travel",
    category: {
      en: "Web application · Applied AI",
      ar: "تطبيق ويب · ذكاء اصطناعي تطبيقي",
      he: "יישום רשת · בינה מלאכותית יישומית",
      de: "Webanwendung · Angewandte KI",
    },
    summary: {
      en: "Turning travel preferences into structured destination comparisons, with budget, timing, and multi-city route tradeoffs made visible.",
      ar: "تحويل تفضيلات السفر إلى مقارنات منظّمة بين الوجهات، مع توضيح أثر الميزانية والتوقيت وخيارات التنقّل بين المدن.",
      he: "הפיכת העדפות נסיעה להשוואות מסודרות בין יעדים, עם הצגה ברורה של שיקולי תקציב, עיתוי ומסלולים בין ערים.",
      de: "Aus Reisewünschen werden strukturierte Zielvergleiche, die Abwägungen bei Budget, Reisezeit und Routen mit mehreren Städten sichtbar machen.",
    },
    status: {
      en: "Solo academic project · In development",
      ar: "مشروع أكاديمي فردي · قيد التطوير",
      he: "פרויקט אקדמי עצמאי · בפיתוח",
      de: "Akademisches Einzelprojekt · In Entwicklung",
    },
    role: {
      en: "Full-stack development & AI integration",
      ar: "تطوير الواجهات والخدمات ودمج الذكاء الاصطناعي",
      he: "פיתוח צד לקוח ושרת ושילוב בינה מלאכותית",
      de: "Full-Stack-Entwicklung und KI-Integration",
    },
    roleNote: {
      en: "An individual academic project that I developed independently, from the Next.js interface to the analysis pipeline and AI integration. The repository includes graduation-project documentation and a record of the implementation.",
      ar: "مشروع أكاديمي فردي طوّرته بنفسي، من واجهة Next.js إلى مسار التحليل ودمج الذكاء الاصطناعي. يتضمن المستودع توثيق مشروع التخرّج وسجل التنفيذ.",
      he: "פרויקט אקדמי אישי שפיתחתי באופן עצמאי, מממשק Next.js ועד תהליך הניתוח ושילוב הבינה המלאכותית. המאגר כולל תיעוד של פרויקט הגמר ורישום של עבודת הפיתוח.",
      de: "Ein akademisches Einzelprojekt, das ich selbstständig entwickelt habe: von der Next.js-Oberfläche bis zur Analysepipeline und KI-Integration. Das Repository enthält die Dokumentation des Abschlussprojekts und den Verlauf der Umsetzung.",
    },
    stack: ["Next.js", "TypeScript", "React", "OpenAI", "Zod", "Supabase"],
    github: "https://github.com/sami1507/Travel-Scan-AI",
    live: "https://travel-scan-ai.vercel.app",
    sections: [
      {
        title: {
          en: "The problem",
          ar: "المشكلة",
          he: "הבעיה",
          de: "Das Problem",
        },
        body: {
          en: "Choosing a destination is only one part of planning a trip. Budget, season, passport requirements, and travel between cities can turn an appealing suggestion into an impractical itinerary. A useful recommendation needs structure and visible tradeoffs.",
          ar: "اختيار الوجهة ليس سوى جزء من تخطيط الرحلة. قد تجعل الميزانية والموسم ومتطلبات جواز السفر والتنقّل بين المدن اقتراحًا جذابًا صعب التنفيذ. التوصية المفيدة تحتاج إلى بنية واضحة وموازنة بين الخيارات.",
          he: "בחירת יעד היא רק חלק מתכנון נסיעה. תקציב, עונה, דרישות כניסה בהתאם לדרכון ומעבר בין ערים יכולים להפוך הצעה מושכת למסלול שקשה לממש. המלצה מועילה צריכה להיות מסודרת ולהציג בבירור את השיקולים השונים.",
          de: "Die Wahl eines Reiseziels ist nur ein Teil der Planung. Budget, Jahreszeit, Einreisebedingungen je nach Reisepass und Fahrten zwischen Städten können aus einem reizvollen Vorschlag einen unpraktischen Reiseplan machen. Eine hilfreiche Empfehlung braucht Struktur und nachvollziehbare Abwägungen.",
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
          en: "TravelScan AI collects preferences through chat or a guided form, then organizes destination recommendations and route details for comparison. The implementation combines language-model output with deterministic scoring, validated response shapes, and optional travel-data providers.",
          ar: "يجمع TravelScan AI التفضيلات عبر محادثة أو نموذج موجّه، ثم ينظّم توصيات الوجهات وتفاصيل المسارات للمقارنة. يجمع التنفيذ بين مخرجات النموذج اللغوي، وتقييم حتمي، والتحقق من بنية الاستجابة، ومزوّدي بيانات سفر اختياريين.",
          he: "TravelScan AI אוסף העדפות באמצעות צ׳אט או טופס מודרך, ואז מארגן המלצות ליעדים ופרטי מסלולים לצורך השוואה. המימוש משלב פלט ממודל שפה עם דירוג דטרמיניסטי, בדיקת מבנה התשובות וספקי נתוני נסיעות אופציונליים.",
          de: "TravelScan AI erfasst Präferenzen per Chat oder geführtem Formular und bereitet anschließend Zielempfehlungen und Routendetails zum Vergleich auf. Die Umsetzung kombiniert Ausgaben eines Sprachmodells mit deterministischer Bewertung, validierten Antwortstrukturen und optionalen Anbietern von Reisedaten.",
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
          en: "The scoring engine is explicit TypeScript logic rather than an unexplained number returned by a model. It computes separate factors such as budget fit, weather, transport, and hotel value. Zod validates inputs and AI response structures, while API credentials stay on the server.",
          ar: "محرك التقييم منطق واضح مكتوب بلغة TypeScript، وليس رقمًا غير مفسّر يعيده النموذج. يحسب عوامل منفصلة مثل ملاءمة الميزانية والطقس والنقل وقيمة الإقامة. ويتحقق Zod من المدخلات وبنية استجابات الذكاء الاصطناعي، وتبقى مفاتيح API على الخادم.",
          he: "מנוע הדירוג מבוסס על לוגיקה מפורשת ב-TypeScript, ולא על מספר ללא הסבר שמחזיר מודל. הוא מחשב גורמים נפרדים כמו התאמה לתקציב, מזג אוויר, תחבורה ותמורה במחירי מלונות. Zod בודק את הקלט ואת מבנה תשובות הבינה המלאכותית, ופרטי הגישה ל-API נשארים בשרת.",
          de: "Die Bewertungslogik ist explizit in TypeScript implementiert, statt eine unerklärte Zahl vom Modell zu übernehmen. Sie berechnet einzelne Faktoren wie Budgetpassung, Wetter, Verkehrsanbindung und Preis-Leistungs-Verhältnis von Hotels. Zod validiert Eingaben und KI-Antwortstrukturen; API-Zugangsdaten bleiben auf dem Server.",
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
          en: "External providers and generated responses do not always cooperate. The code includes response validation, a curated fallback route library, and optional provider enrichment. Keeping those paths separate helps the interface present a coherent result while distinguishing estimated data from live provider data.",
          ar: "لا تعمل الخدمات الخارجية والاستجابات المولّدة دائمًا كما نتوقع. يتضمن الكود التحقق من الاستجابات، ومكتبة مسارات بديلة، وإثراءً اختياريًا من مزوّدي البيانات. يساعد فصل هذه المسارات على تقديم نتيجة متماسكة والتمييز بين التقديرات والبيانات القادمة من المزوّدين.",
          he: "ספקים חיצוניים ותשובות שנוצרו אוטומטית לא תמיד פועלים כמצופה. הקוד כולל בדיקת תשובות, ספריית מסלולי גיבוי שנבחרו מראש והעשרה אופציונלית באמצעות ספקי נתונים. הפרדת התהליכים עוזרת לממשק להציג תוצאה עקבית ולהבחין בין הערכות לנתונים חיים מספקים.",
          de: "Externe Anbieter und generierte Antworten verhalten sich nicht immer wie erwartet. Der Code enthält Antwortvalidierung, eine kuratierte Bibliothek mit Ersatzrouten und optionale Ergänzungen durch Datenanbieter. Die getrennten Abläufe helfen der Oberfläche, ein stimmiges Ergebnis zu zeigen und Schätzungen von aktuellen Anbieterdaten zu unterscheiden.",
        },
      },
      {
        title: {
          en: "What the work demonstrates",
          ar: "ما الذي يوضحه المشروع",
          he: "מה הפרויקט מדגים",
          de: "Was das Projekt zeigt",
        },
        body: {
          en: "The repository demonstrates structured AI integration across a Next.js application: preferences, analysis, comparison, and saved trips. Its academic documentation identifies quantitative evaluation as unfinished, so no accuracy or travel-savings figures are presented here. The key lesson is that an AI feature needs validation, explainable rules, and failure handling around the model.",
          ar: "يوضّح المستودع دمجًا منظّمًا للذكاء الاصطناعي داخل تطبيق Next.js، من التفضيلات إلى التحليل والمقارنة وحفظ الرحلات. يحدّد التوثيق الأكاديمي التقييم الكمي كعمل غير مكتمل، لذلك لا تُعرض هنا نسب دقة أو توفير. الدرس الأساسي: تحتاج ميزة الذكاء الاصطناعي إلى تحقق وقواعد مفهومة ومعالجة للفشل حول النموذج.",
          he: "המאגר מדגים שילוב מסודר של בינה מלאכותית ביישום Next.js: העדפות, ניתוח, השוואה ונסיעות שמורות. התיעוד האקדמי מציין שההערכה הכמותית טרם הושלמה, ולכן לא מוצגים כאן נתוני דיוק או חיסכון בנסיעות. הלקח המרכזי הוא שיכולת מבוססת בינה מלאכותית צריכה בדיקות תקינות, כללים שניתן להסביר וטיפול בכשלים סביב המודל.",
          de: "Das Repository zeigt eine strukturierte KI-Integration in einer Next.js-Anwendung: Präferenzen, Analyse, Vergleich und gespeicherte Reisen. Laut akademischer Dokumentation ist die quantitative Evaluation noch nicht abgeschlossen; deshalb werden hier keine Angaben zu Genauigkeit oder Reisekostenersparnis gemacht. Die wichtigste Erkenntnis: Eine KI-Funktion braucht Validierung, erklärbare Regeln und Fehlerbehandlung rund um das Modell.",
        },
      },
    ],
    evidence: [
      {
        label: {
          en: "Project source",
          ar: "الشيفرة المصدرية للمشروع",
          he: "קוד המקור של הפרויקט",
          de: "Quellcode des Projekts",
        },
        url: "https://github.com/sami1507/Travel-Scan-AI#readme",
      },
      {
        label: {
          en: "Scoring engine",
          ar: "محرك تقييم الوجهات",
          he: "מנוע הדירוג",
          de: "Bewertungslogik",
        },
        url: "https://github.com/sami1507/Travel-Scan-AI/blob/main/src/lib/scoring/engine.ts",
      },
      {
        label: {
          en: "Academic evaluation scope",
          ar: "نطاق التقييم الأكاديمي",
          he: "היקף ההערכה האקדמית",
          de: "Umfang der akademischen Evaluation",
        },
        url: "https://github.com/sami1507/Travel-Scan-AI/blob/main/docs/graduation-project-audit.md",
      },
    ],
  },
  {
    slug: "taskflow",
    name: "TaskFlow",
    number: "03",
    visual: "taskflow",
    category: {
      en: "Web application · Everyday utility",
      ar: "تطبيق ويب · أدوات يومية",
      he: "יישום רשת · כלים ליום־יום",
      de: "Webanwendung · Werkzeug für den Alltag",
    },
    summary: {
      en: "A focused Kanban board that keeps everyday tasks close: no account, no setup, and a board that stays in your browser.",
      ar: "لوحة Kanban مركّزة لتنظيم المهام اليومية: بلا حساب أو إعداد، مع حفظ اللوحة في متصفحك.",
      he: "לוח Kanban ממוקד לניהול משימות יומיומיות: בלי חשבון, בלי הגדרות, ועם לוח שנשאר בדפדפן שלכם.",
      de: "Ein übersichtliches Kanban-Board für tägliche Aufgaben: ohne Konto, ohne Einrichtung und direkt im eigenen Browser gespeichert.",
    },
    status: {
      en: "Solo personal project · Browser demo",
      ar: "مشروع شخصي فردي · متاح للتجربة",
      he: "פרויקט אישי עצמאי · הדגמה בדפדפן",
      de: "Persönliches Einzelprojekt · Browser-Demo",
    },
    role: {
      en: "Frontend development",
      ar: "تطوير الواجهة",
      he: "פיתוח צד לקוח",
      de: "Frontend-Entwicklung",
    },
    roleNote: {
      en: "A personal frontend project published on my GitHub profile, covering board interactions, local persistence, responsive styling, and unit-tested state logic.",
      ar: "مشروع واجهات شخصي منشور على حسابي في GitHub، يشمل تفاعلات اللوحة والحفظ المحلي والتصميم المتجاوب ومنطق حالة باختبارات وحدات.",
      he: "פרויקט צד לקוח אישי שמפורסם בפרופיל GitHub שלי, וכולל תפעול הלוח, שמירה מקומית, עיצוב רספונסיבי ולוגיקת מצב שנבדקת בבדיקות יחידה.",
      de: "Ein persönliches Frontend-Projekt auf meinem GitHub-Profil. Es umfasst die Bedienung des Boards, lokale Speicherung, responsives Design und Zustandslogik mit Unit-Tests.",
    },
    stack: ["React", "JavaScript", "Vite", "CSS", "Node.js test runner"],
    github: "https://github.com/sami1507/taskflow-kanban",
    live: "https://sami1507.github.io/taskflow-kanban/",
    sections: [
      {
        title: {
          en: "The problem",
          ar: "المشكلة",
          he: "הבעיה",
          de: "Das Problem",
        },
        body: {
          en: "For a small personal board, creating an account and configuring a workspace can be more effort than the task itself. The goal is a direct way to capture work, see progress, and move tasks forward.",
          ar: "قد يتطلب إنشاء حساب وإعداد مساحة عمل جهدًا أكبر من المهمة نفسها عند استخدام لوحة شخصية صغيرة. الهدف هو طريقة مباشرة لتسجيل العمل ومتابعة التقدم ونقل المهام بين المراحل.",
          he: "בלוח אישי קטן, יצירת חשבון והגדרת סביבת עבודה עלולות לדרוש יותר מאמץ מהמשימה עצמה. המטרה היא דרך ישירה לרשום משימות, לראות התקדמות ולהעביר עבודה לשלב הבא.",
          de: "Für ein kleines persönliches Board können das Anlegen eines Kontos und das Einrichten eines Arbeitsbereichs aufwendiger sein als die eigentliche Aufgabe. Das Ziel ist ein direkter Weg, Aufgaben festzuhalten, Fortschritt zu sehen und Arbeit voranzubringen.",
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
          en: "TaskFlow offers editable cards, priorities and tags, live search, progress tracking, and light and dark themes. Cards move through native drag and drop or explicit move buttons, making the core workflow available on touch screens too.",
          ar: "يقدّم TaskFlow بطاقات قابلة للتعديل، وأولويات ووسومًا، وبحثًا فوريًا، ومتابعة للتقدم، ووضعين فاتحًا وداكنًا. يمكن نقل البطاقات بالسحب والإفلات أو بأزرار نقل واضحة، لتبقى الوظائف الأساسية متاحة على شاشات اللمس أيضًا.",
          he: "TaskFlow מציע כרטיסים שניתן לערוך, סדרי עדיפויות ותגיות, חיפוש מיידי, מעקב התקדמות וערכות נושא בהירה וכהה. אפשר להזיז כרטיסים בגרירה ושחרור מובנים או בכפתורי העברה ייעודיים, כך שתהליך העבודה המרכזי זמין גם במסכי מגע.",
          de: "TaskFlow bietet bearbeitbare Karten, Prioritäten und Tags, eine Sofortsuche, Fortschrittsanzeige sowie ein helles und dunkles Design. Karten lassen sich per nativem Drag-and-drop oder über eigene Schaltflächen verschieben. Damit funktioniert der zentrale Ablauf auch auf Touchscreens.",
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
          en: "One reducer manages a normalized board: cards are stored by ID, while each column keeps an ordered list of those IDs. The reducer and helpers are pure JavaScript, separate from React and browser APIs, so unit tests can check changes without rendering the interface.",
          ar: "يدير reducer واحد اللوحة: تُحفظ البطاقات حسب المعرّف، ويحتفظ كل عمود بقائمة مرتّبة من المعرّفات. منطق الحالة والدوال المساعدة مكتوب بلغة JavaScript مستقلة عن React وواجهات المتصفح، لتُختبر التغييرات دون عرض الواجهة.",
          he: "Reducer אחד מנהל לוח במבנה מנורמל: הכרטיסים נשמרים לפי מזהה, וכל עמודה שומרת רשימה מסודרת של המזהים. ה-Reducer ופונקציות העזר כתובים ב-JavaScript טהור, בנפרד מ-React ומממשקי הדפדפן, כדי שבדיקות יחידה יוכלו לבדוק שינויים בלי לרנדר את הממשק.",
          de: "Ein einzelner Reducer verwaltet ein normalisiertes Board: Karten werden nach ID gespeichert, während jede Spalte eine geordnete Liste dieser IDs enthält. Reducer und Hilfsfunktionen bestehen aus reinem JavaScript, getrennt von React und Browser-APIs. So können Unit-Tests Änderungen prüfen, ohne die Oberfläche zu rendern.",
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
          en: "A lightweight app still needs to handle awkward browser conditions. A guarded localStorage wrapper keeps the board usable when storage is blocked, and move buttons provide an alternative to pointer dragging. These small decisions keep basic interaction from depending on one input method or browser capability.",
          ar: "يحتاج التطبيق الخفيف أيضًا إلى التعامل مع ظروف المتصفح غير المثالية. تُبقي طبقة حماية حول localStorage اللوحة قابلة للاستخدام عند منع التخزين، وتوفّر أزرار النقل بديلًا للسحب بالمؤشر. تمنع هذه القرارات اعتماد التفاعل الأساسي على وسيلة إدخال أو قدرة واحدة في المتصفح.",
          he: "גם אפליקציה קלה צריכה להתמודד עם מגבלות בדפדפן. שכבת גישה מוגנת ל-localStorage שומרת על שימושיות הלוח כשהאחסון חסום, וכפתורי העברה מספקים חלופה לגרירה באמצעות מצביע. ההחלטות הקטנות האלה מונעות מהפעולות הבסיסיות להיות תלויות באמצעי קלט אחד או ביכולת אחת של הדפדפן.",
          de: "Auch eine schlanke App muss mit Einschränkungen des Browsers umgehen. Eine abgesicherte localStorage-Schicht hält das Board benutzbar, wenn der Speicher blockiert ist; Schaltflächen zum Verschieben bieten eine Alternative zum Ziehen mit dem Zeiger. Diese kleinen Entscheidungen verhindern, dass grundlegende Aktionen von einer einzigen Eingabemethode oder Browserfunktion abhängen.",
        },
      },
      {
        title: {
          en: "What the work demonstrates",
          ar: "ما الذي يوضحه المشروع",
          he: "מה הפרויקט מדגים",
          de: "Was das Projekt zeigt",
        },
        body: {
          en: "The board supports creating, editing, moving, and deleting tasks, with browser-local persistence when storage is available. It demonstrates a deliberately small React application with independently tested state transitions. There is no server sync: the board belongs to the browser where it was created.",
          ar: "تدعم اللوحة إنشاء المهام وتعديلها ونقلها وحذفها، مع حفظ محلي عندما يسمح المتصفح بذلك. يوضّح المشروع تطبيق React صغيرًا بمنطق تغيّر حالة قابل للاختبار بشكل مستقل. لا توجد مزامنة مع خادم؛ تبقى اللوحة في المتصفح الذي أُنشئت فيه.",
          he: "הלוח תומך ביצירה, עריכה, העברה ומחיקה של משימות, עם שמירה מקומית בדפדפן כשהאחסון זמין. הוא מדגים יישום React קטן במכוון, עם בדיקות עצמאיות למעברי מצב. אין סנכרון עם שרת: הלוח שייך לדפדפן שבו נוצר.",
          de: "Das Board unterstützt das Erstellen, Bearbeiten, Verschieben und Löschen von Aufgaben und speichert sie lokal, sofern der Browser Speicherzugriff erlaubt. Es zeigt eine bewusst kleine React-Anwendung mit unabhängig getesteten Zustandsübergängen. Es gibt keine Serversynchronisierung: Das Board bleibt in dem Browser, in dem es erstellt wurde.",
        },
      },
    ],
    evidence: [
      {
        label: {
          en: "README & implementation notes",
          ar: "وصف المشروع وتفاصيل التنفيذ",
          he: "תיאור הפרויקט והערות מימוש",
          de: "Projektbeschreibung und Umsetzung",
        },
        url: "https://github.com/sami1507/taskflow-kanban#readme",
      },
      {
        label: {
          en: "Board logic & tests",
          ar: "منطق اللوحة واختباراتها",
          he: "לוגיקת הלוח והבדיקות",
          de: "Board-Logik und Tests",
        },
        url: "https://github.com/sami1507/taskflow-kanban/tree/main/src",
      },
    ],
  },
];
