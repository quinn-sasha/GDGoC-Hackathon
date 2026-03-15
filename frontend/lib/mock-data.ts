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
  badge: "ONGOING",
  label: "FEATURED",
  readTime: "12 min read",
  title: "The Future of Sustainable Urban Architecture",
  description:
    "Exploring how vertical forests and modular construction are reshaping city living...",
  hostInitial: "H",
  hostName: "Host Name",
};

export const HOME_CATEGORIES = ["All", "Design", "Tech", "Art", "Music", "Film"];

export const HOME_UPDATES: HomeUpdate[] = [
  {
    id: 1,
    title: "Generative AI in Modern UI/UX",
    status: "IN REVIEW",
    statusColor: "#c9973a",
    statusBg: "#3d2e00",
    time: "2h ago",
    description:
      "How designers are leveraging neural networks to automate repetitive layout tasks and create...",
    author: "ALEX RIVERA",
    category: "TECHNOLOGY",
    categoryTag: "Tech",
    avatarInitial: "A",
  },
  {
    id: 2,
    title: "Minimalism: More Than Just White Space",
    status: "COMPLETED",
    statusColor: "#4fc3a1",
    statusBg: "#0d2e22",
    time: "5h ago",
    description:
      "The philosophical roots of minimalist design and its resurgence in an era of digital information...",
    author: "SARAH CHEN",
    category: "DESIGN",
    categoryTag: "Design",
    avatarInitial: "S",
  },
  {
    id: 3,
    title: "Digital Art Collectives on the Rise",
    status: "DRAFT",
    statusColor: "#aaaaaa",
    statusBg: "#2a2a2a",
    time: "Yesterday",
    description:
      "Community-driven art projects are changing the ownership model and how creators interact with...",
    author: "MARCUS THORNE",
    category: "ART",
    categoryTag: "Art",
    avatarInitial: "M",
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
];