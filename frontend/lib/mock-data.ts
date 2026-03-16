export type HomeUpdate = {
  id: number;
  title: string;
  status: string;
  statusColor: string;
  statusBg: string;
  time: string;
  description: string;
  author: string;
  category: string;
  categoryTag: string; // matches HOME_CATEGORIES tabs
  avatarInitial: string;
};

export type HomeFeatured = {
  id: number;
  badge: string;
  label: string;
  readTime: string;
  title: string;
  description: string;
  hostInitial: string;
  hostName: string;
  category: string;
  statusColor: string;
  statusBg: string;
  time: string;
};

export const HOME_FEATURED: HomeFeatured = {
  id: 100,
  badge: "進行中",
  label: "注目",
  readTime: "12分で読める",
  title: "サステナブル都市建築のこれから",
  description:
    "垂直緑化やモジュール工法が、これからの都市生活をどう変えていくのかを紹介します。",
  hostInitial: "H",
  hostName: "ホスト名",
  category: "デザイン",
  statusColor: "#4fc3a1",
  statusBg: "#0d2e22",
  time: "注目プロジェクト",
};

export const HOME_CATEGORIES = ["すべて", "デザイン", "技術", "アート", "音楽", "映像"];

export const HOME_UPDATES: HomeUpdate[] = [
  {
    id: 1,
    title: "現代UI/UXにおける生成AI",
    status: "レビュー中",
    statusColor: "#c9973a",
    statusBg: "#3d2e00",
    time: "2時間前",
    description:
      "デザイナーがニューラルネットワークを活用して、繰り返し発生するレイアウト作業を自動化し、新しい体験を生み出す方法を紹介します...",
    author: "ALEX RIVERA",
    category: "技術",
    categoryTag: "技術",
    avatarInitial: "A",
  },
  {
    id: 2,
    title: "ミニマリズムは余白だけではない",
    status: "完了",
    statusColor: "#4fc3a1",
    statusBg: "#0d2e22",
    time: "5時間前",
    description:
      "ミニマルデザインの思想的なルーツと、情報過多の時代に再評価されている背景をひも解きます...",
    author: "SARAH CHEN",
    category: "デザイン",
    categoryTag: "デザイン",
    avatarInitial: "S",
  },
  {
    id: 3,
    title: "広がるデジタルアート・コレクティブ",
    status: "下書き",
    statusColor: "#aaaaaa",
    statusBg: "#2a2a2a",
    time: "昨日",
    description:
      "コミュニティ主導のアートプロジェクトが、作品の所有のあり方とクリエイター同士の関わり方をどう変えているのかを追います...",
    author: "MARCUS THORNE",
    category: "アート",
    categoryTag: "アート",
    avatarInitial: "M",
  },
  {
    id: 4,
    title: "学生向けハッカソン支援プラットフォーム",
    status: "進行中",
    statusColor: "#4fc3a1",
    statusBg: "#0d2e22",
    time: "昨日",
    description:
      "イベント参加者がチーム募集、進捗共有、メンタリング予約を一つの画面で完結できる支援プラットフォームを設計中です...",
    author: "YUNA PARK",
    category: "技術",
    categoryTag: "技術",
    avatarInitial: "Y",
  },
  {
    id: 5,
    title: "地域映画祭のビジュアルリブランディング",
    status: "レビュー中",
    statusColor: "#c9973a",
    statusBg: "#3d2e00",
    time: "1日前",
    description:
      "ポスター、予告映像、上映スケジュールUIを含む一連のブランド表現を再設計し、来場体験全体を刷新しています...",
    author: "KEI MORITA",
    category: "映像",
    categoryTag: "映像",
    avatarInitial: "K",
  },
  {
    id: 6,
    title: "インディーアーティスト向け配信ダッシュボード",
    status: "下書き",
    statusColor: "#aaaaaa",
    statusBg: "#2a2a2a",
    time: "2日前",
    description:
      "再生数、ファン獲得率、グッズ売上を横断して追える分析ダッシュボードの初期プロトタイプを制作しています...",
    author: "RINA SATO",
    category: "音楽",
    categoryTag: "音楽",
    avatarInitial: "R",
  },
  {
    id: 7,
    title: "クラフト作家のための展示会予約アプリ",
    status: "完了",
    statusColor: "#4fc3a1",
    statusBg: "#0d2e22",
    time: "3日前",
    description:
      "出展管理、来場予約、作品在庫チェックまでをまとめた展示会運営アプリのMVPを完成させました...",
    author: "NAOMI KIM",
    category: "デザイン",
    categoryTag: "デザイン",
    avatarInitial: "N",
  },
  {
    id: 8,
    title: "都市騒音を可視化するサウンドマップ",
    status: "レビュー中",
    statusColor: "#c9973a",
    statusBg: "#3d2e00",
    time: "4日前",
    description:
      "街区ごとの騒音データを収集し、時間帯別の音環境を地図上で体験できるインタラクティブ作品を開発しています...",
    author: "DAICHI ARAI",
    category: "音楽",
    categoryTag: "音楽",
    avatarInitial: "D",
  },
  {
    id: 9,
    title: "文化施設向けアクセシブル案内サイン",
    status: "進行中",
    statusColor: "#4fc3a1",
    statusBg: "#0d2e22",
    time: "5日前",
    description:
      "多言語表記、色覚多様性、車いす導線を考慮した館内サインシステムを自治体向けに提案しています...",
    author: "EMI TAKAHASHI",
    category: "デザイン",
    categoryTag: "デザイン",
    avatarInitial: "E",
  },
];

