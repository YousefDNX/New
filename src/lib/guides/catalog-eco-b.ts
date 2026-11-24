import type { FeatureGuideEntry } from "./types";

export const ECO_GUIDES_B: Record<string, FeatureGuideEntry> = {
  "adventure-world": {
    en: {
      title: "BTC Adventure World & Interactive Quest",
      category: "Level Up",
      whatItDoes:
        "Lets you guide a student explorer through themed knowledge zones, solve educational challenges, collect artifacts, and earn Adventure XP.",
      whyAndProblem:
        "Replaces dry drill repetition with motivating game-based learning challenges.",
      whoBenefits: "Students seeking playful reinforcement after serious study blocks.",
      steps: [
        "Choose a world region or active quest checkpoint.",
        "Answer zone challenges and unlock educational collectibles.",
      ],
      options: [
        { label: "Zone Selector & Inventory", desc: "Tracks solved quests and collected rewards." },
      ],
      limitations: "Game progress persists inside your student ecosystem state.",
    },
    ar: {
      title: "عالم مغامرات BTC والتحديات التفاعلية",
      category: "الترقي والتحفيز",
      whatItDoes:
        "تحدٍّ معرفي تفاعلي يتنقل فيه الطالب عبر مناطق تعلم لحل الألغاز وكسب نقاط ومقتنيات معرفية.",
      whyAndProblem: "يكسر روتين المراجعة التقليدية عبر التعلم القائم على اللعب.",
      whoBenefits: "الطلاب الباحثون عن تحفيز ممتع بعد جلسات التركيز.",
      steps: ["اختر منطقة التعلم وحل التحديات لفتح المقتنيات والمكافآت."],
      options: [{ label: "المناطق والمقتنيات", desc: "تحفظ المهام المنجزة والميداليات المكتسبة." }],
      limitations: "تُحفظ حالة التقدم في مخزن نظام الطالب الخاص بك.",
    },
    ja: {
      title: "BTCアドベンチャーワールド",
      category: "レベルアップ",
      whatItDoes:
        "テーマ別の知識ゾーンを探検し、クイズクエストをクリアして報酬やXPを集める学習ゲームです。",
      whyAndProblem: "単調になりがちな反復演習を楽しい探索体験へ変えます。",
      whoBenefits: "勉強の合間にゲーム感覚で達成感を得たい学生。",
      steps: ["ワールドのエリアを選んでチャレンジ問題に挑戦します。"],
      options: [
        { label: "エリア選択＆インベントリ", desc: "獲得した報酬と達成状況を確認できます。" },
      ],
      limitations: "ゲーム進捗はエコシステムストアに保存されます。",
    },
    fr: {
      title: "Monde d'Aventure BTC",
      category: "Progression",
      whatItDoes: "Jeu d'exploration éducatif par zones pour résoudre des défis et gagner de l'XP.",
      whyAndProblem: "Rend les révisions ludiques et stimulantes.",
      whoBenefits: "Étudiants cherchant un apprentissage interactif par le jeu.",
      steps: ["Choisissez une zone, relevez les défis et débloquez les récompenses."],
      options: [{ label: "Zones & Récompenses", desc: "Suit vos quêtes accomplies." }],
      limitations: "La progression est sauvegardée dans l'écosystème du compte.",
    },
    de: {
      title: "BTC Adventure World",
      category: "Level-Up",
      whatItDoes: "Interaktives Lern-Abenteuer mit Themenzonen, Rätsel-Quests und Sammelobjekten.",
      whyAndProblem: "Lockert trockenes Wiederholen durch spielerische Motivation auf.",
      whoBenefits: "Lernende, die Abwechslung nach Lernblöcken suchen.",
      steps: ["Zone auswählen, Fragen lösen und Belohnungen freischalten."],
      options: [{ label: "Zonen & Inventar", desc: "Speichert abgeschlossene Quests." }],
      limitations: "Fortschritt wird im Ökosystem-Speicher abgelegt.",
    },
    "zh-CN": {
      title: "BTC 冒险世界探索游戏",
      category: "成长激励",
      whatItDoes: "以主题区域闯关形式解答跨学科挑战题、收集徽章并赚取经验。",
      whyAndProblem: "用游戏化探索消除单纯刷题的枯燥感。",
      whoBenefits: "想在专注学习后轻松巩固知识的学生。",
      steps: ["选择探险地图区域，完成知识问答解锁奖励。"],
      options: [{ label: "区域进度与藏品", desc: "自动保留通关记录。" }],
      limitations: "游戏状态储存在学生生态配置存储中。",
    },
    ko: {
      title: "BTC 어드벤처 월드",
      category: "레벨 업",
      whatItDoes:
        "지식 탐험 구역을 이동하며 학습 퀘스트를 풀고 보상과 XP를 모으는 게이미피케이션 공간입니다.",
      whyAndProblem: "지루해지기 쉬운 복습을 흥미로운 탐험으로 바꿔줍니다.",
      whoBenefits: "재미있는 동기부여가 필요한 학생.",
      steps: ["구역을 선택해 퀴즈 퀘스트를 해결하고 보상을 모으세요."],
      options: [{ label: "구역 및 인벤토리", desc: "완료한 퀘스트와 수집품을 기록합니다." }],
      limitations: "게임 진행 내역은 학생 에코시스템 저장소에 저장됩니다.",
    },
  },
  "levelup-qotd": {
    en: {
      title: "Question of the Day & Knowledge Challenges",
      category: "Level Up",
      whatItDoes:
        "Presents a fresh daily cross-disciplinary brain teaser plus multi-topic challenge questions for bonus XP.",
      whyAndProblem: "Builds a light daily thinking habit even on busy days.",
      whoBenefits: "Students keeping their daily learning streak alive in under two minutes.",
      steps: [
        "Read today's Question of the Day and select your answer option.",
        "Tackle additional subject Knowledge Challenges below.",
      ],
      options: [
        {
          label: "Daily Prompt & Feedback",
          desc: "Explains the answer immediately upon selection.",
        },
      ],
      limitations:
        "Rotates deterministically by calendar date; answers record per session/ecosystem state.",
    },
    ar: {
      title: "سؤال اليوم والتحديات المعرفية",
      category: "الترقي والتحفيز",
      whatItDoes: "يطرح سؤالاً ذهنياً يومياً متجدداً بالإضافة لتحديات معرفية سريعة لكسب XP.",
      whyAndProblem: "يبني عادة التفكير اليومي السريع حتى في الأيام المزدحمة.",
      whoBenefits: "الطلاب الراغبون في الحفاظ على سلسلة التعلم خلال دقيقتين يومياً.",
      steps: ["اقرأ سؤال اليوم واختر إجابتك لقراءة التفسير الفوري."],
      options: [{ label: "سؤال متجدد", desc: "يتغير تلقائياً حسب تاريخ اليوم." }],
      limitations: "يدور السؤال تلقائياً وفق التاريخ المسجل.",
    },
    ja: {
      title: "今日の1問＆知識チャレンジ",
      category: "レベルアップ",
      whatItDoes: "日替わりの思考問題と分野別チャレンジクイズに答えてXPを獲得できます。",
      whyAndProblem: "忙しい日でも2分で毎日の学習習慣を継続できます。",
      whoBenefits: "連続学習ストリークを維持したいすべての学生。",
      steps: ["今日の問題から選択肢を選び、解説を確認します。"],
      options: [{ label: "日替わり問題＆チャレンジ", desc: "解答後にポイント解説します。" }],
      limitations: "問題はカレンダー日付に応じて切り替わります。",
    },
    fr: {
      title: "Question du Jour & Défis",
      category: "Progression",
      whatItDoes:
        "Propose une énigme quotidienne et des défis thématiques avec explication instantanée.",
      whyAndProblem: "Entretient la curiosité intellectuelle en deux minutes par jour.",
      whoBenefits: "Étudiants souhaitant préserver leur série quotidienne.",
      steps: ["Lisez la question du jour et sélectionnez votre réponse."],
      options: [{ label: "Défis rapides", desc: "Affiche l'explication immédiatement." }],
      limitations: "Rotation quotidienne basée sur la date.",
    },
    de: {
      title: "Frage des Tages & Wissens-Challenges",
      category: "Level-Up",
      whatItDoes:
        "Bietet täglich eine neue Denkaufgabe plus Themen-Challenges mit direktem Feedback.",
      whyAndProblem: "Fördert eine kurze tägliche Lernroutine.",
      whoBenefits: "Lernende zur Pflege ihrer Tages-Serie.",
      steps: ["Antwort auswählen und Erklärung direkt lesen."],
      options: [{ label: "Tagesrätsel", desc: "Wechselt täglich nach Datum." }],
      limitations: "Datumsbasiertes Fragen-Set.",
    },
    "zh-CN": {
      title: "每日一问与知识挑战赛",
      category: "成长激励",
      whatItDoes: "每天呈现一道跨学科思考题及多主题知识闯关，即时显示解析并奖励 XP。",
      whyAndProblem: "哪怕日程再满也能在两分钟内保持思维活跃与连续打卡。",
      whoBenefits: "希望保持每日学习节奏的同学。",
      steps: ["选出今日一题答案并查看解析，继续下方主题挑战。"],
      options: [{ label: "每日轮换题库", desc: "提交即见详解与经验反馈。" }],
      limitations: "题目按日期确定性轮换。",
    },
    ko: {
      title: "오늘의 문제 및 지식 챌린지",
      category: "레벨 업",
      whatItDoes: "매일 새로운 사고력 퀴즈와 분야별 챌린지 문제를 풀고 보너스 XP를 얻습니다.",
      whyAndProblem: "바쁜 날에도 하루 2분 투자로 꾸준한 학습 습관을 유지할 수 있습니다.",
      whoBenefits: "매일 연속 학습 기록을 이어가고 싶은 학생.",
      steps: ["오늘의 문제에서 보기를 고르고 즉시 해설을 확인하세요."],
      options: [{ label: "일일 퀴즈 & 챌린지", desc: "날짜별로 새로운 문항이 제공됩니다." }],
      limitations: "달력 날짜 기준으로 질문이 순환됩니다.",
    },
  },
  "student-portfolio": {
    en: {
      title: "Student Portfolio & Verified Achievement Ledger",
      category: "Portfolio",
      whatItDoes:
        "Aggregates verified academic milestones, earned badges, skill academy tracks, reflection statements, and project evidence into a structured showcase with JSON/Markdown export.",
      whyAndProblem:
        "Students struggle to collect scattered certificates and milestones when applying for scholarships or universities.",
      whoBenefits: "High schoolers and undergraduates compiling academic portfolios.",
      steps: [
        "Inspect computed achievement evidence pulled from your real activity.",
        "Add personal reflection summaries or showcase project entries.",
        "Export a formatted portfolio summary for applications.",
      ],
      options: [
        { label: "Portfolio Export", desc: "Downloads structured achievement evidence cleanly." },
      ],
      limitations:
        "Evidence derives from platform activity logs; external PDF layout printing uses browser print.",
    },
    ar: {
      title: "ملف إنجاز الطالب الموثق",
      category: "ملف الإنجاز",
      whatItDoes:
        "يجمع الشارات، ومسارات المهارات المنجزة، والمشاريع، وتأملات الطالب في ملف متكامل قابل للتصدير.",
      whyAndProblem: "يعالج تشتت الشهادات والإنجازات عند التقديم للجامعات أو المنح الدراسية.",
      whoBenefits: "الطلاب الساعون لتوثيق مسيرتهم الأكاديمية والمهارية.",
      steps: [
        "استعرض الأدلة المحسوبة تلقائياً من نشاطك في المنصة.",
        "أضف مشاريعك وتأملاتك ثم صدّر ملخص الملف.",
      ],
      options: [{ label: "تصدير ملف الإنجاز", desc: "يصدر سجل إنجازاتك جاهزاً للمشاركة." }],
      limitations: "البيانات تعتمد على نشاطك المسجل في المنصة.",
    },
    ja: {
      title: "生徒ポートフォリオ＆実績記録",
      category: "ポートフォリオ",
      whatItDoes:
        "獲得バッジ、スキル修了、振り返り、プロジェクト成果を一つの成果集にまとめ、書き出しができます。",
      whyAndProblem: "推薦入試や奨学金応募時に活動実績を一から探し直す手間を省きます。",
      whoBenefits: "進学・留学・キャリア準備を行う学生。",
      steps: ["自動集計された実績証拠を確認し、コメントや作品を追記してエクスポートします。"],
      options: [{ label: "実績エクスポート", desc: "整理されたポートフォリオを書き出します。" }],
      limitations: "プラットフォーム上の実績データに基づいて生成されます。",
    },
    fr: {
      title: "Portfolio Étudiant & Preuves d'Acquis",
      category: "Portfolio",
      whatItDoes:
        "Centralise badges, parcours validés, réflexions et projets avec export structuré.",
      whyAndProblem: "Facilite la constitution de dossiers pour bourses et universités.",
      whoBenefits: "Lycéens et étudiants préparant leurs candidatures.",
      steps: [
        "Vérifiez les preuves issues de vos activités, complétez vos réflexions et exportez.",
      ],
      options: [{ label: "Export Portfolio", desc: "Télécharge un récapitulatif structuré." }],
      limitations: "Fondé sur vos activités enregistrées sur la plateforme.",
    },
    de: {
      title: "Schüler-Portfolio & Leistungsnachweis",
      category: "Portfolio",
      whatItDoes:
        "Sammelt Badges, Skill-Abschlüsse, Reflexionen und Projekte exportfertig an einem Ort.",
      whyAndProblem: "Erleichtert Bewerbungen für Stipendien oder Hochschulen.",
      whoBenefits: "Lernende zur Dokumentation ihrer Erfolge.",
      steps: ["Automatische Nachweise prüfen, eigene Projekte ergänzen und exportieren."],
      options: [{ label: "Portfolio-Export", desc: "Erzeugt strukturierte Zusammenfassungen." }],
      limitations: "Basiert auf protokollierten Plattform-Aktivitäten.",
    },
    "zh-CN": {
      title: "学生个人成就作品集档案",
      category: "成长档案",
      whatItDoes: "汇总平台勋章、技能课认证、反思陈述与代表项目，支持格式化导出用于申请。",
      whyAndProblem: "免去申请奖学金或大学时四处翻找获奖与活动记录的烦恼。",
      whoBenefits: "筹备升学或奖学金申请的中学和大学生。",
      steps: ["查看系统基于真实记录提取的成就证据，补充代表作品后一键导出。"],
      options: [{ label: "档案导出", desc: "导出结构化成就清单。" }],
      limitations: "所列依据均来自平台实际活动日志。",
    },
    ko: {
      title: "학생 포트폴리오 및 성취 기록",
      category: "포트폴리오",
      whatItDoes:
        "획득 배지, 이수한 스킬 트랙, 프로젝트 성과와 성찰을 모아 내보낼 수 있는 포트폴리오입니다.",
      whyAndProblem:
        "진학이나 장학금 지원 시 흩어진 활동 내역을 일일이 찾는 번거로움을 줄여줍니다.",
      whoBenefits: "입시·취업·장학금 지원을 준비하는 학생.",
      steps: ["활동 기록에서 추출된 성취 증거를 확인하고 성찰이나 프로젝트를 추가해 내보내세요."],
      options: [{ label: "포트폴리오 내보내기", desc: "정리된 이력 요약을 다운로드합니다." }],
      limitations: "플랫폼 내 활동 로그를 근거로 자동 구성됩니다.",
    },
  },
  "thinking-studio": {
    en: {
      title: "Critical Thinking, Logic & Debate Studio",
      category: "Cognitive Skills",
      whatItDoes:
        "Trains students on 6 structured modules (#19–24): fallacy detection, argument mapping, root-cause 5-Whys, bias checks, Socratic questioning, and debate prep.",
      whyAndProblem:
        "Builds disciplined reasoning so students evaluate claims critically rather than accepting surface opinions.",
      whoBenefits: "Debaters, essay writers, MUN delegates, and STEM researchers.",
      steps: [
        "Pick one of the thinking & debate modules.",
        "Fill argument claims, evidence, counterarguments, or fallacy answers and save.",
      ],
      options: [
        {
          label: "6 Reasoning Drills",
          desc: "Saves logic exercises and awards completion progress.",
        },
      ],
      limitations: "Interactive self-guided exercises stored locally/per ecosystem state.",
    },
    ar: {
      title: "استوديو التفكير النقدي والمنطق والمناظرة",
      category: "المهارات المعرفية",
      whatItDoes:
        "يدربك عبر 6 وحدات (#19–24) على كشف المغالطات، بناء الحجج، تحليل السبب الجذري، وتحضير المناظرات.",
      whyAndProblem: "يعزز التفكير المنطقي الرصين والقدرة على تقييم الادعاءات بالأدلة.",
      whoBenefits: "المتناظرون، وكتاب المقالات، ومندوبو نموذج الأمم المتحدة.",
      steps: ["اختر إحدى وحدات التفكير والمناظرة وأكمل حقول الحجة والدليل والرد المضاد."],
      options: [{ label: "تمارين التفكير الستة", desc: "تحفظ تدريباتك المنطقية في ملفك." }],
      limitations: "تمارين تفاعلية ذاتية الحفظ في مخزن نظام الطالب.",
    },
    ja: {
      title: "批判的思考・論理学・ディベートスタジオ",
      category: "思考スキル",
      whatItDoes:
        "誤謬見抜き、論証マップ、5なぜ分析、バイアス点検、ソクラテス式問答、ディベート構成の6演習を提供します。",
      whyAndProblem: "主張を根拠と反論から論理的に組み立てる力を養います。",
      whoBenefits: "ディベート、小論文、MUN、研究に取り組む学生。",
      steps: ["演習モジュールを選び、主張・根拠・反論を入力して演習を進めます。"],
      options: [{ label: "6つの思考ドリル", desc: "実践入力と進捗管理ができます。" }],
      limitations: "自己学習型演習としてローカル／エコシステム状態に保存されます。",
    },
    fr: {
      title: "Studio Esprit Critique, Logique & Débat",
      category: "Compétences Cognitives",
      whatItDoes:
        "Propose 6 ateliers (#19–24) : détection de sophismes, carte d'arguments, 5 Pourquoi, biais et débat.",
      whyAndProblem: "Renforce la rigueur argumentative face aux affirmations superficielles.",
      whoBenefits: "Débatteurs, rédacteurs et délégués MUN.",
      steps: ["Choisissez un module et structurez thèse, preuves et réfutation."],
      options: [{ label: "6 exercices logiques", desc: "Enregistre vos progrès de raisonnement." }],
      limitations: "Ateliers interactifs sauvegardés dans l'état du compte.",
    },
    de: {
      title: "Denk-, Logik- & Debattier-Studio",
      category: "Kognitive Stärke",
      whatItDoes:
        "Trainiert 6 Module (#19–24): Fehlschlüsse erkennen, Argumente strukturieren, 5-Why-Analyse und Debattenvorbereitung.",
      whyAndProblem: "Stärkt präzise Argumentation statt oberflächlicher Meinungen.",
      whoBenefits: "Debattierclubs, Aufsatzschreiber und MUN-Teilnehmende.",
      steps: ["Modul auswählen und Argument, Beleg sowie Gegenargument ausarbeiten."],
      options: [{ label: "6 Denkübungen", desc: "Speichert Übungsfortschritt im Ökosystem." }],
      limitations: "Selbstgeführte Übungen mit lokaler/synchroner Speicherung.",
    },
    "zh-CN": {
      title: "批判思维、逻辑与辩论工作室",
      category: "认知能力",
      whatItDoes:
        "提供识别谬误、论据图谱、五问归因、偏见排查、苏格拉底追问及辩论立论 6 大训练模块。",
      whyAndProblem: "培养严谨论证与独立审辨习惯，写作和辩论更有说服力。",
      whoBenefits: "辩手、模联代表及学术写作练习者。",
      steps: ["进入任意模块完成立论、论据与反驳拆解。"],
      options: [{ label: "六大思维训练营", desc: "记录推演草稿与完成进度。" }],
      limitations: "属于引导式互动训练，数据保存于个人学习记录中。",
    },
    ko: {
      title: "비판적 사고 · 논리 · 토론 스튜디오",
      category: "인지 역량",
      whatItDoes:
        "오류 판별, 논증 구조화, 5-Whys 원인 분석, 편향 점검, 소크라테스 질문법, 토론 준비 등 6가지 훈련(#19–24)을 제공합니다.",
      whyAndProblem: "근거 없는 주장을 가려내고 논리적으로 설득하는 힘을 길러줍니다.",
      whoBenefits: "토론, 에세이 작성, 모의유엔(MUN), 탐구 활동을 하는 학생.",
      steps: ["원하는 사고 모듈을 선택하고 주장·근거·반론을 입력해 연습하세요."],
      options: [{ label: "6가지 논리 훈련", desc: "실습 내용과 완료 내역을 저장합니다." }],
      limitations: "자가 주도형 실습 도구로 에코시스템 상태에 저장됩니다.",
    },
  },
  "coding-studio": {
    en: {
      title: "Coding, Algorithms & Robotics Studio",
      category: "Tech & Engineering",
      whatItDoes:
        "Provides 5 interactive tracks (#25–29): visual algorithm tracing, logic gate & sensor simulator, HTML/JS sandbox checks, debugging drills, and robotics state machines.",
      whyAndProblem:
        "Helps students grasp control flow, debugging, and robotics logic hands-on right in the browser.",
      whoBenefits: "Computer science beginners, robotics club teams, and hackathon students.",
      steps: [
        "Pick one of the 5 tech submodules.",
        "Adjust inputs, trace execution steps, or test debugging fixes live.",
      ],
      options: [
        {
          label: "5 Interactive Tech Labs",
          desc: "Runs instant browser-side simulations without external setup.",
        },
      ],
      limitations:
        "Simulated logic runs safely in-browser rather than flashing physical hardware microcontrollers.",
    },
    ar: {
      title: "استوديو البرمجة والخوارزميات والروبوتيكس",
      category: "التقنية والهندسة",
      whatItDoes:
        "يقدم 5 مختبرات عملية (#25–29): تتبع الخوارزميات، بوابات المنطق والمستشعرات، فحص الأخطاء البرمجية، ومنطق الروبوت.",
      whyAndProblem: "يجعل فهم التدفق البرمجي واكتشاف الأخطاء تفاعلياً وممتعاً مباشرة من المتصفح.",
      whoBenefits: "مبتدئو البرمجة وفرق الروبوتيكس والهاكاثون.",
      steps: ["اختر أحد المختبرات الخمسة وجرب القيم والمدخلات لمشاهدة التنفيذ الفوري."],
      options: [{ label: "5 مختبرات تقنية", desc: "محاكاة فورية آمنة داخل المتصفح." }],
      limitations: "المحاكاة رقمية داخل المتصفح ولا تبرمج أجهزة مادية مباشرة.",
    },
    ja: {
      title: "コーディング・アルゴリズム・ロボティクススタジオ",
      category: "テック＆工学",
      whatItDoes:
        "アルゴリズム追跡、論理ゲート＆センサー模擬、デバッグ演習、ロボット状態機械の5モジュールを提供します。",
      whyAndProblem: "プログラム制御やデバッグの考え方をブラウザ上で手を動かして理解できます。",
      whoBenefits: "プログラミング入門者、ロボット部、ハッカソン参加者。",
      steps: ["5つのサブモジュールから選び、入力を変えて挙動を確認します。"],
      options: [{ label: "5種の対話ラボ", desc: "環境構築なしで即座にシミュレーション可能です。" }],
      limitations: "ブラウザ内シミュレーションであり実機マイコンへの直接書き込みには非対応です。",
    },
    fr: {
      title: "Studio Code, Algorithmes & Robotique",
      category: "Tech & Ingénierie",
      whatItDoes:
        "Réunit 5 ateliers (#25–29) : trace d'algorithmes, portes logiques/capteurs, débogage et automates robotiques.",
      whyAndProblem: "Rend la logique algorithmique concrète sans configuration complexe.",
      whoBenefits: "Débutants en informatique et clubs de robotique.",
      steps: ["Sélectionnez un module et testez vos paramètres en direct."],
      options: [{ label: "5 labos interactifs", desc: "Simulation immédiate côté navigateur." }],
      limitations: "Simulation logicielle sans téléversement sur microcontrôleur physique.",
    },
    de: {
      title: "Coding-, Algorithmen- & Robotik-Studio",
      category: "Technik",
      whatItDoes:
        "Bietet 5 Labore (#25–29): Algorithmen-Trace, Logikgatter & Sensoren, Debugging-Drills und Robotik-Zustände.",
      whyAndProblem: "Macht Programmfluss und Fehlersuche ohne lokale Installation erlebbar.",
      whoBenefits: "Informatik-Einsteigende und Robotik-AGs.",
      steps: ["Labor auswählen, Eingaben verändern und Abläufe testen."],
      options: [{ label: "5 Technik-Labore", desc: "Sofortige Browser-Simulation." }],
      limitations: "Reine Browser-Simulation ohne direkte Hardware-Anbindung.",
    },
    "zh-CN": {
      title: "编程、算法与机器人工作室",
      category: "科技工程",
      whatItDoes:
        "囊括算法单步追踪、逻辑门与传感器模拟、代码排错演练及机器人状态机等 5 个互动实验模块。",
      whyAndProblem: "无需配置本地编译器即可直观动手理解控制流与排错思路。",
      whoBenefits: "编程入门生、机器人社团与创客比赛选手。",
      steps: ["切换 5 个技术实验标签，调整输入参数观察逻辑输出。"],
      options: [{ label: "五大互动工坊", desc: "浏览器端即时演算运行。" }],
      limitations: "仅作浏览器逻辑仿真，不直接烧录实体硬件主板。",
    },
    ko: {
      title: "코딩 · 알고리즘 · 로보틱스 스튜디오",
      category: "기술 및 공학",
      whatItDoes:
        "알고리즘 단계 추적, 논리 게이트·센서 시뮬레이터, 디버깅 훈련, 로봇 상태 머신 등 5가지 트랙(#25–29)을 제공합니다.",
      whyAndProblem:
        "복잡한 개발 환경 설치 없이 제어 흐름과 디버깅 원리를 브라우저에서 실습할 수 있습니다.",
      whoBenefits: "컴퓨터과학 입문자, 로봇 동아리 및 해커톤 참가 학생.",
      steps: ["5개 세부 모듈 중 하나를 골라 입력을 바꾸며 동작을 테스트하세요."],
      options: [
        { label: "5가지 인터랙티브 랩", desc: "즉시 실행되는 안전 시뮬레이션을 제공합니다." },
      ],
      limitations: "실제 하드웨어 업로드는 지원하지 않는 브라우저 내 시뮬레이션입니다.",
    },
  },
  "future-pathways": {
    en: {
      title: "Career & Future Pathways Explorer",
      category: "Future Pathways",
      whatItDoes:
        "Matches student interests and strengths to curated career pathways, computes fit percentages, saves custom multi-milestone plans, and exports prep tasks.",
      whyAndProblem:
        "Helps uncertain students turn vague ambitions into concrete multi-step preparation roadmaps.",
      whoBenefits: "Middle/high schoolers and university students exploring majors and careers.",
      steps: [
        "Toggle Interest and Strength chips to filter matching careers and inspect Fit %.",
        "Save any pathway or build a Custom Plan with your own milestones.",
        "Check off completed milestones or click to add prep tasks.",
      ],
      options: [
        { label: "Interest & Strength Fit %", desc: "Calculates pathway alignment dynamically." },
        {
          label: "Milestone to Task",
          desc: "Sends any preparation milestone to your Tasks planner.",
        },
      ],
      limitations:
        "Pathway templates are educational reference roadmaps; combine with counselor advice for official degree rules.",
    },
    ar: {
      title: "مستكشف المسارات المهنية والمستقبلية",
      category: "مسارات المستقبل",
      whatItDoes:
        "يطابق اهتماماتك ومهاراتك مع مسارات مهنية مع نسبة التوافق، ويحفظ خطط المعالم المخصصة ويرسلها للمهام.",
      whyAndProblem: "يحول التساؤلات حول التخصص الجامعي والمهنة إلى خطة تحضير عملية واضحة.",
      whoBenefits: "طلاب المرحلتين الثانوية والجامعية عند التخطيط للتخصصات.",
      steps: [
        "اختر اهتماماتك ونقاط قوتك لرؤية نسبة التوافق مع كل مسار.",
        "احفظ أي مسار أو أنشئ خطتك المخصصة وحوّل معالمها لمهام.",
      ],
      options: [
        { label: "مؤشر التوافق %", desc: "يحسب مدى ملاءمة المسار لاختياراتك." },
        { label: "تحويل المعلم لمهمة", desc: "يضيف خطوات الاستعداد مباشرة لقائمة مهامك." },
      ],
      limitations: "القوالب إرشادية؛ يُنصح بمراجعة المرشد الأكاديمي لمتطلبات القبول الرسمية.",
    },
    ja: {
      title: "将来・キャリアパス探求",
      category: "将来設計",
      whatItDoes:
        "興味と強みから適性キャリアを適合率（Fit%）付きで提案し、マイルストーン計画とタスク連携を行います。",
      whyAndProblem: "進路への漠然とした不安を具体的な準備ロードマップへと具体化します。",
      whoBenefits: "進路・学部選びやキャリア形成を考える中高生・大学生。",
      steps: ["興味・強みチップを選んで適合度を確認し、計画として保存します。"],
      options: [
        { label: "適合スコア＆タスク化", desc: "マイルストーンを課題リストへ展開できます。" },
      ],
      limitations: "参考ロードマップであり、公式な大学要件は各機関の要項をご確認ください。",
    },
    fr: {
      title: "Explorateur de Parcours & Carrières",
      category: "Avenir",
      whatItDoes:
        "Associe vos centres d'intérêt et points forts à des voies professionnelles avec score d'affinité et jalons modifiables.",
      whyAndProblem: "Transforme une orientation floue en plan d'action structuré.",
      whoBenefits: "Lycéens et étudiants choisissant leur filière.",
      steps: [
        "Sélectionnez vos intérêts/forces, comparez le Fit % et enregistrez votre feuille de route.",
      ],
      options: [
        { label: "Score Fit % & Tâches", desc: "Exporte les étapes clés vers vos tâches." },
      ],
      limitations: "Modèles indicatifs à compléter avec votre conseiller d'orientation.",
    },
    de: {
      title: "Zukunfts- & Karrierepfad-Explorer",
      category: "Zukunft",
      whatItDoes:
        "Gleicht Interessen und Stärken mit Berufsfeldern ab, berechnet Fit-%-Werte und speichert Meilensteinpläne.",
      whyAndProblem: "Macht vage Berufswünsche zu greifbaren Vorbereitungsplänen.",
      whoBenefits: "Schüler und Studierende bei der Studien- und Berufswahl.",
      steps: ["Interessen und Stärken markieren, Plan speichern und Meilensteine abhaken."],
      options: [{ label: "Fit-% & Aufgaben-Export", desc: "Sendet Schritte direkt in Aufgaben." }],
      limitations: "Orientierungshilfen – verbindliche Zulassungsregeln direkt prüfen.",
    },
    "zh-CN": {
      title: "职业与升学未来路径探索器",
      category: "未来规划",
      whatItDoes:
        "根据你的兴趣与优势标签匹配职业赛道、计算契合度百分比，并支持自定义里程碑计划及一键转待办。",
      whyAndProblem: "把模糊的升学/求职想法落成可打卡的阶段准备地图。",
      whoBenefits: "正在思考选专业或未来职业方向的中学和大学生。",
      steps: ["勾选兴趣与优势标签查看契合度，保存路线或自建计划并逐项打卡。"],
      options: [{ label: "契合度与转任务", desc: "把关键节点直推每日任务表。" }],
      limitations: "所列节点为通用成长指南，实际升学政策请核对官方招生简章。",
    },
    ko: {
      title: "진로 및 미래 경로 탐색기",
      category: "미래 설계",
      whatItDoes:
        "관심사와 강점을 선택하면 진로 적합도(%)를 계산하고 마일스톤 계획을 저장해 할 일로 보낼 수 있습니다.",
      whyAndProblem: "막연한 진로 고민을 단계별 실행 로드맵으로 바꿔줍니다.",
      whoBenefits: "전공 선택과 커리어를 탐색 중인 중고등·대학생.",
      steps: ["관심사·강점 칩을 고르고 적합도가 높은 진로 계획을 저장해 실천하세요."],
      options: [
        { label: "적합도(%) & 과제 연동", desc: "준비 단계를 바로 할 일 목록에 추가합니다." },
      ],
      limitations: "참고용 가이드이므로 공식 입시·자격 요건은 해당 기관 안내를 확인하세요.",
    },
  },
  "university-projects": {
    en: {
      title: "University Prep & Student Project Builder",
      category: "Future Pathways",
      whatItDoes:
        "Tracks university admission checklists, personal statement drafts, and capstone/team project scopes inside dedicated sub-tabs.",
      whyAndProblem:
        "Keeps scattered college prep essays, deadlines, and build deliverables organized in one hub.",
      whoBenefits:
        "Upper-year high schoolers preparing applications and students running independent build projects.",
      steps: [
        "Switch to the University or Projects tab inside Future Pathways.",
        "Complete readiness items or scaffold new student projects.",
      ],
      options: [
        {
          label: "University / Project Views",
          desc: "Dedicated checklists and milestone scaffolds.",
        },
      ],
      limitations:
        "Checklist data tracks within student ecosystem storage; official portals handle actual submissions.",
    },
    ar: {
      title: "إعداد الجامعة ومُنشئ المشاريع الطلابية",
      category: "مسارات المستقبل",
      whatItDoes: "يتابع قوائم التقديم للجامعات، ومسودات خطاب الدافع، وتخطيط المشاريع الطلابية.",
      whyAndProblem: "يجمع متطلبات القبول الجامعي والمشاريع العملية في مكان واحد منظم.",
      whoBenefits: "طلاب الثانوية المقبلون على الجامعة والطلاب أصحاب المشاريع.",
      steps: ["انتقل إلى تبويب الجامعة أو المشاريع في صفحة المستقبل لتتبع المتطلبات."],
      options: [{ label: "قوائم الجاهزية والمشاريع", desc: "تنظم خطوات التقديم والتنفيذ." }],
      limitations: "التقديم الفعلي يتم عبر بوابات الجامعات الرسمية.",
    },
    ja: {
      title: "大学進学準備＆学生プロジェクト",
      category: "将来設計",
      whatItDoes:
        "出願チェックリスト、志望理由書構成、自主プロジェクト設計の進捗を一元管理します。",
      whyAndProblem: "受験準備と探究・制作活動の管理が分散するのを防ぎます。",
      whoBenefits: "大学出願を控えた高校生や制作プロジェクトを進める学生。",
      steps: ["将来ページ内の大学・プロジェクトタブで準備項目をチェックします。"],
      options: [{ label: "出願チェック＆設計", desc: "必須書類や工程を漏れなく追跡します。" }],
      limitations: "実際の出願提出は各大学の公式ポータルで行ってください。",
    },
    fr: {
      title: "Préparation Université & Projets Étudiants",
      category: "Avenir",
      whatItDoes:
        "Suit les listes d'admission universitaire, lettres de motivation et cahiers des charges de projets.",
      whyAndProblem: "Centralise échéances post-bac et projets personnels.",
      whoBenefits: "Lycéens et étudiants bâtissant un projet ou dossier.",
      steps: ["Ouvrez les onglets Université ou Projets dans Avenir."],
      options: [{ label: "Listes & Projets", desc: "Structure candidatures et livrables." }],
      limitations: "Les candidatures officielles restent à déposer sur les portails dédiés.",
    },
    de: {
      title: "Studienvorbereitung & Projekt-Builder",
      category: "Zukunft",
      whatItDoes:
        "Verwaltet Hochschul-Checklisten, Motivationsschreiben und eigene Projektkonzepte.",
      whyAndProblem: "Bündelt Bewerbungsschritte und Projektmeilensteine.",
      whoBenefits: "Oberstufe und Studierende mit Praxisprojekten.",
      steps: ["Tabs Universität oder Projekte öffnen und Checklisten pflegen."],
      options: [{ label: "Checklisten & Konzepte", desc: "Strukturierte Vorbereitung." }],
      limitations: "Offizielle Bewerbungen erfolgen über die Hochschulportale.",
    },
    "zh-CN": {
      title: "大学申请筹备与学生项目孵化器",
      category: "未来规划",
      whatItDoes: "管理大学申请清单、个人陈述构思以及课题/科创项目框架。",
      whyAndProblem: "把繁杂的申请资料准备与项目进度表集中管理。",
      whoBenefits: "高年级中学生与开展自主科研/作品项目的学生。",
      steps: ["在未来页面切换大学筹备或项目孵化标签，勾选清单与编写提纲。"],
      options: [{ label: "申请清单与项目脚手架", desc: "防止遗漏关键材料与里程碑。" }],
      limitations: "实际网申仍需前往目标院校官方网站提交。",
    },
    ko: {
      title: "대학 진학 준비 및 학생 프로젝트 빌더",
      category: "미래 설계",
      whatItDoes:
        "대학 지원 체크리스트, 자기소개서 초안, 개인·팀 프로젝트 기획을 하위 탭에서 체계적으로 관리합니다.",
      whyAndProblem: "흩어지기 쉬운 입시 준비 문서와 프로젝트 일정을 한곳에 모아줍니다.",
      whoBenefits: "대학 입학을 준비하는 고등학생과 프로젝트 중심 학습자.",
      steps: ["미래 탭에서 대학 또는 프로젝트 보기로 이동해 항목을 채워보세요."],
      options: [{ label: "진학 체크리스트 & 프로젝트", desc: "준비 단계와 산출물을 추적합니다." }],
      limitations: "실제 원서 접수는 각 대학 공식 포털에서 진행해야 합니다.",
    },
  },
  "science-fair-impact": {
    en: {
      title: "Science Fair Blueprint & Community Impact Planner",
      category: "Impact & Research",
      whatItDoes:
        "Structures science fair boards (question, hypothesis, variables, method, results) alongside measurable student community service initiatives.",
      whyAndProblem:
        "Turns raw curiosity or volunteering spirit into judge-ready documentation and measurable community impact.",
      whoBenefits: "Science fair competitors and Be The Change social impact volunteers.",
      steps: [
        "Open the Science Fair & Impact tab inside Future Pathways.",
        "Document hypothesis, variables, and community beneficiary metrics.",
      ],
      options: [
        { label: "Experiment & Impact Cards", desc: "Guides presentation-ready documentation." },
      ],
      limitations: "Saves cleanly in client/ecosystem state for rapid iteration.",
    },
    ar: {
      title: "مخطط المعرض العلمي والأثر المجتمعي",
      category: "الأثر والبحث",
      whatItDoes:
        "ينظم لوحة المعرض العلمي (السؤال، الفرضية، المتغيرات، النتائج) ومبادرات خدمة المجتمع وقياس الأثر.",
      whyAndProblem: "يحوّل الحماس البحثي والتطوعي إلى وثائق احترافية جاهزة للتحكيم.",
      whoBenefits: "المشاركون في المعارض العلمية ومبادرات التغيير الإيجابي (BTC).",
      steps: ["افتح تبويب المعرض العلمي والأثر المجتمعي لتدوين الفرضيات ومؤشرات الأثر."],
      options: [{ label: "نماذج البحث والأثر", desc: "ترتب عرض مشروعك أمام لجان التحكيم." }],
      limitations: "يُحفظ العمل في مخزن نظام الطالب للتعديل السريع.",
    },
    ja: {
      title: "サイエンスフェア＆社会貢献プランナー",
      category: "研究・社会貢献",
      whatItDoes:
        "科学コンテスト用の研究設計（問い・仮説・変数・結果）と地域貢献活動の成果指標を整理します。",
      whyAndProblem: "アイデアやボランティア意欲を審査員に伝わる構成へとまとめます。",
      whoBenefits: "自由研究・科学展出場者およびBTCコミュニティ活動を行う学生。",
      steps: ["仮説や変数、活動の受益指標を入力して設計図を完成させます。"],
      options: [{ label: "研究＆インパクト設計", desc: "発表向けドキュメント構成を作ります。" }],
      limitations: "エコシステム状態に保存して随時改善できます。",
    },
    fr: {
      title: "Expo-Sciences & Impact Communautaire",
      category: "Recherche & Impact",
      whatItDoes:
        "Structure projets scientifiques (problématique, hypothèse, variables) et initiatives citoyennes.",
      whyAndProblem: "Transforme idées de recherche et bénévolat en dossiers prêts pour un jury.",
      whoBenefits: "Participants aux concours scientifiques et porteurs d'actions solidaires.",
      steps: ["Renseignez hypothèse, protocole et indicateurs d'impact dans l'onglet dédié."],
      options: [
        { label: "Fiches Recherche & Impact", desc: "Prépare des dossiers clairs et mesurables." },
      ],
      limitations: "Sauvegardé dans votre espace écosystème.",
    },
    de: {
      title: "Science-Fair- & Community-Impact-Planer",
      category: "Forschung & Wirkung",
      whatItDoes:
        "Strukturiert Wettbewerbsprojekte (Frage, Hypothese, Variablen) sowie gemeinnützige Initiativen.",
      whyAndProblem: "Macht Forschung und Engagement juryreif und messbar.",
      whoBenefits: "Jugend-forscht-Teilnehmende und engagierte Schülerinnen und Schüler.",
      steps: ["Hypothese, Methodik und Wirkungskennzahlen strukturiert ausfüllen."],
      options: [{ label: "Projekt- & Impact-Vorlagen", desc: "Unterstützt Dokumentation." }],
      limitations: "Speicherung im Konto-Ökosystem.",
    },
    "zh-CN": {
      title: "科创竞赛蓝图与社区公益影响规划",
      category: "科研与公益",
      whatItDoes:
        "梳理科学竞赛展板要素（研究问题、假设、变量、方法、结论）及学生社区服务的量化公益成效。",
      whyAndProblem: "让探索灵感与公益热忱沉淀为评委认可的规范化文档与可量化成果。",
      whoBenefits: "科创赛参赛者及参与「Be The Change」社会行动的学生。",
      steps: ["进入该标签填写实验变量、假设或志愿服务受益指标。"],
      options: [{ label: "科研与影响力卡片", desc: "贴合评委评分维度的框架。" }],
      limitations: "记录在学生生态本地与关联配置中便于反复打磨。",
    },
    ko: {
      title: "과학 전람회 및 커뮤니티 임팩트 플래너",
      category: "연구 및 사회공헌",
      whatItDoes:
        "과학 탐구 발표 구조(연구 질문, 가설, 변인, 방법, 결과)와 학생 봉사·임팩트 지표를 설계합니다.",
      whyAndProblem: "호기심과 봉사 열정을 심사위원이 보기 좋은 체계적 성과 문서로 완성해 줍니다.",
      whoBenefits: "과학 대회 참가자 및 Be The Change 사회공헌 활동 학생.",
      steps: ["미래 탭 내 과학·임팩트 보기로 이동해 가설과 성과 지표를 작성하세요."],
      options: [{ label: "탐구 & 임팩트 설계", desc: "발표용 구조 문서를 간편히 정리합니다." }],
      limitations: "에코시스템 저장소에 보관되어 수시로 수정할 수 있습니다.",
    },
  },
};
