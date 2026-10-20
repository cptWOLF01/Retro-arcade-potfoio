// ─────────────────────────────────────────────────────────────
// ALL portfolio text + links live here. Edit freely.
// ─────────────────────────────────────────────────────────────
export const profile = {
  name: 'Himanshu Mahire',
  short: 'HIMANSHU',
  arcadeTitle: "HIMANSHU'S ARCADE",
  photo: '/me-beach.png', // drop your beach photo at public/me-beach.png
  photoAlt: 'Pixel-art portrait of Himanshu Mahire walking on a beach at sunset',
  bio: 'A full-stack developer who loves building end-to-end applications and turning complex problems into simple solutions. Captain of school and college football and basketball teams.',
  stats: [
    { label: 'FRONTEND', value: 8 },
    { label: 'BACKEND', value: 7 },
    { label: 'UI/UX', value: 8 },
    { label: 'TEAMWORK', value: 9 },
  ],
}

export const worlds = [
  { id: 'world-1-1', hud: 'WORLD 1-1 · ABOUT' },
  { id: 'world-1-2', hud: 'WORLD 1-2 · SKILLS' },
  { id: 'world-2', hud: 'WORLD 2 · PROJECTS' },
  { id: 'world-3', hud: 'WORLD 3 · EXPERIENCE' },
  { id: 'world-4', hud: 'WORLD 4 · ACHIEVEMENTS' },
  { id: 'world-5', hud: 'WORLD 5 · CONTACT' },
]

export const aboutCards = [
  { title: 'PLAYER', lines: ['Himanshu Mahire', 'Pune, India'] },
  { title: 'EDUCATION', lines: ['B.E. Computer Engineering (2023–2027)', 'SPPU · CGPA 8.5'] },
  { title: 'GUILD ROLE', lines: ["Secretary, Computer Dept. Students' Association", 'Keystone College'] },
  { title: 'LANGUAGES', lines: ['English · Hindi · Marathi'] },
  { title: 'INTERESTS', lines: ['Breaking down complex problems into simple solutions', 'Building end-to-end applications'] },
]

export const skillGroups = [
  { name: 'FRONTEND', color: '#ff3d8b', skills: ['React JS', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'UI/UX Prototyping'] },
  { name: 'MOBILE', color: '#ff9f5a', skills: ['React Native', 'Flutter', 'Dart'] },
  { name: 'BACKEND & DB', color: '#2bb5ff', skills: ['Python', 'Java', 'SQL', 'MySQL', 'MongoDB', 'Database Design'] },
  { name: 'TOOLS', color: '#7a5cff', skills: ['AWS', 'Data Analysis', 'Code Review'] },
]

export const projects = [
  {
    id: 'ble', scene: 'racing', title: 'ROAD SAFETY NAVIGATION SYSTEM (BLE)',
    desc: 'Bluetooth Low Energy beacons mounted at danger zones warn approaching drivers in real time, flag speeding vehicles and help avoid collisions.',
    tags: ['BLE', 'Mobile', 'Real-time alerts'], badge: null, hint: 'CLICK = SPEED UP THE CAR', link: '#',
  },
  {
    id: 'pothole', scene: 'runner', title: 'POTHOLE DETECTION SYSTEM',
    desc: 'Detects potholes and grades them by risk (green / yellow / red) so road authorities can prioritise repairs. Citizens can report new ones.',
    tags: ['Detection', 'Risk levels', 'Reporting'], badge: 'IdeaThon Key2Nirman · Runner-Up (2nd Place)', hint: 'CLICK A POTHOLE = REPORT', link: '#',
  },
  {
    id: 'health', scene: 'invaders', title: 'AI HEALTHCARE & SYMPTOM CHECKER',
    desc: 'A chatbot-style assistant that maps symptoms to a likely diagnosis and simple remedies, with one-tap appointment booking.',
    tags: ['AI', 'Chatbot', 'Healthcare'], badge: 'VIT InnoHack 2.0 · Top 30 Finalists', hint: 'CLICK = FIRE A REMEDY', link: '#',
  },
  {
    id: 'edulib', scene: 'tetris', title: 'EDULIB LIBRARY MANAGEMENT SYSTEM',
    desc: 'Catalogue, issue, reserve and return books with a clean dashboard. Full CRUD backed by a relational database.',
    tags: ['CRUD', 'DB integration', 'Dashboard'], badge: null, hint: 'CLICK = ROTATE BOOK', link: '#',
  },
  {
    id: 'site', scene: 'monitor', title: 'PORTFOLIO WEBSITE',
    desc: 'The meta level: the arcade you are standing in right now. Scroll-driven world, procedural sprites, 3D room.',
    tags: ['React', 'Tailwind', '3D'], badge: null, hint: 'CLICK = PING', link: '#',
  },
]

export const experience = [
  {
    role: 'Software Developer Intern (Frontend)', org: 'AI Solution and Technology', boss: 'BOSS 1',
    points: ['Built responsive Flutter (Dart) mobile screens', 'Integrated REST APIs', 'Debugged and tested for stability'],
  },
  {
    role: 'Code Reviewer', org: 'Outlier AI · Freelance Coding Platform', boss: 'BOSS 2',
    points: ['Reviewed and evaluated code submissions', 'Gave structured feedback on quality and performance'],
  },
]

export const leaderboard = [
  { rank: '1ST', event: 'VIT INNOHACK 2.0', result: 'TOP 30 FINALIST', project: 'AI HEALTHCARE' },
  { rank: '2ND', event: 'IDEATHON KEY2NIRMAN', result: 'RUNNER-UP', project: 'POTHOLE DETECTION' },
]

export const badges = [
  { icon: 'ball', title: 'TEAM CAPTAIN', sub: 'Football · Basketball · School Football' },
  { icon: 'star', title: 'SECRETARY', sub: "Computer Dept. Students' Association" },
]

export const contact = {
  email: 'himanshum9199@gmail.com',
  phone: '+91 90286 56429',
  location: 'Wagholi, Pune, Maharashtra',
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  resume: '#',
}
