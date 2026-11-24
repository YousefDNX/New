import type { FeatureGuideEntry } from "./types";

export const ECO_GUIDES_A: Record<string, FeatureGuideEntry> = {
  "ai-tutor": {
    en: {
      title: "AI Study Tutor & Concept Coach",
      category: "AI Intelligence",
      whatItDoes:
        "Answers academic questions step by step in Direct or Socratic mode, supports web search grounding, and converts responses into Tasks or Flashcards.",
      whyAndProblem:
        "Provides 24/7 guided tutoring focused on genuine understanding rather than instant answer dumping.",
      whoBenefits: "Students stuck on homework concepts, exam prep, or essay structuring.",
      steps: [
        "Select your subject and toggle Direct vs. Socratic tutor mode.",
        "Optionally turn on Google Search Grounding for live verified references.",
        "Convert useful explanations directly into flashcards or tasks.",
      ],
      options: [
        {
          label: "Socratic vs Direct Mode",
          desc: "Either guides with probing hints or gives structured steps.",
        },
        {
          label: "Convert to Task / Card",
          desc: "Saves AI proposals straight to your study library.",
        },
      ],
      limitations:
        "Requires server-side GEMINI_API_KEY configuration; without it the status pill notifies you.",
    },
    ar: {
      title: "مدرس ومعلم الذكاء الاصطناعي",
      category: "الذكاء الاصطناعي",
      whatItDoes:
        "يشرح المفاهيم خطوة بخطوة في الوضع المباشر أو السقراطي مع توثيق المصادر وتحويل الشرح إلى بطاقات ومهام.",
      whyAndProblem: "يوفر معلماً شخصياً على مدار الساعة يركز على الفهم الحقيقي لا النسخ السريع.",
      whoBenefits: "الطلاب المحتاجون لمساعدة فورية في الواجبات أو فهم الدروس الصعبة.",
      steps: [
        "اختر المادة وأسلوب المعلم (مباشر أو سقراطي).",
        "فعّل توثيق البحث عند الحاجة لمصادر حديثة.",
        "حوّل مخرجات المحادثة إلى بطاقة أو مهمة دراسة.",
      ],
      options: [
        { label: "الوضع السقراطي", desc: "يوجهك بالأسئلة للتفكير والوصول للحل بنفسك." },
        { label: "التحويل لمهمة أو بطاقة", desc: "يحفظ الفكرة فوراً في مكتبتك الدراسية." },
      ],
      limitations: "يتطلب إعداد مفتاح GEMINI_API_KEY على الخادم للعمل.",
    },
    ja: {
      title: "AI学習チューター＆コーチ",
      category: "AIインテリジェンス",
      whatItDoes:
        "直接解説またはソクラテス式問答で疑問を解説し、検索グラウンディングやタスク/カード変換に対応します。",
      whyAndProblem: "答えの丸写しではなく本質的な理解を促す24時間メンターを提供します。",
      whoBenefits: "課題の解き方や試験範囲の理解を深めたい学生。",
      steps: [
        "教科とモード（Direct / Socratic）を選んで質問を入力します。",
        "有用な回答はワンクリックでカードやタスクへ保存できます。",
      ],
      options: [{ label: "Web検索グラウンディング", desc: "参照ソース付きで回答精度を高めます。" }],
      limitations: "利用にはサーバー側の GEMINI_API_KEY 設定が必要です。",
    },
    fr: {
      title: "Tuteur d'Étude IA",
      category: "Intelligence IA",
      whatItDoes:
        "Explique vos cours étape par étape en mode Direct ou Socratique avec sources web et création de tâches/cartes.",
      whyAndProblem: "Offre un accompagnement pédagogique centré sur la compréhension réelle.",
      whoBenefits: "Étudiants bloqués sur un devoir ou préparant un examen.",
      steps: [
        "Choisissez matière et mode, posez votre question puis transformez la réponse en carte.",
      ],
      options: [
        { label: "Mode Socratique & Sources", desc: "Guide par questions et vérifie les sources." },
      ],
      limitations: "Requiert la configuration serveur de GEMINI_API_KEY.",
    },
    de: {
      title: "KI-Lerntutor & Coach",
      category: "KI-Intelligenz",
      whatItDoes:
        "Erklärt Themen im Direkt- oder Sokrates-Modus samt Web-Quellen und Aufgaben-/Karten-Export.",
      whyAndProblem: "Fördert echtes Verständnis statt bloßem Abschreiben.",
      whoBenefits: "Lernende mit Fragen bei Hausaufgaben oder Klausurstoff.",
      steps: ["Fach und Modus wählen, Frage senden und Ergebnisse als Lernkarten sichern."],
      options: [{ label: "Sokrates-Modus & Quellen", desc: "Führt schrittweise zur Lösung." }],
      limitations: "Erfordert serverseitig konfigurierten GEMINI_API_KEY.",
    },
    "zh-CN": {
      title: "AI 学习导师与解题教练",
      category: "AI 智能",
      whatItDoes:
        "提供直答或苏格拉底启发式分步讲解，支持联网搜索引证，并可一键将回复转为任务或记忆卡。",
      whyAndProblem: "避免直接抄答案，通过 24 小时陪伴式提问培养独立思考能力。",
      whoBenefits: "写作业卡壳或梳理复杂知识点的学生。",
      steps: [
        "选定学科和辅导模式，输入问题或粘贴题目文本。",
        "根据需要开启联网验证，并将要点保存为记忆卡或任务。",
      ],
      options: [{ label: "苏格拉底引导与转换", desc: "支持一步步追问提示并保存产物。" }],
      limitations: "需在服务端配置有效的 GEMINI_API_KEY 方可使用实时对话。",
    },
    ko: {
      title: "AI 학습 튜터 및 코치",
      category: "AI 인텔리전스",
      whatItDoes:
        "직접 설명 또는 소크라테스식 질문 모드로 단계별 해설을 제공하며 검색 근거와 카드·과제 변환을 지원합니다.",
      whyAndProblem: "정답 베끼기가 아닌 근본적 개념 이해 중심의 24시간 개인 튜터를 제공합니다.",
      whoBenefits: "과제 풀이나 개념 정리에 도움이 필요한 모든 학생.",
      steps: [
        "과목과 튜터 모드를 고르고 질문을 입력하세요.",
        "유용한 답변은 바로 플래시카드나 학습 과제로 저장할 수 있습니다.",
      ],
      options: [
        {
          label: "소크라테스 모드 & 검색 근거",
          desc: "사고 과정을 유도하고 신뢰 출처를 표기합니다.",
        },
      ],
      limitations: "서버 측 GEMINI_API_KEY 환경 변수가 설정되어 있어야 동작합니다.",
    },
  },
  "ai-audio-transcribe": {
    en: {
      title: "Audio Lecture Transcriber",
      category: "AI Intelligence",
      whatItDoes:
        "Records microphone audio or processes uploaded audio clips to transcribe spoken lectures into editable study text.",
      whyAndProblem: "Saves time manually typing long spoken explanations or voice memos.",
      whoBenefits: "Auditory note-takers and students reviewing recorded study discussions.",
      steps: [
        "Open Transcribe Audio inside AI Hub or Study Notes.",
        "Record via microphone or select an audio file, then click Transcribe.",
        "Insert or copy the transcript directly into your notes.",
      ],
      options: [
        { label: "Mic / File Input", desc: "Supports live recording or uploading audio snippets." },
      ],
      limitations:
        "Requires microphone permission and configured server-side AI transcription endpoint.",
    },
    ar: {
      title: "مفرّغ الصوتيات والمحاضرات",
      category: "الذكاء الاصطناعي",
      whatItDoes: "يسجل من الميكروفون أو يعالج ملفاً صوتياً لتحويل الكلام إلى نص دراسي قابل للتحرير.",
      whyAndProblem: "يوفر وقت كتابة الشروحات الشفهية والملاحظات الصوتية يدوياً.",
      whoBenefits: "الطلاب المتعلمون سمعياً أو من يسجلون ملخصاتهم صوتياً.",
      steps: [
        "افتح أداة تفريغ الصوت في مركز الذكاء الاصطناعي أو الملاحظات.",
        "سجّل صوتك أو ارفع ملفاً واضغط تحويل ثم انسخ النص.",
      ],
      options: [{ label: "إدخال صوتي / ملف", desc: "يدعم الميكروفون ورفع المقاطع القصيرة." }],
      limitations: "يتطلب إذن الميكروفون وتفعيل خدمة الذكاء الاصطناعي على الخادم.",
    },
    ja: {
      title: "音声講義文字起こし",
      category: "AIインテリジェンス",
      whatItDoes: "マイク録音または音声ファイルをテキスト化し、そのまま学習ノートへ取り込めます。",
      whyAndProblem: "口頭説明や音声メモを手入力する手間を削減します。",
      whoBenefits: "音声メモからノートを作成したい学生。",
      steps: ["録音またはファイルを選択して文字起こしを実行し、結果をコピーします。"],
      options: [
        { label: "マイク＆ファイル対応", desc: "録音と音声ファイル双方をテキスト化します。" },
      ],
      limitations: "マイク権限およびAIバックエンド設定が必要です。",
    },
    fr: {
      title: "Transcripteur Audio de Cours",
      category: "Intelligence IA",
      whatItDoes: "Enregistre au micro ou traite un fichier audio pour produire un texte éditable.",
      whyAndProblem: "Évite la saisie manuelle des explications orales.",
      whoBenefits: "Étudiants prenant des notes audio.",
      steps: ["Enregistrez ou importez un extrait puis copiez la transcription dans vos notes."],
      options: [{ label: "Micro ou fichier", desc: "Transcrit facilement les mémos vocaux." }],
      limitations: "Nécessite l'accès au micro et la configuration IA serveur.",
    },
    de: {
      title: "Audio-Transkription",
      category: "KI-Intelligenz",
      whatItDoes: "Nimmt Sprache auf oder verarbeitet Audiodateien in bearbeitbaren Lerntext.",
      whyAndProblem: "Spart zeitraubendes Abtippen gesprochener Notizen.",
      whoBenefits: "Auditive Lerner und Studierende mit Sprachmemos.",
      steps: ["Mikrofonaufnahme starten oder Datei hochladen und Text übernehmen."],
      options: [{ label: "Aufnahme & Upload", desc: "Wandelt gesprochene Erklärungen in Text." }],
      limitations: "Erfordert Mikrofonberechtigung und konfigurierte KI-API.",
    },
    "zh-CN": {
      title: "语音讲座与口述转录助手",
      category: "AI 智能",
      whatItDoes: "支持麦克风录音或上传音频片段，将口述内容转写为可编辑的复习文字。",
      whyAndProblem: "省去手动整理录音或口头灵感的繁琐打字过程。",
      whoBenefits: "习惯口述复习要点或整理录音的学生。",
      steps: ["在 AI 中心或笔记工具栏打开语音转录，录音或选文件后提取正文。"],
      options: [{ label: "录音与文件双入口", desc: "一键转出文本方便存笔记。" }],
      limitations: "需授权浏览器麦克风并配置服务端 AI 转录接口。",
    },
    ko: {
      title: "강의 음성 텍스트 받아쓰기",
      category: "AI 인텔리전스",
      whatItDoes:
        "마이크 녹음 또는 오디오 파일을 업로드해 학습 노트로 편집 가능한 텍스트로 변환합니다.",
      whyAndProblem: "음성 메모나 구두 설명을 손으로 타이핑하는 시간을 줄여줍니다.",
      whoBenefits: "청각 중심 학습자 및 음성 메모를 자주 활용하는 학생.",
      steps: ["녹음을 진행하거나 파일을 선택한 뒤 변환된 텍스트를 노트에 넣으세요."],
      options: [
        { label: "마이크 및 파일 입력", desc: "실시간 녹음과 파일 업로드를 모두 지원합니다." },
      ],
      limitations: "마이크 권한 및 서버 AI 설정이 필요합니다.",
    },
  },
  "ai-visual-aid": {
    en: {
      title: "Visual Aid & Diagram Studio",
      category: "AI Intelligence",
      whatItDoes:
        "Generates clean educational illustrations, concept diagrams, or study visuals from a topic prompt.",
      whyAndProblem:
        "Helps visual learners picture biological, physical, or historical systems quickly.",
      whoBenefits: "Students creating presentation visuals, posters, or concept maps.",
      steps: [
        "Enter the concept or diagram prompt you want visualized.",
        "Generate the image, inspect it, and download or embed into notes/circle.",
      ],
      options: [{ label: "Diagram Prompt & Style", desc: "Produces clean educational graphics." }],
      limitations: "Requires live server-side Gemini image generation quota and API key.",
    },
    ar: {
      title: "استوديو الوسائل البصرية والرسوم",
      category: "الذكاء الاصطناعي",
      whatItDoes: "ينشئ رسوماً تعليمية ومخططات توضيحية لمفاهيم العلوم والدراسة انطلاقاً من وصف نصي.",
      whyAndProblem: "يساعد المتعلمين بصرياً على تخيل الأنظمة العلمية وتجهيز شرائح العرض.",
      whoBenefits: "الطلاب المعدّون للملصقات أو العروض أو البطاقات البصرية.",
      steps: ["اكتب وصف الرسم المطلوب واضغط توليد ثم احفظ الصورة."],
      options: [{ label: "موجه الرسم التعليمي", desc: "يصمم صوراً مبسطة مناسبة للمذاكرة." }],
      limitations: "يعتمد التوليد على توفر مفتاح API وحصة التوليد على الخادم.",
    },
    ja: {
      title: "ビジュアルエイド生成スタジオ",
      category: "AIインテリジェンス",
      whatItDoes:
        "プロンプトから学習用の概念図・イラストを生成してノートや発表資料に活用できます。",
      whyAndProblem: "文章だけでは掴みにくい仕組みを図像化して理解を助けます。",
      whoBenefits: "視覚的理解を深めたい学生や発表資料作成者。",
      steps: ["図解したいテーマを入力して生成し、保存します。"],
      options: [{ label: "図解プロンプト", desc: "教育向けのクリアなビジュアルを生成します。" }],
      limitations: "サーバー側AI画像生成APIの設定・利用枠が必要です。",
    },
    fr: {
      title: "Studio Visuel & Schémas IA",
      category: "Intelligence IA",
      whatItDoes:
        "Génère des illustrations pédagogiques et schémas conceptuels à partir d'une description.",
      whyAndProblem: "Aide les apprenants visuels à représenter des systèmes complexes.",
      whoBenefits: "Étudiants préparant exposés ou fiches illustrées.",
      steps: ["Décrivez le concept à illustrer puis lancez la génération."],
      options: [{ label: "Générateur de schémas", desc: "Produit des visuels adaptés à l'étude." }],
      limitations: "Dépend de la clé API et du quota image côté serveur.",
    },
    de: {
      title: "Visual Aid & Diagramm-Studio",
      category: "KI-Intelligenz",
      whatItDoes:
        "Erstellt anschauliche Lernillustrationen und Konzeptgrafiken aus Textbeschreibungen.",
      whyAndProblem: "Unterstützt visuelles Lernen bei komplexen Systemen.",
      whoBenefits: "Lernende für Referate, Plakate oder Lernzettel.",
      steps: ["Themenprompt eingeben, Grafik erzeugen und herunterladen."],
      options: [{ label: "Grafik-Generator", desc: "Erstellt verständliche Lernbilder." }],
      limitations: "Erfordert aktiven Bildgenerierungs-API-Zugang auf dem Server.",
    },
    "zh-CN": {
      title: "视觉图解生成工作室",
      category: "AI 智能",
      whatItDoes: "根据主题描述一键生成清晰的教学插图与概念视觉辅助图片。",
      whyAndProblem: "帮助视觉型学习者快速理解结构系统，或制作展示海报素材。",
      whoBenefits: "制作汇报 PPT、笔记配图或概念地图的学生。",
      steps: ["输入希望可视化的概念提示词，生成后保存或展示。"],
      options: [{ label: "教学插图提示器", desc: "输出简洁明了的教育示意图。" }],
      limitations: "需要服务端已配置生图 API 密钥与额度。",
    },
    ko: {
      title: "시각 자료 및 다이어그램 스튜디오",
      category: "AI 인텔리전스",
      whatItDoes: "입력한 주제 프롬프트를 바탕으로 학습용 개념 삽화와 시각 자료를 생성합니다.",
      whyAndProblem: "글로만 읽기 어려운 원리를 그림으로 직관화해 줍니다.",
      whoBenefits: "발표 슬라이드, 포스터, 시각 요약을 만드는 학생.",
      steps: ["시각화하고 싶은 개념을 입력해 생성하고 저장하세요."],
      options: [{ label: "교육용 이미지 생성", desc: "학습에 적합한 시각 이미지를 제작합니다." }],
      limitations: "서버 측 Gemini 이미지 API 키 및 할당량이 필요합니다.",
    },
  },
  "ai-voice-drawer": {
    en: {
      title: "Hands-Free Voice Conversation Tutor",
      category: "AI Intelligence",
      whatItDoes:
        "Enables spoken dialogue with the AI tutor using microphone speech recognition and spoken voice responses.",
      whyAndProblem:
        "Allows verbal language practice or hands-free revision when eyes need rest from typing.",
      whoBenefits: "Language learners, auditory students, and learners using voice accessibility.",
      steps: [
        "Open the Voice button in AI Hub.",
        "Speak a question using microphone capture and listen to the spoken reply.",
      ],
      options: [
        { label: "Speech In / Voice Out", desc: "Pairs dictation with read-aloud responses." },
      ],
      limitations:
        "Web Speech Recognition availability varies by browser (best in Chromium/Edge/Safari).",
    },
    ar: {
      title: "المحادثة الصوتية مع المعلم الذكي",
      category: "الذكاء الاصطناعي",
      whatItDoes: "يتيح حواراً صوتياً مباشراً مع المدرس الذكي باستخدام الميكروفون والرد المنطوق.",
      whyAndProblem: "يدعم تدريب النطق والمحادثة والمراجعة بدون الحاجة للكتابة المستمرة.",
      whoBenefits: "متعلمو اللغات ومن يفضلون التفاعل الصوتي وإمكانية الوصول.",
      steps: ["افتح درج المحادثة الصوتية، تحدّث بسؤالك، واستمع للرد."],
      options: [{ label: "تفاعل صوتي ثنائي", desc: "يجمع بين إملاء الصوت وقراءة الإجابة." }],
      limitations: "دعم التعرف الصوتي يختلف حسب المتصفح وإذن الميكروفون.",
    },
    ja: {
      title: "ハンズフリー音声対話チューター",
      category: "AIインテリジェンス",
      whatItDoes: "マイク音声認識と音声読み上げでAIチューターと対話できます。",
      whyAndProblem: "語学のスピーキング練習や画面に疲れたときの耳学を支援します。",
      whoBenefits: "語学学習者や音声アクセシビリティを利用する学生。",
      steps: ["AIハブの音声ボタンを開き、話しかけて音声応答を聴きます。"],
      options: [{ label: "音声入出力対話", desc: "発話入力と読み上げを組み合わせます。" }],
      limitations: "Web音声認識の対応状況はブラウザによって異なります。",
    },
    fr: {
      title: "Dialogue Vocal avec le Tuteur IA",
      category: "Intelligence IA",
      whatItDoes:
        "Permet un échange oral mains libres via reconnaissance vocale et synthèse parlée.",
      whyAndProblem: "Facilite la pratique orale des langues et la révision auditive.",
      whoBenefits: "Apprenants en langues et utilisateurs vocaux.",
      steps: ["Ouvrez le tiroir vocal, dictez votre question et écoutez la réponse."],
      options: [{ label: "Entrée & Sortie vocale", desc: "Combine dictée et lecture vocale." }],
      limitations: "La reconnaissance vocale dépend du navigateur utilisé.",
    },
    de: {
      title: "Freihändiger Sprach-Tutor",
      category: "KI-Intelligenz",
      whatItDoes: "Ermöglicht gesprochene Dialoge mit dem KI-Tutor per Mikrofon und Sprachausgabe.",
      whyAndProblem: "Ideal für Aussprachetraining oder bildschirmschonendes Wiederholen.",
      whoBenefits: "Sprachlernende und auditive Typen.",
      steps: ["Sprach-Drawer öffnen, Frage einsprechen und Antwort anhören."],
      options: [{ label: "Sprachein-/-ausgabe", desc: "Verbindet Diktat mit Vorlesefunktion." }],
      limitations: "Verfügbarkeit der Spracherkennung ist browserabhängig.",
    },
    "zh-CN": {
      title: "AI 语音对话伴学抽屉",
      category: "AI 智能",
      whatItDoes: "通过语音识别提问与语音朗读回复，与 AI 导师进行免打字口语交互。",
      whyAndProblem: "方便练口语或在用眼疲劳时纯语音梳理思路。",
      whoBenefits: "语言学习者及需要语音辅助的学生。",
      steps: ["在 AI 中心点击语音按钮，开启麦克风提问并听取回答。"],
      options: [{ label: "语音听写与朗读", desc: "支持双向语音沟通。" }],
      limitations: "浏览器的 Web Speech API 支持程度因内核而异。",
    },
    ko: {
      title: "음성 대화 AI 튜터",
      category: "AI 인텔리전스",
      whatItDoes: "마이크 음성 인식과 음성 합성 응답을 통해 손대지 않고 AI와 대화합니다.",
      whyAndProblem: "외국어 말하기 연습과 시각 피로가 덜한 음성 학습을 지원합니다.",
      whoBenefits: "회화 연습자 및 음성 접근성 기능이 필요한 학생.",
      steps: ["음성 드로어를 열고 질문한 뒤 AI의 음성 답변을 들어보세요."],
      options: [{ label: "음성 입출력 대화", desc: "받아쓰기와 읽어주기를 결합합니다." }],
      limitations: "브라우저에 따라 Web Speech API 지원 여부가 다를 수 있습니다.",
    },
  },
  "ai-transparency": {
    en: {
      title: "AI Transparency & Privacy Control Drawer",
      category: "AI Safety",
      whatItDoes:
        "Displays clearly what profile/task/growth signals are shared with the AI model, lets you pause context sharing, and inspects active AI configuration.",
      whyAndProblem:
        "Ensures students understand and consent to how their context is handled inside AI features.",
      whoBenefits: "Privacy-conscious students and families reviewing AI behavior.",
      steps: [
        "Open AI Transparency in the AI Hub toolbar.",
        "Review active context toggles (Profile, Tasks, Growth) and adjust preferences.",
      ],
      options: [
        {
          label: "Context Sharing Summary",
          desc: "Mirrors and explains your exact AI privacy toggles.",
        },
      ],
      limitations: "Adjusting permanent defaults redirects to Settings > AI.",
    },
    ar: {
      title: "لوحة شفافية الذكاء الاصطناعي والخصوصية",
      category: "أمان الذكاء الاصطناعي",
      whatItDoes:
        "تعرض بوضوح ما البيانات (الملف، المهام، النمو) التي تُشارك مع النموذج وتتيح التحكم بها.",
      whyAndProblem: "تضمن وعي الطالب وموافقته الكاملة على كيفية استخدام سياقه الشخصي.",
      whoBenefits: "الطلاب وأولياء الأمور المهتمون بخصوصية البيانات.",
      steps: ["افتح زر الشفافية في أعلى مركز الذكاء الاصطناعي لمراجعة البيانات المشتركة."],
      options: [{ label: "ملخص مشاركة السياق", desc: "يوضح كل إشارة متاحة للنموذج حالياً." }],
      limitations: "تعديل الخيارات الدائمة يتم عبر الإعدادات > الذكاء الاصطناعي.",
    },
    ja: {
      title: "AI透明性＆プライバシー管理パネル",
      category: "AI安全性",
      whatItDoes: "プロフィール・タスク・成長データのうち何がAIに共有されているかを可視化します。",
      whyAndProblem: "AIが参照するコンテキストを透明化し、安心して学習に使えるようにします。",
      whoBenefits: "プライバシー設定を把握したい学生・保護者。",
      steps: ["AIハブの透明性ボタンから現在の共有状況を確認します。"],
      options: [{ label: "コンテキスト共有確認", desc: "有効な共有フラグを一覧表示します。" }],
      limitations: "恒久的な共有設定の変更は「設定 > AI」で行います。",
    },
    fr: {
      title: "Panneau de Transparence & Vie Privée IA",
      category: "Sécurité IA",
      whatItDoes:
        "Affiche exactement quelles informations (profil, tâches, croissance) sont transmises au tuteur IA.",
      whyAndProblem: "Garantit contrôle et transparence sur l'usage de vos données.",
      whoBenefits: "Étudiants et familles soucieux de confidentialité.",
      steps: ["Ouvrez le panneau Transparence dans l'espace IA pour inspecter les autorisations."],
      options: [{ label: "Audit de contexte", desc: "Détaille les données partagées en session." }],
      limitations: "Les réglages permanents s'ajustent dans Paramètres > IA.",
    },
    de: {
      title: "KI-Transparenz & Datenschutz",
      category: "KI-Sicherheit",
      whatItDoes:
        "Zeigt transparent an, welche Profil-, Aufgaben- und Lerninfos an die KI weitergegeben werden.",
      whyAndProblem: "Stärkt Kontrolle und Vertrauen in KI-Funktionen.",
      whoBenefits: "Datenschutzbewusste Lernende.",
      steps: ["Transparenz-Panel im KI-Hub öffnen und aktive Freigaben prüfen."],
      options: [{ label: "Kontext-Übersicht", desc: "Erklärt aktive KI-Datenquellen." }],
      limitations: "Dauerhafte Änderungen erfolgen unter Einstellungen > KI.",
    },
    "zh-CN": {
      title: "AI 透明性与上下文隐私面板",
      category: "AI 安全",
      whatItDoes: "清晰展示当前有哪些个人画像、任务或成长信号传给了 AI 模型。",
      whyAndProblem: "保障学生对个人学习数据使用方式的知情权与掌控权。",
      whoBenefits: "关注数据安全与隐私边界的同学和家长。",
      steps: ["点击 AI 中心顶栏透明度按钮查看实时共享清单。"],
      options: [{ label: "共享信号明细", desc: "核对资料、任务、进度分享开关状态。" }],
      limitations: "永久默认配置需前往 设置 > AI 中更改。",
    },
    ko: {
      title: "AI 투명성 및 프라이버시 패널",
      category: "AI 안전",
      whatItDoes: "프로필·할 일·성장 데이터 중 AI 모델에 전달되는 항목을 투명하게 보여줍니다.",
      whyAndProblem: "학생 스스로 개인 학습 맥락이 어떻게 활용되는지 확인하고 통제할 수 있습니다.",
      whoBenefits: "데이터 투명성과 개인정보 보호를 중시하는 학생·학부모.",
      steps: ["AI 허브 상단의 투명성 버튼을 눌러 현재 공유 상태를 점검하세요."],
      options: [{ label: "공유 컨텍스트 요약", desc: "활성화된 공유 범위를 명확히 안내합니다." }],
      limitations: "영구 설정 변경은 설정 > AI 탭에서 진행합니다.",
    },
  },
  "tasks-planner": {
    en: {
      title: "Academic Tasks Planner & Priority Matrix",
      category: "Productivity",
      whatItDoes:
        "Creates tasks with priority flags, growth domain tags, recurrence rules, due dates, checklist subtasks, and lets you switch between List and Eisenhower Matrix views.",
      whyAndProblem:
        "Prevents missed homework and balances urgent vs. important study assignments.",
      whoBenefits:
        "Students managing multiple deadlines and breaking big assignments into small subtasks.",
      steps: [
        "Fill task title, priority, due date, and optional daily/weekly recurrence.",
        "Switch between List View and 2x2 Matrix View.",
        "Add checklist subtasks inside any task and check them off for XP.",
      ],
      options: [
        {
          label: "List vs Priority Matrix",
          desc: "Organizes tasks chronologically or by urgency/importance.",
        },
        {
          label: "Checklist Subtasks",
          desc: "Breaks multi-part projects into trackable micro-steps.",
        },
      ],
      limitations: "Overdue highlights depend on accurate system clock and due dates.",
    },
    ar: {
      title: "مخطط المهام الدراسية ومصفوفة الأولويات",
      category: "الإنتاجية",
      whatItDoes:
        "ينشئ المهام بأولوياتها وتواريخها وتكرارها وقوائم المهام الفرعية مع التبديل بين العرض القائمي ومصفوفة أيزنهاور.",
      whyAndProblem: "يمنع نسيان الواجبات ويساعد في ترتيب المهام العاجلة والمهمة.",
      whoBenefits: "الطلاب الذين يديرون واجبات متعددة ومشاريع مقسمة لخطوات.",
      steps: [
        "أضف المهمة مع الأولوية والتاريخ أو التكرار.",
        "بدّل بين عرض القائمة والمصفوفة وأضف مهاماً فرعية للمتابعة.",
      ],
      options: [
        { label: "عرض المصفوفة", desc: "يصنف المهام حسب الأهمية والاستعجال." },
        { label: "المهام الفرعية", desc: "يقسم الواجب الكبير إلى خطوات قابلة للتحديد." },
      ],
      limitations: "تنبيهات التأخر تعتمد على تاريخ الجهاز والمنطقة الزمنية.",
    },
    ja: {
      title: "課題プランナー＆優先度マトリックス",
      category: "生産性",
      whatItDoes:
        "優先度・期限・繰り返し・サブタスク付きの課題管理に加え、リスト表示とアイゼンハワーマトリックス切替を提供します。",
      whyAndProblem: "提出漏れを防ぎ、緊急かつ重要な課題を見極めます。",
      whoBenefits: "複数教科の課題や試験準備を管理する学生。",
      steps: ["課題と優先度・期限を入力して登録し、サブタスクで細分化します。"],
      options: [{ label: "リスト／マトリックス切替", desc: "緊急度と重要度で整理できます。" }],
      limitations: "期限警告は端末の時刻設定に準拠します。",
    },
    fr: {
      title: "Planificateur de Tâches & Matrice",
      category: "Productivité",
      whatItDoes:
        "Gère devoirs avec priorité, récurrence, sous-tâches et vue Liste / Matrice d'Eisenhower.",
      whyAndProblem: "Évite les oublis de devoirs et hiérarchise les urgences.",
      whoBenefits: "Étudiants gérant plusieurs échéances simultanées.",
      steps: ["Créez la tâche, ajoutez des sous-tâches et basculez vers la Matrice au besoin."],
      options: [{ label: "Matrice & Sous-tâches", desc: "Découpe les projets en étapes simples." }],
      limitations: "Les alertes de retard dépendent de la date système.",
    },
    de: {
      title: "Aufgabenplaner & Prioritäten-Matrix",
      category: "Produktivität",
      whatItDoes:
        "Verwaltet Aufgaben mit Priorität, Fälligkeit, Wiederholung, Teilaufgaben sowie Listen- und Matrix-Ansicht.",
      whyAndProblem: "Verhindert verpasste Abgaben und schafft klare Prioritäten.",
      whoBenefits: "Lernende mit parallelen Hausaufgaben und Projekten.",
      steps: ["Aufgabe anlegen, Teilaufgaben ergänzen und Ansicht nach Bedarf umschalten."],
      options: [{ label: "Matrix-Ansicht", desc: "Sortiert nach Wichtigkeit und Dringlichkeit." }],
      limitations: "Überfälligkeitsmarkierung richtet sich nach der Systemzeit.",
    },
    "zh-CN": {
      title: "学业任务规划器与四象限矩阵",
      category: "效率管理",
      whatItDoes:
        "支持设置优先级、截止日期、每日/每周重复与拆分子任务，并支持在清单视图和四象限矩阵间切换。",
      whyAndProblem: "杜绝漏交作业，帮助分清重要紧急的学业事务。",
      whoBenefits: "同时跟进多门课程作业与长线项目的学生。",
      steps: ["填写任务及优先级日期，可展开添加子步骤清单。"],
      options: [{ label: "清单 / 四象限切换", desc: "不同视角审视每周工作量。" }],
      limitations: "逾期判定依据设备和系统当前时间。",
    },
    ko: {
      title: "학업 과제 플래너 및 우선순위 매트릭스",
      category: "생산성",
      whatItDoes:
        "우선순위, 마감일, 반복 규칙, 세부 체크리스트를 관리하고 목록 보기와 아이젠하워 매트릭스를 전환할 수 있습니다.",
      whyAndProblem: "과제 누락을 막고 긴급함과 중요도에 따라 시간을 배분하도록 돕습니다.",
      whoBenefits: "여러 마감일과 팀 과제를 병행하는 학생.",
      steps: ["할 일과 마감일을 등록하고 하위 항목을 추가해 단계별로 완료하세요."],
      options: [{ label: "목록 / 매트릭스 전환", desc: "중요도와 긴급도 2x2 보기로 정리합니다." }],
      limitations: "마감 경고는 기기 날짜·시간 설정을 기준으로 합니다.",
    },
  },
  "productivity-calendar": {
    en: {
      title: "Interactive Study Calendar (Gregorian & Hijri)",
      category: "Productivity",
      whatItDoes:
        "Displays monthly tasks, due flashcards, and milestones on an interactive month grid supporting both Gregorian and Hijri dates and ICS calendar export.",
      whyAndProblem:
        "Lets students preview busy exam weeks visually instead of scrolling long flat lists.",
      whoBenefits:
        "Students planning across weekly classes, exams, or dual Gregorian/Hijri schedules.",
      steps: [
        "Browse the month calendar and click any day cell to inspect scheduled items.",
        "Export dates to your phone/calendar app via the ICS download button.",
      ],
      options: [
        {
          label: "Calendar System & ICS Export",
          desc: "Mirrors your Settings calendar preference and exports .ics.",
        },
      ],
      limitations: "Calendar mode (Gregorian/Hijri) follows Settings > Language & Region.",
    },
    ar: {
      title: "التقويم التفاعلي (ميلادي وهجري)",
      category: "الإنتاجية",
      whatItDoes:
        "يعرض مهامك وبطاقاتك المستحقة على تقويم شهري تفاعلي يدعم التاريخ الميلادي والهجري مع تصدير ملف ICS.",
      whyAndProblem: "يمنح رؤية بصرية لأسابيع الضغط والاختبارات بدلاً من القوائم الطويلة.",
      whoBenefits: "الطلاب المنظمون لمواعيدهم الدراسية أو المتابعون للتقويمين.",
      steps: [
        "انقر على أي يوم لاستعراض المهام أو البطاقات المجدولة فيه.",
        "اضغط تصدير ICS لحفظ المواعيد في تقويم هاتفك.",
      ],
      options: [{ label: "التصدير للتقويم (ICS)", desc: "يصدر المهام كتقويم قياسي." }],
      limitations: "يتم التبديل بين الميلادي والهجري من الإعدادات > اللغة والمنطقة.",
    },
    ja: {
      title: "インタラクティブ学習カレンダー",
      category: "生産性",
      whatItDoes:
        "タスクや復習カード期限を月間カレンダー上で視覚化し、グレゴリオ暦/ヒジュラ暦対応とICS書き出しに対応します。",
      whyAndProblem: "忙しい週や試験集中日を一目で把握できます。",
      whoBenefits: "週単位・月単位で計画を立てたい学生。",
      steps: ["日付セルをクリックして予定を確認し、必要に応じてICSファイルで書き出します。"],
      options: [{ label: "ICSエクスポート", desc: "外部カレンダーアプリへ予定を取り込めます。" }],
      limitations: "暦法の設定は言語・地域設定に従います。",
    },
    fr: {
      title: "Calendrier Interactif (Grégorien & Hégirien)",
      category: "Productivité",
      whatItDoes: "Affiche tâches et révisions dues sur une grille mensuelle avec export .ics.",
      whyAndProblem: "Offre une vision globale des semaines chargées.",
      whoBenefits: "Étudiants planifiant examens et rendus.",
      steps: ["Cliquez sur une date pour voir les échéances ou exportez en ICS."],
      options: [{ label: "Export ICS", desc: "Compatible avec vos agendas externes." }],
      limitations: "Le type de calendrier suit Paramètres > Langue et région.",
    },
    de: {
      title: "Interaktiver Lernkalender",
      category: "Produktivität",
      whatItDoes:
        "Zeigt Aufgaben und fällige Karten im Monatsraster inkl. ICS-Export und Gregorianisch/Hijri-Unterstützung.",
      whyAndProblem: "Macht arbeitsreiche Prüfungswochen auf einen Blick erkennbar.",
      whoBenefits: "Lernende mit langfristiger Terminplanung.",
      steps: ["Tag im Kalender anklicken und bei Bedarf als .ics exportieren."],
      options: [{ label: "ICS-Export", desc: "Für externe Kalender-Apps." }],
      limitations: "Kalendersystem folgt den Sprach- und Regionseinstellungen.",
    },
    "zh-CN": {
      title: "交互式学习日历（公历与伊斯兰历）",
      category: "效率管理",
      whatItDoes: "按月历格子呈现任务截止与到期记忆卡，并支持导出 .ics 标准日历文件。",
      whyAndProblem: "一眼看清考试周与作业高峰期。",
      whoBenefits: "需要按周统筹课业进度的学生。",
      steps: ["点击任意日期查看当天待办详情，或导出为日历订阅文件。"],
      options: [{ label: "ICS 导出", desc: "可导入手机或桌面系统日历。" }],
      limitations: "历法显示可在设置 > 语言与区域中切换。",
    },
    ko: {
      title: "인터랙티브 학습 캘린더",
      category: "생산성",
      whatItDoes:
        "월간 달력에서 과제 마감일과 복습 카드를 확인하고 양력/히즈리력 표기 및 .ics 내보내기를 지원합니다.",
      whyAndProblem: "시험 기간이나 마감 집중 주간을 시각적으로 한눈에 파악합니다.",
      whoBenefits: "주간·월간 단위로 일정을 관리하는 학생.",
      steps: ["날짜 칸을 눌러 예정된 일정을 보거나 ICS 버튼으로 외부 달력에 저장하세요."],
      options: [{ label: "ICS 내보내기", desc: "스마트폰·PC 캘린더 앱과 호환됩니다." }],
      limitations: "달력 표기 방식은 설정 > 언어 및 지역을 따릅니다.",
    },
  },
  "productivity-deadlines": {
    en: {
      title: "Upcoming Deadlines & Urgency Queue",
      category: "Productivity",
      whatItDoes:
        "Sorts open tasks with due dates by nearest deadline, flags overdue work, and shows quick completion controls.",
      whyAndProblem: "Prevents buried future due dates from sneaking up undetected.",
      whoBenefits: "Students juggling weekly labs, essays, and scholarship dates.",
      steps: [
        "Open the Deadlines tab inside Productivity to scan sorted due items.",
        "Complete or adjust dates straight from urgency rows.",
      ],
      options: [
        { label: "Overdue & Due-Soon Highlights", desc: "Color-codes missed vs. upcoming dates." },
      ],
      limitations: "Only tasks with a due date set appear in this timeline view.",
    },
    ar: {
      title: "طابور المواعيد النهائية العاجلة",
      category: "الإنتاجية",
      whatItDoes: "يرتب المهام المفتوحة زمنياً حسب أقرب موعد تسليم مع إبراز المتأخر والقريب.",
      whyAndProblem: "يمنع تسلل موعد تسليم مهمة منسية وسط القوائم.",
      whoBenefits: "الطلاب الذين يتابعون مواعيد تسليم متقاربة.",
      steps: ["افتح تبويب المواعيد النهائية لمراجعة المهام المرتبة وتنفيذ العاجل منها."],
      options: [{ label: "تصنيف الاستعجال", desc: "يميز المهام المتأخرة والقريبة لونياً." }],
      limitations: "تظهر هنا فقط المهام التي حُدد لها تاريخ استحقاق.",
    },
    ja: {
      title: "提出期限＆緊急度キュー",
      category: "生産性",
      whatItDoes: "期限付き未完了タスクを締切順に並べ、期限切れと直前案件をハイライトします。",
      whyAndProblem: "締切直前の見落としを未然に防ぎます。",
      whoBenefits: "複数のレポート締切を抱える学生。",
      steps: ["「期限」タブで近い予定から順番に着手・完了します。"],
      options: [{ label: "期限ステータス", desc: "遅延・直近を色分け表示します。" }],
      limitations: "期限日を設定したタスクのみ表示されます。",
    },
    fr: {
      title: "File des Échéances Urgentes",
      category: "Productivité",
      whatItDoes:
        "Trie les tâches ouvertes par date d'échéance la plus proche et signale les retards.",
      whyAndProblem: "Évite qu'une date limite ne passe inaperçue.",
      whoBenefits: "Étudiants gérant dossiers et devoirs datés.",
      steps: ["Consultez l'onglet Échéances pour traiter les priorités par ordre chronologique."],
      options: [
        { label: "Alertes de retard", desc: "Distingue visuellement l'urgent du planifié." },
      ],
      limitations: "Seules les tâches ayant une date limite apparaissent ici.",
    },
    de: {
      title: "Fristen- & Dringlichkeitsliste",
      category: "Produktivität",
      whatItDoes:
        "Sortiert offene Aufgaben chronologisch nach Abgabedatum und markiert Überfälliges.",
      whyAndProblem: "Verhindert vergessene Abgabetermine.",
      whoBenefits: "Lernende mit mehreren Fristen.",
      steps: ["Im Tab Fristen nach Datum sortiert abarbeiten."],
      options: [{ label: "Dringlichkeits-Markierung", desc: "Hebt überfällige Posten hervor." }],
      limitations: "Zeigt nur Aufgaben mit gesetztem Fälligkeitsdatum.",
    },
    "zh-CN": {
      title: "近期截止日与紧急队列",
      category: "效率管理",
      whatItDoes: "按最近到期时间排序展示所有设了日期的未完成任务，高亮已逾期或临近条目。",
      whyAndProblem: "避免远期截止日期在不知不觉中过期。",
      whoBenefits: "同时面对实验报告、论文和截止申请的学生。",
      steps: ["进入效率中心的「截止日期」标签优先清空临近项。"],
      options: [{ label: "逾期预警颜色", desc: "区分已超期与近日到期任务。" }],
      limitations: "仅包含已设置截止日期的任务。",
    },
    ko: {
      title: "마감 임박 대기열",
      category: "생산성",
      whatItDoes:
        "마감일이 지정된 미완료 과제를 가장 가까운 날짜순으로 정렬하고 지연 항목을 강조합니다.",
      whyAndProblem: "목록 아래에 묻힌 과제 마감일을 놓치지 않도록 도와줍니다.",
      whoBenefits: "주간 과제와 공모전·장학금 마감을 관리하는 학생.",
      steps: ["생산성 내 마감 탭에서 임박한 일정부터 처리하세요."],
      options: [{ label: "지연 및 임박 강조", desc: "시각적 색상 코드로 우선순위를 알려줍니다." }],
      limitations: "마감일이 입력된 과제만 이 목록에 표시됩니다.",
    },
  },
};
