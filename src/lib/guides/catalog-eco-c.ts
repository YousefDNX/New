import type { FeatureGuideEntry } from "./types";

export const ECO_GUIDES_C: Record<string, FeatureGuideEntry> = {
  "learning-places-map": {
    en: {
      title: "Google Maps Learning Places & Campus Explorer",
      category: "Discovery & Maps",
      whatItDoes:
        "Searches nearby libraries, study cafes, university campuses, STEM labs, and museums on an interactive Google Map.",
      whyAndProblem: "Helps students discover quiet study environments or academic venues nearby.",
      whoBenefits: "Students looking for libraries, workshops, or university campuses.",
      steps: [
        "Open the Places Map drawer in Future Pathways or Opportunities.",
        "Enter a place query (e.g., library, museum, university) and inspect map pins.",
      ],
      options: [
        {
          label: "Search Query & Pins",
          desc: "Loads real Google Maps place cards and directions.",
        },
      ],
      limitations:
        "Requires active internet connection and valid Google Maps quota; subject to daily Maps API limits.",
    },
    ar: {
      title: "خريطة أماكن التعلم والجامعات",
      category: "الاكتشاف والخرائط",
      whatItDoes:
        "يبحث عن المكتبات ومقاهي الدراسة والجامعات والمختبرات والمتاحف القريبة على خرائط Google التفاعلية.",
      whyAndProblem: "يساعد الطالب في إيجاد بيئات هادئة للمذاكرة أو مواقع تعليمية قريبة.",
      whoBenefits: "الطلاب الباحثون عن مكتبات أو جامعات أو ورش عمل.",
      steps: ["افتح زر الخريطة في صفحة المستقبل أو الفرص واكتب نوع المكان."],
      options: [{ label: "بحث الأماكن", desc: "يعرض بطاقات المواقع والعلامات على الخريطة." }],
      limitations: "يعتمد على توفر حصة Google Maps API وقد يتأثر بحدود الاستخدام اليومية.",
    },
    ja: {
      title: "学習スポット＆キャンパス探索マップ",
      category: "探索＆マップ",
      whatItDoes:
        "周辺の図書館、自習スペース、大学キャンパス、科学館などをGoogleマップ上で検索できます。",
      whyAndProblem: "集中できる学習場所や進学先施設を手早く見つけられます。",
      whoBenefits: "静かな自習場所やキャンパス情報を探したい学生。",
      steps: ["将来・機会ページからマップを開きキーワードで検索します。"],
      options: [{ label: "施設検索＆ピン", desc: "周辺スポットと案内リンクを表示します。" }],
      limitations: "Google Maps APIの通信とクォータ上限に依存します。",
    },
    fr: {
      title: "Carte des Lieux d'Étude & Campus",
      category: "Découverte & Cartes",
      whatItDoes:
        "Localise bibliothèques, cafés d'étude, universités et musées via Google Maps interactif.",
      whyAndProblem: "Aide à trouver rapidement un lieu calme pour réviser.",
      whoBenefits: "Étudiants cherchant bibliothèques ou campus.",
      steps: ["Ouvrez la carte dans Avenir ou Opportunités puis saisissez votre recherche."],
      options: [{ label: "Recherche par lieu", desc: "Affiche marqueurs et fiches détaillées." }],
      limitations: "Soumis à la disponibilité et au quota de l'API Google Maps.",
    },
    de: {
      title: "Lernorte- & Campus-Karte",
      category: "Karten",
      whatItDoes: "Sucht nahe Bibliotheken, Lerncafés, Universitäten und Museen auf Google Maps.",
      whyAndProblem: "Hilft beim Finden ruhiger Lernorte.",
      whoBenefits: "Lernende auf der Suche nach Bibliotheken oder Campussen.",
      steps: ["Kartenansicht öffnen und Suchbegriff eingeben."],
      options: [{ label: "Orts-Suche", desc: "Zeigt Markierungen und Standortinfos." }],
      limitations: "Abhängig von Internetzugang und Google Maps API-Kontingent.",
    },
    "zh-CN": {
      title: "学习场所与校园地图探索",
      category: "探索与地图",
      whatItDoes: "利用交互式 Google 地图检索周边图书馆、自习咖啡馆、大学校园与博物馆。",
      whyAndProblem: "帮学生迅速定位安静自习环境或研学地标。",
      whoBenefits: "寻找图书馆、大学开放日地点或科研场馆的学生。",
      steps: ["在未来规划或机会雷达页展开地图工具栏并输入地点关键词。"],
      options: [{ label: "地标检索与标记", desc: "展示位置图钉与详情信息。" }],
      limitations: "依赖在线网络与 Google Maps API 配额；超出配额时会弹出提醒。",
    },
    ko: {
      title: "학습 장소 및 캠퍼스 지도 탐색기",
      category: "탐색 및 지도",
      whatItDoes:
        "주변 도서관, 스터디 카페, 대학 캠퍼스, 박물관 등을 Google 지도에서 바로 검색합니다.",
      whyAndProblem: "집중할 수 있는 학습 공간이나 방문할 교육 시설을 빠르게 찾도록 돕습니다.",
      whoBenefits: "도서관, 연구 시설, 대학 탐방 정보를 찾는 학생.",
      steps: ["진로 또는 기회 페이지에서 지도를 열고 장소 키워드를 검색하세요."],
      options: [{ label: "장소 검색 및 핀", desc: "주변 교육 장소 정보와 위치를 표시합니다." }],
      limitations: "Google Maps API 연결 및 일일 할당량 제한에 따라 동작합니다.",
    },
  },
  "opportunities-radar": {
    en: {
      title: "Student Opportunities Radar & Deadline Saver",
      category: "Opportunities",
      whatItDoes:
        "Discovers scholarships, competitions, internships, and camps filterable by Kuwait/GCC/Global scope, tracks personal saved/applied status, verifies live info via AI Search, and pushes prep checklists to Tasks.",
      whyAndProblem:
        "Centralizes scattered scholarship deadlines and application checklists before students miss cutoff dates.",
      whoBenefits:
        "Students applying for scholarships, Olympiads, summer research, or youth programs.",
      steps: [
        "Filter by Scope (Kuwait, GCC, Global) and Category.",
        "Save opportunities or log manual discoveries, and update status (Saved -> Applied -> Archived).",
        "Click Add Prep Checklist to push application steps into Tasks.",
      ],
      options: [
        {
          label: "Live Web Verification",
          desc: "Runs grounded AI search to double-check current program status.",
        },
        {
          label: "Prep Task Export",
          desc: "Creates a high-priority task with 3 application subtasks.",
        },
      ],
      limitations:
        "Reference catalog entries reflect curated dates; always verify official links (and web verification requires AI API key).",
    },
    ar: {
      title: "رادار الفرص الطلابية والمنح",
      category: "الفرص",
      whatItDoes:
        "يستكشف المنح والمسابقات والتدريب حسب النطاق (الكويت، الخليج، عالمي) مع حفظ التقدم والتحقق بالبحث الذكي وإنشاء مهام التحضير.",
      whyAndProblem: "يجمع مواعيد المنح المتناثرة وقوائم التقديم في مكان واحد قبل فوات الأوان.",
      whoBenefits: "الطلاب المتقدمون للمنح الدراسية والأولمبيادات والبرامج الشبابية.",
      steps: [
        "صفِّ الفرص حسب النطاق الجغرافي والفئة.",
        "احفظ الفرص المهمة وتابع حالتها وأضف قائمة التحضير لمهامك.",
      ],
      options: [
        {
          label: "التحقق عبر البحث الحي",
          desc: "يتحقق من أحدث تفاصيل البرنامج بالذكاء الاصطناعي.",
        },
        { label: "توليد قائمة الاستعداد", desc: "ينشئ مهمة تحضير مفصلة بمهامها الفرعية." },
      ],
      limitations: "يرجى مراجعة الروابط الرسمية للجهات؛ البحث الحي يتطلب مفتاح AI.",
    },
    ja: {
      title: "奨学金・機会レーダー",
      category: "機会・進路",
      whatItDoes:
        "奨学金・競技会・インターンシップを地域（クウェート/GCC/世界）別に検索し、応募状況管理、AI Web照合、対策タスク生成を行えます。",
      whyAndProblem: "締切を見落としがちな応募情報を一元管理します。",
      whoBenefits: "奨学金・コンテスト・サマープログラムへ応募したい学生。",
      steps: ["地域とカテゴリーで絞り込み、気になる機会を保存して準備タスクを登録します。"],
      options: [
        {
          label: "ライブWeb検証＆対策タスク",
          desc: "最新情報を検索確認し応募準備タスクを作成します。",
        },
      ],
      limitations: "公式要項は必ず主催サイトでご確認ください。Web検証にはAIキーが必要です。",
    },
    fr: {
      title: "Radar d'Opportunités & Bourses",
      category: "Opportunités",
      whatItDoes:
        "Recense bourses, concours et stages filtrables par zone (Koweït, CCG, Monde) avec suivi de candidature, vérification web IA et tâches de préparation.",
      whyAndProblem: "Évite de manquer les dates limites de bourses ou compétitions.",
      whoBenefits: "Étudiants visant bourses, olympiades ou stages.",
      steps: ["Filtrez par portée, enregistrez vos cibles et générez la checklist vers Tâches."],
      options: [
        {
          label: "Vérification Web & Checklist",
          desc: "Crée des sous-tâches de candidature prêtes à l'emploi.",
        },
      ],
      limitations: "Vérifiez toujours les liens officiels ; la recherche web requiert l'API IA.",
    },
    de: {
      title: "Chancen- & Stipendien-Radar",
      category: "Chancen",
      whatItDoes:
        "Findet Stipendien, Wettbewerbe und Praktika nach Region, verwaltet Bewerbungsstatus und erstellt Aufgaben-Checklisten.",
      whyAndProblem: "Verhindert verpasste Bewerbungsfristen.",
      whoBenefits: "Lernende auf der Suche nach Stipendien oder Wettbewerben.",
      steps: ["Nach Region und Kategorie filtern, speichern und Vorbereitungsaufgaben anlegen."],
      options: [{ label: "Web-Check & Aufgaben", desc: "Erzeugt Checklisten direkt in Aufgaben." }],
      limitations: "Aktuelle Termine immer auf der offiziellen Website gegenprüfen.",
    },
    "zh-CN": {
      title: "学生机会与奖学金雷达",
      category: "机遇雷达",
      whatItDoes:
        "按地域（本地/海湾/全球）和类别筛选奖学金、竞赛与实习机会，跟踪申请状态并可联网核验或生成申请准备清单。",
      whyAndProblem: "防止分散在各处的奖学金与比赛截止时间被遗忘。",
      whoBenefits: "准备申报奖学金、学科竞赛或暑期项目的学生。",
      steps: ["筛选地域和类型，保存意向项目或手动补录。", "点击添加准备清单，立即拆解生成任务。"],
      options: [{ label: "联网信息核验", desc: "使用搜索增强检索确认官方最新公告。" }],
      limitations: "目录日期供参考，报名前请务必点击官方链接确认；实时核验需 AI 接口。",
    },
    ko: {
      title: "기회 및 장학금 레이더",
      category: "기회 탐색",
      whatItDoes:
        "장학금·경진대회·인턴십을 지역 및 분야별로 탐색하고 지원 상태 관리, 웹 검증, 준비 체크리스트 생성까지 연결합니다.",
      whyAndProblem: "흩어져 있는 지원 마감일을 놓치지 않도록 한데 모아 관리해 줍니다.",
      whoBenefits: "장학금, 올림피아드, 캠프 지원을 준비하는 학생.",
      steps: ["범위와 카테고리를 고른 뒤 관심 기회를 저장하고 준비 과제를 생성하세요."],
      options: [
        { label: "웹 검증 & 준비 과제 생성", desc: "세부 체크리스트가 포함된 과제를 등록합니다." },
      ],
      limitations: "반드시 주최 기관 공식 링크로 최신 요강을 재확인하세요.",
    },
  },
  "study-circles": {
    en: {
      title: "Study Circles, Team Rooms & Showcase",
      category: "Collaboration",
      whatItDoes:
        "Creates or joins invite-code peer study groups with shared team goals, discussion feeds, collaborative tasks, resource links, and community safety reporting.",
      whyAndProblem:
        "Combines group accountability with a structured student space instead of noisy chat threads.",
      whoBenefits: "Peer study groups, project teammates, and class revision partners.",
      steps: [
        "Create a Study Circle or enter an invite code to join a friend's group.",
        "Post discussions, assign tasks, or share trusted study URLs across Feed/Tasks/Resources.",
        "Use Flag / Report if any shared content violates safety guidelines.",
      ],
      options: [
        {
          label: "Invite Code Join",
          desc: "Generates a shareable room code protected by circle membership rules.",
        },
        {
          label: "Safety Flagging",
          desc: "Sends moderation reports directly to staff review queues.",
        },
      ],
      limitations:
        "Requires an online authenticated session; minors/privacy settings govern visibility.",
    },
    ar: {
      title: "دوائر الدراسة والعمل الجماعي",
      category: "التعاون",
      whatItDoes:
        "ينشئ أو ينضم لمجموعات دراسة برمز دعوة، مع هدف مشترك ومنشورات ومهام وروابط ومزايا أمان وإبلاغ.",
      whyAndProblem: "ينظم النقاش والمهام الجماعية للطلاب بعيداً عن فوضى الدردشات العامة.",
      whoBenefits: "فرق المشاريع ومجموعات المذاكرة بين الأصدقاء.",
      steps: [
        "أنشئ دائرة دراسة أو أدخل رمز دعوة للانضمام.",
        "شارك المنشورات أو المهام أو الموارد، واستخدم زر الإبلاغ عند الحاجة.",
      ],
      options: [
        { label: "الانضمام برمز الدعوة", desc: "يحفظ خصوصية المجموعة للأعضاء فقط." },
        { label: "الإبلاغ الآمن", desc: "يرسل البلاغات فوراً لفريق الرقابة." },
      ],
      limitations: "يتطلب اتصالاً وحساباً مسجلاً؛ يخضع ظهور التقدم لإعدادات الخصوصية.",
    },
    ja: {
      title: "スタディサークル＆共同グループ",
      category: "協働学習",
      whatItDoes:
        "招待コードで参加する学習グループを作成し、共通目標・投稿・タスク・リソース共有と安全通報を行えます。",
      whyAndProblem: "雑談チャットに流されず課題や資料をチームで整理できます。",
      whoBenefits: "ゼミ仲間・プロジェクトチーム・試験対策グループ。",
      steps: ["サークルを作成または招待コードを入力して参加し、投稿やタスクを共有します。"],
      options: [{ label: "招待コード＆通報", desc: "安全管理機能付きのチーム学習スペースです。" }],
      limitations: "オンライン接続とログインが必要です。",
    },
    fr: {
      title: "Cercles d'Étude & Travail d'Équipe",
      category: "Collaboration",
      whatItDoes:
        "Crée ou rejoint des groupes par code d'invitation avec objectif commun, fil, tâches partagées et signalement modéré.",
      whyAndProblem: "Remplace les discussions désordonnées par un vrai espace projet.",
      whoBenefits: "Groupes de révision et équipes de projet.",
      steps: ["Créez un cercle ou entrez un code d'invitation pour collaborer."],
      options: [
        { label: "Code d'invitation & Sécurité", desc: "Accès réservé et modération intégrée." },
      ],
      limitations:
        "Connexion Internet requise ; visibilité régie par vos paramètres de confidentialité.",
    },
    de: {
      title: "Lerngruppen & Team-Räume",
      category: "Kollaboration",
      whatItDoes:
        "Erstellt Lerngruppen per Einladungscode mit gemeinsamem Ziel, Feed, Team-Aufgaben, Links und Meldefunktion.",
      whyAndProblem: "Ersetzt unübersichtliche Chats durch strukturierte Gruppenarbeit.",
      whoBenefits: "Lernteams und Projektgruppen.",
      steps: ["Gruppe erstellen oder Code eingeben und Beiträge oder Aufgaben teilen."],
      options: [{ label: "Einladungscode & Meldung", desc: "Geschützter Raum mit Moderation." }],
      limitations: "Erfordert aktive Anmeldung und Internet.",
    },
    "zh-CN": {
      title: "学习圈与团队协作空间",
      category: "协作社群",
      whatItDoes:
        "支持通过邀请码创建或加入学习小组，共享团队目标、动态讨论、协作任务及学习资源，并配备安全举报。",
      whyAndProblem: "让小组合作井然有序，告别聊天群信息刷屏。",
      whoBenefits: "项目小队、竞赛搭档及期末互助小组。",
      steps: [
        "新建学习圈或凭邀请码加入同伴小组。",
        "切换动态、任务、资源标签协同推进，如有违规内容可点击举报。",
      ],
      options: [{ label: "邀请码与安全举报", desc: "兼顾私密协作与社区审核。" }],
      limitations: "需在线登录；组内数据可见性受隐私设置保护。",
    },
    ko: {
      title: "스터디 서클 및 팀 협업 공간",
      category: "협업 커뮤니티",
      whatItDoes:
        "초대 코드로 스터디 그룹을 만들거나 참여해 공동 목표, 피드, 협업 과제, 자료 링크를 공유하고 안전 신고 기능을 제공합니다.",
      whyAndProblem: "산만한 일반 채팅 대신 과제와 자료가 구조화되는 팀 학습 공간을 제공합니다.",
      whoBenefits: "조별 프로젝트 팀, 스터디 메이트, 시험 대비 그룹.",
      steps: ["새 서클을 만들거나 초대 코드를 입력해 참여하고 게시물과 할 일을 나누세요."],
      options: [
        { label: "초대 코드 & 안전 신고", desc: "비공개 팀 협업과 모더레이션 신고를 지원합니다." },
      ],
      limitations: "온라인 로그인 연결이 필요하며 공개 범위는 프라이버시 설정을 따릅니다.",
    },
  },
  "mun-simulator": {
    en: {
      title: "Model UN (MUN) Debate & Diplomacy Simulator",
      category: "Collaboration",
      whatItDoes:
        "Guides students through committee topic briefing, country stance preparation, resolution clause drafting, and timed speaker speeches.",
      whyAndProblem:
        "Demystifies Model United Nations procedure so first-time delegates feel prepared before live conferences.",
      whoBenefits: "MUN club delegates, public speakers, and diplomacy enthusiasts.",
      steps: [
        "Open the MUN Simulator tab inside Circle.",
        "Pick a committee scenario, draft your country stance, and rehearse timed speeches.",
      ],
      options: [
        {
          label: "Stance & Resolution Builder",
          desc: "Templates UN operative clauses and speech structure.",
        },
      ],
      limitations:
        "Interactive self/peer rehearsal simulator; external conference registration is separate.",
    },
    ar: {
      title: "محاكي نموذج الأمم المتحدة (MUN) والدبلوماسية",
      category: "التعاون والمناظرة",
      whatItDoes:
        "يدربك على صياغة موقف الدولة، وكتابة بنود القرار، وإلقاء الكلمات المؤقتة في محاكاة لجان الأمم المتحدة.",
      whyAndProblem: "يبسط إجراءات نموذج الأمم المتحدة للطلاب الجدد قبل المؤتمرات الفعلية.",
      whoBenefits: "أعضاء أندية نموذج الأمم المتحدة والخطابة الدبلوماسية.",
      steps: ["افتح تبويب MUN في صفحة الدوائر، واختر اللجنة، واكتب موقف دولتك وتدرب على الإلقاء."],
      options: [
        { label: "منشئ القرار والخطاب", desc: "يوفر قوالب عملية لصياغة القرارات الدبلوماسية." },
      ],
      limitations: "محاكاة تدريبية تفاعلية داخل المنصة.",
    },
    ja: {
      title: "模擬国連（MUN）ディベートシミュレーター",
      category: "協働・弁論",
      whatItDoes:
        "委員会テーマ確認、各国スタンス作成、決議案ドラフト、時間制限スピーチ練習が行えます。",
      whyAndProblem:
        "模擬国連のルールや決議書フォーマットに不慣れな初学者でも本番前に実践準備できます。",
      whoBenefits: "模擬国連（MUN）部や国際問題ディベートに参加する学生。",
      steps: ["Circle内のMUNタブを開き、スタンス作成とスピーチ練習を行います。"],
      options: [
        { label: "決議案＆スピーチ補助", desc: "定型フォーマットで草案作成をサポートします。" },
      ],
      limitations: "練習用シミュレーターであり大会登録システムとは独立しています。",
    },
    fr: {
      title: "Simulateur Modèle des Nations Unies (MUN)",
      category: "Collaboration",
      whatItDoes:
        "Accompagne prise de position nationale, rédaction de clauses de résolution et discours chronométrés.",
      whyAndProblem: "Prépare sereinement aux procédures officielles des conférences MUN.",
      whoBenefits: "Délégués MUN et passionnés d'art oratoire.",
      steps: ["Ouvrez l'onglet MUN dans Cercle pour préparer discours et résolution."],
      options: [{ label: "Trame de résolution", desc: "Aide à formuler clauses opératoires." }],
      limitations: "Outil d'entraînement interne indépendant des inscriptions externes.",
    },
    de: {
      title: "Model-UN (MUN) Konferenz-Simulator",
      category: "Kollaboration",
      whatItDoes:
        "Hilft beim Ausarbeiten von Länderpositionen, Resolutionsklauseln und zeitgesteuerten Reden.",
      whyAndProblem: "Nimmt Einsteigern die Hürde vor formellen MUN-Verfahren.",
      whoBenefits: "MUN-AGs und Debattier-Begeisterte.",
      steps: ["Im Circle-Bereich den Tab MUN öffnen und Position sowie Rede üben."],
      options: [{ label: "Resolutions-Vorlage", desc: "Unterstützt typische UN-Strukturen." }],
      limitations: "Interne Übungssimulation ohne externe Konferenzanmeldung.",
    },
    "zh-CN": {
      title: "模拟联合国 (MUN) 议事与演练模拟器",
      category: "协作交流",
      whatItDoes: "围绕委员会背景、国家立场书撰写、决议草案条款及限时发言提供交互式模拟演练。",
      whyAndProblem: "帮助初次接触模联议事规则的同学在正式会前熟悉流程与措辞。",
      whoBenefits: "模拟联合国社团成员及英语演讲辩论爱好者。",
      steps: ["进入学习圈中的 MUN 标签，设定国家立场并起草决议与发言稿。"],
      options: [{ label: "立场与决议生成器", desc: "规范外交文件结构并辅助计时演练。" }],
      limitations: "属于校内练兵模拟器，不含外部正式模联会议报名。",
    },
    ko: {
      title: "모의유엔(MUN) 외교·토론 시뮬레이터",
      category: "협업 커뮤니티",
      whatItDoes:
        "위원회 의제 브리핑, 국가 입장문 작성, 결의안 조항 설계 및 시간 제한 연설 연습을 지원합니다.",
      whyAndProblem:
        "처음 모의유엔에 참가하는 학생도 실제 회의 절차와 문서를 손쉽게 익힐 수 있게 돕습니다.",
      whoBenefits: "MUN 동아리, 스피치·외교 분야에 관심 있는 학생.",
      steps: ["서클 내 MUN 탭에서 의제를 고르고 국가 입장과 결의안 초안을 작성해 보세요."],
      options: [
        { label: "결의안 및 연설 연습", desc: "표준 외교 문서 형식과 타이머 연습을 제공합니다." },
      ],
      limitations: "플랫폼 내부 훈련 도구이며 외부 공식 대회 등록과는 별개입니다.",
    },
  },
  "global-culture": {
    en: {
      title: "Global Citizenship & Cultural Exchange Hub",
      category: "Global Horizon",
      whatItDoes:
        "Explores world regions, cultural etiquette insights, bilingual greetings, and global SDGs project themes inside Circle.",
      whyAndProblem:
        "Broadens international perspective and cross-cultural awareness for global students.",
      whoBenefits:
        "Students collaborating internationally, learning languages, or preparing for study abroad.",
      steps: [
        "Open the Global Hub tab inside Study Circles.",
        "Browse regional spotlights and connect global themes to your projects.",
      ],
      options: [
        {
          label: "Region & Culture Cards",
          desc: "Highlights traditions, phrases, and civic takeaways.",
        },
      ],
      limitations: "Curated cultural reference guide rather than live public matchmaking.",
    },
    ar: {
      title: "بوابة المواطنة العالمية والتبادل الثقافي",
      category: "الأفق العالمي",
      whatItDoes:
        "يستكشف ثقافات العالم وآداب التواصل العالمية والعبارات الترحيبية وأهداف التنمية المستدامة.",
      whyAndProblem: "يوسّع الأفق العالمي والوعي الثقافي لدى الطلاب المتعاونين دولياً.",
      whoBenefits: "الطلاب المهتمون باللغات والتبادل الطلابي والمنح الدولية.",
      steps: ["افتح تبويب العالم والثقافة في صفحة الدوائر واستكشف البطاقات الثقافية."],
      options: [
        { label: "بطاقات الثقافات العالمية", desc: "تستعرض آداب الحوار والتقاليد والعبارات." },
      ],
      limitations: "مرجع ثقافي منسّق وليس منصة تعارف مفتوحة للعامة.",
    },
    ja: {
      title: "グローバル教養＆異文化ハブ",
      category: "グローバル視野",
      whatItDoes: "世界各地域の文化・マナー、挨拶表現、SDGsテーマを探索できます。",
      whyAndProblem: "留学や国際協働に向けた異文化理解力を高めます。",
      whoBenefits: "語学学習者・留学志望者・国際交流に関心のある学生。",
      steps: ["Circle内のグローバルタブから地域カードを選んで学習します。"],
      options: [{ label: "地域＆文化カード", desc: "現地のマナーや基本フレーズを学べます。" }],
      limitations: "厳選された学習ガイドであり外部SNSマッチング機能ではありません。",
    },
    fr: {
      title: "Carrefour Citoyenneté Mondiale & Culture",
      category: "Horizon Mondial",
      whatItDoes: "Présente régions du monde, codes culturels, formules d'accueil et thèmes ODD.",
      whyAndProblem: "Développe l'ouverture interculturelle des étudiants.",
      whoBenefits: "Candidats à la mobilité internationale et apprenants en langues.",
      steps: ["Consultez l'onglet Global dans Cercle pour explorer les fiches culturelles."],
      options: [
        { label: "Fiches culturelles", desc: "Découverte des usages et thématiques mondiales." },
      ],
      limitations: "Guide documentaire structuré sans mise en relation publique ouverte.",
    },
    de: {
      title: "Global Citizenship & Kultur-Hub",
      category: "Weltblick",
      whatItDoes:
        "Stellt Weltregionen, kulturelle Umgangsformen, Grußformeln und Nachhaltigkeitsziele vor.",
      whyAndProblem: "Stärkt interkulturelle Kompetenz für internationale Teams.",
      whoBenefits: "Sprachinteressierte und Auslandsstudium-Interessierte.",
      steps: ["Global-Tab im Circle öffnen und Kulturkarten entdecken."],
      options: [{ label: "Länder- & Kulturkarten", desc: "Bietet kompakte kulturelle Einblicke." }],
      limitations: "Kuratierte Wissenssammlung ohne öffentliche Kontaktbörse.",
    },
    "zh-CN": {
      title: "全球公民意识与跨文化中心",
      category: "全球视野",
      whatItDoes: "浏览世界各地区文化礼仪、双语问候与联合国可持续发展目标议题。",
      whyAndProblem: "拓展中学生与大学生的国际理解力与跨文化沟通素养。",
      whoBenefits: "计划留学交换、外语学习或参加国际活动的学生。",
      steps: ["在学习圈中打开全球文化标签浏览各地区卡片。"],
      options: [{ label: "跨文化卡片", desc: "聚焦礼仪、常用问候与全球议题。" }],
      limitations: "属精选知识库，不提供面向陌生人的公开社交匹配。",
    },
    ko: {
      title: "글로벌 시민의식 및 문화 교류 허브",
      category: "글로벌 시야",
      whatItDoes:
        "세계 여러 지역의 문화 예절, 다국어 인사 표현, 글로벌 지속가능발전목표(SDG) 주제를 살펴봅니다.",
      whyAndProblem: "국제 협업과 해외 진학을 앞둔 학생들에게 문화적 감수성을 길러줍니다.",
      whoBenefits: "어학 학습자 및 국제 교류 프로그램 관심 학생.",
      steps: ["서클 내 글로벌 문화 탭을 열고 관심 지역 카드를 탐색하세요."],
      options: [{ label: "지역·문화 스포트라이트", desc: "전통 예절과 핵심 주제를 소개합니다." }],
      limitations: "큐레이션된 교육 가이드이며 공개 낯선 사람 매칭 서비스는 아닙니다.",
    },
  },
  "care-wellness": {
    en: {
      title: "Private Mood Check-in, Breathing & Sleep Balance",
      category: "Student Care",
      whatItDoes:
        "Logs private mood/energy/stress/sleep check-ins, plots wellbeing trends, and guides Box/4-7-8 breathing + 5-4-3-2-1 sensory grounding.",
      whyAndProblem:
        "Helps students recognize academic burnout early and calm exam anxiety privately.",
      whoBenefits: "Any student balancing intense exam weeks and personal rest.",
      steps: [
        "Record your mood, energy, stress rating, and sleep hours privately.",
        "Start Box (4-4-4-4) or 4-7-8 breathing cycles or check off the 5-4-3-2-1 grounding steps.",
      ],
      options: [
        {
          label: "Breathing Ring Timer",
          desc: "Guides inhale, hold, and exhale durations smoothly.",
        },
        {
          label: "Wellbeing Trend Chart",
          desc: "Visualizes recent sleep vs. energy/stress curves.",
        },
      ],
      limitations:
        "Private self-care aid only — does NOT provide medical/clinical therapy. Reach out to professionals in emergencies.",
    },
    ar: {
      title: "تسجيل المزاج الخاص وتمارين التنفس والتهدئة",
      category: "رعاية الطالب",
      whatItDoes:
        "يسجل حالتك المزاجية والطاقة والضغط والنوم بخصوصية تامة، مع مؤقت تنفس الصندوق وتقنية التأريض الحسي 5-4-3-2-1.",
      whyAndProblem: "يساعد في اكتشاف الإرهاق الدراسي مبكراً وتهدئة قلق الاختبارات.",
      whoBenefits: "جميع الطلاب خلال أسابيع الضغط والاختبارات.",
      steps: [
        "سجّل تقييمك اليومي للمزاج والطاقة وساعات النوم.",
        "شغّل دائرة التنفس الإرشادي أو اتبع خطوات التهدئة الحسية.",
      ],
      options: [
        { label: "مؤقت التنفس", desc: "يرشد الشهيق والحبس والزفير بنسب متزنة." },
        { label: "مخطط العافية", desc: "يعرض منحنى النوم والضغط خلال الأيام الأخيرة." },
      ],
      limitations:
        "أداة مساعدة للراحة الذاتية ولا تغني أبداً عن الاستشارة الطبية أو النفسية المتخصصة.",
    },
    ja: {
      title: "プライベート気分記録＆呼吸ガイド",
      category: "ケア＆健康",
      whatItDoes:
        "気分・エネルギー・ストレス・睡眠を非公開で記録し、ボックス呼吸法（4-4-4-4 / 4-7-8）と5-4-3-2-1グラウンディングを案内します。",
      whyAndProblem: "試験前の燃え尽きや過度な不安に早く気づき心身を整えます。",
      whoBenefits: "学業と休息のバランスを保ちたいすべての学生。",
      steps: ["気分や睡眠時間を記録し、必要に応じて呼吸リングやグラウンディングを使用します。"],
      options: [
        {
          label: "呼吸ガイド＆推移チャート",
          desc: "吸う・止める・吐くリズムと体調推移を確認できます。",
        },
      ],
      limitations:
        "医療・専門カウンセリングの代替ではありません。緊急時は専門機関へ相談してください。",
    },
    fr: {
      title: "Suivi Humeur Privé & Respiration Guidée",
      category: "Bien-être",
      whatItDoes:
        "Enregistre en privé humeur, énergie, stress et sommeil avec exercices respiratoires (4-4-4-4 / 4-7-8) et ancrage sensoriel.",
      whyAndProblem: "Prévient l'épuisement scolaire et apaise le trac des examens.",
      whoBenefits: "Tout étudiant soucieux de son équilibre mental et physique.",
      steps: ["Remplissez votre bilan privé ou lancez un cycle de respiration guidée."],
      options: [
        { label: "Guide respiratoire & courbe", desc: "Visualise sommeil, stress et énergie." },
      ],
      limitations:
        "Outil de bien-être personnel ; ne remplace pas un suivi médical ou psychologique.",
    },
    de: {
      title: "Privater Stimmungs-Check & Atemübung",
      category: "Wohlbefinden",
      whatItDoes:
        "Dokumentiert privat Stimmung, Energie, Stress und Schlaf und bietet Box-/4-7-8-Atmung sowie 5-4-3-2-1 Grounding.",
      whyAndProblem: "Hilft Überlastung und Prüfungsangst frühzeitig abzubauen.",
      whoBenefits: "Alle Lernenden in intensiven Prüfungsphasen.",
      steps: ["Check-in ausfüllen oder Atem-Ring zur Beruhigung starten."],
      options: [{ label: "Atem-Timer & Trend", desc: "Zeigt Schlaf- und Stresskurven." }],
      limitations:
        "Kein medizinischer oder therapeutischer Ersatz – bei Krisen professionelle Hilfe hinzuziehen.",
    },
    "zh-CN": {
      title: "私密情绪记录与呼吸引导调节",
      category: "学生关怀",
      whatItDoes:
        "私密记录当日心情、精力、压力与睡眠时长并生成趋势图，配有箱式/4-7-8 呼吸计时与 5-4-3-2-1 感官着陆法。",
      whyAndProblem: "帮助察觉考前过劳和焦虑情绪并及时平稳心绪。",
      whoBenefits: "备考高压期注重作息调节的同学们。",
      steps: ["记录睡眠与心理状态后，按动画圆环提示完成呼吸放松练习。"],
      options: [{ label: "呼吸引导与趋势图", desc: "完全个人可见的健康自我观察。" }],
      limitations: "仅作日常放松辅助，不能替代专业心理或医疗诊断。",
    },
    ko: {
      title: "비공개 기분 체크인 및 호흡 명상 가이드",
      category: "학생 케어",
      whatItDoes:
        "기분·에너지·스트레스·수면 시간을 비공개로 기록하고 박스/4-7-8 호흡 타이머와 5-4-3-2-1 감각 안정화를 안내합니다.",
      whyAndProblem: "학업 번아웃과 시험 불안을 조기에 인식하고 스스로 진정할 수 있게 돕습니다.",
      whoBenefits: "시험 기간 멘탈과 휴식 균형을 지키고 싶은 모든 학생.",
      steps: ["오늘의 상태와 수면 시간을 기록하거나 호흡 링 타이머를 시작해 긴장을 푸세요."],
      options: [
        { label: "호흡 타이머 & 웰빙 차트", desc: "개인 기록 추이와 안정화 가이드를 제공합니다." },
      ],
      limitations: "자가 관리 도구일 뿐 의학적 진단이나 전문 심리 상담을 대신하지 않습니다.",
    },
  },
  "student-privacy": {
    en: {
      title: "Student Privacy & Wellbeing Data Boundaries",
      category: "Student Care",
      whatItDoes:
        "Explains and lets you audit how private care check-ins, minor safety controls, and peer-circle visibility boundaries are protected.",
      whyAndProblem:
        "Builds trust by making it crystal clear that private care records stay strictly private to your account.",
      whoBenefits: "Students checking what peers or staff can vs. cannot see.",
      steps: [
        "Review privacy boundary cards inside Care or open full settings via Privacy & Security.",
      ],
      options: [
        { label: "Visibility Audit", desc: "Clarifies private vs. circle-shared records." },
      ],
      limitations:
        "Full account data exports, password resets, and visibility switches live in Settings > Privacy & Security.",
    },
    ar: {
      title: "مركز خصوصية الطالب وحدود البيانات",
      category: "رعاية الطالب",
      whatItDoes: "يوضح ويؤكد حدود الخصوصية لسجلات العافية الخاصة وظهور البيانات داخل الدوائر.",
      whyAndProblem: "يعزز ثقة الطالب ببقاء يومياته ومشاعره سرية تماماً لحسابه فقط.",
      whoBenefits: "الطلاب الراغبون في معرفة من يرى بياناتهم ومن لا يراها.",
      steps: ["راجع بطاقات الخصوصية في قسم العافية أو انتقل لإعدادات الخصوصية الكاملة."],
      options: [{ label: "تدقيق الظهور", desc: "يفصل بوضوح بين السجلات الخاصة والمشتركة." }],
      limitations: "أدوات التصدير وحذف الحساب توجد في الإعدادات > الخصوصية والأمان.",
    },
    ja: {
      title: "生徒プライバシー＆境界コントロール",
      category: "ケア＆健康",
      whatItDoes:
        "ケア記録が完全非公開である仕組みや未成年安全設定、グループ内の公開境界を確認できます。",
      whyAndProblem: "個人の健康記録が他者に見られない安心感を提供します。",
      whoBenefits: "データ公開範囲を把握したい学生。",
      steps: ["プライバシー境界パネルを確認し、必要に応じて詳細設定へ進みます。"],
      options: [{ label: "可視性ポリシー確認", desc: "非公開項目と共有項目の境界を明示します。" }],
      limitations: "アカウントデータ書き出し等は設定のプライバシー画面で行います。",
    },
    fr: {
      title: "Confidentialité & Limites des Données Élèves",
      category: "Bien-être",
      whatItDoes:
        "Explique la protection stricte des bilans bien-être et des réglages de visibilité entre pairs.",
      whyAndProblem: "Garantit que vos ressentis personnels restent confidentiels.",
      whoBenefits: "Étudiants souhaitant vérifier la portée de partage de leurs données.",
      steps: ["Consultez le panneau de confidentialité dans Bien-être ou les Paramètres complets."],
      options: [{ label: "Audit de visibilité", desc: "Distingue données privées et cercle." }],
      limitations: "Export JSON et suppression du compte sont dans Paramètres > Confidentialité.",
    },
    de: {
      title: "Schüler-Datenschutz & Sichtbarkeitsgrenzen",
      category: "Wohlbefinden",
      whatItDoes:
        "Erklärt transparent den privaten Schutz von Care-Check-ins und Sichtbarkeit in Lerngruppen.",
      whyAndProblem: "Sichert Vertrauen, dass persönliche Befindlichkeiten privat bleiben.",
      whoBenefits: "Lernende mit Fragen zur Datensichtbarkeit.",
      steps: ["Übersicht im Care-Bereich prüfen oder Details in Datenschutz-Einstellungen öffnen."],
      options: [{ label: "Sichtbarkeits-Check", desc: "Trennt private vs. geteilte Felder." }],
      limitations: "Datenexport und Kontolöschung befinden sich in Einstellungen > Datenschutz.",
    },
    "zh-CN": {
      title: "学生隐私边界与数据保护中心",
      category: "学生关怀",
      whatItDoes: "清晰说明心理情绪记录的严格私密隔离原则，以及社团圈内进度分享的可见权限边界。",
      whyAndProblem: "打消担心个人状态被同学或他人偷看的顾虑。",
      whoBenefits: "关心平台权限边界和未成年保护机制的用户。",
      steps: ["查看该卡了解各类数据的隔离级别，更多开关请进「隐私与安全设置」。"],
      options: [{ label: "权限范围核对", desc: "列明私有数据与协作数据的边界。" }],
      limitations: "完整数据导出和注销功能位于 设置 > 隐私与安全。",
    },
    ko: {
      title: "학생 프라이버시 및 데이터 보호 센터",
      category: "학생 케어",
      whatItDoes: "개인 케어 기록의 비공개 원칙과 스터디 서클 내 공개 범위를 명확히 안내합니다.",
      whyAndProblem: "민감한 심리·수면 체크인이 타인에게 노출되지 않는다는 신뢰를 제공합니다.",
      whoBenefits: "내 정보의 공개 범위가 궁금한 모든 학생.",
      steps: ["케어 내 프라이버시 카드를 확인하고 세부 설정이 필요하면 설정 페이지로 이동하세요."],
      options: [{ label: "공개 범위 점검", desc: "개인 데이터와 공유 항목을 구분해 설명합니다." }],
      limitations: "전체 데이터 내보내기 및 탈퇴는 설정 > 개인정보 및 보안에서 관리합니다.",
    },
  },
  "settings-notifications": {
    en: {
      title: "Notification, Quiet Hours & Language Preferences",
      category: "Settings",
      whatItDoes:
        "Configures browser alert permissions, study/task/streak reminders, overnight Quiet Hours, notification digest frequency, plus study & AI workspace defaults.",
      whyAndProblem:
        "Prevents intrusive late-night alerts while ensuring vital study deadlines never slip.",
      whoBenefits: "Students balancing deep evening rest with morning accountability.",
      steps: [
        "Grant browser notification permission if you want OS-level reminders.",
        "Toggle reminders you care about and set your Quiet Hours window.",
      ],
      options: [
        {
          label: "Quiet Hours Window",
          desc: "Mutes study alerts overnight during your chosen sleep block.",
        },
        {
          label: "Reminder Types & Digest",
          desc: "Controls task, calendar, and streak reminder timing.",
        },
      ],
      limitations:
        "Push alerts require browser permission and active open tab; silent fallback to in-app notifications when denied.",
    },
    ar: {
      title: "الإشعارات وساعات الهدوء وتفضيلات التعلم",
      category: "الإعدادات",
      whatItDoes:
        "يضبط إذن تنبيهات المتصفح، وتذكيرات الدراسة، وساعات الهدوء الليلية، وتكرار الملخصات، وتفضيلات اللغة والذكاء الاصطناعي.",
      whyAndProblem: "يمنع إزعاج التنبيهات أثناء النوم مع ضمان وصول تذكيرات الواجبات.",
      whoBenefits: "الطلاب الراغبون في تنبيهات ذكية غير مزعجة.",
      steps: ["فعّل إذن الإشعارات ثم حدد التذكيرات المطلوبة وساعات الهدوء."],
      options: [{ label: "ساعات الهدوء", desc: "تكتم التنبيهات خلال ساعات راحتك ونومك." }],
      limitations: "التنبيهات الخارجية تتطلب سماح المتصفح بالإشعارات.",
    },
    ja: {
      title: "通知・おやすみ時間・学習環境設定",
      category: "設定",
      whatItDoes:
        "ブラウザ通知権限、リマインダー種別、夜間のおやすみモード（Quiet Hours）、言語・AI設定を調整します。",
      whyAndProblem: "睡眠中の不要な通知を防ぎつつ重要な締切通知を受け取れます。",
      whoBenefits: "休息と通知のバランスを保ちたい学生。",
      steps: ["通知許可を有効にし、必要なリマインダーとサイレント時間帯を設定します。"],
      options: [{ label: "クワイエットアワー", desc: "指定時間帯の通知を抑制します。" }],
      limitations: "OSレベルの通知にはブラウザの通知許可が必要です。",
    },
    fr: {
      title: "Notifications, Heures Calmes & Préférences",
      category: "Paramètres",
      whatItDoes:
        "Règle permissions navigateur, rappels d'étude, plage de silence nocturne et fréquence d'envoi.",
      whyAndProblem: "Évite les alertes nocturnes tout en rappelant les échéances clés.",
      whoBenefits: "Étudiants protégeant leur sommeil sans oublier leurs devoirs.",
      steps: ["Autorisez les notifications si souhaité et définissez vos heures calmes."],
      options: [{ label: "Heures calmes", desc: "Met en pause les alertes pendant le repos." }],
      limitations: "Les alertes système dépendent des autorisations du navigateur.",
    },
    de: {
      title: "Benachrichtigungen, Ruhezeiten & Präferenzen",
      category: "Einstellungen",
      whatItDoes:
        "Steuert Browser-Berechtigungen, Lern-Erinnerungen, nächtliche Ruhezeiten und Digest-Frequenz.",
      whyAndProblem: "Verhindert nächtliche Störungen, ohne wichtige Fristen zu verpassen.",
      whoBenefits: "Lernende mit geregelten Ruhephasen.",
      steps: ["Erinnerungstypen auswählen und Ruhezeitfenster aktivieren."],
      options: [{ label: "Ruhezeiten", desc: "Stummschaltung während der Schlafenszeit." }],
      limitations: "Desktop-Benachrichtigungen benötigen Browser-Freigabe.",
    },
    "zh-CN": {
      title: "通知、免打扰时段与学习偏好",
      category: "系统设置",
      whatItDoes:
        "管理浏览器通知权限、复习/打卡提醒开关、夜间免打扰（Quiet Hours）、语言地区及学习与 AI 默认模式。",
      whyAndProblem: "兼顾白天不遗漏重要任务与夜间安心睡眠不被打扰。",
      whoBenefits: "注重作息规律与消息减噪的学生。",
      steps: ["按需开启浏览器通知授权并勾选提醒类型与夜间免打扰时段。"],
      options: [{ label: "夜间免打扰窗口", desc: "在休息时间段内自动静默弹窗提醒。" }],
      limitations: "系统级弹窗依赖浏览器通知权限；未授权时回退为站内提醒。",
    },
    ko: {
      title: "알림, 방해 금지 시간 및 학습 설정",
      category: "설정",
      whatItDoes:
        "브라우저 알림 권한, 과제·연속 학습 리마인더, 야간 방해 금지 시간, 언어·AI·학습 기본값을 설정합니다.",
      whyAndProblem: "수면 중 불필요한 알림은 막고 중요한 마감 알림은 놓치지 않도록 합니다.",
      whoBenefits: "규칙적인 생활과 스마트한 알림 관리를 원하는 학생.",
      steps: ["알림 권한을 허용하고 필요한 알림 항목과 방해 금지 시간대를 지정하세요."],
      options: [
        { label: "방해 금지 시간대", desc: "설정한 수면 시간에는 알림을 조용히 보류합니다." },
      ],
      limitations: "푸시 알림은 브라우저 권한 허용 시 동작하며 거부 시 앱 내 알림으로 대체됩니다.",
    },
  },
  "accessibility-assistant": {
    en: {
      title: "Voice Read-Aloud & Accessibility Assistant",
      category: "Accessibility",
      whatItDoes:
        "Opens quick controls inside Study/Settings to adjust speech synthesis speed, pitch, voice selection, and dyslexia/contrast presets live.",
      whyAndProblem:
        "Gives auditory and low-vision learners instant control over reading comfort anywhere they study.",
      whoBenefits:
        "Learners relying on audio reinforcement, dyslexia spacing, or screen magnification.",
      steps: [
        "Open the Accessibility Assistant button inside Study or Settings.",
        "Adjust reading rate, select a voice, or toggle readability presets immediately.",
      ],
      options: [
        {
          label: "TTS Rate & Preset Shortcuts",
          desc: "Applies readable typography and speech tuning instantly.",
        },
      ],
      limitations: "Speech voices available depend on OS and browser installation.",
    },
    ar: {
      title: "مساعد القراءة الصوتية وإمكانية الوصول",
      category: "إمكانية الوصول",
      whatItDoes:
        "يوفر تحكماً سريعاً في سرعة القراءة الصوتية واختيار الصوت وتباين القراءة ودعم عسر القراءة من داخل الدراسة.",
      whyAndProblem: "يمنح الطلاب أداة فورية لراحة القراءة والاستماع دون مغادرة درسهم.",
      whoBenefits: "المتعلمون سمعياً ومن يستفيدون من الخطوط الواضحة والتباين العالي.",
      steps: ["افتح مساعد الوصول من أعلى الدراسة لضبط السرعة والصوت والخط المريح فوراً."],
      options: [{ label: "تحكم النطق والقراءة", desc: "يعدّل سرعة الصوت وتنسيق العرض مباشرة." }],
      limitations: "قائمة الأصوات تعتمد على المتصفح ونظام التشغيل.",
    },
    ja: {
      title: "音声読み上げ＆アクセシビリティ補助",
      category: "アクセシビリティ",
      whatItDoes:
        "読み上げ速度・声質の調整やディスレクシア・高コントラスト設定を学習中すぐ呼び出せます。",
      whyAndProblem: "ページを移動せずに読みやすさと聞き取りやすさを即座に整えます。",
      whoBenefits: "音声学習者や視覚・読字サポートを必要とする学生。",
      steps: ["学習画面や設定からアシスタントを開き、話速や表示を調整します。"],
      options: [
        { label: "TTS話速＆読みやすさ調整", desc: "その場で読み上げと文字表示を切り替えます。" },
      ],
      limitations: "選択可能な音声は端末・ブラウザに依存します。",
    },
    fr: {
      title: "Assistant Lecture Vocale & Accessibilité",
      category: "Accessibilité",
      whatItDoes:
        "Règle vitesse de lecture audio, choix de voix et préréglages de lisibilité sans quitter l'espace d'étude.",
      whyAndProblem: "Adapte le confort visuel et auditif instantanément.",
      whoBenefits: "Apprenants auditifs ou utilisateurs d'aides à la lecture.",
      steps: ["Ouvrez l'Assistant Accessibilité dans Étude et ajustez voix ou contraste."],
      options: [{ label: "Raccourcis TTS & Lisibilité", desc: "Applique les réglages en direct." }],
      limitations: "Les voix disponibles dépendent de votre navigateur et système.",
    },
    de: {
      title: "Vorlese- & Barrierefreiheits-Assistent",
      category: "Barrierefreiheit",
      whatItDoes: "Bietet Direktsteuerung für Sprechtempo, Stimmwahl sowie Lese-/Kontrastmodi.",
      whyAndProblem:
        "Ermöglicht schnelle Anpassung von Vorlesestimme und Lesbarkeit direkt beim Lernen.",
      whoBenefits: "Auditive Lerner und Nutzer von Lesehilfen.",
      steps: ["Assistenten öffnen, Vorlesetempo oder Kontrast direkt anpassen."],
      options: [{ label: "TTS- & Lesehilfen", desc: "Wirkt sofort ohne Seitenwechsel." }],
      limitations: "Verfügbare Stimmen hängen vom Betriebssystem ab.",
    },
    "zh-CN": {
      title: "语音朗读与无障碍伴读助手",
      category: "无障碍辅助",
      whatItDoes: "在学习页即可快捷呼出语速、音色调节以及高对比/阅读障碍排版预设。",
      whyAndProblem: "无需跳离当前笔记或题库即可即时调整听读舒适度。",
      whoBenefits: "习惯听读结合或需要清晰排版放大的学习者。",
      steps: ["在学习中心或设置页点开无障碍助手，拖动语速并试听效果。"],
      options: [{ label: "实时朗读调参", desc: "立即生效于全部学习朗读按钮。" }],
      limitations: "可选音色由当前浏览器及操作系统自带语音包提供。",
    },
    ko: {
      title: "음성 읽기 및 접근성 도우미",
      category: "접근성",
      whatItDoes:
        "학습 중에도 바로 말하기 속도·음성 선택·난독증 배려 및 고대비 프리셋을 즉시 조절합니다.",
      whyAndProblem: "설정 화면으로 이동하지 않고 학습 중 즉시 읽기·청취 편의를 높여줍니다.",
      whoBenefits: "청각 보조와 가독성 지원이 필요한 모든 학생.",
      steps: ["학습 화면에서 접근성 도우미를 열어 읽기 속도와 프리셋을 맞추세요."],
      options: [{ label: "TTS 속도 & 가독성 단축 메뉴", desc: "즉시 화면과 음성에 반영됩니다." }],
      limitations: "선택 가능한 음성은 운영체제 및 브라우저 설치 환경에 따릅니다.",
    },
  },
};