export type ChatThread = {
  id: number;
  title: string;
  preview: string;
  time: string;
  online: boolean;
  accent: string;
  avatar: string;
};

export const CHAT_THREADS: ChatThread[] = [
  {
    id: 1,
    title: "大輝 佐藤",
    preview: "今夜、軽く仕様合わせしませんか？",
    time: "2分前",
    online: true,
    accent: "#6559ff",
    avatar: "大",
  },
  {
    id: 2,
    title: "Sarah Kim",
    preview: "今日のスタンドアップ、参加できそう？",
    time: "1時間前",
    online: true,
    accent: "#2f68ff",
    avatar: "S",
  },
  {
    id: 3,
    title: "龍之介 田中",
    preview: "修正版をpushしたので時間ある時に見てください。",
    time: "昨日",
    online: false,
    accent: "#ff8a22",
    avatar: "龍",
  },
  {
    id: 4,
    title: "Mike Thompson",
    preview: "あとでDiscordで10分だけ話せる？",
    time: "10月24日",
    online: false,
    accent: "#3d66ff",
    avatar: "M",
  },
  {
    id: 5,
    title: "風花 伊藤",
    preview: "ワイヤーフレーム送ったので確認お願いします。",
    time: "10月20日",
    online: false,
    accent: "#2f4c77",
    avatar: "風",
  },
  {
    id: 6,
    title: "Alice Johnson",
    preview: "PRレビューの件、進捗どうですか？",
    time: "10月18日",
    online: false,
    accent: "#dc4e89",
    avatar: "A",
  },
];

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileProject = {
  name: string;
  meta: string;
  description: string;
  badge: string;
  initial: string;
  accent: string;
  members: string;
};

export type ProfileSummary = {
  name: string;
  handle: string;
  bio: string;
  avatarInitial: string;
};

export const PROFILE_SUMMARY: ProfileSummary = {
  name: "Alex Dev",
  handle: "@alexcodez",
  bio: "フルスタックエンジニア。フィンテックのサイドプロジェクトで協力できるUIデザイナーを募集中。コードとコーヒーが好き☕",
  avatarInitial: "A",
};

export const PROFILE_STATS: ProfileStat[] = [
  { label: "プロジェクト", value: "12" },
  { label: "フォロワー", value: "450" },
  { label: "閲覧数", value: "1.2k" },
];

export const PROFILE_SKILLS = ["SwiftUI", "Node.js", "Firebase", "Figma", "Python", "AWS", "+"];

export const PROFILE_PROJECTS: ProfileProject[] = [
  {
    name: "CryptoTracker",
    meta: "フィンテック · iOS",
    description:
      "プライバシー重視の暗号資産ポートフォリオトラッカー。データを売らない設計にコダワッテいます。UI/UXの協力者を募集中。",
    badge: "バックエンド",
    initial: "C",
    accent: "#8b5cf6",
    members: "+2人",
  },
  {
    name: "PlantMom",
    meta: "ライフスタイル · AI",
    description:
      "TensorFlow Liteを使ったAI植物判定アプリ。現在はモデルの認識筏度を改善中です。",
    badge: "リードDev",
    initial: "P",
    accent: "#22c55e",
    members: "自分のみ",
  },
  {
    name: "CampusConnect",
    meta: "コミュニティ · Web",
    description:
      "学内イベントとサークル募集をまとめて見つけられる学生向けコミュニティアプリ。通知設計と参加導線を調整中です。",
    badge: "プロダクト設計",
    initial: "C",
    accent: "#0f766e",
    members: "+4人",
  },
  {
    name: "MoodMeals",
    meta: "ヘルス · モバイル",
    description:
      "気分や体調に合わせてレシピを提案する餅事サポートアプリ。食材推蕘ロジックとオンボーディングを開発しています。",
    badge: "リードDev",
    initial: "M",
    accent: "#f97316",
    members: "+1人",
  },
  {
    name: "ArchiveLens",
    meta: "文化 · AI",
    description:
      "地域アーカイブ資料をOCRと要約で探索しやすくする検索ツール。博物館展示との連携案も検証中です。",
    badge: "リサーチ",
    initial: "A",
    accent: "#2563eb",
    members: "+3人",
  },
  {
    name: "GreenRoute",
    meta: "サステナビリティ · 地図",
    description:
      "徒歩や自転車で移動しやすいルートを、日陛や混雑度も含めて提案するナビゲーションサービスの試作です。",
    badge: "バックエンド",
    initial: "G",
    accent: "#16a34a",
    members: "+2人",
  },
  {
    name: "SceneNote",
    meta: "映像 · クリエイターツール",
    description:
      "映像制作者向けにショットメモ、進行表、素材リンクを一元管理できる軽量な制作ノートアプリを作っています。",
    badge: "フロントエンド",
    initial: "S",
    accent: "#9333ea",
    members: "+5人",
  },
];