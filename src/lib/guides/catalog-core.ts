import type { FeatureGuideEntry } from "./types";

export const CORE_GUIDES: Record<string, FeatureGuideEntry> = {
  "dashboard-overview": {
    en: {
      title: "Student Command Dashboard",
      category: "Dashboard",
      whatItDoes:
        "Unifies your active streak, XP progress, Quick Actions, Life Areas filter, tasks, daily goals, Pomodoro timer, and module launcher in one home screen.",
      whyAndProblem:
        "Prevents fragmented workflows where students lose track of homework, focus sessions, and study progress across disconnected pages.",
      whoBenefits: "All students managing daily schoolwork, exam prep, and personal habits.",
      steps: [
        "Switch between Overview, Growth Map, Growth History, and Daily Journal tabs at the top.",
        "Use Quick Actions to jump straight into AI Coach, Focus Timer, Tasks, or Study.",
        "Filter Today's Tasks by clicking any Life & Study Area tile.",
      ],
      options: [
        {
          label: "Dashboard / Growth Map / History / Journal Tabs",
          desc: "Switches top-level home views without leaving the dashboard.",
        },
        {
          label: "Quick Actions Row",
          desc: "Opens your most frequent study and planning workflows in one click.",
        },
      ],
      limitations:
        "Quick Actions automatically hide when Accessibility Simplified Mode or Distraction-Free Study Mode is enabled.",
    },
    ar: {
      title: "لوحة القيادة الطلابية",
      category: "لوحة التحكم",
      whatItDoes:
        "تجمع سلسلة أيامك، ونقاط الخبرة (XP)، والإجراءات السريعة، ومرشح مجالات الحياة، والمهام، والأهداف اليومية، ومؤقت بومودورو في شاشة رئيسية واحدة.",
      whyAndProblem:
        "تعالج تشتت الطالب بين عدة صفحات عند متابعة الواجبات وجلسات التركيز والتقدم اليومي.",
      whoBenefits: "جميع الطلاب الذين ينظمون دراستهم اليومية واستعدادهم للاختبارات.",
      steps: [
        "بدّل بين تبويبات النظرة العامة وخارطة النمو والسجل والمفكرة اليومية من الأعلى.",
        "استخدم أزرار الوصول السريع للانتقال فوراً للمدرب الذكي أو المؤقت أو المهام أو الدراسة.",
        "انقر على أي بطاقة مجال تطور لتصفية المهام المرتبطة به.",
      ],
      options: [
        {
          label: "تبويبات اللوحة العلوية",
          desc: "تنتقل بين العرض العام وخارطة النمو والتاريخ والمفكرة.",
        },
        {
          label: "شريط الوصول السريع",
          desc: "يفتح أكثر أدوات الدراسة وتنظيم المهام استخداماً بنقرة واحدة.",
        },
      ],
      limitations: "تختفي الإجراءات السريعة تلقائياً عند تفعيل الوضع المبسط لإمكانية الوصول.",
    },
    ja: {
      title: "学生コマンドダッシュボード",
      category: "ダッシュボード",
      whatItDoes:
        "ストリーク、XP、クイックアクション、ライフ領域フィルター、タスク、毎日の目標、ポモドーロタイマーを1画面に統合します。",
      whyAndProblem:
        "課題・集中時間・学習進捗が複数ページに分散して管理しづらくなる問題を防ぎます。",
      whoBenefits: "日々の課題や試験対策を一元管理したいすべての学生。",
      steps: [
        "上部の「ダッシュボード / 成長マップ / 履歴 / ジャーナル」タブで表示を切り替えます。",
        "クイックアクションからAIコーチや集中タイマー、タスクへ即座に移動します。",
        "ライフ領域カードをクリックして今日のタスクを絞り込みます。",
      ],
      options: [
        { label: "ビュー切替タブ", desc: "ダッシュボード内で主要4ビューを切り替えます。" },
        { label: "クイックアクション", desc: "AI・集中・タスク・学習へ直接アクセスします。" },
      ],
      limitations: "簡易モード（Simplified Mode）ではクイックアクションが非表示になります。",
    },
    fr: {
      title: "Tableau de Bord Étudiant",
      category: "Tableau de bord",
      whatItDoes:
        "Regroupe série quotidienne, XP, actions rapides, domaines de vie, tâches, objectifs et minuteur Pomodoro sur un écran central.",
      whyAndProblem:
        "Évite la dispersion des devoirs, sessions de concentration et progrès entre trop d'onglets.",
      whoBenefits: "Tous les étudiants organisant leur travail scolaire et leurs révisions.",
      steps: [
        "Basculez entre Vue générale, Carte de croissance, Historique et Journal quotidien.",
        "Utilisez les Actions rapides pour lancer l'IA, le minuteur, les tâches ou l'étude.",
        "Cliquez sur un domaine de vie pour filtrer les tâches associées.",
      ],
      options: [
        { label: "Onglets supérieurs", desc: "Changent la vue principale du tableau de bord." },
        { label: "Actions rapides", desc: "Accès direct aux outils quotidiens les plus utilisés." },
      ],
      limitations:
        "Les Actions rapides sont masquées lorsque le mode d'accessibilité simplifié est activé.",
    },
    de: {
      title: "Schüler-Kommandozentrale",
      category: "Dashboard",
      whatItDoes:
        "Vereint Lernserie, XP-Fortschritt, Schnellaktionen, Lebensbereiche, Aufgaben, Tagesziele und Pomodoro-Timer auf einer Startseite.",
      whyAndProblem:
        "Verhindert unübersichtliche Arbeitsabläufe über viele getrennte Werkzeuge hinweg.",
      whoBenefits: "Alle Lernenden zur Koordination von Hausaufgaben, Prüfungen und Gewohnheiten.",
      steps: [
        "Wechseln Sie oben zwischen Dashboard, Growth Map, Verlauf und Tagebuch.",
        "Nutzen Sie Schnellaktionen für direkten Zugriff auf KI-Coach, Timer, Aufgaben oder Lernen.",
        "Klicken Sie auf einen Lebensbereich, um Aufgaben danach zu filtern.",
      ],
      options: [
        { label: "Ansichts-Tabs", desc: "Schalten zwischen den vier Kernansichten um." },
        { label: "Schnellaktionen", desc: "Starten häufig genutzte Lernmodule mit einem Klick." },
      ],
      limitations: "Im vereinfachten Barrierefreiheitsmodus werden Schnellaktionen ausgeblendet.",
    },
    "zh-CN": {
      title: "学生综合仪表板",
      category: "仪表板",
      whatItDoes:
        "在一个主界面整合连续学习天数、XP进度、快捷操作、成长领域、每日任务、目标与番茄钟计时器。",
      whyAndProblem: "解决作业、专注计时和学习进度分散在多个页面导致难以统筹的问题。",
      whoBenefits: "所有需要统一规划日常学业、考试复习与习惯养成的学生。",
      steps: [
        "在顶部标签页间切换概览、成长地图、成长历史与每日反思日记。",
        "使用快捷操作一键进入 AI 导师、专注计时、任务清单或学习工作区。",
        "点击任意成长领域卡片即可按领域筛选今日任务。",
      ],
      options: [
        { label: "顶部视图标签", desc: "无需离开首页即可切换四大核心视图。" },
        { label: "快捷操作栏", desc: "一键打开最常用的 AI 辅导与专注工具。" },
      ],
      limitations: "开启无障碍简化模式或免打扰模式后，快捷操作栏会自动隐藏。",
    },
    ko: {
      title: "학생 통합 대시보드",
      category: "대시보드",
      whatItDoes:
        "연속 학습일, XP, 빠른 실행, 성장 영역 필터, 오늘의 할 일, 일일 목표 및 뽀모도로 타이머를 한 화면에 모아 보여줍니다.",
      whyAndProblem:
        "과제와 집중 기록, 학습 진도가 여러 화면에 흩어져 관리가 어려워지는 문제를 해결합니다.",
      whoBenefits: "일일 과제, 시험 대비 및 학습 습관을 체계적으로 관리하려는 모든 학생.",
      steps: [
        "상단 탭에서 개요, 성장 맵, 성장 기록, 일일 저널로 전환하세요.",
        "빠른 실행 버튼으로 AI 코치, 집중 타이머, 과제 또는 학습실로 바로 이동합니다.",
        "삶과 학습 영역 카드를 눌러 관련 할 일만 필터링할 수 있습니다.",
      ],
      options: [
        { label: "상단 뷰 탭", desc: "대시보드 내 4가지 핵심 화면을 즉시 전환합니다." },
        { label: "빠른 실행 막대", desc: "자주 쓰는 학습/생산성 도구로 즉시 이동합니다." },
      ],
      limitations: "접근성 단순화 모드 활성화 시 빠른 실행 막대가 숨겨집니다.",
    },
  },
  "dashboard-theme-switcher": {
    en: {
      title: "Appearance & Design Studio (In Settings)",
      category: "Personalization",
      whatItDoes:
        "All platform visual styling is centralized in Settings, offering 10 complete Design Presets (changing colors, EN/AR typography, surfaces, cards, buttons, and layout shell) plus Dark/Light mode and custom accent color.",
      whyAndProblem:
        "Keeps the workspace header, dashboard, and navigation menus clean and distraction-free while giving full-platform visual transformation inside Settings.",
      whoBenefits:
        "Students sensitive to screen brightness or wanting tailored visual aesthetics without dashboard clutter.",
      steps: [
        "Open Settings from the top utility bar or navigation menu.",
        "Adjust Dark/Light/System mode or custom accent color in Appearance, or open the 10-Preset Design & Layout Studio.",
        "Preview any Design Preset live across the interface, then click Apply to save across devices.",
      ],
      options: [
        {
          label: "10 Full-Platform Design Presets",
          desc: "Transforms colors, EN/AR fonts, cards, inputs, navigation chrome, and coordinated layout shell.",
        },
        {
          label: "Dark / Light / System Mode",
          desc: "Switches brightness mode; syncs to Firestore when online.",
        },
        {
          label: "10 Navigation Shell Layouts",
          desc: "Configures sidebar, top navigation, double header, or dock shells independently inside Settings.",
        },
      ],
      limitations:
        "Changes save locally right away when offline and sync to Firestore once reconnected.",
    },
    ar: {
      title: "استوديو التصاميم والمظهر (داخل الإعدادات)",
      category: "التخصيص",
      whatItDoes:
        "جميع أدوات المظهر مركّزة داخل صفحة الإعدادات، وتشمل ١٠ تصاميم شاملة تغيّر الألوان والخطوط العربية والإنجليزية والأسطح والأزرار وتخطيط الواجهة مع الوضع الداكن والفاتح.",
      whyAndProblem:
        "يحافظ على هدوء لوحة التحكم وقوائم التنقل دون أي أزرار مبعثرة، مع منح تحكم بصري متكامل من الإعدادات.",
      whoBenefits: "الطلاب الباحثون عن راحة بصرية وتخصيص كامل دون ازدحام في الشاشة الرئيسية.",
      steps: [
        "افتح صفحة الإعدادات من شريط الأدوات العلوي أو قائمة التنقل.",
        "اختر الوضع الداكن/الفاتح أو لون التمييز، أو افتح استوديو التصاميم العشرة والتخطيطات.",
        "عاين أي تصميم مباشرة ثم اضغط تطبيق للحفظ على حسابك.",
      ],
      options: [
        {
          label: "١٠ تصاميم شاملة للمنصة",
          desc: "تغيّر الألوان والخطوط والبطاقات والحقول وهيكل التنقل بالكامل.",
        },
        {
          label: "داكن / فاتح / تلقائي",
          desc: "يضبط السطوع مع حفظ فوري في الحساب.",
        },
      ],
      limitations: "عند عدم الاتصال بالإنترنت يُحفظ المظهر محلياً ويزامن عند عودة الاتصال.",
    },
    ja: {
      title: "外観＆デザインスタジオ（設定ページ内）",
      category: "パーソナライズ",
      whatItDoes:
        "設定ページに統合された外観管理では、10種類の統合デザインプリセット（配色・フォント・カード・ボタン・入力欄・レイアウト）とダーク/ライトモードを切り替えられます。",
      whyAndProblem:
        "ダッシュボードやナビゲーションから煩雑なスイッチを取り除き、落ち着いた学習環境を保ちます。",
      whoBenefits: "画面の明るさや視覚的雰囲気を設定画面でまとめて整えたい学生。",
      steps: [
        "設定ページを開き、外観セクションまたはデザインスタジオに進みます。",
        "10種類のデザインプリセットや10種類のシェルレイアウトをプレビューします。",
        "「適用」をクリックしてアカウントに保存します。",
      ],
      options: [
        {
          label: "10種類の統合デザイン",
          desc: "配色・書体・操作要素・ナビ配置を一括で切り替えます。",
        },
        { label: "明暗トグル", desc: "ダークモードとライトモードを切り替えます。" },
      ],
      limitations: "オフライン時はローカルに保存され、再接続時にFirestoreへ同期されます。",
    },
    fr: {
      title: "Apparence & Studio Design (dans Paramètres)",
      category: "Personnalisation",
      whatItDoes:
        "Centralise toute la personnalisation visuelle dans les Paramètres avec 10 préréglages complets (couleurs, typographie EN/AR, surfaces, composants et navigation) et le mode clair/sombre.",
      whyAndProblem:
        "Garde l'accueil, le tableau de bord et la navigation épurés sans boutons de thème dispersés.",
      whoBenefits:
        "Étudiants souhaitant personnaliser l'ensemble de l'interface depuis un seul endroit.",
      steps: [
        "Ouvrez les Paramètres depuis la barre supérieure ou le menu.",
        "Choisissez clair/sombre ou ouvrez le Studio 10 Designs & Dispositions.",
        "Testez en direct puis cliquez sur Appliquer.",
      ],
      options: [
        {
          label: "10 Designs Complets",
          desc: "Transforme couleurs, polices, cartes, boutons et navigation.",
        },
        {
          label: "Mode Sombre / Clair",
          desc: "Adapte la luminosité tout en conservant le design choisi.",
        },
      ],
      limitations: "Hors ligne, les préférences sont mémorisées localement jusqu'à la reconnexion.",
    },
    de: {
      title: "Darstellung & Design-Studio (in Einstellungen)",
      category: "Personalisierung",
      whatItDoes:
        "Bündelt alle visuellen Einstellungen zentral in den Einstellungen: 10 vollständige Design-Presets (Farben, EN/AR-Schriften, Oberflächen, Steuerelemente, Shell-Layouts) sowie Hell/Dunkel-Modus.",
      whyAndProblem:
        "Hält Dashboard und Navigationsleisten ruhig und frei von verstreuten Theme-Schaltern.",
      whoBenefits: "Lernende, die das gesamte Erscheinungsbild zentral anpassen möchten.",
      steps: [
        "Öffnen Sie die Einstellungen.",
        "Wählen Sie Hell/Dunkel oder öffnen Sie das 10-Design- & Layout-Studio.",
        "Testen Sie ein Design live und speichern Sie es mit Anwenden.",
      ],
      options: [
        {
          label: "10 Design-Presets",
          desc: "Ändert Farben, Schriften, Karten und Navigationsstil global.",
        },
        {
          label: "Hell/Dunkel-Schalter",
          desc: "Wechselt sofort zwischen hellem und dunklem Modus.",
        },
      ],
      limitations: "Ohne Internetverbindung erfolgt die Speicherung zunächst lokal.",
    },
    "zh-CN": {
      title: "外观与设计工作室（位于设置内）",
      category: "外观定制",
      whatItDoes:
        "所有外观设置均已集中至设置页面，提供 10 套完整的全局设计预设（同步重塑配色、中英阿字体、卡片按钮控件与布局壳层）及深浅色模式。",
      whyAndProblem: "保持首页仪表板与导航栏简洁无干扰，所有视觉切换统一在设置中完成。",
      whoBenefits: "希望在一处集中定制整站视觉风格的学生。",
      steps: [
        "进入设置页面，打开外观或设计预设工作室。",
        "实时预览 10 套设计预设或 10 种导航布局。",
        "点击应用并同步保存到账户。",
      ],
      options: [
        { label: "10 套全局设计预设", desc: "统一改变颜色、字体、表面材质与布局框架。" },
        { label: "深浅模式切换", desc: "在深色护眼与浅色模式间即时切换。" },
      ],
      limitations: "离线状态下会先保存在本地，联网后自动同步到 Firestore。",
    },
    ko: {
      title: "화면 스타일 및 디자인 스튜디오 (설정 내)",
      category: "개인화",
      whatItDoes:
        "모든 시각 설정이 설정 페이지 한 곳에 통합되어 색상, 영문/아랍어 서체, 카드/버튼 스타일과 레이아웃 셸까지 바꾸는 10가지 디자인 프리셋을 제공합니다.",
      whyAndProblem: "대시보드와 내비게이션 메뉴의 불필요한 테마 버튼을 제거해 집중도를 높입니다.",
      whoBenefits: "깔끔한 작업 환경과 통합된 시각적 커스터마이징을 원하는 학생.",
      steps: [
        "설정 페이지의 화면 및 디자인 스튜디오로 이동합니다.",
        "10가지 디자인 프리셋이나 10가지 레이아웃을 실시간 미리보기로 확인합니다.",
        "적용을 눌러 계정에 저장합니다.",
      ],
      options: [
        {
          label: "10가지 통합 디자인 프리셋",
          desc: "색상, 서체, UI 표면 및 레이아웃을 함께 전환합니다.",
        },
        { label: "다크 / 라이트 전환", desc: "선택한 디자인에 맞춰 밝기를 전환합니다." },
      ],
      limitations: "오프라인일 경우 기기에 우선 저장되고 온라인 복귀 시 동기화됩니다.",
    },
  },
  "dashboard-customizer": {
    en: {
      title: "Personal Dashboard Builder",
      category: "Layout",
      whatItDoes:
        "Lets you reorder dashboard widgets up or down, hide cards you do not need today, and reset to the default layout.",
      whyAndProblem:
        "Reduces cognitive overload when preparing for a single focus sprint or exam week.",
      whoBenefits: "Students who want a clutter-free, customized home workspace.",
      steps: [
        "Click Customize Widgets on the dashboard.",
        "Click any widget eye icon to show or hide that card.",
        "Use Up/Down arrows to change vertical display order, or Reset to restore defaults.",
      ],
      options: [
        {
          label: "Eye Visibility Toggle",
          desc: "Hides/shows a widget while ensuring at least one stays visible.",
        },
        {
          label: "Up / Down Order Arrows",
          desc: "Moves cards higher or lower and persists order to settings.",
        },
      ],
      limitations: "Navigation bars and core accessibility controls remain locked for safety.",
    },
    ar: {
      title: "منشئ لوحة التحكم الشخصية",
      category: "التخطيط",
      whatItDoes:
        "يمكّنك من إعادة ترتيب بطاقات لوحة التحكم للأعلى والأسفل، وإخفاء البطاقات غير الضرورية، واستعادة الوضع الافتراضي.",
      whyAndProblem: "يقلل التشتت البصري عند الرغبة في التركيز على مهام أو مراجعات محددة فقط.",
      whoBenefits: "الطلاب الذين يفضلون واجهة مرتبة ومخصصة لاحتياجاتهم اليومية.",
      steps: [
        "اضغط زر تخصيص البطاقات في لوحة التحكم.",
        "اضغط أيقونة العين لإظهار أو إخفاء أي بطاقة.",
        "استخدم أسهم الأعلى والأسفل لتغيير الترتيب أو زر استعادة الافتراضي.",
      ],
      options: [
        {
          label: "أيقونة الإظهار والإخفاء",
          desc: "تتحكم بظهور البطاقة مع ضمان بقاء بطاقة واحدة على الأقل.",
        },
        { label: "أسهم الترتيب", desc: "تغيّر موضع البطاقة وتحفظ الترتيب تلقائياً." },
      ],
      limitations: "تبقى أشرطة التنقل وأدوات إمكانية الوصول محمية ولا يمكن إخفاؤها.",
    },
    ja: {
      title: "パーソナルダッシュボードビルダー",
      category: "レイアウト",
      whatItDoes:
        "ダッシュボードのウィジェットを上下に並べ替えたり、不要なカードを非表示にしたり、初期配置にリセットできます。",
      whyAndProblem: "試験前など集中したい時期に情報過多を防ぎます。",
      whoBenefits: "必要なカードだけを表示して集中したい学生。",
      steps: [
        "「Customize Widgets」をクリックします。",
        "目のアイコンでカードの表示/非表示を切り替えます。",
        "上下矢印で順序を変更し、「Reset」で初期化します。",
      ],
      options: [
        { label: "表示切替", desc: "最低1つのウィジェットを残して不要カードを隠します。" },
        { label: "並べ替え矢印", desc: "表示順を変更して設定に保存します。" },
      ],
      limitations: "ナビゲーションとアクセシビリティ操作は安全のため常に固定されます。",
    },
    fr: {
      title: "Constructeur de Tableau de Bord",
      category: "Mise en page",
      whatItDoes:
        "Réorganise les widgets vers le haut/bas, masque les cartes inutiles et réinitialise la disposition par défaut.",
      whyAndProblem: "Réduit la surcharge cognitive en période d'examen ou de révision intensive.",
      whoBenefits: "Étudiants préférant un espace épuré et adapté à leurs priorités.",
      steps: [
        "Cliquez sur Personnaliser les widgets.",
        "Cliquez sur l'œil d'une carte pour l'afficher ou la masquer.",
        "Utilisez les flèches haut/bas pour réordonner ou Réinitialiser pour revenir par défaut.",
      ],
      options: [
        {
          label: "Visibilité",
          desc: "Masque/affiche un module tout en gardant au moins une carte active.",
        },
        {
          label: "Flèches d'ordre",
          desc: "Modifie l'ordre vertical et enregistre votre disposition.",
        },
      ],
      limitations: "Les barres de navigation et outils d'accessibilité restent toujours visibles.",
    },
    de: {
      title: "Dashboard-Layout-Builder",
      category: "Layout",
      whatItDoes:
        "Sortiert Dashboard-Karten nach oben/unten, blendet nicht benötigte Widgets aus und stellt Standardlayouts wieder her.",
      whyAndProblem: "Reduziert Ablenkung während intensiver Lernphasen.",
      whoBenefits: "Lernende, die eine aufgeräumte Startseite bevorzugen.",
      steps: [
        "Klicken Sie auf Widgets anpassen.",
        "Schalten Sie Karten über das Augensymbol ein oder aus.",
        "Ändern Sie die Reihenfolge mit den Pfeilen oder klicken Sie auf Zurücksetzen.",
      ],
      options: [
        { label: "Sichtbarkeit", desc: "Blendet Karten ein/aus (mindestens eine bleibt aktiv)." },
        { label: "Sortierpfeile", desc: "Speichert die gewünschte Kartenreihenfolge." },
      ],
      limitations: "Navigationsleisten bleiben zur Sicherheit stets fixiert.",
    },
    "zh-CN": {
      title: "个性化仪表板编辑器",
      category: "布局设置",
      whatItDoes: "支持上下调整仪表板卡片顺序、隐藏暂不需要的模块并可一键重置为默认布局。",
      whyAndProblem: "减少考试周或冲刺阶段的视觉干扰，让界面只保留核心功能。",
      whoBenefits: "希望自由定制极简学习工作区的学生。",
      steps: [
        "点击「自定义卡片」展开编辑面板。",
        "点击卡片旁的眼睛图标即可显示或隐藏该模块。",
        "使用上下箭头调节显示顺序，或点击重置恢复初始排列。",
      ],
      options: [
        { label: "显隐开关", desc: "控制单个卡片显隐，并自动保留至少一个核心卡片。" },
        { label: "排序箭头", desc: "调整模块上下位置并同步至设置。" },
      ],
      limitations: "导航菜单和无障碍核心控制始终保持可见，不可隐藏。",
    },
    ko: {
      title: "맞춤형 대시보드 빌더",
      category: "레이아웃",
      whatItDoes:
        "대시보드 위젯의 위아래 순서를 바꾸고, 당장 필요 없는 카드를 숨기며, 기본 레이아웃으로 초기화합니다.",
      whyAndProblem: "시험 기간 등 집중이 필요할 때 불필요한 정보로 인한 시각적 부담을 줄여줍니다.",
      whoBenefits: "깔끔하고 개인화된 홈 화면 구성을 원하는 학생.",
      steps: [
        "대시보드에서 '위젯 맞춤설정' 버튼을 누르세요.",
        "눈 아이콘을 눌러 각 위젯을 표시하거나 숨기세요.",
        "위/아래 화살표로 순서를 조정하거나 초기화 버튼으로 복원합니다.",
      ],
      options: [
        { label: "표시/숨김 토글", desc: "최소 1개 위젯을 유지한 채 카드 노출을 제어합니다." },
        { label: "순서 화살표", desc: "카드 순서를 바꿔 설정에 자동 저장합니다." },
      ],
      limitations: "내비게이션 메뉴와 접근성 컨트롤은 안전을 위해 숨길 수 없습니다.",
    },
  },
  "dashboard-search": {
    en: {
      title: "Unified Platform Search (Ctrl/⌘+K)",
      category: "Navigation",
      whatItDoes:
        "Searches instantly across your tasks, goals, study notes, flashcards, saved opportunities, and quick page jumps.",
      whyAndProblem:
        "Eliminates manual hunting across 10 modules when you just need one specific note, assignment, or tool.",
      whoBenefits: "Students managing dozens of notes, flashcards, deadlines, and goals.",
      steps: [
        "Click the search bar on the dashboard (or press Ctrl+K / ⌘+K anywhere).",
        "Type keywords from a task title, subject, note, or tool name.",
        "Click any matching result to jump straight to that item's workspace.",
      ],
      options: [
        {
          label: "Keyboard Shortcut (Ctrl+K / ⌘+K)",
          desc: "Opens global command palette from any screen.",
        },
        {
          label: "Live Cross-Module Filter",
          desc: "Matches tasks, flashcards, notes, and routes simultaneously.",
        },
      ],
      limitations:
        "Searches synced client data in memory; items outside loaded collections will not appear until loaded.",
    },
    ar: {
      title: "البحث الموحد عبر المنصة",
      category: "التنقل",
      whatItDoes:
        "يبحث فوراً في مهامك وأهدافك وملاحظاتك وبطاقات الاستذكار والفرص المحفوظة وأقسام المنصة.",
      whyAndProblem: "يوفر الوقت بدلاً من التنقل يدوياً بين 10 أقسام للعثور على ملاحظة أو واجب محدد.",
      whoBenefits: "الطلاب الذين يملكون عشرات الملاحظات والبطاقات والمهام.",
      steps: [
        "انقر على شريط البحث في لوحة التحكم أو اضغط Ctrl+K / ⌘+K.",
        "اكتب كلمة مفتاحية من اسم المهمة أو المادة أو الأداة.",
        "انقر على أي نتيجة للانتقال مباشرة إلى مكانها.",
      ],
      options: [
        { label: "اختصار لوحة المفاتيح", desc: "يفتح البحث الشامل من أي صفحة داخل التطبيق." },
        { label: "نتائج فورية متعددة", desc: "تعرض المهام والبطاقات والملاحظات والأدوات معاً." },
      ],
      limitations: "يبحث في البيانات المحمّلة في الجلسة الحالية لسرعة الاستجابة الفورية.",
    },
    ja: {
      title: "統合プラットフォーム検索",
      category: "ナビゲーション",
      whatItDoes:
        "タスク、目標、学習ノート、フラッシュカード、保存済み機会、各画面を横断して即座に検索します。",
      whyAndProblem: "目的のメモや課題を探すために10個のモジュールを手動で巡回する手間を省きます。",
      whoBenefits: "多くのノート・単語カード・課題を抱えるすべての学生。",
      steps: [
        "ダッシュボードの検索欄をクリック（または Ctrl+K / ⌘+K）。",
        "課題名・科目・ツール名などのキーワードを入力します。",
        "一致した項目をクリックして該当ページへ移動します。",
      ],
      options: [
        { label: "ショートカットキー", desc: "どの画面からでもコマンドパレットを呼び出せます。" },
        { label: "横断リアルタイム検索", desc: "複数の学習コレクションを同時に絞り込みます。" },
      ],
      limitations: "現在読み込まれているクライアント側データを対象に高速検索します。",
    },
    fr: {
      title: "Recherche Unifiée",
      category: "Navigation",
      whatItDoes:
        "Recherche instantanément dans vos tâches, objectifs, notes, cartes mémoire, opportunités et modules.",
      whyAndProblem:
        "Évite de fouiller manuellement dans 10 rubriques pour retrouver une fiche ou un devoir précis.",
      whoBenefits: "Étudiants gérant de nombreuses notes, révisions et échéances.",
      steps: [
        "Cliquez sur la barre de recherche ou appuyez sur Ctrl+K / ⌘+K.",
        "Saisissez un mot-clé (matière, titre de tâche, outil).",
        "Cliquez sur un résultat pour ouvrir directement l'espace correspondant.",
      ],
      options: [
        {
          label: "Raccourci Ctrl+K / ⌘+K",
          desc: "Ouvre la palette de commande depuis n'importe quelle page.",
        },
        {
          label: "Filtre multi-modules",
          desc: "Regroupe tâches, notes, cartes et routes en une vue.",
        },
      ],
      limitations: "Analyse en temps réel les données chargées dans la session active.",
    },
    de: {
      title: "Plattformweite Suche",
      category: "Navigation",
      whatItDoes:
        "Durchsucht Aufgaben, Ziele, Lernnotizen, Lernkarten, Chancen und Werkzeuge in Echtzeit.",
      whyAndProblem: "Erspart langes Suchen über zehn verschiedene Module hinweg.",
      whoBenefits: "Lernende mit vielen Notizen, Karteikarten und Abgabeterminen.",
      steps: [
        "Klicken Sie in die Suchleiste oder drücken Sie Strg+K / ⌘+K.",
        "Geben Sie ein Stichwort zu Fach, Aufgabe oder Tool ein.",
        "Klicken Sie auf ein Ergebnis für den direkten Sprung.",
      ],
      options: [
        { label: "Tastenkürzel", desc: "Öffnet die Schnellsuche auf jeder Seite." },
        { label: "Live-Filter", desc: "Durchsucht mehrere Lernbereiche gleichzeitig." },
      ],
      limitations: "Durchsucht aus Geschwindigkeitsgründen die geladenen Sitzungsdaten.",
    },
    "zh-CN": {
      title: "全平台统一搜索 (Ctrl/⌘+K)",
      category: "快捷导航",
      whatItDoes: "即时搜索您的任务、目标、学习笔记、闪卡、已保存机会以及各功能模块入口。",
      whyAndProblem: "无需在 10 个模块间反复切换翻找某条笔记或作业。",
      whoBenefits: "积累了大量学习笔记、闪卡和日程任务的同学。",
      steps: [
        "点击仪表板搜索栏，或在任意页面按下 Ctrl+K / ⌘+K。",
        "输入科目、任务标题或功能名称关键词。",
        "点击搜索结果即可直达目标页面或条目。",
      ],
      options: [
        { label: "全局快捷键", desc: "随时呼出命令面板快速跳转。" },
        { label: "跨模块实时匹配", desc: "同时检索学业任务、笔记、闪卡与路由。" },
      ],
      limitations: "仅在当前会话已同步加载的数据范围内进行毫秒级本地检索。",
    },
    ko: {
      title: "플랫폼 통합 검색 (Ctrl/⌘+K)",
      category: "탐색",
      whatItDoes:
        "할 일, 목표, 학습 노트, 플래시카드, 저장된 기회 및 메뉴 경로를 한 번에 검색합니다.",
      whyAndProblem:
        "특정 노트나 과제를 찾기 위해 10개 모듈을 일일이 열어봐야 하는 번거로움을 없애줍니다.",
      whoBenefits: "수많은 노트, 카드, 마감일을 관리하는 학생.",
      steps: [
        "대시보드 검색창을 클릭하거나 Ctrl+K / ⌘+K를 누르세요.",
        "과목, 과제명 또는 도구 이름을 입력하세요.",
        "검색 결과를 클릭하면 해당 작업실로 바로 이동합니다.",
      ],
      options: [
        { label: "단축키 지원", desc: "어느 페이지에서든 명령 팔레트를 바로 열 수 있습니다." },
        { label: "모듈 통합 필터", desc: "여러 컬렉션의 항목을 동시에 찾아줍니다." },
      ],
      limitations: "빠른 응답을 위해 현재 세션에 불러온 데이터를 기준으로 검색합니다.",
    },
  },
  "growth-map": {
    en: {
      title: "Interactive 6-Domain Growth Map",
      category: "Growth Analytics",
      whatItDoes:
        "Visualizes your student balance across Academic, Productivity, Growth, Wellbeing, Career, and Community using an interactive constellation + radar chart, weekly objectives, and daily pulse.",
      whyAndProblem:
        "Prevents burnout caused by pushing only one area (e.g. academics) while neglecting wellbeing, community, or career skills.",
      whoBenefits: "Students aiming for balanced personal development alongside grades.",
      steps: [
        "Open the Growth Map tab on the dashboard.",
        "Click any of the 6 domain nodes (Academic, Career, Wellbeing, etc.) to inspect its score and recent XP.",
        "Record your Daily Pulse check-in and complete Weekly Objectives to grow weaker domains.",
      ],
      options: [
        {
          label: "6 Domain Nodes",
          desc: "Opens detailed score, task count, goals, and XP events for that life area.",
        },
        {
          label: "Balance Index & Radar Chart",
          desc: "Computes your overall symmetry percentage and historical trend.",
        },
      ],
      limitations:
        "Domain percentages calculate dynamically from completed tasks, goals, and logged activity events.",
    },
    ar: {
      title: "خارطة النمو التفاعلية ذات الـ 6 مجالات",
      category: "تحليلات النمو",
      whatItDoes:
        "تعرض توازنك الطلابي عبر المجالات الستة (الأكاديمي، الإنتاجية، النمو، العافية، المسار المهني، المجتمع) برسم تفاعلي وشبكة رادار وأهداف أسبوعية.",
      whyAndProblem:
        "تمنع الإرهاق الناتج عن التركيز على جانب واحد فقط وإهمال العافية أو المهارات المهنية.",
      whoBenefits: "الطلاب الساعون لتطوير شامل ومتوازن بين الدراسة والحياة.",
      steps: [
        "افتح تبويب خارطة النمو من أعلى لوحة التحكم.",
        "انقر على أي عقدة مجال لعرض نسبته ومهامه ونقاط خبرته الأخيرة.",
        "سجّل نبضك اليومي وأكمل الأهداف الأسبوعية لرفع المجالات الأقل.",
      ],
      options: [
        {
          label: "عقد المجالات الستة",
          desc: "تعرض تفاصيل الأداء والمهام والخبرة المكتسبة لكل مجال.",
        },
        { label: "مؤشر التوازن والرادار", desc: "يحسب متوسط توازنك ويعرض تطوره." },
      ],
      limitations: "تُحسب النسب تلقائياً من المهام المنجزة والأهداف والأنشطة المسجلة.",
    },
    ja: {
      title: "インタラクティブ6領域・成長マップ",
      category: "成長分析",
      whatItDoes:
        "学業・生産性・成長・ウェルビーイング・キャリア・コミュニティの6領域のバランスを星座図とレーダーチャートで可視化します。",
      whyAndProblem: "学業だけに偏って健康や将来準備を疎かにしてしまう燃え尽きを防ぎます。",
      whoBenefits: "成績と生活バランスの両立を目指す学生。",
      steps: [
        "ダッシュボード上部の「Growth Map」タブを開きます。",
        "6つの領域ノードをクリックしてスコアや直近XPを確認します。",
        "デイリーパルスや週間目標を記録して弱い領域を伸ばします。",
      ],
      options: [
        {
          label: "領域ノード",
          desc: "選択した領域の進捗・目標・XP履歴をインスペクターに表示します。",
        },
        { label: "バランス指数", desc: "6領域全体の均等度（%）を算出します。" },
      ],
      limitations: "各スコアは完了タスク、目標、アクティビティ履歴から動的に算出されます。",
    },
    fr: {
      title: "Carte de Croissance Interactive (6 Domaines)",
      category: "Analytique",
      whatItDoes:
        "Visualise votre équilibre entre Académique, Productivité, Développement, Bien-être, Carrière et Communauté via constellation et graphique radar.",
      whyAndProblem:
        "Évite le surmenage lié à un déséquilibre entre études intensives, santé et projets d'avenir.",
      whoBenefits: "Étudiants souhaitant progresser harmonieusement dans chaque dimension.",
      steps: [
        "Ouvrez l'onglet Carte de croissance sur l'accueil.",
        "Cliquez sur l'un des 6 nœuds pour inspecter son score et ses derniers XP.",
        "Complétez votre bilan quotidien et les objectifs hebdomadaires.",
      ],
      options: [
        {
          label: "Nœuds interactifs",
          desc: "Affiche tâches, objectifs et gains d'XP du domaine choisi.",
        },
        { label: "Indice d'équilibre", desc: "Calcule la moyenne de progression sur les 6 axes." },
      ],
      limitations:
        "Les scores évoluent en fonction réelle des tâches, objectifs et sessions enregistrés.",
    },
    de: {
      title: "Interaktive 6-Bereiche-Growth-Map",
      category: "Wachstumsanalyse",
      whatItDoes:
        "Visualisiert die Balance zwischen Studium, Produktivität, Entwicklung, Wohlbefinden, Karriere und Gemeinschaft per Radar- und Konstellationsdiagramm.",
      whyAndProblem:
        "Verhindert einseitige Überlastung, indem vernachlässigte Lebensbereiche sichtbar gemacht werden.",
      whoBenefits: "Studierende mit Fokus auf ganzheitliche Entwicklung.",
      steps: [
        "Öffnen Sie den Tab Growth Map im Dashboard.",
        "Klicken Sie auf einen der 6 Bereiche für Details und XP-Ereignisse.",
        "Nutzen Sie Daily Pulse und Wochenziele, um schwächere Bereiche zu stärken.",
      ],
      options: [
        { label: "Bereichsknoten", desc: "Zeigt Detailwerte, Aufgaben und letzte XP-Punkte." },
        { label: "Balance-Index", desc: "Berechnet den Gesamtausgleich in Prozent." },
      ],
      limitations:
        "Werte berechnen sich dynamisch aus erledigten Aufgaben, Zielen und Aktivitäten.",
    },
    "zh-CN": {
      title: "六维交互式成长地图",
      category: "成长分析",
      whatItDoes:
        "通过星图与雷达图直观呈现学业、效率、个人成长、身心健康、职业发展与社区贡献六大维度的平衡度，并集成周目标与每日脉搏。",
      whyAndProblem: "避免只顾刷题而忽视身心健康、社交协作和职业探索导致的倦怠。",
      whoBenefits: "希望全面发展、保持学业与生活平衡的学生。",
      steps: [
        "在首页顶部点击「成长地图」标签。",
        "点击任意领域节点，在右侧详情面板查看得分、任务数与近期 XP。",
        "记录每日脉搏并完成每周目标以补齐短板维度。",
      ],
      options: [
        { label: "六大领域节点", desc: "查看各维度的实时得分、目标进度和 XP 记录。" },
        { label: "平衡指数", desc: "自动计算六大领域的综合均衡百分比。" },
      ],
      limitations: "雷达图与得分完全基于您实际完成的任务、目标与日志动态生成。",
    },
    ko: {
      title: "인터랙티브 6대 영역 성장 맵",
      category: "성장 분석",
      whatItDoes:
        "학업, 생산성, 성장, 웰빙, 커리어, 커뮤니티 6개 영역의 균형을 별자리 및 레이더 차트로 시각화합니다.",
      whyAndProblem: "한 영역에만 치우쳐 건강이나 진로 준비를 놓치는 번아웃을 방지합니다.",
      whoBenefits: "성적과 삶의 균형 있는 발전을 추구하는 모든 학생.",
      steps: [
        "대시보드 상단의 '성장 맵' 탭을 엽니다.",
        "6개 영역 노드 중 하나를 클릭하여 점수와 최근 XP 내역을 확인하세요.",
        "데일리 펄스 체크인과 주간 목표를 달성해 부족한 영역을 키워보세요.",
      ],
      options: [
        { label: "영역 노드 선택", desc: "세부 달성률, 완료 과제, 최근 획득 XP를 표시합니다." },
        { label: "균형 지수", desc: "6개 영역의 평균 균형 점수를 계산합니다." },
      ],
      limitations: "점수는 완료된 할 일, 목표 및 기록된 활동 데이터를 기반으로 실시간 산출됩니다.",
    },
  },
  "growth-history": {
    en: {
      title: "Growth History & XP Timeline",
      category: "Analytics",
      whatItDoes:
        "Displays a chronological log of every XP-earning milestone, focus sprint, quiz completion, and task achievement.",
      whyAndProblem:
        "Makes long-term effort visible so students see tangible proof of consistency even on tough weeks.",
      whoBenefits: "Students tracking streaks, preparing portfolios, or reviewing study habits.",
      steps: [
        "Switch to the History tab on the dashboard or Level Up page.",
        "Review recent XP events filtered by domain and timestamp.",
        "Spot your peak productivity days and recurring study patterns.",
      ],
      options: [
        {
          label: "Event Filter / Timeline",
          desc: "Lists recent study, focus, task, and reflection XP awards.",
        },
      ],
      limitations: "Displays up to the most recent 100 synced activity events for fast loading.",
    },
    ar: {
      title: "سجل النمو والخط الزمني لنقاط الخبرة",
      category: "التحليلات",
      whatItDoes: "يعرض سجلاً زمنياً مفصلاً لكل إنجاز وجلسة تركيز واختبار ومهمة أضافت لك نقاط خبرة.",
      whyAndProblem: "يُظهر الجهد التراكمي بوضوح كي يرى الطالب ثمرة التزامه على المدى الطويل.",
      whoBenefits: "الطلاب المتابعون لتقدمهم وبناء ملف إنجازهم.",
      steps: [
        "انتقل إلى تبويب السجل في لوحة التحكم أو صفحة الترقية.",
        "استعرض أحداث نقاط الخبرة مرتبة زمنياً حسب المجال.",
        "اكتشف أيام ذروة إنتاجيتك وأنماط مذاكرتك.",
      ],
      options: [
        { label: "الخط الزمني للأحداث", desc: "يعرض تفاصيل كل نقطة خبرة مكتسبة وتوقيتها." },
      ],
      limitations: "يعرض أحدث 100 حدث نشاط متزامن لضمان سرعة التصفح.",
    },
    ja: {
      title: "成長履歴＆XPタイムライン",
      category: "分析",
      whatItDoes:
        "集中セッション、クイズ完了、タスク達成などで獲得したXP履歴を時系列で表示します。",
      whyAndProblem: "日々の積み上げを可視化し、学習の継続実感を高めます。",
      whoBenefits: "学習習慣の振り返りやポートフォリオ作成を行う学生。",
      steps: [
        "ダッシュボードまたはレベルアップ画面の「History」タブを開きます。",
        "領域別の獲得XPと日時を確認します。",
        "集中しやすい曜日や学習リズムを把握します。",
      ],
      options: [
        { label: "アクティビティ履歴", desc: "最近の学習・タスク・目標のXPイベントを表示します。" },
      ],
      limitations: "高速表示のため最新の同期イベント100件までを表示します。",
    },
    fr: {
      title: "Historique de Croissance & Timeline XP",
      category: "Analytique",
      whatItDoes:
        "Affiche le journal chronologique de chaque session de concentration, quiz et tâche ayant généré de l'XP.",
      whyAndProblem:
        "Rend vos efforts quotidiens tangibles pour entretenir la motivation sur la durée.",
      whoBenefits: "Étudiants suivant leur régularité ou préparant leur portfolio.",
      steps: [
        "Ouvrez l'onglet Historique du tableau de bord.",
        "Consultez les gains d'XP classés par domaine et horodatage.",
        "Repérez vos meilleurs créneaux de productivité.",
      ],
      options: [
        { label: "Journal XP", desc: "Liste détaillée des récompenses d'activité récentes." },
      ],
      limitations:
        "Affiche les 100 derniers événements synchronisés pour des performances optimales.",
    },
    de: {
      title: "Wachstumsverlauf & XP-Chronik",
      category: "Analyse",
      whatItDoes:
        "Zeigt eine chronologische Übersicht aller Fokus-Sprints, Quizze und erledigten Aufgaben inklusive XP-Vergabe.",
      whyAndProblem: "Macht langfristige Konstanz sichtbar und stärkt die Motivation.",
      whoBenefits: "Lernende zur Reflexion ihrer Lerngewohnheiten.",
      steps: [
        "Öffnen Sie den Tab Verlauf auf dem Dashboard.",
        "Prüfen Sie XP-Ereignisse nach Bereich und Datum.",
        "Erkennen Sie Ihre produktivsten Tage.",
      ],
      options: [{ label: "Aktivitätsprotokoll", desc: "Listet alle verdienten XP-Meilensteine." }],
      limitations: "Zeigt aus Performancegründen die letzten 100 synchronisierten Ereignisse.",
    },
    "zh-CN": {
      title: "成长历史与 XP 时间线",
      category: "数据统计",
      whatItDoes: "按时间顺序完整记录每次专注训练、测验、任务完成获得的 XP 明细。",
      whyAndProblem: "让长期努力有迹可循，在疲惫时也能看见实实在在的积累。",
      whoBenefits: "追踪自律天数、复盘学习习惯与整理成就档案的学生。",
      steps: [
        "在仪表板或升级中心切换到「成长历史」标签。",
        "按时间与领域查看近期获取的 XP 事件。",
        "识别自己的高效学习时段与习惯规律。",
      ],
      options: [{ label: "活动时间线", desc: "展示学习、专注、任务与反思的 XP 流水。" }],
      limitations: "为保证加载流畅，默认展示最近同步的 100 条活动记录。",
    },
    ko: {
      title: "성장 기록 및 XP 타임라인",
      category: "분석",
      whatItDoes: "집중 세션, 퀴즈, 과제 완료 등으로 획득한 모든 XP 기록을 시간순으로 보여줍니다.",
      whyAndProblem: "꾸준한 노력의 흔적을 시각화해 장기적인 학습 동기를 유지하도록 돕습니다.",
      whoBenefits: "학습 패턴을 돌아보거나 포트폴리오 증거를 정리하는 학생.",
      steps: [
        "대시보드 또는 레벨업 화면의 '기록' 탭으로 이동하세요.",
        "영역별 XP 획득 내역과 시각을 확인합니다.",
        "가장 생산적이었던 날과 학습 리듬을 파악하세요.",
      ],
      options: [{ label: "활동 로그", desc: "최근 완료한 학습 및 목표 XP 내역을 나열합니다." }],
      limitations: "빠른 로딩을 위해 최근 동기화된 100건의 활동 이벤트를 표시합니다.",
    },
  },
  "daily-journal": {
    en: {
      title: "Daily Reflection Journal & 1-Click Conversion",
      category: "Reflection",
      whatItDoes:
        "Lets you record daily study reflections with guided prompts, mood & minutes tracking, live word count, search, and 1-click conversion into a Task or Study Note.",
      whyAndProblem:
        "Helps students capture breakthroughs and turn vague reflections into concrete next-step tasks or study notes.",
      whoBenefits:
        "Reflective learners, exam candidates, and students building consistent study logs.",
      steps: [
        "Click a guided prompt (e.g., Concept Breakthrough) or enter your own headline.",
        "Write your reflection, key win, next step, mood, and study duration, then click Save Entry.",
        "Use 'Turn into Task' or 'Save as Note' on any saved entry to convert insights into action.",
      ],
      options: [
        {
          label: "Guided Prompts",
          desc: "Pre-fills structured headlines to eliminate blank-page friction.",
        },
        {
          label: "Turn into Task / Save as Note",
          desc: "Creates a linked task in Productivity or note in Study Workspace.",
        },
      ],
      limitations: "Synced with Firestore per signed-in user.",
    },
    ar: {
      title: "المفكرة اليومية والتحويل الفوري لمهمة أو ملاحظة",
      category: "التأمل الدراسي",
      whatItDoes:
        "تسجّل تأملاتك اليومية مع قوالب إرشادية ومؤشر للمزاج وعدد الكلمات وبحث وزر لتحويل أي تدوينة إلى مهمة أو ملاحظة دراسية.",
      whyAndProblem:
        "تساعد الطالب على توثيق لحظات الفهم وتحويل أفكاره إلى مهام أو ملخصات عملية فوراً.",
      whoBenefits: "الطلاب المهتمون بتوثيق تقدمهم وبناء عادة التأمل الذاتي.",
      steps: [
        "اختر قالباً إرشادياً أو اكتب عنواناً لتجربتك اليوم.",
        "دوّن تأملك وأهم إنجاز والخطوة التالية ومدة الدراسة ثم احفظ التدوينة.",
        "استخدم 'تحويل إلى مهمة' أو 'حفظ كملاحظة' لتحويل أي تدوينة إلى إجراء عملي.",
      ],
      options: [
        { label: "القوالب الإرشادية", desc: "تملأ العنوان تلقائياً لتسهيل بدء الكتابة." },
        {
          label: "تحويل إلى مهمة / ملاحظة",
          desc: "يرسل التدوينة مباشرة لقائمة المهام أو ملاحظات الدراسة.",
        },
      ],
      limitations: "تُحفظ التدوينات وتُزامن في قاعدة البيانات الخاصة بحسابك.",
    },
    ja: {
      title: "デイリー学習ジャーナル＆1クリック変換",
      category: "振り返り",
      whatItDoes:
        "ガイド付きプロンプト、気分・学習時間、単語数カウント付きで日々の振り返りを記録し、タスクや学習ノートへ1クリック変換できます。",
      whyAndProblem: "気づきを記録だけで終わらせず、具体的な次のタスクや暗記ノートにつなげます。",
      whoBenefits: "毎日の学びを定着させたいすべての学生。",
      steps: [
        "ガイドプロンプトを選択するか自由に見出しを入力します。",
        "振り返り本文・成果・次のステップ・気分を入力し保存します。",
        "「Turn into Task」や「Save as Note」でアクションやノートに変換します。",
      ],
      options: [
        { label: "ガイドプロンプト", desc: "書き出しに迷わないテンプレート見出しを設定します。" },
        { label: "タスク / ノート変換", desc: "保存済み記録から直接ToDoやノートを生成します。" },
      ],
      limitations: "ログイン中のアカウントごとにFirestoreへ同期保存されます。",
    },
    fr: {
      title: "Journal Quotidien & Conversion en 1 Clic",
      category: "Réflexion",
      whatItDoes:
        "Enregistre vos bilans quotidiens avec amorces guidées, humeur, compteur de mots et conversion en 1 clic en Tâche ou Note d'étude.",
      whyAndProblem:
        "Transforme vos prises de conscience en actions concrètes ou fiches de révision.",
      whoBenefits: "Étudiants souhaitant capitaliser sur leurs réussites et axes d'amélioration.",
      steps: [
        "Choisissez une amorce guidée ou saisissez votre propre titre.",
        "Rédigez votre réflexion, réussite clé, prochaine étape et durée d'étude.",
        "Cliquez sur Transformer en tâche ou Enregistrer en note sur n'importe quelle entrée.",
      ],
      options: [
        {
          label: "Amorces guidées",
          desc: "Pré-remplissent des titres structurés pour écrire plus vite.",
        },
        {
          label: "Convertir en tâche / note",
          desc: "Crée directement un élément dans Productivité ou Étude.",
        },
      ],
      limitations: "Synchronisé dans Firestore pour votre compte.",
    },
    de: {
      title: "Tagesjournal & 1-Klick-Umwandlung",
      category: "Reflexion",
      whatItDoes:
        "Erfasst Lernreflexionen mit Impulsen, Stimmung, Wortzähler und 1-Klick-Umwandlung in Aufgaben oder Lernnotizen.",
      whyAndProblem: "Verwandelt Erkenntnisse direkt in umsetzbare Aufgaben oder Lernmaterial.",
      whoBenefits: "Lernende, die ihre Fortschritte dokumentieren möchten.",
      steps: [
        "Wählen Sie einen Schreibimpuls oder geben Sie eine Überschrift ein.",
        "Notieren Sie Erkenntnisse, Erfolge, nächste Schritte und Lernzeit und speichern Sie.",
        "Nutzen Sie „In Aufgabe umwandeln“ oder „Als Notiz speichern“.",
      ],
      options: [
        { label: "Schreibimpulse", desc: "Bieten strukturierte Vorlagen gegen Schreibblockaden." },
        {
          label: "Aufgabe / Notiz erstellen",
          desc: "Überträgt Einträge nahtlos ins Aufgaben- oder Lernmodul.",
        },
      ],
      limitations: "Wird pro angemeldetem Konto in Firestore synchronisiert.",
    },
    "zh-CN": {
      title: "每日反思日记与一键转化",
      category: "复盘总结",
      whatItDoes:
        "提供写作提示、情绪与时长记录、实时字数统计和检索，并支持一键将任意反思转化为待办任务或学习笔记。",
      whyAndProblem: "避免灵感和复盘停留在纸面，直接变成可执行任务或复习资料。",
      whoBenefits: "注重每日总结、不断优化学习方法的学生。",
      steps: [
        "点击引导提示卡（如「概念突破」）或输入自定义标题。",
        "填写反思正文、今日收获、下一步计划与情绪后保存。",
        "点击记录下的「转为任务」或「存为笔记」一键联动。",
      ],
      options: [
        { label: "引导写作提示", desc: "提供结构化标题，消除面对空白页的无从下手。" },
        { label: "一键转为任务/笔记", desc: "自动写入效率中心或学习笔记库。" },
      ],
      limitations: "数据按登录账号实时保存并同步至 Firestore。",
    },
    ko: {
      title: "일일 성찰 저널 및 원클릭 변환",
      category: "성찰",
      whatItDoes:
        "가이드 프롬프트, 기분·학습 시간 기록, 실시간 단어 수, 검색 및 1클릭 할 일/학습 노트 변환 기능을 제공합니다.",
      whyAndProblem:
        "학습 중 깨달음을 단순 메모로 끝내지 않고 실행 가능한 과제와 복습 자료로 연결합니다.",
      whoBenefits: "꾸준히 학습 회고를 작성하며 성장하고 싶은 학생.",
      steps: [
        "가이드 프롬프트(예: 개념 돌파구)를 선택하거나 제목을 입력하세요.",
        "성찰 내용, 주요 성과, 다음 단계, 기분을 작성한 뒤 저장합니다.",
        "저장된 항목에서 '할 일로 전환' 또는 '노트로 저장'을 눌러 바로 연결하세요.",
      ],
      options: [
        { label: "가이드 프롬프트", desc: "글쓰기 부담을 줄여주는 구조화된 주제를 채워줍니다." },
        { label: "할 일 / 노트 변환", desc: "생산성 모듈이나 학습 노트로 즉시 복제합니다." },
      ],
      limitations: "로그인된 사용자 계정별로 Firestore에 동기화됩니다.",
    },
  },
  "study-pomodoro": {
    en: {
      title: "Pomodoro Focus Timer & Presets",
      category: "Focus",
      whatItDoes:
        "Provides timed Focus, Short Break, and Long Break intervals with Sprint/Classic/Deep Work presets, Pause/Resume control, and Focus Session XP logging.",
      whyAndProblem:
        "Combats procrastination and mental burnout by dividing work into manageable, distraction-free intervals.",
      whoBenefits: "Students tackling heavy reading, math problem sets, or exam revision.",
      steps: [
        "Choose a preset (15m Sprint, 25m Classic, or 50m Deep Work) and optionally tag a subject.",
        "Click Start to run the countdown timer; pause or switch to Short Break anytime.",
        "Click Complete & Save Session (or let it finish) to log minutes and earn XP.",
      ],
      options: [
        {
          label: "Presets (15m / 25m / 50m)",
          desc: "Configures focus and break durations instantly.",
        },
        {
          label: "Start / Pause / Resume / Complete",
          desc: "Preserves exact remaining seconds and records session history.",
        },
      ],
      limitations: "Logs completed focus sessions to Firestore when signed in.",
    },
    ar: {
      title: "مؤقت التركيز بومودورو",
      category: "التركيز",
      whatItDoes:
        "يوفر دورات تركيز واستراحة قصيرة وطويلة مع أوضاع جاهزة (15 / 25 / 50 دقيقة) وتحكم بالإيقاف المؤقت وتسجيل الجلسات لكسب الخبرة.",
      whyAndProblem: "يعالج التسويف والإرهاق الذهني عبر تقسيم المذاكرة لفترات مركزة وقصيرة.",
      whoBenefits: "الطلاب أثناء القراءة العميقة وحل التمارين والمراجعة.",
      steps: [
        "اختر المدة المناسبة (15 أو 25 أو 50 دقيقة) وحدد المادة إن شئت.",
        "اضغط بدء لبدء العد التنازلي مع إمكانية الإيقاف المؤقت أو الاستئناف.",
        "اضغط إتمام الجلسة لحفظ الدقائق وكسب نقاط الخبرة.",
      ],
      options: [
        {
          label: "القوالب السريعة (15 / 25 / 50)",
          desc: "تضبط وقت التركيز والاستراحة بنقرة واحدة.",
        },
        { label: "بدء / إيقاف / حفظ الجلسة", desc: "يحفظ الدقائق المتبقية بدقة ويوثق الجلسة." },
      ],
      limitations: "تُحفظ الجلسات المكتملة في سجل حسابك عند تسجيل الدخول.",
    },
    ja: {
      title: "ポモドーロ集中タイマー",
      category: "集中",
      whatItDoes:
        "スプリント(15分)・クラシック(25分)・ディープ(50分)の集中と休憩サイクルを管理し、完了セッションをXP記録として保存します。",
      whyAndProblem: "長時間のダラダラ学習や先延ばしを防ぎ、高い集中力を維持します。",
      whoBenefits: "問題演習や暗記・レポート作成に集中したい学生。",
      steps: [
        "プリセット（15m / 25m / 50m）と対象科目を選びます。",
        "「Start」でカウントダウンを開始し、必要に応じて一時停止します。",
        "「Complete」で学習時間を保存しXPを獲得します。",
      ],
      options: [
        {
          label: "時間プリセット",
          desc: "集中時間と休憩時間の組み合わせをワンクリックで設定します。",
        },
        {
          label: "一時停止/再開/完了保存",
          desc: "残り秒数を保持したまま中断・再開し、記録を残せます。",
        },
      ],
      limitations: "ログイン時に完了した集中セッションがFirestoreに記録されます。",
    },
    fr: {
      title: "Minuteur de Concentration Pomodoro",
      category: "Concentration",
      whatItDoes:
        "Propose des cycles Travail / Pause courte / Pause longue avec préréglages (15, 25, 50 min), pause/reprise et suivi XP.",
      whyAndProblem:
        "Lutte contre la procrastination et la fatigue mentale grâce au découpage temporel.",
      whoBenefits: "Étudiants réalisant des exercices complexes ou des révisions longues.",
      steps: [
        "Choisissez un préréglage (Sprint 15m, Classique 25m, Profond 50m) et une matière.",
        "Cliquez sur Démarrer ; mettez en pause ou reprenez sans perdre le temps restant.",
        "Validez la fin de session pour enregistrer les minutes et gagner de l'XP.",
      ],
      options: [
        { label: "Préréglages 15/25/50", desc: "Configurent instantanément la durée du cycle." },
        {
          label: "Enregistrer la session",
          desc: "Ajoute la session au journal d'activité et attribue l'XP.",
        },
      ],
      limitations: "La synchronisation de l'historique nécessite un compte connecté.",
    },
    de: {
      title: "Pomodoro-Fokus-Timer",
      category: "Fokus",
      whatItDoes:
        "Steuert Lern- und Pausenphasen mit Voreinstellungen (15/25/50 Min.), Pause/Fortsetzen und automatischer XP-Protokollierung.",
      whyAndProblem: "Hilft gegen Aufschieberitis und geistige Erschöpfung bei langem Lernen.",
      whoBenefits: "Schüler und Studierende bei Aufgaben, Lesen und Prüfungsvorbereitung.",
      steps: [
        "Wählen Sie eine Voreinstellung (Sprint, Klassisch, Deep Work) und optional ein Fach.",
        "Starten Sie den Timer und pausieren oder setzen Sie jederzeit fort.",
        "Speichern Sie die abgeschlossene Einheit für XP-Fortschritt.",
      ],
      options: [
        {
          label: "Zeit-Presets",
          desc: "Wechseln mit einem Klick zwischen 15-, 25- und 50-Minuten-Sprints.",
        },
        { label: "Abschließen & Speichern", desc: "Protokolliert die Lernzeit in Ihrem Konto." },
      ],
      limitations: "Sitzungsprotokolle werden im angemeldeten Zustand in Firestore gespeichert.",
    },
    "zh-CN": {
      title: "番茄钟专注计时器",
      category: "高效专注",
      whatItDoes:
        "内置 15/25/50 分钟专注与短休/长休预设，支持随时暂停恢复并将完成记录写入学习时长与 XP。",
      whyAndProblem: "克服拖延与久坐疲劳，用科学时间块保持高效专注。",
      whoBenefits: "刷题、背诵、写论文或冲刺备考的所有学生。",
      steps: [
        "选择时长预设（15 分钟冲刺、25 分钟标准、50 分钟深度），可关联学科。",
        "点击开始倒计时，途中可随时暂停并保留精确剩余秒数。",
        "倒计时结束或点击完成即可累计学习分钟并获取 XP。",
      ],
      options: [
        { label: "三档节奏预设", desc: "快速设定专注与休息时长比例。" },
        { label: "完成并记入档案", desc: "把真实专注分钟写入成长日志。" },
      ],
      limitations: "专注记录在登录后会自动保存至云端数据库。",
    },
    ko: {
      title: "뽀모도로 집중 타이머",
      category: "집중",
      whatItDoes:
        "15분 스프린트, 25분 클래식, 50분 딥워크 프리셋과 일시정지/재개, 완료 시 학습 시간 및 XP 자동 기록 기능을 제공합니다.",
      whyAndProblem: "미루는 습관과 정신적 피로를 줄이고 몰입 시간을 구조화해 줍니다.",
      whoBenefits: "문제 풀이, 암기, 시험 공부를 집중적으로 해야 하는 모든 학생.",
      steps: [
        "원하는 시간 프리셋(15/25/50분)과 과목을 선택하세요.",
        "시작 버튼을 눌러 카운트다운을 시작하고 필요 시 일시정지할 수 있습니다.",
        "완료 버튼을 눌러 학습 세션을 저장하고 XP를 획득하세요.",
      ],
      options: [
        { label: "집중 프리셋", desc: "집중과 휴식 시간을 원클릭으로 맞춥니다." },
        { label: "세션 완료 저장", desc: "집중 시간과 XP를 계정 기록에 반영합니다." },
      ],
      limitations: "완료된 집중 세션은 로그인 시 Firestore에 저장됩니다.",
    },
  },
  "daily-goals": {
    en: {
      title: "Daily Goals Tracker",
      category: "Dashboard",
      whatItDoes:
        "Lets you define, inspect, complete, and remove daily measurable goals tied to your 6 growth domains.",
      whyAndProblem: "Keeps daily ambitions concrete and achievable instead of overwhelming.",
      whoBenefits: "Students turning long-term dreams into clear daily wins.",
      steps: [
        "Type a short daily objective and choose its Life Area and target date.",
        "Click Add Goal to pin it to your Today list.",
        "Click the checkmark when completed to trigger progress celebrations and XP.",
      ],
      options: [
        { label: "Add Goal Form", desc: "Creates a new tracked goal with area badge." },
        { label: "Complete / Delete Buttons", desc: "Marks goals done (+XP) or clears old goals." },
      ],
      limitations: "Synced directly to your Firestore goals collection.",
    },
    ar: {
      title: "متتبع الأهداف اليومية",
      category: "لوحة التحكم",
      whatItDoes:
        "يتيح إضافة أهداف يومية قصيرة وربطها بمجالات النمو الستة وإتمامها لكسب نقاط الخبرة.",
      whyAndProblem: "يحوّل الطموحات الكبيرة إلى أهداف يومية واضحة وقابلة للتحقيق.",
      whoBenefits: "كل طالب يسعى لإنجازات يومية ملموسة دون تشتت.",
      steps: [
        "اكتب هدفاً يومياً واضحاً واختر المجال والتاريخ المستهدف.",
        "اضغط إضافة لتثبيته في قائمة اليوم.",
        "اضغط علامة الصح عند الإنجاز لكسب نقاط الخبرة.",
      ],
      options: [
        { label: "نموذج إضافة هدف", desc: "ينشئ هدفاً جديداً مرتبطاً بمجالك المختار." },
        { label: "زر الإتمام", desc: "يغلق الهدف ويضيف نقاط الخبرة تلقائياً." },
      ],
      limitations: "تُحفظ الأهداف وتتزامن مع قاعدة بيانات حسابك.",
    },
    ja: {
      title: "デイリー目標トラッカー",
      category: "ダッシュボード",
      whatItDoes: "6つの成長領域に紐づいた日々の達成目標を作成・完了・管理できます。",
      whyAndProblem: "漠然とした長期目標を、今日実行できる小さな勝利に落とし込みます。",
      whoBenefits: "毎日着実に前進したいすべての学生。",
      steps: [
        "目標名・領域・期限を入力して追加します。",
        "リストに表示された今日の目標を進めます。",
        "完了ボタンをクリックしてXPを獲得します。",
      ],
      options: [
        { label: "目標追加フォーム", desc: "領域タグ付きの目標を登録します。" },
        { label: "完了チェック", desc: "達成を記録してXPを付与します。" },
      ],
      limitations: "Firestoreのgoalsコレクションとリアルタイム同期します。",
    },
    fr: {
      title: "Suivi des Objectifs Quotidiens",
      category: "Tableau de bord",
      whatItDoes:
        "Permet de définir, valider et suivre vos objectifs quotidiens liés aux 6 domaines de croissance.",
      whyAndProblem: "Transforme les grands projets en victoires quotidiennes mesurables.",
      whoBenefits: "Étudiants souhaitant garder un cap clair chaque journée.",
      steps: [
        "Saisissez un objectif clair, choisissez son domaine et sa date.",
        "Ajoutez-le à votre liste du jour.",
        "Cochez-le une fois terminé pour recevoir de l'XP.",
      ],
      options: [
        { label: "Ajouter un objectif", desc: "Enregistre un objectif catégorisé." },
        { label: "Valider / Supprimer", desc: "Clôture l'objectif avec récompense XP." },
      ],
      limitations: "Synchronisé en direct avec Firestore.",
    },
    de: {
      title: "Tagesziele-Tracker",
      category: "Dashboard",
      whatItDoes:
        "Ermöglicht das Erstellen, Abhaken und Verwalten täglicher Ziele in den 6 Wachstumsbereichen.",
      whyAndProblem: "Macht große Vorhaben in kleinen, erreichbaren Tagesetappen greifbar.",
      whoBenefits: "Studierende, die täglich klare Fortschritte sehen wollen.",
      steps: [
        "Zieltitel eingeben, Lebensbereich und Zieldatum wählen.",
        "Mit Hinzufügen in die Tagesliste übernehmen.",
        "Bei Erledigung abhaken und XP erhalten.",
      ],
      options: [
        { label: "Ziel-Formular", desc: "Legt ein neues Ziel mit Bereichskennzeichnung an." },
        { label: "Abschließen", desc: "Markiert das Ziel als erledigt (+XP)." },
      ],
      limitations: "Direkt mit Ihrer Firestore-Sammlung synchronisiert.",
    },
    "zh-CN": {
      title: "每日目标追踪器",
      category: "仪表板",
      whatItDoes: "支持创建、查看和打卡关联六大成长领域的每日目标。",
      whyAndProblem: "把宏大计划拆解为当天可落地的明确小目标。",
      whoBenefits: "希望每天都能积累可见成就感的学生。",
      steps: [
        "输入简短明确的今日目标并选择对应领域与日期。",
        "点击添加将其固定到今日列表。",
        "完成后点击对勾打卡即可赢得 XP。",
      ],
      options: [
        { label: "新建目标", desc: "带领域标签保存至每日清单。" },
        { label: "完成打卡", desc: "记录达成状态并发放 XP 奖励。" },
      ],
      limitations: "与您账户下的 Firestore goals 集合实时同步。",
    },
    ko: {
      title: "일일 목표 트래커",
      category: "대시보드",
      whatItDoes: "6대 성장 영역과 연결된 하루 목표를 등록하고 달성 체크 및 삭제할 수 있습니다.",
      whyAndProblem: "막연한 계획을 오늘 끝낼 수 있는 구체적인 성취 단위로 쪼개어 줍니다.",
      whoBenefits: "매일 작은 성취를 쌓아가고 싶은 모든 학생.",
      steps: [
        "오늘 이룰 목표와 영역, 목표 날짜를 입력하세요.",
        "추가 버튼을 눌러 오늘 목록에 등록합니다.",
        "달성 시 완료 버튼을 눌러 XP를 획득하세요.",
      ],
      options: [
        { label: "목표 추가 폼", desc: "영역 배지가 포함된 목표를 생성합니다." },
        { label: "완료 토글", desc: "목표를 달성 상태로 바꾸고 보상을 지급합니다." },
      ],
      limitations: "Firestore goals 컬렉션과 실시간으로 동기화됩니다.",
    },
  },
  "tasks-widget": {
    en: {
      title: "Dashboard Quick Tasks Widget",
      category: "Dashboard",
      whatItDoes:
        "Displays active tasks right on your home dashboard with instant task creation, priority tagging, Life Area filtering, and completion toggles.",
      whyAndProblem: "Lets you add or complete urgent homework without leaving the dashboard.",
      whoBenefits: "Students checking daily priorities at a glance.",
      steps: [
        "Type a task name, select priority, area, or subject, and click Add.",
        "Click a task checkbox to mark it complete and gain XP.",
        "Click Clear filter if you filtered by a Life Area.",
      ],
      options: [
        { label: "Quick Task Input", desc: "Saves new tasks directly to your Productivity list." },
        { label: "Checkbox Toggle", desc: "Completes tasks and recalculates domain stats." },
      ],
      limitations:
        "For Eisenhower Matrix, subtask checklists, and recurrence, open the full Productivity & Tasks module.",
    },
    ar: {
      title: "أداة المهام السريعة على لوحة التحكم",
      category: "لوحة التحكم",
      whatItDoes:
        "تعرض مهامك النشطة على الشاشة الرئيسية مع إضافة فورية، واختيار الأولوية، والتصفية حسب المجال.",
      whyAndProblem: "تمكّنك من تسجيل وإنجاز الواجبات العاجلة دون مغادرة الصفحة الرئيسية.",
      whoBenefits: "الطلاب الذين يتابعون أولويات يومهم بسرعة.",
      steps: [
        "اكتب اسم المهمة وحدد الأولوية والمجال ثم اضغط إضافة.",
        "اضغط مربع التحديد لإكمال المهمة وكسب الخبرة.",
        "انتقل لقسم المهام الكامل عند الحاجة لمصفوفة الأولويات.",
      ],
      options: [
        { label: "إضافة مهمة سريعة", desc: "تحفظ المهمة فوراً في قائمة الإنتاجية." },
        { label: "تبديل الإكمال", desc: "يحدّث التقدم ونقاط الخبرة تلقائياً." },
      ],
      limitations: "لتقسيم المهام الفرعية ومصفوفة الأولويات افتح قسم المهام والإنتاجية الكامل.",
    },
    ja: {
      title: "ダッシュボード・クイックタスク",
      category: "ダッシュボード",
      whatItDoes:
        "ホーム画面上でタスクの素早い追加・優先度設定・領域別表示・完了チェックが行えます。",
      whyAndProblem: "急な宿題を思い出した際、専用画面へ移動せず数秒で登録できます。",
      whoBenefits: "その日の最優先課題を素早く確認したい学生。",
      steps: [
        "タスク名と優先度・領域を入力して追加します。",
        "完了したらチェックボックスをクリックしてXPを得ます。",
      ],
      options: [
        { label: "クイック追加", desc: "生産性タスク一覧へ即時保存します。" },
        { label: "完了チェック", desc: "各領域スコアを更新します。" },
      ],
      limitations: "サブタスクやマトリックス表示は「タスク・生産性」ページでご利用ください。",
    },
    fr: {
      title: "Widget Tâches Rapides",
      category: "Tableau de bord",
      whatItDoes:
        "Affiche vos tâches actives à l'accueil avec ajout rapide, priorité, filtrage par domaine et validation.",
      whyAndProblem: "Permet de noter un devoir urgent sans quitter la page principale.",
      whoBenefits: "Étudiants consultant leurs priorités du jour d'un coup d'œil.",
      steps: [
        "Saisissez un titre, sélectionnez priorité/domaine puis ajoutez.",
        "Cochez une tâche terminée pour gagner de l'XP.",
      ],
      options: [
        { label: "Ajout rapide", desc: "Synchronise la tâche dans le module Productivité." },
        { label: "Case à cocher", desc: "Met à jour vos statistiques de domaine." },
      ],
      limitations:
        "Pour la matrice d'Eisenhower et les sous-tâches, ouvrez le module Tâches complet.",
    },
    de: {
      title: "Dashboard-Schnellaufgaben",
      category: "Dashboard",
      whatItDoes:
        "Zeigt aktive Aufgaben direkt auf der Startseite mit schneller Eingabe, Prioritäten und Bereichsfilter.",
      whyAndProblem:
        "Ermöglicht das sofortige Notieren dringender Hausaufgaben ohne Seitenwechsel.",
      whoBenefits: "Alle Lernenden für den schnellen Tagesüberblick.",
      steps: [
        "Aufgabentitel eingeben, Priorität und Bereich wählen und hinzufügen.",
        "Aufgabe abhaken, um XP zu sammeln.",
      ],
      options: [
        { label: "Schnelleingabe", desc: "Speichert direkt in Ihrer Aufgabenliste." },
        { label: "Erledigt-Haken", desc: "Aktualisiert Ihren Bereichsfortschritt." },
      ],
      limitations:
        "Unteraufgaben und Eisenhower-Matrix befinden sich im vollständigen Aufgabenmodul.",
    },
    "zh-CN": {
      title: "首页快速待办组件",
      category: "仪表板",
      whatItDoes:
        "在仪表板首页直接展示活跃任务，支持快速新增、设定优先级、按成长领域筛选与勾选完成。",
      whyAndProblem: "想起临时作业或待办时无需跳转页面即可秒速记下。",
      whoBenefits: "需要随时查看和清理当日优先任务的学生。",
      steps: ["输入任务名称并选择优先级、领域或科目后点击添加。", "完成后直接勾选复选框获得 XP。"],
      options: [
        { label: "快速录入框", desc: "自动同步到完整版任务管理器。" },
        { label: "完成勾选", desc: "触发领域积分与等级增长。" },
      ],
      limitations: "四象限矩阵与子任务拆解功能请前往完整的「任务与效率」模块。",
    },
    ko: {
      title: "대시보드 빠른 할 일 위젯",
      category: "대시보드",
      whatItDoes:
        "홈 화면에서 즉시 할 일을 추가하고 우선순위 지정, 영역별 필터링 및 완료 체크를 할 수 있습니다.",
      whyAndProblem: "갑자기 떠오른 과제를 별도 페이지 이동 없이 빠르게 기록할 수 있습니다.",
      whoBenefits: "오늘의 핵심 과제를 한눈에 관리하려는 학생.",
      steps: [
        "할 일 제목, 우선순위, 영역을 고르고 추가를 누르세요.",
        "완료 시 체크박스를 눌러 XP를 받습니다.",
      ],
      options: [
        { label: "빠른 입력", desc: "전체 할 일 목록에 즉시 저장됩니다." },
        { label: "완료 체크", desc: "성장 영역 점수가 즉시 반영됩니다." },
      ],
      limitations:
        "하위 체크리스트와 아이젠하워 매트릭스는 전체 '할 일/생산성' 페이지에서 지원됩니다.",
    },
  },
  "smart-recommendations": {
    en: {
      title: "Smart Study Recommendations",
      category: "Intelligence",
      whatItDoes:
        "Analyzes your overdue tasks, due-soon items, due SM-2 flashcards, weak subjects, and active goals to suggest the highest-impact next action.",
      whyAndProblem:
        "Solves decision paralysis when you sit down to study and do not know what deserves attention first.",
      whoBenefits: "Students balancing multiple subjects and approaching deadlines.",
      steps: [
        "Check the prioritized cards showing overdue work, due flashcards, or weak areas.",
        "Click the recommended action link to jump straight into that task, review queue, or quiz.",
      ],
      options: [
        {
          label: "Direct Action Link",
          desc: "Routes you immediately to the overdue task, flashcard deck, or weak topic.",
        },
      ],
      limitations:
        "Recommendations compute automatically from your live Firestore tasks, quiz attempts, and flashcards.",
    },
    ar: {
      title: "التوصيات الدراسية الذكية",
      category: "الذكاء التعليمي",
      whatItDoes:
        "يحلل مهامك المتأخرة والمواعيد القريبة وبطاقات المراجعة المستحقة والمواد الضعيفة ليقترح أولوية المذاكرة التالية.",
      whyAndProblem: "يحل مشكلة الحيرة عند بدء المذاكرة وتحديد المادة أو الواجب الأهم الآن.",
      whoBenefits: "الطلاب الذين يدرسون عدة مواد بمواعيد تسليم متقاربة.",
      steps: [
        "اطّلع على البطاقات المرتبة حسب الأولوية والاستعجال.",
        "اضغط رابط الإجراء للانتقال مباشرة إلى البطاقات أو الاختبار أو المهمة.",
      ],
      options: [
        {
          label: "رابط التنفيذ المباشر",
          desc: "يأخذك فوراً للمهمة المتأخرة أو مجموعة البطاقات المستحقة.",
        },
      ],
      limitations: "تُبنى التوصيات آلياً على بياناتك الحقيقية في المهام والبطاقات والاختبارات.",
    },
    ja: {
      title: "スマート学習レコメンド",
      category: "学習インテリジェンス",
      whatItDoes:
        "期限超過タスク、期限間近の課題、復習時期の単語カード、苦手科目を分析し、今すぐやるべき最適アクションを提案します。",
      whyAndProblem:
        "「何から手をつけるべきか迷う」時間をなくし、成績向上に直結する行動を促します。",
      whoBenefits: "複数科目や締め切りを同時に抱える学生。",
      steps: [
        "優先度順に表示された提案カードを確認します。",
        "アクションボタンをクリックして該当の復習やタスクへ直接移動します。",
      ],
      options: [
        { label: "ワンクリック実行", desc: "期限切れ課題や要復習カード画面へ直接遷移します。" },
      ],
      limitations: "Firestore上の実際のタスク・フラッシュカード・テスト結果から算出されます。",
    },
    fr: {
      title: "Recommandations Intelligentes d'Étude",
      category: "Intelligence",
      whatItDoes:
        "Analyse tâches en retard, échéances proches, cartes mémoire dues et matières faibles pour suggérer la priorité immédiate.",
      whyAndProblem: "Élimine l'hésitation au démarrage d'une session de révision.",
      whoBenefits: "Étudiants gérant plusieurs matières et examens simultanés.",
      steps: [
        "Consultez les cartes classées par urgence.",
        "Cliquez sur le lien d'action pour ouvrir directement la révision ou tâche ciblée.",
      ],
      options: [
        {
          label: "Lien direct",
          desc: "Vous dirige vers l'élément exact nécessitant votre attention.",
        },
      ],
      limitations: "Calculé en temps réel à partir de vos tâches, quiz et cartes enregistrés.",
    },
    de: {
      title: "Smarte Lernempfehlungen",
      category: "Lernintelligenz",
      whatItDoes:
        "Analysiert überfällige Aufgaben, fällige Karteikarten, schwache Fächer und aktive Ziele für den nächsten sinnvollsten Schritt.",
      whyAndProblem: "Beendet Planlosigkeit beim Lernstart und verhindert vergessene Fristen.",
      whoBenefits: "Lernende mit vielen Fächern und knappen Terminen.",
      steps: [
        "Prüfen Sie die nach Dringlichkeit sortierten Hinweise.",
        "Klicken Sie auf die Empfehlung, um direkt zur passenden Übung zu springen.",
      ],
      options: [
        {
          label: "Aktions-Link",
          desc: "Öffnet direkt fällige Karteikarten oder dringende Aufgaben.",
        },
      ],
      limitations:
        "Basiert vollständig auf Ihren aktuellen Firestore-Aufgaben und Lernergebnissen.",
    },
    "zh-CN": {
      title: "智能学习优先级推荐",
      category: "学习智能",
      whatItDoes:
        "综合分析您的逾期作业、临近截止任务、到期 SM-2 闪卡及薄弱学科，给出当下最值得投入的下一步建议。",
      whyAndProblem: "消除坐下学习却不知先做什么的选择困难。",
      whoBenefits: "同时兼顾多门课程与截止日期的同学。",
      steps: ["查看按紧急度排列的推荐提示卡片。", "点击卡片上的行动链接直达对应待办或复习队列。"],
      options: [{ label: "直达行动入口", desc: "一键跳转到到期闪卡、薄弱科目测验或逾期任务。" }],
      limitations: "完全根据您真实保存的任务、测验和闪卡数据实时计算。",
    },
    ko: {
      title: "스마트 학습 우선순위 추천",
      category: "학습 인텔리전스",
      whatItDoes:
        "지연된 과제, 마감 임박 항목, 복습 주기가 도래한 카드, 취약 과목을 분석해 지금 가장 먼저 해야 할 행동을 제안합니다.",
      whyAndProblem: "공부를 시작할 때 무엇부터 할지 고민하다 시간을 허비하는 문제를 줄입니다.",
      whoBenefits: "여러 과목과 마감 일정을 동시에 관리하는 학생.",
      steps: [
        "긴급도 순으로 정리된 추천 카드를 확인하세요.",
        "바로가기 버튼을 눌러 해당 복습 큐나 할 일로 즉시 이동합니다.",
      ],
      options: [
        { label: "실행 바로가기", desc: "복습 카드나 밀린 과제 화면으로 바로 연결됩니다." },
      ],
      limitations:
        "Firestore에 저장된 실제 과제, 퀴즈 점수, 플래시카드 데이터를 분석해 생성됩니다.",
    },
  },
  "learning-recovery": {
    en: {
      title: "Learning Recovery & Catch-Up Planner",
      category: "Recovery",
      whatItDoes:
        "Turns missed study days, overdue work, or exam pressure into a calm, realistic catch-up recovery plan you can execute step by step.",
      whyAndProblem:
        "Helps students recover safely after illness, busy weeks, or missed deadlines without guilt or panic.",
      whoBenefits: "Any student catching up after falling behind on coursework.",
      steps: [
        "Inspect the detected backlog items (overdue tasks, open mistakes, pending cards).",
        "Click to convert recovery steps into prioritized today tasks or spaced reviews.",
      ],
      options: [
        {
          label: "Generate Recovery Action",
          desc: "Converts backlog pressure into manageable 1-step catch-up actions.",
        },
      ],
      limitations:
        "Suggestions adapt directly to overdue tasks and open mistakes currently stored in your workspace.",
    },
    ar: {
      title: "مخطط التعافي الدراسي واستدراك الفائت",
      category: "التعافي الدراسي",
      whatItDoes: "يحوّل المهام المتراكمة والأيام الفائتة إلى خطة استدراك هادئة وواقعية خطوة بخطوة.",
      whyAndProblem:
        "يساعد الطالب على العودة للمسار بعد الغياب أو ضغط الاختبارات دون قلق أو إرباك.",
      whoBenefits: "الطلاب المتأخرون عن بعض الدروس أو الواجبات ويرغبون بخطة إنقاذ عملية.",
      steps: [
        "راجع العناصر المتأخرة المكتشفة (واجبات أو أخطاء مفتوحة أو بطاقات).",
        "حوّل خطوات الاستدراك إلى مهام صغيرة مرتبة لليوم.",
      ],
      options: [
        { label: "إنشاء خطوة استدراك", desc: "يقسّم الضغط المتراكم لمهام يومية قابلة للإنجاز." },
      ],
      limitations: "يعتمد التخطيط على حجم المهام المتأخرة والأخطاء المسجلة في حسابك.",
    },
    ja: {
      title: "学習リカバリー（遅れ挽回）プランナー",
      category: "リカバリー",
      whatItDoes: "休んだ日や溜まった課題を、無理のない段階的なキャッチアップ計画に整理します。",
      whyAndProblem: "体調不良や繁忙期後に「何から取り戻せばいいか分からない」不安を和らげます。",
      whoBenefits: "課題や復習の遅れを落ち着いて取り戻したい学生。",
      steps: [
        "検出された未完了タスクや未復習ミスを確認します。",
        "復旧ステップを今日の小さなタスクに変換して実行します。",
      ],
      options: [
        { label: "リカバリー計画生成", desc: "負荷を分散した実行可能な手順を提示します。" },
      ],
      limitations: "登録されている遅延課題・誤答データに基づいて提案を作成します。",
    },
    fr: {
      title: "Planificateur de Rattrapage d'Étude",
      category: "Rattrapage",
      whatItDoes:
        "Transforme le retard accumulé ou les absences en un plan de rattrapage réaliste étape par étape.",
      whyAndProblem: "Évite la panique après une période d'absence ou de surcharge scolaire.",
      whoBenefits: "Tout étudiant devant rattraper des cours ou des devoirs en retard.",
      steps: [
        "Examinez les retards détectés (tâches dépassées, erreurs ouvertes, cartes en attente).",
        "Transformez les étapes proposées en petites actions prioritaires pour aujourd'hui.",
      ],
      options: [
        {
          label: "Action de rattrapage",
          desc: "Découpe le retard en étapes gérables sans surcharge.",
        },
      ],
      limitations: "S'adapte uniquement aux tâches et erreurs déjà enregistrées dans votre espace.",
    },
    de: {
      title: "Lern-Erholungs- & Aufholplaner",
      category: "Aufholen",
      whatItDoes:
        "Wandelt verpasste Lerntage oder überfällige Aufgaben in einen ruhigen, machbaren Aufholplan um.",
      whyAndProblem: "Nimmt nach Krankheit oder Stressphasen die Überforderung heraus.",
      whoBenefits: "Lernende, die Stoff oder Abgaben strukturiert aufholen möchten.",
      steps: [
        "Prüfen Sie den angezeigten Rückstand an Aufgaben und Fehlern.",
        "Wandeln Sie Aufholschritte in überschaubare Tagesaufgaben um.",
      ],
      options: [
        { label: "Aufholschritt anlegen", desc: "Zerlegt Rückstände in kleine Tagesaktionen." },
      ],
      limitations: "Orientiert sich direkt an Ihren gespeicherten Aufgaben und offenen Fehlern.",
    },
    "zh-CN": {
      title: "学业恢复与补进度规划器",
      category: "进度恢复",
      whatItDoes: "将漏掉的学习日、逾期任务与积压错题整理为循序渐进、心理压力小的补救行动计划。",
      whyAndProblem: "帮助因生病或忙碌而落后的学生平稳回到节奏，避免因焦虑彻底放弃。",
      whoBenefits: "需要追赶课程进度或清理积压作业的同学。",
      steps: [
        "查看系统识别出的积压项（逾期任务、未掌握错题、待复习卡片）。",
        "将恢复建议一键拆分为今日小步任务依次推进。",
      ],
      options: [{ label: "生成恢复行动", desc: "把大块压力分解成今日可完成的一步。" }],
      limitations: "计划内容完全基于工作区当前的逾期与错题数据自动调整。",
    },
    ko: {
      title: "학습 회복 및 진도 보충 플래너",
      category: "학습 회복",
      whatItDoes:
        "밀린 과제, 놓친 학습일, 오답 부담을 차분하고 현실적인 단계별 보충 계획으로 전환해 줍니다.",
      whyAndProblem: "결석이나 바쁜 주간 이후 막막함과 죄책감 없이 학습 리듬을 되찾도록 돕습니다.",
      whoBenefits: "진도가 밀려 차근차근 따라잡고 싶은 모든 학생.",
      steps: [
        "감지된 지연 과제와 미완료 복습 항목을 확인하세요.",
        "제안된 회복 단계를 오늘의 작은 할 일로 전환해 하나씩 해결합니다.",
      ],
      options: [
        { label: "보충 단계 생성", desc: "밀린 분량을 감당 가능한 일일 계획으로 쪼개 줍니다." },
      ],
      limitations: "현재 저장된 지연 과제 및 오답 노트 항목에 맞춰 작동합니다.",
    },
  },
  "settings-appearance": {
    en: {
      title: "Appearance, Colors & Density Settings",
      category: "Settings",
      whatItDoes:
        "Controls Dark/Light/System brightness, Accent Colors (5 presets + Custom HEX with live WCAG contrast ratio), UI Density, Corner Radius, Visual Effects reduction, and Reading Width.",
      whyAndProblem:
        "Gives students full visual comfort customization while checking WCAG contrast safety in real time.",
      whoBenefits: "All students customizing screen readability, contrast, and color accents.",
      steps: [
        "Select Dark, Light, or System color mode at the top.",
        "Pick an accent preset or enter a valid 6-digit Custom HEX color and inspect the contrast badge.",
        "Adjust UI Density, Corner Style, Reduce Visual Effects, and Reading Layout width.",
      ],
      options: [
        {
          label: "Theme Mode (Dark/Light/System)",
          desc: "Updates root theme class and syncs to Firestore.",
        },
        {
          label: "Accent Preset & Custom HEX",
          desc: "Sets primary highlight color and calculates live WCAG contrast ratio.",
        },
      ],
      limitations:
        "Persisted to user_settings in Firestore when online, with local device fallback offline.",
    },
    ar: {
      title: "إعدادات المظهر والألوان والكثافة",
      category: "الإعدادات",
      whatItDoes:
        "يتحكم بوضع الإضاءة (داكن/فاتح/النظام)، وألوان التمييز مع قياس التباين الفوري، وكثافة الواجهة، واستدارة الحواف، وعرض القراءة.",
      whyAndProblem: "يضمن راحة بصرية مخصصة مع التحقق الفوري من جودة التباين للقراءة السليمة.",
      whoBenefits: "جميع الطلاب لضبط المظهر المريح لأعينهم.",
      steps: [
        "اختر وضع الإضاءة (داكن أو فاتح أو مطابق للنظام).",
        "اختر لون تمييز جاهزاً أو أدخل رمز HEX مخصصاً وراقب نسبة التباين.",
        "عدّل كثافة العرض واستدارة الزوايا وتقليل المؤثرات عند الحاجة.",
      ],
      options: [
        { label: "وضع الإضاءة", desc: "يغيّر السمة فوراً ويحفظها لحسابك." },
        { label: "لون التمييز المخصص", desc: "يطبّق اللون مع حساب نسبة التباين اللوني WCAG." },
      ],
      limitations: "يُحفظ في قاعدة البيانات عند الاتصال وبشكل محلي مؤقتاً عند الانقطاع.",
    },
    ja: {
      title: "外観・アクセントカラー・表示密度",
      category: "設定",
      whatItDoes:
        "ダーク/ライト/システム切替、アクセントカラー（カスタムHEX＋コントラスト比計算）、表示密度、角丸、エフェクト軽減、閲覧幅を調整します。",
      whyAndProblem: "WCAGコントラスト比を確認しながら自分好みの見やすい配色へ整えられます。",
      whoBenefits: "視認性と快適さを最適化したいすべての学生。",
      steps: [
        "テーマモード（ダーク/ライト/システム）を選択します。",
        "アクセントカラーまたはカスタムHEXコードを入力しコントラスト比を確認します。",
        "表示密度・角の丸み・読みやすさ幅を調整します。",
      ],
      options: [
        { label: "カラーモード", desc: "画面全体の明暗を即時適用して同期します。" },
        { label: "カスタムHEX", desc: "任意のカラーとコントラスト比（:1）を計算表示します。" },
      ],
      limitations: "オンライン時はFirestoreに保存、オフライン時はローカルに保存されます。",
    },
    fr: {
      title: "Paramètres d'Apparence, Couleurs et Densité",
      category: "Paramètres",
      whatItDoes:
        "Règle le mode Sombre/Clair/Système, les couleurs d'accent (préréglages + HEX personnalisé avec ratio WCAG), la densité, les coins et la largeur de lecture.",
      whyAndProblem:
        "Assure un confort visuel optimal tout en vérifiant l'accessibilité du contraste.",
      whoBenefits: "Tous les utilisateurs ajustant la lisibilité et l'esthétique.",
      steps: [
        "Sélectionnez Sombre, Clair ou Système.",
        "Choisissez une couleur d'accent ou saisissez un code HEX personnalisé.",
        "Ajustez la densité, l'arrondi des cartes et la largeur de colonne.",
      ],
      options: [
        { label: "Mode de thème", desc: "Met à jour l'ensemble de l'interface et sauvegarde." },
        { label: "HEX personnalisé", desc: "Affiche le ratio de contraste en temps réel." },
      ],
      limitations: "Sauvegardé dans Firestore en ligne et localement hors ligne.",
    },
    de: {
      title: "Darstellung, Akzentfarben & Dichte",
      category: "Einstellungen",
      whatItDoes:
        "Steuert Dunkel/Hell/System, Akzentfarben (Presets + eigenes HEX mit Kontrastwert), Dichte, Eckenradius, Effektreduzierung und Lesebreite.",
      whyAndProblem:
        "Ermöglicht individuelle Augenfreundlichkeit bei gleichzeitiger WCAG-Kontrastkontrolle.",
      whoBenefits: "Alle Lernenden zur optimalen Anpassung der Oberfläche.",
      steps: [
        "Wählen Sie Dunkel, Hell oder System.",
        "Bestimmen Sie eine Akzentfarbe oder einen HEX-Wert samt Kontrastprüfung.",
        "Passen Sie Dichte, Eckenstil und Leselayout an.",
      ],
      options: [
        { label: "Farbmodus", desc: "Wechselt sofort das globale Helligkeitsschema." },
        { label: "Eigener HEX-Wert", desc: "Berechnet automatisch das Kontrastverhältnis." },
      ],
      limitations: "Wird in Firestore gespeichert und bei Bedarf lokal zwischengespeichert.",
    },
    "zh-CN": {
      title: "外观、主题色与界面密度设置",
      category: "系统设置",
      whatItDoes:
        "集中管理深色/浅色/跟随系统模式、主强调色（5套预设与自定义 HEX 实时对比度校验）、界面密度、圆角风格、减弱动效及阅读宽度。",
      whyAndProblem: "提供灵活个性化配色的同时实时监控 WCAG 对比度安全。",
      whoBenefits: "所有希望定制舒适界面外观与护眼对比度的学生。",
      steps: [
        "在顶部选择深色、浅色或跟随系统。",
        "点选主色预设或输入六位 HEX 色值并查看对比度读数。",
        "根据习惯调整布局密度、圆角、视觉特效与阅读栏宽度。",
      ],
      options: [
        { label: "明暗模式开关", desc: "即时改变整体明暗主题并写入账户。" },
        { label: "自定义 HEX 强调色", desc: "自动计算与背景的对比度（如 4.5:1）。" },
      ],
      limitations: "在线时保存至 Firestore 的 user_settings，离线时暂存本地。",
    },
    ko: {
      title: "외관, 색상 및 밀도 설정",
      category: "설정",
      whatItDoes:
        "다크/라이트/시스템 모드, 강조 색상(5가지 프리셋 및 실시간 WCAG 명암비 검사가 포함된 커스텀 HEX), UI 밀도, 모서리 둥글기, 읽기 너비를 설정합니다.",
      whyAndProblem: "시각적 취향과 가독성·명암비 기준을 동시에 만족할 수 있도록 돕습니다.",
      whoBenefits: "화면 대비와 색감을 자신에게 맞게 조절하려는 모든 사용자.",
      steps: [
        "다크, 라이트 또는 시스템 모드를 고르세요.",
        "기본 강조 색상을 누르거나 HEX 코드를 입력해 명암비를 확인합니다.",
        "밀도, 모서리 스타일, 시각 효과 줄이기 및 읽기 열 너비를 조정하세요.",
      ],
      options: [
        { label: "테마 모드", desc: "전체 밝기 모드를 즉시 바꾸고 계정에 저장합니다." },
        { label: "커스텀 HEX", desc: "실시간 명암비(:1)를 계산하여 보여줍니다." },
      ],
      limitations: "온라인 시 Firestore에 저장되며 오프라인 시 기기 로컬에 안전하게 보관됩니다.",
    },
  },
  "settings-themes": {
    en: {
      title: "10-Preset Design Studio, Appearance & 10 Workspace Layouts",
      category: "Settings",
      whatItDoes:
        "Centralizes all visual personalization in Settings: Dark/Light/System mode and custom accents alongside 10 full-platform Design Presets (transforming colors, EN/AR typography, cards, buttons, inputs, and layout shell), 10 Navigation Shell layout modes, Sidebar style, Surface styling (Card, Border, Shadow, Background Grid/Ambient/Solid), and Dashboard widget ordering.",
      whyAndProblem:
        "Keeps navigation menus, headers, and dashboard cards uncluttered while giving cohesive full-platform design transformation inside Settings.",
      whoBenefits:
        "Students customizing visual identity, Arabic & English typography, sidebar navigation structure, and dashboard surfaces.",
      steps: [
        "Use Appearance for general Dark/Light mode and accent color, or choose a complete Design Preset card to preview it live.",
        "Click Open 10 Design Presets & Layouts Studio to inspect all 10 curated identities and 10 navigation shell layouts.",
        "Expand Fine Surface & Widget Controls to configure Background style, Shadows, Borders, and Widget order.",
      ],
      options: [
        {
          label: "Preview / Apply Design Preset",
          desc: "Tests any of the 10 full-platform design identities safely before committing to your account.",
        },
        {
          label: "10-Preset Design & Layout Studio",
          desc: "Opens categorized collections (Minimal, Futuristic, Professional, Colorful, Nature) paired with 10 layout shells.",
        },
        {
          label: "Fine Surface Controls",
          desc: "Adjusts Card Style, Borders, Shadows, Animation intensity, and Ambient/Grid/Solid backgrounds.",
        },
      ],
      limitations:
        "Navigating away from Settings automatically cancels an uncommitted Live Preview so unsaved drafts never stick.",
    },
    ar: {
      title: "استوديو التصاميم العشرة والمظهر و١٠ تخطيطات للمساحة",
      category: "الإعدادات",
      whatItDoes:
        "يجمع جميع أدوات التخصيص البصري في الإعدادات: الوضع الداكن/الفاتح ولون التمييز إلى جانب ١٠ تصاميم شاملة تغيّر الألوان والخطوط والبطاقات والأزرار والحقول، و١٠ تخطيطات لهيكل التنقل وأنماط الشريط الجانبي والخلفيات والظلال وترتيب البطاقات.",
      whyAndProblem:
        "يوحّد جميع أدوات التصاميم والمظهر في الإعدادات بدلاً من تشتيتها في قوائم التنقل ولوحة التحكم.",
      whoBenefits: "الطلاب الراغبون بتصميم بيئة تعلم متكاملة الشكل والخط والتخطيط.",
      steps: [
        "اضغط معاينة على أي تصميم لتجربته فوراً على المنصة بالكامل قبل الحفظ، ثم اعتماد أو إلغاء.",
        "افتح استوديو التصاميم العشرة لاختيار هويات بصرية وتخطيطات هيكلية متكاملة.",
        "وسّع التحكم الدقيق بالأسطح لضبط الخلفية والظلال والبطاقات.",
      ],
      options: [
        {
          label: "معاينة / تطبيق التصميم",
          desc: "يجرب التصميم حياً دون الكتابة فوق إعداداتك إلا بعد التأكيد.",
        },
        { label: "استوديو التصاميم العشرة", desc: "يعرض ١٠ تصاميم مصنفة و١٠ أوضاع تخطيط للتنقل." },
      ],
      limitations: "تُلغى المعاينة الحية غير المحفوظة تلقائياً عند مغادرة صفحة الإعدادات.",
    },
    ja: {
      title: "10デザインプリセット・外観・10ワークスペース配置",
      category: "設定",
      whatItDoes:
        "設定画面にすべての外観管理を集約し、10種類のフルプラットフォームデザインプリセット（配色・フォント・カード・ボタン・入力欄・シェル）、10種類のナビレイアウト、背景・影・ウィジェット配置を管理します。",
      whyAndProblem:
        "ナビゲーションに散らばっていた外観操作を設定画面に集約し、重複なく整理します。",
      whoBenefits: "学習空間の見た目とレイアウト構造をトータルで設計したい学生。",
      steps: [
        "デザインカードの「Preview」でライブ試用し、「Apply」で確定またはキャンセルします。",
        "「Design & Layout Studio」から10種類の統合プリセットと10種類のレイアウトモードを選択します。",
        "詳細パネルで背景（Ambient/Solid/Grid）・影・ウィジェット順を調整します。",
      ],
      options: [
        { label: "ライブプレビュー＆適用", desc: "保存前に画面全体で即時確認できます。" },
        {
          label: "10デザインスタジオ",
          desc: "10種類の完成されたビジュアルアイデンティティと10種のレイアウトを提供します。",
        },
      ],
      limitations: "未確定のライブプレビューは設定ページを離れると自動的に元へ戻ります。",
    },
    fr: {
      title: "Studio 10 Designs, Apparence & 10 Dispositions",
      category: "Paramètres",
      whatItDoes:
        "Centralise dans les Paramètres les 10 préréglages de design complets (couleurs, typographie EN/AR, surfaces, boutons, champs), les 10 dispositions de navigation, les styles de fond et l'ordre des widgets.",
      whyAndProblem:
        "Centralise toute la personnalisation visuelle dans les Paramètres pour garder la navigation épurée.",
      whoBenefits: "Étudiants personnalisant style graphique, menu latéral et surfaces des cartes.",
      steps: [
        "Cliquez sur Aperçu sur une carte design pour tester en direct puis Appliquer.",
        "Ouvrez le Studio 10 Designs pour parcourir les 10 identités visuelles et 10 dispositions.",
        "Dépliez les contrôles avancés pour régler l'arrière-plan, les ombres et les widgets.",
      ],
      options: [
        {
          label: "Aperçu en direct",
          desc: "Permet d'essayer un design sans l'enregistrer tant que non confirmé.",
        },
        {
          label: "Studio 10 Designs",
          desc: "Regroupe 10 identités visuelles complètes et 10 modes de mise en page.",
        },
      ],
      limitations: "Quitter les Paramètres annule automatiquement un aperçu non confirmé.",
    },
    de: {
      title: "10-Design-Studio, Darstellung & 10 Layouts",
      category: "Einstellungen",
      whatItDoes:
        "Bündelt in den Einstellungen 10 vollständige Design-Presets (Farben, EN/AR-Schriften, Oberflächen, Steuerelemente), 10 Navigationslayouts, Hintergrundstile (Ambient/Solid/Grid), Schatten und Widget-Sortierung.",
      whyAndProblem:
        "Verlegt alle Design-Steuerelemente sauber aus der Navigation in die Einstellungen.",
      whoBenefits:
        "Studierende, die Optik, Seitenleiste und Karten-Oberflächen zentral verwalten möchten.",
      steps: [
        "Testen Sie ein Design per Vorschau-Button und bestätigen oder verwerfen Sie es in der Leiste.",
        "Öffnen Sie das 10-Design-Studio für alle 10 Presets und 10 Shell-Layouts.",
        "Öffnen Sie erweiterte Oberflächen für Hintergründe, Schatten und Dashboard-Widgets.",
      ],
      options: [
        {
          label: "Live-Vorschau",
          desc: "Testet Designs sofort ohne versehentliches Überschreiben.",
        },
        {
          label: "10-Design-Studio",
          desc: "Vollständige Preset-Galerie inklusive 10 Layout-Modi.",
        },
      ],
      limitations:
        "Eine nicht bestätigte Vorschau wird beim Verlassen der Einstellungen automatisch zurückgesetzt.",
    },
    "zh-CN": {
      title: "10 套全局设计工作室、外观与 10 种布局",
      category: "系统设置",
      whatItDoes:
        "在设置中心统一管理 10 套全局设计预设（全面切换配色、字体、卡片、按钮、输入框与布局框架）、10 种导航外壳布局、背景样式（氛围光/纯色/网格）、阴影与卡片顺序。",
      whyAndProblem: "将分散的样式开关集中到设置中心，消除重复控制与菜单干扰。",
      whoBenefits: "希望深度定制整站视觉风格与工作区布局的学生。",
      steps: [
        "点击任意设计预设的「预览」实时试看效果，满意后在顶部确认条点击「应用」。",
        "点击「打开设计与布局工作室」浏览 10 套全平台设计预设与 10 种布局。",
        "展开高级表面控制以调整背景纹理、边框、阴影强度和首页模块顺序。",
      ],
      options: [
        { label: "实时预览 / 应用", desc: "先试用再保存，随时一键取消还原。" },
        { label: "10 套设计工作室弹窗", desc: "一站切换全套设计风格与 10 种导航外壳模式。" },
      ],
      limitations: "未点击应用的实时预览在离开设置页面时会自动撤销，避免误修改。",
    },
    ko: {
      title: "10가지 디자인 스튜디오, 화면 및 10가지 레이아웃",
      category: "설정",
      whatItDoes:
        "설정 페이지에서 전체 색상·서체·카드·버튼·입력창을 전환하는 10가지 디자인 프리셋, 10가지 내비게이션 레이아웃, 배경/그림자/테두리 스타일 및 위젯 순서를 통합 관리합니다.",
      whyAndProblem:
        "내비게이션 메뉴에 흩어져 있던 디자인 설정을 설정 페이지 한 곳으로 정리해 중복을 제거했습니다.",
      whoBenefits: "화면 스타일과 사이드바 구조, 배경 질감을 한꺼번에 꾸미고 싶은 학생.",
      steps: [
        "각 디자인 카드의 '미리보기'로 먼저 체험한 뒤 상단 바에서 '적용' 또는 '취소'를 누르세요.",
        "'디자인 스튜디오'를 열어 10개 프리셋과 10개 레이아웃 모드를 선택할 수 있습니다.",
        "세부 표면 설정을 펼쳐 배경 스타일(Ambient/Solid/Grid), 그림자, 위젯 순서를 조정하세요.",
      ],
      options: [
        {
          label: "실시간 미리보기 및 적용",
          desc: "저장 전 전체 화면에 임시 적용해 안전하게 비교할 수 있습니다.",
        },
        {
          label: "10가지 디자인 스튜디오",
          desc: "10가지 통합 디자인과 10가지 레이아웃 셸을 제공합니다.",
        },
      ],
      limitations:
        "적용하지 않은 미리보기 상태는 설정 화면을 벗어나면 자동으로 원래대로 복원됩니다.",
    },
  },
  "settings-accessibility": {
    en: {
      title: "Accessibility & Typography Studio",
      category: "Settings",
      whatItDoes:
        "Configures readability presets, font families (including Arabic, CJK, Serif, and Dyslexia-friendly Atkinson Hyperlegible), text/heading scaling (90–150%), High Contrast mode, Reduce Motion, Read Aloud (TTS), Voice Dictation, and an interactive Accessibility Comfort Assistant.",
      whyAndProblem:
        "Removes reading barriers, visual fatigue, and motor/focus friction across all 7 languages.",
      whoBenefits:
        "Students with dyslexia, low vision, ADHD, auditory preferences, or late-night study fatigue.",
      steps: [
        "Pick a Readability Preset (Standard, Comfortable, Large, Compact, or Accessibility) or adjust sliders individually.",
        "Toggle High Contrast, Dyslexia Font, Reduce Motion, Focus Ring, or Read Aloud as needed.",
        "Launch the Comfort Assistant wizard if you want tailored recommendations based on your comfort needs.",
      ],
      options: [
        {
          label: "Live Specimen Card",
          desc: "Previews exact body text, XP badges, and RTL/CJK rendering before scrolling.",
        },
        {
          label: "Read Aloud & Voice Input",
          desc: "Uses your browser Web Speech API for page narration and hands-free input.",
        },
      ],
      limitations:
        "Web Speech Read Aloud and Voice Dictation depend on browser support and installed OS voice packs.",
    },
    ar: {
      title: "إمكانية الوصول واستوديو الخطوط",
      category: "الإعدادات",
      whatItDoes:
        "يضبط قوالب القراءة، ونوع الخط (بما في ذلك الخط العربي وخط عسر القراءة)، وحجم النص والعناوين، والتباين العالي، وتقليل الحركة، والقراءة الصوتية، ومساعد الراحة البصرية.",
      whyAndProblem:
        "يزيل صعوبات القراءة وإجهاد العين ويدعم مختلف احتياجات الطلاب اللغوية والحسية.",
      whoBenefits: "جميع الطلاب وخاصة من يعانون من عسر القراءة أو ضعف البصر أو إرهاق الشاشة.",
      steps: [
        "اختر قالب قراءة جاهزاً أو عدّل الخط والحجم والارتفاع بين السطور يدوياً.",
        "فعّل التباين العالي أو خط عسر القراءة أو القراءة الصوتية حسب حاجتك.",
        "جرّب معالج مساعد الراحة لاقتراح الإعدادات الأنسب لك تلقائياً.",
      ],
      options: [
        {
          label: "بطاقة المعاينة الحية",
          desc: "تُظهر شكل النص والأرقام واللغة العربية مباشرة عند التعديل.",
        },
        { label: "القراءة الصوتية", desc: "تقرأ محتوى الصفحات بصوت مسموع عبر المتصفح." },
      ],
      limitations:
        "تعتمد ميزات القراءة الصوتية والإملاء الصوتي على دعم المتصفح وأصوات النظام المثبتة.",
    },
    ja: {
      title: "アクセシビリティ＆タイポグラフィ",
      category: "設定",
      whatItDoes:
        "可読性プリセット、フォント種別（日本語/CJK、セリフ、ディスレクシア対応書体）、文字サイズ(90〜150%)、高コントラスト、動きの軽減、音声読み上げを設定します。",
      whyAndProblem: "視覚的な読みづらさや目の疲れ、集中を妨げるアニメーション負担を解消します。",
      whoBenefits: "長時間の読解や視覚配慮・音声サポートを必要とするすべての学生。",
      steps: [
        "可読性プリセットまたは個別のフォント・文字倍率スライダーを調整します。",
        "高コントラスト、動きの軽減、読み上げ機能をオンにします。",
        "必要に応じてアクセシビリティアシスタントから自動推奨を適用します。",
      ],
      options: [
        { label: "書体プレビューカード", desc: "フォント変更の効果をリアルタイムで確認できます。" },
        { label: "音声読み上げ", desc: "ブラウザの音声合成機能で画面テキストを読み上げます。" },
      ],
      limitations: "音声読み上げと音声入力はブラウザおよびOSの対応状況に依存します。",
    },
    fr: {
      title: "Accessibilité & Studio Typographique",
      category: "Paramètres",
      whatItDoes:
        "Configure les préréglages de lisibilité, polices (dont Atkinson Hyperlegible pour dyslexie), échelle de texte (90–150 %), contraste élevé, réduction des animations et lecture vocale.",
      whyAndProblem: "Élimine les obstacles de lecture et la fatigue oculaire dans les 7 langues.",
      whoBenefits:
        "Étudiants dyslexiques, malvoyants, fatigués visuellement ou préférant l'écoute.",
      steps: [
        "Sélectionnez un préréglage de lisibilité ou ajustez les curseurs typographiques.",
        "Activez Contraste élevé, Police dyslexie, Réduire les animations ou Lecture vocale.",
        "Utilisez l'Assistant de confort pour des recommandations personnalisées.",
      ],
      options: [
        {
          label: "Spécimen en direct",
          desc: "Prévisualise instantanément polices, graisse et interlignage.",
        },
        {
          label: "Synthèse / Dictée vocale",
          desc: "S'appuie sur l'API Web Speech de votre navigateur.",
        },
      ],
      limitations:
        "Les fonctions vocales dépendent de la prise en charge du navigateur et des voix système.",
    },
    de: {
      title: "Barrierefreiheit & Typografie-Studio",
      category: "Einstellungen",
      whatItDoes:
        "Steuert Lesbarkeits-Presets, Schriftarten (inkl. Legasthenie-Schrift), Textskalierung (90–150 %), hohen Kontrast, reduzierte Bewegung und Vorlesefunktion.",
      whyAndProblem: "Beseitigt Lesebarrieren und visuelle Überanstrengung beim langen Lernen.",
      whoBenefits:
        "Lernende mit Legasthenie, Sehbeeinträchtigung oder Wunsch nach Audio-Unterstützung.",
      steps: [
        "Wählen Sie ein Lesbarkeits-Preset oder passen Sie Schriftgröße und Zeilenhöhe an.",
        "Aktivieren Sie Hoher Kontrast, Bewegung reduzieren oder Vorlesen.",
        "Nutzen Sie den Komfort-Assistenten für geführte Empfehlungen.",
      ],
      options: [
        {
          label: "Schrift-Vorschau",
          desc: "Zeigt Änderungen an Fließtext und Abständen sofort an.",
        },
        { label: "Vorlesefunktion", desc: "Nutzt die Web-Speech-API Ihres Browsers." },
      ],
      limitations: "Sprachausgabe und -eingabe hängen von der Browser- und Systemunterstützung ab.",
    },
    "zh-CN": {
      title: "无障碍辅助与字体排版实验室",
      category: "系统设置",
      whatItDoes:
        "调节易读预设、字体家族（含中日韩字体、衬线与阅读障碍友好字体）、字号缩放(90–150%)、高对比度、减弱动效、朗读(TTS)及语音输入。",
      whyAndProblem: "消除字体拥挤、低对比度和视觉疲劳带来的阅读阻碍。",
      whoBenefits: "长时间看屏学习、偏好语音辅助或有阅读无障碍需求的同学。",
      steps: [
        "选择「标准/舒适/大字/无障碍」预设或手动调节字号与行高滑块。",
        "按需开启高对比度、阅读障碍字体、减弱动画或页面朗读开关。",
        "可使用无障碍舒适向导一键生成推荐配置。",
      ],
      options: [
        { label: "实时排版样张卡", desc: "立即预览正文字体、行距与标签清晰度。" },
        { label: "页面朗读与语音听写", desc: "调用浏览器 Web Speech 接口提供声音辅助。" },
      ],
      limitations: "语音朗读与麦克风听写取决于当前浏览器的语音接口与系统语音包。",
    },
    ko: {
      title: "접근성 및 타이포그래피 스튜디오",
      category: "설정",
      whatItDoes:
        "가독성 프리셋, 글꼴(한국어/CJK, 세리프, 난독증 배려 서체 포함), 글자 크기(90~150%), 고대비, 모션 줄이기, 음성 읽기(TTS) 및 음성 입력을 설정합니다.",
      whyAndProblem: "장시간 화면 학습으로 인한 눈의 피로와 읽기 장벽을 낮춰 줍니다.",
      whoBenefits: "난독증 배려, 저시력 보조 또는 청각 학습을 선호하는 모든 학생.",
      steps: [
        "가독성 프리셋을 고르거나 글꼴·크기·줄간격 슬라이더를 조절하세요.",
        "고대비 모드, 동작 줄이기, 소리 내어 읽기 등을 켜고 끄세요.",
        "편안함 도우미를 실행하면 맞춤형 접근성 조합을 추천받을 수 있습니다.",
      ],
      options: [
        {
          label: "실시간 서체 미리보기",
          desc: "본문과 수치 표기의 가독성 변화를 즉시 확인합니다.",
        },
        {
          label: "읽어주기 / 음성 입력",
          desc: "브라우저 Web Speech API를 통해 음성 기능을 지원합니다.",
        },
      ],
      limitations: "음성 읽기 및 받아쓰기는 사용 중인 브라우저와 OS 음성 팩 지원 여부에 따릅니다.",
    },
  },
  "settings-privacy-account": {
    en: {
      title: "Language, Region, Study, AI, Notifications, Privacy & Account",
      category: "Settings",
      whatItDoes:
        "Configures your UI language (7 languages with automatic RTL/LTR), region & Hijri/Gregorian calendar format, Study depth, AI tone & memory, quiet hours, minor privacy visibility, JSON data export, and profile security.",
      whyAndProblem:
        "Puts every regional, behavioral, notification, and privacy control under clear, transparent student ownership.",
      whoBenefits:
        "All students and guardians managing localization, study defaults, and account safety.",
      steps: [
        "Use the Settings category menu or search bar to jump to Language, Study, AI, Notifications, Privacy, or Account.",
        "Update your preferred language, study complexity, quiet hours, or Circle visibility.",
        "Export a full JSON snapshot of your data anytime from Privacy & Security.",
      ],
      options: [
        {
          label: "Export My Data (JSON)",
          desc: "Downloads a portable backup of your profile, settings, and learning records.",
        },
        {
          label: "Quiet Hours & Notifications",
          desc: "Silences browser alerts overnight while keeping in-app work uninterrupted.",
        },
      ],
      limitations:
        "Browser notifications require granting OS/browser permission; AI chat history storage respects your toggle.",
    },
    ar: {
      title: "اللغة، المنطقة، الدراسة، الذكاء، الإشعارات، والخصوصية",
      category: "الإعدادات",
      whatItDoes:
        "يدير لغة الواجهة (7 لغات مع دعم RTL)، التقويم الهجري/الميلادي، أسلوب الشرح والذكاء الاصطناعي، ساعات الهدوء، خصوصية القاصرين، وتصدير البيانات JSON.",
      whyAndProblem: "يمنح الطالب تحكماً شفافاً وشاملاً في لغته وإشعاراته وخصوصية بياناته.",
      whoBenefits: "جميع الطلاب وأولياء الأمور لإدارة التوطين والأمان.",
      steps: [
        "استخدم قائمة فئات الإعدادات أو شريط البحث للوصول السريع لأي قسم.",
        "عدّل اللغة أو مدة بومودورو الافتراضية أو أسلوب المدرب الذكي أو ساعات الهدوء.",
        "يمكنك تصدير نسخة كاملة من بياناتك بصيغة JSON من قسم الخصوصية.",
      ],
      options: [
        { label: "تصدير بياناتي (JSON)", desc: "ينزّل نسخة احتياطية كاملة لإعداداتك وسجلاتك." },
        { label: "ساعات الهدوء", desc: "تمنع التنبيهات المزعجة خلال أوقات الراحة والنوم." },
      ],
      limitations: "إشعارات المتصفح تتطلب السماح بإذن الإشعارات من المتصفح نفسه.",
    },
    ja: {
      title: "言語・地域・学習・AI・通知・プライバシー設定",
      category: "設定",
      whatItDoes:
        "7言語切替、暦・時刻形式、学習解説の深さ、AIのトーンと履歴保存、おやすみ時間、プライバシー公開範囲、JSONデータ書き出しを一括管理します。",
      whyAndProblem:
        "学習スタイルや通知タイミング、個人情報保護を細かく自己管理できるようにします。",
      whoBenefits: "学習環境とセキュリティ設定を最適化したいすべての学生。",
      steps: [
        "設定カテゴリーや検索バーから該当セクションを開きます。",
        "言語、学習難易度、AI設定、通知スケジュールを変更します。",
        "プライバシー欄からいつでも学習データをJSON形式でバックアップできます。",
      ],
      options: [
        {
          label: "JSONデータエクスポート",
          desc: "アカウントの学習履歴と設定一式をダウンロードします。",
        },
        { label: "おやすみ時間（Quiet Hours）", desc: "夜間などの集中を妨げる通知を抑制します。" },
      ],
      limitations: "ブラウザ通知はブラウザ側の許可設定が有効な場合のみ送信されます。",
    },
    fr: {
      title: "Langue, Région, Étude, IA, Notifications & Confidentialité",
      category: "Paramètres",
      whatItDoes:
        "Gère les 7 langues (avec RTL automatique), le format calendaire, la complexité d'étude, le ton de l'IA, les heures silencieuses, la confidentialité mineurs et l'export JSON.",
      whyAndProblem:
        "Centralise tous les réglages pédagogiques, régionaux et de protection des données.",
      whoBenefits: "Tous les étudiants et tuteurs configurant langue et sécurité.",
      steps: [
        "Naviguez via le menu des catégories ou la barre de recherche des paramètres.",
        "Réglez langue, durée Pomodoro par défaut, style de l'IA ou heures calmes.",
        "Téléchargez une copie JSON complète de vos données depuis Confidentialité.",
      ],
      options: [
        {
          label: "Exporter mes données (JSON)",
          desc: "Génère une sauvegarde portable de votre compte.",
        },
        {
          label: "Heures silencieuses",
          desc: "Met les notifications navigateur en pause durant la nuit.",
        },
      ],
      limitations: "Les notifications système nécessitent l'autorisation explicite du navigateur.",
    },
    de: {
      title: "Sprache, Region, Lernen, KI, Benachrichtigungen & Datenschutz",
      category: "Einstellungen",
      whatItDoes:
        "Steuert 7 Sprachen, Datums-/Kalenderformat, Erklärungsstufe, KI-Ton, Ruhezeiten, Jugendschutz-Sichtbarkeit und JSON-Datenexport.",
      whyAndProblem:
        "Sorgt für volle Transparenz und Kontrolle über Lernpräferenzen und Datenschutz.",
      whoBenefits: "Alle Lernenden zur Verwaltung von Sprache, Lernhilfen und Sicherheit.",
      steps: [
        "Nutzen Sie das Kategorie-Menü oder die Suchleiste in den Einstellungen.",
        "Passen Sie Sprache, Lernkomplexität, Ruhezeiten oder Sichtbarkeit an.",
        "Exportieren Sie Ihre Kontodaten jederzeit als JSON-Datei.",
      ],
      options: [
        {
          label: "Datenexport (JSON)",
          desc: "Lädt eine vollständige Sicherung Ihres Profils und Fortschritts herunter.",
        },
        {
          label: "Ruhezeiten",
          desc: "Unterdrückt Browser-Benachrichtigungen während festgelegter Zeiten.",
        },
      ],
      limitations: "Browser-Mitteilungen erfordern die entsprechende Browser-Berechtigung.",
    },
    "zh-CN": {
      title: "语言地区、学习、AI、通知与隐私账号设置",
      category: "系统设置",
      whatItDoes:
        "统一设置 7 种界面语言（含 RTL）、公历/伊斯兰历及时间制、学习讲解深度、AI 语气与记忆、免打扰时段、未成年人隐私及 JSON 数据导出。",
      whyAndProblem: "将地区习惯、AI 隐私边界与提醒频率的控制权完全交还给学生自己。",
      whoBenefits: "所有关注本地化体验、学习偏好与账号安全的学生。",
      steps: [
        "使用左侧分类栏或顶部搜索快速定位语言、学习、AI、通知或隐私卡片。",
        "调整常用语言、专注默认时长、AI 上下文授权或免打扰起止时间。",
        "在「隐私与安全」中可随时下载个人数据 JSON 备份。",
      ],
      options: [
        { label: "导出我的数据 (JSON)", desc: "生成并下载个人资料与学习记录的完整副本。" },
        { label: "免打扰时段", desc: "在夜间休息时段暂停浏览器推送提示。" },
      ],
      limitations: "系统弹窗通知需要您在浏览器权限提示中点击允许。",
    },
    ko: {
      title: "언어·지역, 학습, AI, 알림 및 개인정보 설정",
      category: "설정",
      whatItDoes:
        "7개 언어(RTL 포함), 날짜/달력 형식, 학습 설명 깊이, AI 말투 및 대화 저장, 방해 금지 시간, 청소년 공개 범위, JSON 데이터 내보내기를 관리합니다.",
      whyAndProblem:
        "지역화, 학습 스타일, 알림 제어 및 계정 보안 설정을 한곳에서 투명하게 다룹니다.",
      whoBenefits: "언어와 학습 기본값, 개인정보 보호를 세밀하게 조정하려는 모든 사용자.",
      steps: [
        "설정 카테고리 목록이나 검색창을 통해 원하는 섹션으로 이동하세요.",
        "언어, 기본 집중 시간, AI 톤, 방해 금지 시간대 등을 변경합니다.",
        "개인정보 및 보안 섹션에서 언제든지 내 데이터를 JSON 파일로 백업할 수 있습니다.",
      ],
      options: [
        {
          label: "내 데이터 내보내기 (JSON)",
          desc: "프로필과 학습 기록 전체를 휴대용 백업 파일로 받습니다.",
        },
        { label: "방해 금지 시간", desc: "야간 시간대에 브라우저 알림 울림을 제한합니다." },
      ],
      limitations: "브라우저 푸시 알림은 브라우저 알림 권한이 허용된 경우에만 작동합니다.",
    },
  },
  "help-center": {
    en: {
      title: "NEXORA Help Center & Knowledge Base",
      category: "Support",
      whatItDoes:
        "Provides searchable how-to articles organized by 8 categories plus interactive Frequently Asked Questions.",
      whyAndProblem:
        "Gives instant self-service answers on XP, themes, study tools, and troubleshooting without waiting for ticket replies.",
      whoBenefits: "New and experienced students seeking quick answers.",
      steps: [
        "Type keywords in the Help Search input or click any of the 8 category cards.",
        "Open any article card to read full instructions, or expand FAQs below.",
        "Click Contact Support if your question still needs human staff help.",
      ],
      options: [
        {
          label: "Category Filter & Search",
          desc: "Filters seed and staff-authored Firestore help articles live.",
        },
        {
          label: "FAQ Accordion",
          desc: "Answers common questions about themes, offline mode, and XP.",
        },
      ],
      limitations:
        "Reads published help articles from Firestore with built-in seed articles as fallback offline.",
    },
    ar: {
      title: "مركز المساعدة وقاعدة المعرفة",
      category: "الدعم",
      whatItDoes:
        "يوفر مقالات إرشادية قابلة للبحث في 8 فئات بالإضافة إلى قسم الأسئلة الشائعة التفاعلي.",
      whyAndProblem:
        "يقدم إجابات فورية حول النقاط والثيمات وأدوات الدراسة وحل المشكلات دون انتظار.",
      whoBenefits: "الطلاب الجدد والحاليون الباحثون عن إرشادات سريعة.",
      steps: [
        "اكتب سؤالك في مربع البحث أو اختر إحدى الفئات الثماني.",
        "افتح أي مقال لقراءة الخطوات الكاملة أو تصفح الأسئلة الشائعة.",
        "انتقل لصفحة تذاكر الدعم إذا احتجت مساعدة مباشرة من الفريق.",
      ],
      options: [
        {
          label: "تصفية الفئات والبحث",
          desc: "يبحث في المقالات الأساسية والمقالات المنشورة في Firestore.",
        },
      ],
      limitations: "يعمل أونلاين مع مقالات مدمجة احتياطية عند انقطاع الشبكة.",
    },
    ja: {
      title: "ヘルプセンター＆ナレッジベース",
      category: "サポート",
      whatItDoes:
        "8カテゴリー別の解説記事とよくある質問（FAQ）をキーワード検索付きで閲覧できます。",
      whyAndProblem:
        "XPやテーマ設定、トラブル対処などの疑問をチケット返信を待たずに自己解決できます。",
      whoBenefits: "使い方をすぐ確認したい初心者から上級者まですべての学生。",
      steps: [
        "検索バーに語句を入力するか8つのカテゴリーカードを選びます。",
        "記事をクリックして詳細手順を読むかFAQを展開します。",
      ],
      options: [
        { label: "記事検索＆FAQ", desc: "Firestore上の最新記事と内蔵ガイドを統合表示します。" },
      ],
      limitations: "オフライン時は内蔵シード記事がフォールバック表示されます。",
    },
    fr: {
      title: "Centre d'Aide & Base de Connaissances",
      category: "Assistance",
      whatItDoes:
        "Propose des articles pratiques classés en 8 catégories et une FAQ interactive avec recherche instantanée.",
      whyAndProblem:
        "Apporte des réponses immédiates sur l'XP, les thèmes et le dépannage sans attendre le support.",
      whoBenefits: "Nouveaux utilisateurs et étudiants cherchant une information rapide.",
      steps: [
        "Saisissez un mot-clé dans la barre de recherche ou cliquez sur une catégorie.",
        "Ouvrez un article ou dépliez les questions fréquentes.",
      ],
      options: [
        {
          label: "Recherche & FAQ",
          desc: "Combine articles publiés dans Firestore et guides intégrés.",
        },
      ],
      limitations: "Les articles intégrés restent consultables même sans connexion.",
    },
    de: {
      title: "Hilfe-Center & Wissensdatenbank",
      category: "Support",
      whatItDoes:
        "Bietet durchsuchbare Anleitungen in 8 Kategorien sowie ausklappbare häufige Fragen (FAQ).",
      whyAndProblem: "Beantwortet Fragen zu XP, Designs und Fehlerbehebung sofort per Selbsthilfe.",
      whoBenefits: "Neue und erfahrene Lernende auf der Suche nach schnellen Antworten.",
      steps: [
        "Geben Sie Suchbegriffe ein oder wählen Sie eine der 8 Kategorien.",
        "Öffnen Sie Artikel oder klappen Sie FAQ-Einträge auf.",
      ],
      options: [
        { label: "Suche & FAQ", desc: "Durchsucht gespeicherte sowie integrierte Hilfeartikel." },
      ],
      limitations: "Offline stehen die integrierten Basisartikel weiterhin bereit.",
    },
    "zh-CN": {
      title: "帮助中心与知识库",
      category: "支持与帮助",
      whatItDoes: "提供按 8 大类整理的可搜索操作文章与折叠式常见问题（FAQ）。",
      whyAndProblem: "无需等待客服回复即可自助解决关于 XP、主题、学习工具与网络异常的疑问。",
      whoBenefits: "所有希望快速上手或排查问题的学生。",
      steps: [
        "在搜索框输入关键词，或点选 8 个分类卡片之一。",
        "点击文章阅读详细图文指导，或展开下方 FAQ。",
      ],
      options: [{ label: "文章筛选与问答", desc: "结合 Firestore 发布文章与内置离线帮助库。" }],
      limitations: "断网时自动回退至内置基础帮助文章。",
    },
    ko: {
      title: "도움말 센터 및 지식 베이스",
      category: "지원",
      whatItDoes:
        "8개 카테고리로 정리된 검색 가능한 가이드 문서와 자주 묻는 질문(FAQ)을 제공합니다.",
      whyAndProblem:
        "XP, 테마, 학습 도구 및 오류 해결 방법을 문의 답변을 기다리지 않고 즉시 찾을 수 있습니다.",
      whoBenefits: "빠른 사용법 확인이 필요한 신규 및 기존 학생 모두.",
      steps: [
        "검색창에 키워드를 입력하거나 8가지 카테고리 카드를 선택하세요.",
        "원하는 문서를 눌러 자세한 안내를 읽거나 FAQ를 펼쳐보세요.",
      ],
      options: [
        { label: "문서 검색 및 FAQ", desc: "Firestore 도움말과 내장 기본 문서를 함께 검색합니다." },
      ],
      limitations: "오프라인 시에는 내장 기본 도움말 문서가 표시됩니다.",
    },
  },
  "support-hub": {
    en: {
      title: "Support Tickets, Safety Reports & Community Feedback",
      category: "Support",
      whatItDoes:
        "Lets students submit private support tickets, track conversation threads, report technical bugs or unsafe abuse, and upvote feature suggestions.",
      whyAndProblem:
        "Ensures every bug report, safety concern, or student idea reaches authorized staff through structured channels.",
      whoBenefits:
        "Any student needing technical help, safety reporting, or wanting to suggest improvements.",
      steps: [
        "Choose Submit Support Request, My Tickets, or Suggestions & Community Roadmap.",
        "Use the top Report Problem or Report Abuse buttons for urgent issues.",
        "Track staff replies directly inside your private ticket threads or vote on roadmap ideas.",
      ],
      options: [
        {
          label: "Submit Ticket / My Tickets",
          desc: "Creates encrypted Firestore tickets visible only to you and staff.",
        },
        {
          label: "Feedback Center & Upvotes",
          desc: "Shares improvement ideas and tracks community vote counts.",
        },
      ],
      limitations:
        "Requires an active authenticated session and online connection to submit and load tickets.",
    },
    ar: {
      title: "مركز الدعم والتذاكر والاقتراحات",
      category: "الدعم",
      whatItDoes:
        "يتيح إرسال تذاكر دعم خاصة، متابعة ردود الفريق، الإبلاغ عن الأعطال أو الإساءة، واقتراح ميزات جديدة والتصويت لها.",
      whyAndProblem:
        "يضمن وصول أي مشكلة تقنية أو بلاغ أمان أو اقتراح طلابي للإدارة عبر قنوات منظمة.",
      whoBenefits: "أي طالب يحتاج مساعدة فنية أو يريد المساهمة في تطوير المنصة.",
      steps: [
        "اختر تبويب إرسال طلب جديد، أو تذاكري، أو الاقتراحات وخارطة الطريق.",
        "استخدم أزرار الإبلاغ عن مشكلة أو إساءة في الأعلى للحالات العاجلة.",
        "تابع الردود داخل تذكرتك الخاصة أو صوّت للأفكار الجديدة.",
      ],
      options: [
        { label: "تذاكر الدعم", desc: "رسائل خاصة بينك وبين فريق الدعم المختص." },
        { label: "استوديو الاقتراحات والتصويت", desc: "يعرض أفكار المجتمع ويتيح دعمها بالتصويت." },
      ],
      limitations: "يتطلب اتصالاً بالإنترنت وحساباً مسجلاً لإرسال التذاكر والاطلاع عليها.",
    },
    ja: {
      title: "サポートチケット・安全通報・フィードバック",
      category: "サポート",
      whatItDoes:
        "非公開のサポート問い合わせ送信・返信確認、バグ・規約違反の報告、機能要望の投稿・投票が行えます。",
      whyAndProblem:
        "不具合や安全上の懸念、改善アイデアを確実に運営スタッフへ届ける仕組みを提供します。",
      whoBenefits: "技術サポートや問題報告、機能リクエストを行いたいすべての学生。",
      steps: [
        "「新規リクエスト」「マイチケット」「提案・ロードマップ」からタブを選びます。",
        "緊急の不具合や不適切な行為は上部の通報ボタンから報告できます。",
        "チケット内でスタッフ返信を確認し、要望へ投票します。",
      ],
      options: [
        {
          label: "チケット送信/履歴",
          desc: "あなたとスタッフのみ閲覧できるサポートスレッドを作成します。",
        },
        { label: "フィードバック投票", desc: "学生コミュニティからの機能要望に賛成票を投じます。" },
      ],
      limitations: "チケットの送信・同期にはオンライン接続とサインインが必要です。",
    },
    fr: {
      title: "Tickets Support, Signalements & Suggestions",
      category: "Assistance",
      whatItDoes:
        "Permet d'ouvrir des tickets privés, suivre les réponses, signaler un bug ou abus, et voter pour de nouvelles fonctionnalités.",
      whyAndProblem:
        "Garantit que chaque incident technique, problème de sécurité ou suggestion remonte efficacement à l'équipe.",
      whoBenefits: "Tout étudiant ayant besoin d'assistance ou souhaitant améliorer la plateforme.",
      steps: [
        "Sélectionnez Nouveau ticket, Mes tickets ou Suggestions.",
        "Utilisez les boutons Signaler un problème ou un abus en haut pour les cas urgents.",
        "Suivez les échanges ou votez pour les idées de la communauté.",
      ],
      options: [
        { label: "Tickets privés", desc: "Fils de discussion confidentiels avec l'équipe." },
        {
          label: "Suggestions & Votes",
          desc: "Proposez des améliorations et soutenez celles des pairs.",
        },
      ],
      limitations: "Nécessite une connexion internet active et une session authentifiée.",
    },
    de: {
      title: "Support-Tickets, Sicherheitsmeldungen & Feedback",
      category: "Support",
      whatItDoes:
        "Ermöglicht private Support-Anfragen, Verlaufseinsicht, Fehler-/Missbrauchsmeldungen sowie Abstimmungen über Funktionswünsche.",
      whyAndProblem:
        "Stellt sicher, dass technische Probleme, Sicherheitsfragen und Schülerideen über klare Kanäle bearbeitet werden.",
      whoBenefits: "Alle Lernenden mit Hilfebedarf oder Verbesserungsvorschlägen.",
      steps: [
        "Wählen Sie Anfrage senden, Meine Tickets oder Vorschläge.",
        "Nutzen Sie bei dringenden Fällen oben Problem oder Missbrauch melden.",
        "Verfolgen Sie Antworten direkt im Ticket-Verlauf.",
      ],
      options: [
        {
          label: "Ticket-System",
          desc: "Vertrauliche Konversationen zwischen Ihnen und dem Team.",
        },
        { label: "Feedback & Upvotes", desc: "Ideen einreichen und über Vorschläge abstimmen." },
      ],
      limitations: "Erfordert Anmeldung und aktive Internetverbindung zur Firestore-Übermittlung.",
    },
    "zh-CN": {
      title: "支持工单、安全举报与功能建议中心",
      category: "支持与帮助",
      whatItDoes:
        "支持提交私密客服工单、查看处理回复、报告程序错误或不当内容，以及提交和投票支持新功能建议。",
      whyAndProblem: "确保每位学生的技术问题、安全隐患和产品建议都能直达授权团队。",
      whoBenefits: "遇到故障、安全顾虑或想参与共建平台改进的同学。",
      steps: [
        "在「提交请求」「我的工单」「功能建议」标签间切换。",
        "紧急故障或安全违规请点击右上角对应报告弹窗。",
        "在工单列表中追踪团队回复，或为社区创意点赞投票。",
      ],
      options: [
        { label: "私密支持工单", desc: "仅您本人与授权工作人员可见的问答记录。" },
        { label: "社区建议投票", desc: "汇聚热门改进需求，公开展示采纳状态。" },
      ],
      limitations: "提交与刷新工单状态需要已登录状态及联网访问 Firestore。",
    },
    ko: {
      title: "지원 티켓, 안전 신고 및 커뮤니티 피드백",
      category: "지원",
      whatItDoes:
        "비공개 지원 문의 제출 및 답변 추적, 버그·악용 신고, 기능 제안 등록 및 투표 기능을 제공합니다.",
      whyAndProblem:
        "기술 오류, 안전 문제 및 학생들의 개선 아이디어가 운영진에게 누락 없이 전달되도록 합니다.",
      whoBenefits: "도움이 필요하거나 플랫폼 발전에 의견을 보태고 싶은 모든 학생.",
      steps: [
        "지원 요청 제출, 내 티켓 또는 기능 제안 탭 중 하나를 선택하세요.",
        "긴급 버그나 악용 사례는 상단의 신고 버튼을 이용하세요.",
        "티켓 스레드에서 답변을 확인하거나 다른 학생의 제안에 투표할 수 있습니다.",
      ],
      options: [
        {
          label: "비공개 문의 티켓",
          desc: "작성자와 담당 스태프만 볼 수 있는 안전한 대화 스레드입니다.",
        },
        {
          label: "제안 및 추천",
          desc: "기능 개선 아이디어를 제안하고 추천수로 우선순위를 보여줍니다.",
        },
      ],
      limitations: "티켓 등록 및 조회는 로그인과 온라인 연결이 필요합니다.",
    },
  },
  "admin-control": {
    en: {
      title: "Admin Control Center & Educator Collaboration",
      category: "Governance",
      whatItDoes:
        "Provides authorized staff with ticket dispatch, help-article editing, moderation queues, user role visibility, audit logs, and educator classroom briefing coordination.",
      whyAndProblem:
        "Gives platform moderators and educators a secure governance console isolated from regular student workspaces.",
      whoBenefits: "Authorized moderators, educators, staff, and super-administrators.",
      steps: [
        "Sign in with an authorized staff role (verified via RBAC rules).",
        "Switch between Overview, Tickets, Articles, Moderation, Users, Audit Log, and Educator tabs.",
        "Review and resolve flagged reports or publish help center documentation.",
      ],
      options: [
        {
          label: "Role-Gated Tabs",
          desc: "Each tab loads operational queues guarded by Firestore security rules.",
        },
        {
          label: "Teacher Collaboration Center",
          desc: "Supports classroom rubric templates and safe educator guidance.",
        },
      ],
      limitations:
        "Strictly restricted to staff/admin RBAC roles; regular student accounts see an access-restricted gate.",
    },
    ar: {
      title: "مركز تحكم المشرفين وتعاون المعلمين",
      category: "الإدارة",
      whatItDoes:
        "يوفر للمشرفين والموظفين المخولين إدارة التذاكر، تحرير مقالات المساعدة، قوائم الإشراف والرقابة، سجل التدقيق، ومركز تعاون المعلمين.",
      whyAndProblem:
        "يمنح فريق الإدارة والمعلمين لوحة حوكمة آمنة ومعزولة عن حسابات الطلاب العادية.",
      whoBenefits: "المشرفون، المعلمون المخولون، ومديرو النظام.",
      steps: [
        "سجّل الدخول بحساب يملك صلاحيات إشرافية معتمدة (RBAC).",
        "تنقّل بين التذاكر والمقالات والرقابة والمستخدمين وسجل التدقيق ومركز المعلمين.",
      ],
      options: [
        { label: "تبويبات الإدارة", desc: "محمية بقواعد أمان Firestore وصلاحيات الأدوار." },
      ],
      limitations:
        "مقصور حصراً على أدوار المشرفين والإدارة؛ حسابات الطلاب يظهر لها تنبيه تقييد الوصول.",
    },
    ja: {
      title: "管理コントロールセンター＆教育者連携",
      category: "管理",
      whatItDoes:
        "権限を持つスタッフ向けに、チケット対応、ヘルプ記事編集、モデレーション管理、監査ログ、教育者連携ツールを提供します。",
      whyAndProblem: "学生用画面から分離された安全なガバナンス環境で品質と安全性を維持します。",
      whoBenefits: "モデレーター、認定教員、システム管理者。",
      steps: [
        "スタッフ権限が付与されたアカウントでアクセスします。",
        "チケット・記事・モデレーション・ユーザー・監査ログの各タブを切り替えます。",
      ],
      options: [
        {
          label: "RBAC保護タブ",
          desc: "Firestoreセキュリティルールに保護された管理操作を実行します。",
        },
      ],
      limitations: "一般学生アカウントにはアクセス制限画面が表示されます。",
    },
    fr: {
      title: "Centre de Contrôle Admin & Collaboration Éducateurs",
      category: "Gouvernance",
      whatItDoes:
        "Fournit au personnel autorisé la gestion des tickets, l'édition d'articles d'aide, la modération, les journaux d'audit et l'espace enseignants.",
      whyAndProblem:
        "Sépare les outils de gouvernance et de sécurité des espaces étudiants standards.",
      whoBenefits: "Modérateurs, enseignants autorisés et administrateurs.",
      steps: [
        "Connectez-vous avec un rôle personnel/admin validé.",
        "Naviguez entre Vue d'ensemble, Tickets, Articles, Modération, Audit et Éducateur.",
      ],
      options: [
        { label: "Onglets protégés RBAC", desc: "Opérations sécurisées côté règles Firestore." },
      ],
      limitations:
        "Strictement réservé aux rôles staff/admin ; les comptes étudiants voient un écran restreint.",
    },
    de: {
      title: "Admin-Kontrollzentrum & Lehrkräftebereich",
      category: "Verwaltung",
      whatItDoes:
        "Stellt autorisierten Mitarbeitenden Ticketbearbeitung, Hilfeartikel-Editor, Moderation, Audit-Protokolle und Lehrkraft-Kollaboration bereit.",
      whyAndProblem:
        "Trennt Verwaltungs- und Moderationsaufgaben sicher von regulären Lernendenkonten.",
      whoBenefits: "Autorisierte Moderatorinnen/Moderatoren, Lehrkräfte und Admins.",
      steps: [
        "Mit berechtigter Staff-/Admin-Rolle anmelden.",
        "Zwischen Tickets, Artikeln, Moderation, Audit und Lehrkraft-Tab wechseln.",
      ],
      options: [
        {
          label: "RBAC-geschützte Tabs",
          desc: "Durch Firestore-Sicherheitsregeln geschützte Aktionen.",
        },
      ],
      limitations: "Für reguläre Lernendenkonten gesperrt.",
    },
    "zh-CN": {
      title: "平台管理中心与教师协作区",
      category: "平台治理",
      whatItDoes:
        "为授权教职员与管理员提供工单调度、帮助文档编辑、内容审核队列、角色审计日志与教师协作中心。",
      whyAndProblem: "将社区治理与教务工具与普通学生界面安全隔离。",
      whoBenefits: "平台审核员、授权教师与系统管理员。",
      steps: [
        "使用具备 RBAC 职员或管理员权限的账号访问。",
        "切换工单、文章、审核、用户、审计日志或教师协作标签进行处理。",
      ],
      options: [{ label: "基于角色的治理面板", desc: "受 Firestore 安全规则严格校验权限。" }],
      limitations: "仅限管理员或授权教职员访问，普通学生账号会看到权限拦截提示。",
    },
    ko: {
      title: "관리자 제어 센터 및 교사 협업",
      category: "관리",
      whatItDoes:
        "승인된 스태프에게 티켓 배정, 도움말 문서 편집, 신고 조정, 사용자 및 감사 로그 조회, 교사 협업 도구를 제공합니다.",
      whyAndProblem: "안전과 품질 관리를 일반 학생 학습 공간과 분리된 보안 콘솔에서 처리합니다.",
      whoBenefits: "승인된 운영진, 교사 및 최고 관리자.",
      steps: [
        "스태프 이상 권한이 부여된 계정으로 로그인합니다.",
        "티켓, 도움말, 모더레이션, 감사 로그, 교육자 탭을 전환해 업무를 처리하세요.",
      ],
      options: [
        { label: "역할 기반 관리 탭", desc: "Firestore 보안 규칙으로 엄격하게 검증됩니다." },
      ],
      limitations: "일반 학생 계정에서는 접근 제한 안내 화면만 표시됩니다.",
    },
  },
  "growth-heatmap": {
    en: {
      title: "Growth Heatmap Calendar Grid",
      category: "Growth Analytics",
      whatItDoes:
        "Visualizes your daily and weekly productivity consistency across completed tasks, focus sprints, study actions, journal reflections, and earned XP in a Recharts calendar heatmap.",
      whyAndProblem:
        "Helps students spot rest gaps, high-focus weeks, and study rhythm trends at a glance instead of guessing consistency from raw XP totals.",
      whoBenefits:
        "Students building steady weekly study habits and preparing for long-term exams.",
      steps: [
        "Switch between 4W, 8W, and 12W calendar windows at the top right.",
        "Hover or tap any day square to inspect exact tasks, focus minutes, study actions, and XP earned.",
        "Use the labeled Less to More scale legend to track peak vs. rest days.",
      ],
      options: [
        { label: "4W / 8W / 12W Window", desc: "Adjusts how many calendar weeks are displayed." },
        {
          label: "Day Cell Tooltip",
          desc: "Breaks down every metric contributing to that day's intensity.",
        },
      ],
      limitations:
        "Intensity reflects logged tasks, focus timers, study actions, journals, and XP events.",
    },
    ar: {
      title: "خريطة النمو الحرارية الأسبوعية",
      category: "تحليلات النمو",
      whatItDoes:
        "تعرض انتظامك اليومي والأسبوعي في شبكة تقويم تفاعلية عبر المهام المنجزة وجلسات التركيز وأنشطة الدراسة والتأملات ونقاط الخبرة.",
      whyAndProblem:
        "تساعد الطالب على اكتشاف فترات الفتور وأسابيع التركيز العالي بنظرة سريعة بدلاً من الاعتماد على الأرقام الإجمالية فقط.",
      whoBenefits: "الطلاب الذين يبنون عادات دراسة منتظمة ويستعدون للاختبارات.",
      steps: [
        "اختر نافذة 4 أو 8 أو 12 أسبوعاً من أعلى البطاقة.",
        "مرّر فوق أي مربع يوم لعرض تفاصيل المهام ودقائق التركيز ونقاط الخبرة.",
        "استعن بمقياس الشدة المسمّى لمقارنة أيام الذروة بأيام الراحة.",
      ],
      options: [
        { label: "مبدّل 4 / 8 / 12 أسبوعاً", desc: "يحدد عدد الأسابيع المعروضة في التقويم." },
        { label: "تلميح اليوم التفاعلي", desc: "يعرض تفصيل كل نشاط ساهم في درجة اليوم." },
      ],
      limitations: "تعتمد الكثافة فقط على الأنشطة والمهام وجلسات التركيز المسجلة فعلياً.",
    },
    ja: {
      title: "成長ヒートマップカレンダー",
      category: "成長分析",
      whatItDoes:
        "完了タスク・集中スプリント・学習アクション・日記・獲得XPをRecharts週間カレンダーグリッドで可視化します。",
      whyAndProblem: "累計XPだけでは見えにくい学習リズムや集中週間・休息日をひと目で把握できます。",
      whoBenefits: "安定した学習習慣を築きたいすべての学生。",
      steps: [
        "右上の4W / 8W / 12Wボタンで表示期間を切り替えます。",
        "各日のセルにカーソルを合わせてタスク数や集中分を確認します。",
        "凡例（Less〜More）で強度の目安を確認できます。",
      ],
      options: [
        { label: "期間切替 (4W/8W/12W)", desc: "カレンダーの表示週数を変更します。" },
        { label: "日別ツールチップ", desc: "その日の活動内訳を詳細表示します。" },
      ],
      limitations: "記録されたタスク・集中・学習・日記データのみに基づいて算出されます。",
    },
    fr: {
      title: "Carte thermique de croissance",
      category: "Analyse de progression",
      whatItDoes:
        "Visualise votre régularité hebdomadaire (tâches, sessions focus, étude, journal et XP) sous forme de grille calendaire Recharts.",
      whyAndProblem:
        "Permet de repérer d'un coup d'œil vos semaines intenses et vos pauses sans vous fier uniquement au total XP.",
      whoBenefits: "Étudiants souhaitant stabiliser leur rythme d'étude hebdomadaire.",
      steps: [
        "Choisissez la fenêtre 4W, 8W ou 12W en haut à droite.",
        "Survolez une case pour voir le détail des tâches, minutes focus et XP.",
        "Consultez la légende Moins à Plus pour lire chaque niveau.",
      ],
      options: [
        { label: "Fenêtre 4 / 8 / 12 sem.", desc: "Modifie l'horizon affiché dans la grille." },
        { label: "Info-bulle détaillée", desc: "Affiche les métriques exactes de la journée." },
      ],
      limitations: "Basée uniquement sur les activités réellement enregistrées dans votre compte.",
    },
    de: {
      title: "Wachstums-Heatmap-Kalender",
      category: "Wachstumsanalyse",
      whatItDoes:
        "Visualisiert tägliche und wöchentliche Produktivität über erledigte Aufgaben, Fokus-Sprints, Lernaktionen, Reflexionen und XP in einem Recharts-Raster.",
      whyAndProblem:
        "Macht Lernrhythmus, Pausen und intensive Fokuswochen auf einen Blick erkennbar.",
      whoBenefits: "Lernende, die konstante Wochenroutinen aufbauen möchten.",
      steps: [
        "Wechsle oben rechts zwischen 4W, 8W und 12W.",
        "Fahre über ein Tagesfeld für genaue Aufgaben-, Fokus- und XP-Details.",
        "Nutze die beschriftete Legende von Weniger bis Mehr.",
      ],
      options: [
        { label: "4W / 8W / 12W-Auswahl", desc: "Passt den sichtbaren Wochenzeitraum an." },
        { label: "Tages-Tooltip", desc: "Zeigt alle Kennzahlen des gewählten Tages." },
      ],
      limitations: "Berechnet ausschließlich aus tatsächlich protokollierten Aktivitäten.",
    },
    "zh-CN": {
      title: "成长热力图日历网格",
      category: "成长分析",
      whatItDoes:
        "以 Recharts 日历网格呈现每日与每周已完成任务、专注冲刺、学习记录、反思日志及 XP 活跃度。",
      whyAndProblem: "相比单一的 XP 总数，更能直观发现学习节奏起伏与高峰专注周。",
      whoBenefits: "希望保持稳定每周学习节律并备战考试的学生。",
      steps: [
        "点击右上角 4W / 8W / 12W 切换显示周数范围。",
        "悬停或点击任意日期方块查看当天任务、专注分钟与 XP 明细。",
        "参照底部从少到多的图例识别各活跃等级。",
      ],
      options: [
        { label: "4/8/12 周时间窗", desc: "切换日历网格覆盖的周数范围。" },
        { label: "每日详情浮窗", desc: "展示当天各维度活跃指标与得分。" },
      ],
      limitations: "仅依据系统内真实记录的任务、专注、学习与日志数据计算。",
    },
    ko: {
      title: "성장 히트맵 캘린더 그리드",
      category: "성장 분석",
      whatItDoes:
        "완료한 작업, 집중 스프린트, 학습 활동, 회고, 획득 XP를 Recharts 주간 캘린더 히트맵으로 시각화합니다.",
      whyAndProblem:
        "누적 XP만으로는 파악하기 어려운 주간 학습 리듬과 휴식 공백을 한눈에 확인할 수 있습니다.",
      whoBenefits: "꾸준한 주간 학습 습관을 만들고 시험을 대비하는 학생.",
      steps: [
        "우측 상단에서 4W, 8W, 12W 기간을 전환하세요.",
        "날짜 칸에 마우스를 올려 완료 작업, 집중 시간, XP를 확인하세요.",
        "하단의 적음~많음 범례로 활동 강도를 비교하세요.",
      ],
      options: [
        { label: "4W / 8W / 12W 선택", desc: "표시할 주간 달력 범위를 전환합니다." },
        { label: "일별 상세 툴팁", desc: "해당 날짜의 세부 지표와 활동 점수를 표시합니다." },
      ],
      limitations: "실제로 기록된 작업, 집중 타이머, 학습 및 성찰 기록만 반영됩니다.",
    },
  },
  "girls-space": {
    en: {
      title: "Girls' Space (STEM & Leadership)",
      category: "Community",
      whatItDoes:
        "Provides a welcoming, safe, privacy-protected educational and leadership environment for female students with peer cohorts and mentorship.",
      whyAndProblem:
        "Ensures female students have dedicated, harassment-free study circles to lead STEM research, robotics projects, and Model UN delegations.",
      whoBenefits:
        "Female students pursuing advanced STEM, biomedical sciences, competitive mathematics, and public speaking.",
      steps: [
        "Select your interest track (AI & Robotics, Biomedicine, Mathematics, or Diplomacy).",
        "Browse verified mentorship study cohorts and click 'Request to Join'.",
        "Use 'Ask Moderator Help' at any time for direct, confidential support.",
      ],
      options: [
        {
          label: "4 Empowerment Tracks",
          desc: "AI & Robotics, Biomedical Sciences, Math Mastery, Diplomacy & MUN.",
        },
        {
          label: "Moderator Support",
          desc: "Confidential, one-click escalation to verified female moderators.",
        },
      ],
      limitations:
        "Zero tolerance for harassment or bullying; all peer interactions are strictly moderated.",
    },
    ar: {
      title: "مساحة الفتيات (التميز العلمي والقيادة)",
      category: "المجتمع الطلابي",
      whatItDoes:
        "توفر بيئة تعليمية وقيادية آمنة ومحمية الخصوصية ومرحبة بالطالبات مع حلقات توجيه دراسي وأفرقة بحثية متخصصة.",
      whyAndProblem:
        "تمنح الطالبات فضاءً خالياً من المضايقات والتنمر لقيادة مشاريع الذكاء الاصطناعي، والعلوم الطبية، والأولمبياد العلمي، ونموذج الأمم المتحدة.",
      whoBenefits: "طالبات المدارس والجامعات الراغبات في التفوق في مجالات STEM والقيادة الطلابية.",
      steps: [
        "اختاري المسار العلمي المطلوب (الذكاء الاصطناعي، العلوم الطبية، الرياضيات، أو الدبلوماسية).",
        "تصفحي الحلقات الدراسية المعتمدة واضغطي 'طلب الانضمام للحلقة الآمنة'.",
        "استخدمي زر 'طلب مساعدة المشرفات' في أي وقت للحصول على دعم مباشر وسري.",
      ],
      options: [
        {
          label: "٤ مسارات تمكين",
          desc: "الروبوتات والذكاء الاصطناعي، العلوم الطبية، التفكير الرياضي، القيادة والدبلوماسية.",
        },
        {
          label: "دعم المشرفات",
          desc: "إمكانية التواصل الفوري والسري مع مشرفات المنصة المعتمدات.",
        },
      ],
      limitations:
        "سياسة عدم تسامح مطلق مع التنمر أو المضايقة؛ تتم مراجعة الأنشطة دورياً لضمان سلامة الجميع.",
    },
    ja: {
      title: "ガールズスペース（STEM・リーダーシップ）",
      category: "コミュニティ",
      whatItDoes:
        "女子学生が安心して参加できる、プライバシー保護された学習・リーダーシップ環境とメンターシップを提供します。",
      whyAndProblem:
        "ハラスメントのない環境で、STEM研究やロボティクス、模擬国連などのプロジェクトを主導できるよう支援します。",
      whoBenefits: "STEM、生命科学、数学、パブリックスピーキングに取り組む女子学生。",
      steps: [
        "関心のあるトラック（AI・ロボティクス、生命科学、数学、外交）を選択します。",
        "認定されたメンターシップ学習コホートを閲覧し、参加をリクエストします。",
        "サポートが必要な場合はいつでも「モデレーターに相談」を利用できます。",
      ],
      options: [
        {
          label: "4つのエンパワーメントトラック",
          desc: "AI・ロボティクス、生命科学、数学、外交・模擬国連。",
        },
        {
          label: "モデレーターサポート",
          desc: "認定モデレーターへのワンクリック個別相談。",
        },
      ],
      limitations: "いじめやハラスメントは一切許容されず、すべての交流は厳格にモデレートされます。",
    },
    fr: {
      title: "Espace Filles (STEM & Leadership)",
      category: "Communauté",
      whatItDoes:
        "Offre un environnement éducatif et de leadership sûr, bienveillant et respectueux de la vie privée pour les étudiantes.",
      whyAndProblem:
        "Garantit aux étudiantes des cercles d'étude dédiés, sans harcèlement, pour mener des projets STEM, de robotique et de Modèle des Nations Unies.",
      whoBenefits:
        "Étudiantes engagées en STEM, sciences biomédicales, mathématiques et éloquence.",
      steps: [
        "Sélectionnez votre parcours (IA & Robotique, Biomédecine, Mathématiques ou Diplomatie).",
        "Parcourez les cohortes de mentorat vérifiées et cliquez sur « Demander à rejoindre ».",
        "Utilisez « Demander l'aide d'une modératrice » à tout moment pour un soutien confidentiel.",
      ],
      options: [
        {
          label: "4 parcours d'émancipation",
          desc: "IA & Robotique, Sciences biomédicales, Mathématiques, Diplomatie & MUN.",
        },
        {
          label: "Soutien des modératrices",
          desc: "Escalade confidentielle en un clic vers des modératrices vérifiées.",
        },
      ],
      limitations:
        "Tolérance zéro envers le harcèlement ou l'intimidation ; toutes les interactions sont modérées.",
    },
    de: {
      title: "Girls' Space (MINT & Leadership)",
      category: "Community",
      whatItDoes:
        "Bietet eine sichere, geschützte Lern- und Führungsumgebung für Schülerinnen und Studentinnen mit Mentoring-Gruppen.",
      whyAndProblem:
        "Sorgt für belästigungsfreie Lerngruppen, in denen weibliche Lernende MINT-Forschung, Robotik und Model-UN-Projekte leiten können.",
      whoBenefits: "Schülerinnen und Studentinnen in MINT, Biomedizin, Mathematik und Rhetorik.",
      steps: [
        "Wähle deinen Schwerpunkt (KI & Robotik, Biomedizin, Mathematik oder Diplomatie).",
        "Durchsuche verifizierte Mentoring-Gruppen und klicke auf „Beitritt anfragen“.",
        "Nutze jederzeit „Moderatorinnen-Hilfe anfordern“ für vertrauliche Unterstützung.",
      ],
      options: [
        {
          label: "4 Förderpfade",
          desc: "KI & Robotik, Biomedizin, Mathematik-Meisterschaft, Diplomatie & MUN.",
        },
        {
          label: "Moderatorinnen-Support",
          desc: "Vertrauliche Ein-Klick-Anfrage an verifizierte Moderatorinnen.",
        },
      ],
      limitations:
        "Null-Toleranz-Politik gegenüber Mobbing und Belästigung; alle Interaktionen werden moderiert.",
    },
    "zh-CN": {
      title: "女生空间（STEM 与领导力）",
      category: "学习社区",
      whatItDoes: "为女生提供安全、注重隐私保护的教育与领导力学习环境，配备同伴学习圈与导师支持。",
      whyAndProblem:
        "确保女生拥有免受骚扰的专属学习空间，自主牵头 STEM 研究、机器人项目及模拟联合国代表团。",
      whoBenefits: "致力于进阶 STEM、生物医学、竞赛数学及公共演讲的女生。",
      steps: [
        "选择你的兴趣方向（AI 与机器人、生物医学、数学或外交）。",
        "浏览经认证的导师学习小组并点击“申请加入”。",
        "随时点击“请求管理员协助”获取一对一保密支持。",
      ],
      options: [
        {
          label: "4 大赋能方向",
          desc: "AI 与机器人、生物医学、数学精进、外交与模联。",
        },
        {
          label: "管理员支持",
          desc: "一键保密联系经认证的女性管理员。",
        },
      ],
      limitations: "对任何欺凌或骚扰零容忍；所有同伴互动均受严格审核。",
    },
    ko: {
      title: "걸스 스페이스 (STEM & 리더십)",
      category: "커뮤니티",
      whatItDoes:
        "여학생들을 위해 안전하고 프라이버시가 보호되는 교육·리더십 환경과 멘토링 학습 그룹을 제공합니다.",
      whyAndProblem:
        "괴롭힘 없는 전용 스터디 서클에서 여학생들이 STEM 연구, 로보틱스, 모의유엔 프로젝트를 주도할 수 있도록 돕습니다.",
      whoBenefits: "심화 STEM, 의생명과학, 수학, 스피치에 도전하는 여학생.",
      steps: [
        "관심 트랙(AI 및 로보틱스, 의생명과학, 수학, 외교)을 선택하세요.",
        "검증된 멘토링 학습 코호트를 살펴보고 '가입 요청'을 누르세요.",
        "비공개 지원이 필요할 때는 언제든 '관리자 도움 요청'을 사용하세요.",
      ],
      options: [
        {
          label: "4가지 역량 강화 트랙",
          desc: "AI·로보틱스, 의생명과학, 수학 마스터, 외교·MUN.",
        },
        {
          label: "관리자 지원",
          desc: "검증된 여성 관리자에게 원클릭 비공개 지원 요청.",
        },
      ],
      limitations:
        "괴롭힘이나 따돌림에 대해 무관용 원칙을 적용하며 모든 상호작용을 엄격히 관리합니다.",
    },
  },
};
