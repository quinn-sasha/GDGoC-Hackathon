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
  badge: string;
  label: string;
  readTime: string;
  title: string;
  description: string;
  hostInitial: string;
  hostName: string;
};

export const HOME_FEATURED: HomeFeatured = {
  badge: "進行中",
  label: "注目",
  readTime: "12分で読める",
  title: "サステナブル都市建築のこれから",
  description:
    "垂直型の緑化建築やモジュール工法が、これからの都市生活をどう変えていくのかを探ります...",
  hostInitial: "H",
  hostName: "ホスト名",
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
    title: "DeFi Swap UI",
    preview: "Hey, saw your GitHub, looks great! ...",
    time: "2m ago",
    online: true,
    accent: "#6559ff",
    avatar: "D",
  },
  {
    id: 2,
    title: "Sarah (Backend)",
    preview: "Are we meeting for the standup?",
    time: "1h ago",
    online: true,
    accent: "#2f68ff",
    avatar: "S",
  },
  {
    id: 3,
    title: "Rust CLI Tool",
    preview: "I just pushed the fix for the bug on mai...",
    time: "Yesterday",
    online: false,
    accent: "#ff8a22",
    avatar: "R",
  },
  {
    id: 4,
    title: "Mike T.",
    preview: "Let's connect on Discord later.",
    time: "Oct 24",
    online: false,
    accent: "#3d66ff",
    avatar: "M",
  },
  {
    id: 5,
    title: "Flutter Flow App",
    preview: "Sent an attachment: wireframes_v2.fig",
    time: "Oct 20",
    online: false,
    accent: "#2f4c77",
    avatar: "F",
  },
  {
    id: 6,
    title: "Alice (PM)",
    preview: "Did you review the PR yet?",
    time: "Oct 18",
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
  bio: "Full-stack wizard looking for a UI designer for a fintech side hustle. Coffee & Code ☕",
  avatarInitial: "A",
};

export const PROFILE_STATS: ProfileStat[] = [
  { label: "Projects", value: "12" },
  { label: "Followers", value: "450" },
  { label: "Views", value: "1.2k" },
];

export const PROFILE_SKILLS = ["SwiftUI", "Node.js", "Firebase", "Figma", "Python", "AWS", "+"];

export const PROFILE_PROJECTS: ProfileProject[] = [
  {
    name: "CryptoTracker",
    meta: "Fintech · iOS",
    description:
      "Building a privacy-first portfolio tracker that doesn't sell your data. Need help with UI/UX.",
    badge: "BACKEND ROLE",
    initial: "C",
    accent: "#8b5cf6",
    members: "+2 others",
  },
  {
    name: "PlantMom",
    meta: "Lifestyle · AI",
    description:
      "AI plant identification app using TensorFlow Lite. Currently refining the model accuracy.",
    badge: "LEAD DEV",
    initial: "P",
    accent: "#22c55e",
    members: "Just me",
  },
  {
    name: "CampusConnect",
    meta: "Community · Web",
    description:
      "学内イベントとサークル募集をまとめて見つけられる学生向けコミュニティアプリ。通知設計と参加導線を調整中です。",
    badge: "PRODUCT DESIGN",
    initial: "C",
    accent: "#0f766e",
    members: "+4 others",
  },
  {
    name: "MoodMeals",
    meta: "Health · Mobile",
    description:
      "気分や体調に合わせてレシピを提案する食事サポートアプリ。食材推薦ロジックとオンボーディングを開発しています。",
    badge: "LEAD DEV",
    initial: "M",
    accent: "#f97316",
    members: "+1 other",
  },
  {
    name: "ArchiveLens",
    meta: "Culture · AI",
    description:
      "地域アーカイブ資料をOCRと要約で探索しやすくする検索ツール。博物館展示との連携案も検証中です。",
    badge: "RESEARCH",
    initial: "A",
    accent: "#2563eb",
    members: "+3 others",
  },
  {
    name: "GreenRoute",
    meta: "Sustainability · Map",
    description:
      "徒歩や自転車で移動しやすいルートを、日陰や混雑度も含めて提案するナビゲーションサービスの試作です。",
    badge: "BACKEND ROLE",
    initial: "G",
    accent: "#16a34a",
    members: "+2 others",
  },
  {
    name: "SceneNote",
    meta: "Film · Creator Tools",
    description:
      "映像制作者向けにショットメモ、進行表、素材リンクを一元管理できる軽量な制作ノートアプリを作っています。",
    badge: "FRONTEND ROLE",
    initial: "S",
    accent: "#9333ea",
    members: "+5 others",
  },
];