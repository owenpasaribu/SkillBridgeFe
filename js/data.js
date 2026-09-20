/**
 * SkillBridge — dummy dataset
 *
 * Semua angka di file ini adalah data contoh untuk kebutuhan prototype/lomba,
 * bukan data industri riil. Ditandai "Demo Data" di halaman yang menampilkannya.
 */

const SKILLS = [
  { id: 'sql', name: 'SQL', category: 'technical' },
  { id: 'python', name: 'Python', category: 'technical' },
  { id: 'excel', name: 'Excel', category: 'technical' },
  { id: 'statistics', name: 'Statistics', category: 'technical' },
  { id: 'powerbi', name: 'Power BI', category: 'technical' },
  { id: 'cloud', name: 'Cloud Computing', category: 'technical' },
  { id: 'docker', name: 'Docker', category: 'technical' },
  { id: 'datapipeline', name: 'Data Pipeline / ETL', category: 'technical' },
  { id: 'ml', name: 'Machine Learning', category: 'technical' },
  { id: 'javascript', name: 'JavaScript', category: 'technical' },
  { id: 'react', name: 'React', category: 'technical' },
  { id: 'uidesign', name: 'UI Design', category: 'technical' },
  { id: 'figma', name: 'Figma', category: 'technical' },
  { id: 'cybersecurity', name: 'Cybersecurity Fundamentals', category: 'technical' },
  { id: 'networking', name: 'Networking', category: 'technical' },
  { id: 'linux', name: 'Linux', category: 'technical' },
  { id: 'git', name: 'Git / Version Control', category: 'technical' },
  { id: 'communication', name: 'Communication', category: 'soft' },
  { id: 'problemsolving', name: 'Problem Solving', category: 'soft' },
  { id: 'projectmanagement', name: 'Project Management', category: 'soft' },
];

// Catatan: skillName() dan getCareerBySlug() sekarang didefinisikan di
// js/admin-store.js, supaya seluruh halaman membaca data yang sudah
// dikelola admin (bukan array statis di file ini secara langsung).

/**
 * Opsi skenario untuk skill assessment — dipakai FE (assessment.js) dan
 * mock backend (api-mock.js). Di backend Laravel nanti, ini akan datang
 * dari GET /assessment/questions, bukan konstanta di FE.
 */
const SCENARIO_OPTIONS = [
  { label: 'I have never used this skill at all', value: 10 },
  { label: 'I can do the basics with the help of tutorials/examples', value: 35 },
  { label: 'I can complete most related tasks on my own', value: 60 },
  { label: 'I can handle complex tasks and help explain them to others', value: 85 },
];

// Pemetaan bahasa yang terdeteksi di GitHub ke skill SkillBridge.
// Dipakai mock backend sekarang; nanti jadi bagian logika Laravel BE
// saat endpoint POST /portfolio/github-analyze pindah ke server.
const GITHUB_LANGUAGE_MAP = {
  Python: 'python',
  'Jupyter Notebook': 'python',
  JavaScript: 'javascript',
  TypeScript: 'javascript',
  Dockerfile: 'docker',
  Shell: 'linux',
};

const CAREERS = [
  {
    id: 'data-analyst', slug: 'data-analyst', name: 'Data Analyst',
    category: 'Data', difficulty: 'Beginner-friendly', industryDemand: 78, jobSampleSize: 420, remoteFriendly: true,
    shortDescription: 'Turn raw data into insights that drive business decisions.',
    description: 'A Data Analyst collects, cleans, and analyzes data to answer business questions, then communicates the findings through reports and dashboards.',
    responsibilities: [
      'Prepare and clean datasets from multiple sources',
      'Build dashboards and recurring reports',
      'Run basic statistical analysis to answer business questions',
      'Work with non-technical teams to translate their data needs',
    ],
    tools: ['SQL', 'Excel', 'Power BI', 'Python'],
    requiredSkills: [
      { skillId: 'sql', level: 90, importance: 'critical' },
      { skillId: 'excel', level: 85, importance: 'high' },
      { skillId: 'statistics', level: 80, importance: 'high' },
      { skillId: 'powerbi', level: 75, importance: 'high' },
      { skillId: 'python', level: 65, importance: 'medium' },
      { skillId: 'communication', level: 70, importance: 'medium' },
    ],
  },
  {
    id: 'data-engineer', slug: 'data-engineer', name: 'Data Engineer',
    category: 'Data', difficulty: 'Intermediate', industryDemand: 71, jobSampleSize: 310, remoteFriendly: true,
    shortDescription: 'Build and maintain the data infrastructure and pipelines other teams rely on.',
    description: 'A Data Engineer designs, builds, and maintains the systems and pipelines that move data from many sources to where analytics and product teams can use it.',
    responsibilities: [
      'Build and maintain data pipelines (ETL/ELT)',
      'Design efficient database schemas',
      'Manage data infrastructure in the cloud',
      'Ensure data quality and reliability',
    ],
    tools: ['SQL', 'Python', 'Airflow', 'Docker', 'Cloud (AWS/GCP)'],
    requiredSkills: [
      { skillId: 'sql', level: 90, importance: 'critical' },
      { skillId: 'python', level: 85, importance: 'critical' },
      { skillId: 'datapipeline', level: 75, importance: 'high' },
      { skillId: 'cloud', level: 70, importance: 'high' },
      { skillId: 'docker', level: 65, importance: 'medium' },
      { skillId: 'statistics', level: 45, importance: 'low' },
      { skillId: 'communication', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'software-engineer', slug: 'software-engineer', name: 'Software Engineer',
    category: 'Engineering', difficulty: 'Intermediate', industryDemand: 85, jobSampleSize: 560, remoteFriendly: true,
    shortDescription: 'Design, build, and maintain software applications and systems.',
    description: 'A Software Engineer writes, tests, and maintains code to build digital products, working closely with designers and product managers.',
    responsibilities: [
      'Develop new features to specification',
      'Write tested, maintainable code',
      'Review code with the team',
      'Debug and fix issues in production',
    ],
    tools: ['JavaScript', 'Git', 'React', 'SQL'],
    requiredSkills: [
      { skillId: 'javascript', level: 85, importance: 'critical' },
      { skillId: 'git', level: 80, importance: 'high' },
      { skillId: 'problemsolving', level: 80, importance: 'high' },
      { skillId: 'react', level: 60, importance: 'medium' },
      { skillId: 'sql', level: 60, importance: 'medium' },
      { skillId: 'python', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'ai-engineer', slug: 'ai-engineer', name: 'AI Engineer',
    category: 'Data', difficulty: 'Advanced', industryDemand: 66, jobSampleSize: 190, remoteFriendly: true,
    shortDescription: 'Build and ship machine learning models in real products.',
    description: 'An AI Engineer combines machine learning knowledge with software engineering to train, test, and deploy models into production systems.',
    responsibilities: [
      'Train and evaluate machine learning models',
      'Prepare data for training',
      'Deploy models to production',
      'Monitor model performance over time',
    ],
    tools: ['Python', 'scikit-learn', 'Cloud (AWS/GCP)', 'Docker'],
    requiredSkills: [
      { skillId: 'python', level: 90, importance: 'critical' },
      { skillId: 'ml', level: 85, importance: 'critical' },
      { skillId: 'statistics', level: 80, importance: 'high' },
      { skillId: 'sql', level: 65, importance: 'medium' },
      { skillId: 'cloud', level: 60, importance: 'medium' },
      { skillId: 'docker', level: 50, importance: 'low' },
      { skillId: 'communication', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'cybersecurity-analyst', slug: 'cybersecurity-analyst', name: 'Cybersecurity Analyst',
    category: 'Security', difficulty: 'Intermediate', industryDemand: 69, jobSampleSize: 240, remoteFriendly: false,
    shortDescription: 'Protect an organization\'s systems and data from cyber threats.',
    description: 'A Cybersecurity Analyst monitors, detects, and responds to security threats, and builds better security practices across the organization.',
    responsibilities: [
      'Monitor systems for suspicious activity',
      'Run audits and vulnerability assessments',
      'Respond to and analyze security incidents',
      'Write security policy recommendations',
    ],
    tools: ['SIEM tools', 'Linux', 'Wireshark', 'Cloud security'],
    requiredSkills: [
      { skillId: 'cybersecurity', level: 90, importance: 'critical' },
      { skillId: 'networking', level: 85, importance: 'critical' },
      { skillId: 'linux', level: 75, importance: 'high' },
      { skillId: 'cloud', level: 55, importance: 'medium' },
      { skillId: 'problemsolving', level: 70, importance: 'medium' },
    ],
  },
  {
    id: 'cloud-engineer', slug: 'cloud-engineer', name: 'Cloud Engineer',
    category: 'Engineering', difficulty: 'Intermediate', industryDemand: 64, jobSampleSize: 260, remoteFriendly: true,
    shortDescription: 'Manage cloud infrastructure so applications run reliably and efficiently.',
    description: 'A Cloud Engineer designs and manages infrastructure on cloud platforms, including deployment, scaling, and system security.',
    responsibilities: [
      'Configure and manage cloud services',
      'Automate deployment processes',
      'Monitor infrastructure performance and cost',
      'Keep cloud configurations secure',
    ],
    tools: ['AWS/GCP/Azure', 'Docker', 'Linux', 'Terraform'],
    requiredSkills: [
      { skillId: 'cloud', level: 90, importance: 'critical' },
      { skillId: 'docker', level: 80, importance: 'high' },
      { skillId: 'linux', level: 75, importance: 'high' },
      { skillId: 'networking', level: 65, importance: 'medium' },
      { skillId: 'git', level: 60, importance: 'medium' },
      { skillId: 'python', level: 55, importance: 'low' },
      { skillId: 'communication', level: 50, importance: 'low' },
    ],
  },
  {
    id: 'uiux-designer', slug: 'uiux-designer', name: 'UI/UX Designer',
    category: 'Design', difficulty: 'Beginner-friendly', industryDemand: 58, jobSampleSize: 300, remoteFriendly: true,
    shortDescription: 'Design digital product experiences and interfaces that are easy to use.',
    description: 'A UI/UX Designer researches user needs and turns them into clear, pleasant flows and interfaces.',
    responsibilities: [
      'Conduct user research and interviews',
      'Create wireframes and prototypes',
      'Design the visual interface',
      'Run usability testing',
    ],
    tools: ['Figma', 'Design system', 'User research'],
    requiredSkills: [
      { skillId: 'uidesign', level: 90, importance: 'critical' },
      { skillId: 'figma', level: 85, importance: 'critical' },
      { skillId: 'communication', level: 80, importance: 'high' },
      { skillId: 'problemsolving', level: 65, importance: 'medium' },
      { skillId: 'projectmanagement', level: 50, importance: 'low' },
    ],
  },
  {
    id: 'product-manager', slug: 'product-manager', name: 'Product Manager',
    category: 'Product', difficulty: 'Advanced', industryDemand: 55, jobSampleSize: 200, remoteFriendly: false,
    shortDescription: 'Set the product direction and bridge user, business, and engineering needs.',
    description: 'A Product Manager defines the product vision and priorities, then works with design, engineering, and the business to make it happen.',
    responsibilities: [
      'Define the product roadmap and priorities',
      'Gather and analyze user needs',
      'Write feature specifications',
      'Measure feature impact after release',
    ],
    tools: ['Analytics tools', 'Roadmap tools', 'Basic SQL'],
    requiredSkills: [
      { skillId: 'communication', level: 90, importance: 'critical' },
      { skillId: 'projectmanagement', level: 85, importance: 'critical' },
      { skillId: 'problemsolving', level: 80, importance: 'high' },
      { skillId: 'statistics', level: 55, importance: 'medium' },
      { skillId: 'sql', level: 50, importance: 'low' },
    ],
  },
];

// getCareerBySlug() dipindah ke js/admin-store.js.

/**
 * Konten pembelajaran generik per skill, dipakai untuk menyusun
 * Learning Roadmap secara otomatis dari hasil skill gap — bukan
 * roadmap yang ditulis manual per karier.
 */
const SKILL_CONTENT = {
  sql: {
    objective: 'Master data querying, from the basics to complex table joins.',
    why: 'SQL is the universal language for retrieving and working with data in almost every data role.',
    after: 'You can write queries that retrieve, filter, and join data from multiple tables.',
    resources: [
      { title: 'SQL for Data Analysis', provider: 'Coursera', type: 'course' },
      { title: 'Mode SQL Tutorial', provider: 'Mode Analytics', type: 'article' },
    ],
    tasks: ['Practice SELECT, WHERE, and JOIN', 'Write 3 analysis queries on a public dataset', 'Learn the basics of window functions'],
    miniProject: 'Analyze a public sales dataset and write 5 insights using SQL.',
    durationDays: 10,
  },
  python: {
    objective: 'Master Python for data processing (pandas, numpy).',
    why: 'Python is the backbone of automation and data analysis in almost every technical role.',
    after: 'You can clean and analyze datasets using pandas.',
    resources: [
      { title: 'Python for Everybody', provider: 'Coursera', type: 'course' },
      { title: 'Pandas Documentation — Getting Started', provider: 'pandas.pydata.org', type: 'doc' },
    ],
    tasks: ['Learn Python\'s core data structures', 'Practice data manipulation with pandas', 'Write a simple data-cleaning script'],
    miniProject: 'Clean and analyze one raw dataset from Kaggle.',
    durationDays: 14,
  },
  excel: {
    objective: 'Master Excel functions for processing and summarizing data.',
    why: 'Excel is still a fast tool for small-to-medium data analysis at many companies.',
    after: 'You can build pivot tables and data summaries on your own.',
    resources: [{ title: 'Excel Skills for Data Analytics', provider: 'Coursera', type: 'course' }],
    tasks: ['Practice pivot tables', 'Learn VLOOKUP/XLOOKUP', 'Build a simple dashboard in Excel'],
    miniProject: 'Build an automated monthly report with pivot tables and charts.',
    durationDays: 7,
  },
  statistics: {
    objective: 'Understand core statistics concepts for data-driven decisions.',
    why: 'Statistics is the foundation for interpreting data correctly, not just reading numbers.',
    after: 'You can explain data trends using basic statistical measures and simple significance tests.',
    resources: [{ title: 'Statistics with Python', provider: 'Coursera', type: 'course' }],
    tasks: ['Learn mean, median, and distributions', 'Learn correlation vs. causation', 'Practice simple hypothesis testing'],
    miniProject: 'Analyze correlations between variables in one dataset and write up your conclusions.',
    durationDays: 10,
  },
  powerbi: {
    objective: 'Build interactive dashboards with Power BI.',
    why: 'Strong data visualization makes insights easier for non-technical stakeholders to understand.',
    after: 'You can build interactive dashboards with filters and drill-downs.',
    resources: [{ title: 'Power BI Essential Training', provider: 'LinkedIn Learning', type: 'course' }],
    tasks: ['Learn data modeling in Power BI', 'Build basic visualizations', 'Add filters and interactivity'],
    miniProject: 'Build an interactive sales dashboard from a sample dataset.',
    durationDays: 9,
  },
  cloud: {
    objective: 'Understand core cloud services (compute, storage, networking).',
    why: 'Almost all modern infrastructure runs in the cloud, so this is a must-have foundation for technical roles.',
    after: 'You can deploy a simple application or data pipeline in the cloud.',
    resources: [{ title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Skill Builder', type: 'course' }],
    tasks: ['Learn cloud compute and storage concepts', 'Set up a free-tier account and try the basic services', 'Deploy one simple application'],
    miniProject: 'Deploy a small application or pipeline to a free cloud service.',
    durationDays: 12,
  },
  docker: {
    objective: 'Understand containerization and how to run applications with Docker.',
    why: 'Docker lets applications run consistently across environments.',
    after: 'You can package an application into a container and run it.',
    resources: [{ title: 'Docker for Beginners', provider: 'Docker Docs', type: 'doc' }],
    tasks: ['Learn image and container concepts', 'Write a simple Dockerfile', 'Run an application inside a container'],
    miniProject: 'Containerize a small application you have already built.',
    durationDays: 8,
  },
  datapipeline: {
    objective: 'Understand ETL/ELT processes for moving and transforming data.',
    why: 'A clean data pipeline keeps the data other teams use accurate and on time.',
    after: 'You can build a simple pipeline that extracts, transforms, and stores data.',
    resources: [{ title: 'Data Engineering Zoomcamp', provider: 'DataTalksClub', type: 'course' }],
    tasks: ['Learn ETL vs. ELT', 'Try a basic orchestration tool (e.g., Airflow)', 'Build a simple end-to-end pipeline'],
    miniProject: 'Build a pipeline that pulls data from a public API into a database.',
    durationDays: 14,
  },
  ml: {
    objective: 'Understand the machine learning workflow from raw data to a finished model.',
    why: 'This is the foundation for building systems that learn from data instead of being hand-programmed.',
    after: 'You can train and evaluate a simple machine learning model.',
    resources: [{ title: 'Machine Learning Specialization', provider: 'Coursera (Andrew Ng)', type: 'course' }],
    tasks: ['Learn supervised vs. unsupervised learning', 'Practice training models with scikit-learn', 'Learn model evaluation (accuracy, precision/recall)'],
    miniProject: 'Train a simple classification model and explain its evaluation results.',
    durationDays: 16,
  },
  javascript: {
    objective: 'Master beginner-to-intermediate JavaScript for web development.',
    why: 'JavaScript is the core language for building modern web applications.',
    after: 'You can build interactive web features and understand asynchronous code.',
    resources: [{ title: 'JavaScript.info', provider: 'javascript.info', type: 'doc' }],
    tasks: ['Learn DOM manipulation', 'Learn async/await and fetch', 'Build one small interactive feature'],
    miniProject: 'Build a to-do list app with localStorage.',
    durationDays: 12,
  },
  react: {
    objective: 'Build component-based interfaces with React.',
    why: 'React is widely used in industry to build large-scale web applications.',
    after: 'You can build multi-component applications with basic state management.',
    resources: [{ title: 'React Official Docs — Learn React', provider: 'react.dev', type: 'doc' }],
    tasks: ['Learn components and props', 'Learn state and effect hooks', 'Build one page from several components'],
    miniProject: 'Build a mini dashboard in React using dummy data.',
    durationDays: 14,
  },
  uidesign: {
    objective: 'Understand the core principles of usable interface design.',
    why: 'Good design makes a product easier to understand and trust.',
    after: 'You can design consistent flows and interfaces.',
    resources: [{ title: 'Laws of UX', provider: 'lawsofux.com', type: 'article' }],
    tasks: ['Learn visual hierarchy and spacing', 'Learn common UI components', 'Redesign one screen of an existing app'],
    miniProject: 'Redesign one app flow (e.g., the login page) and explain your reasoning.',
    durationDays: 10,
  },
  figma: {
    objective: 'Master Figma for wireframes and prototypes.',
    why: 'Figma is the most widely used design collaboration tool in the industry today.',
    after: 'You can create wireframes, visual designs, and interactive prototypes.',
    resources: [{ title: 'Figma Basics', provider: 'Figma Academy', type: 'course' }],
    tasks: ['Learn frames, components, and auto layout', 'Create wireframes for one flow', 'Build a simple interactive prototype'],
    miniProject: 'Build an interactive prototype for one app feature.',
    durationDays: 9,
  },
  cybersecurity: {
    objective: 'Understand core cybersecurity concepts and common types of threats.',
    why: 'A solid grasp of security basics is essential for protecting an organization\'s systems and data.',
    after: 'You can recognize common threats and basic security practices.',
    resources: [{ title: 'Google Cybersecurity Certificate', provider: 'Coursera', type: 'course' }],
    tasks: ['Learn common attack types (phishing, malware, etc.)', 'Learn the CIA triad', 'Practice simple log analysis'],
    miniProject: 'Write an analysis report on one simple security-incident scenario.',
    durationDays: 12,
  },
  networking: {
    objective: 'Understand computer networking basics (TCP/IP, DNS, firewalls).',
    why: 'Networking knowledge is the basis for many infrastructure and security roles.',
    after: 'You can explain how data moves across a network and recognize basic configurations.',
    resources: [{ title: 'Networking Basics', provider: 'Cisco Networking Academy', type: 'course' }],
    tasks: ['Learn the OSI/TCP-IP models', 'Learn DNS and basic routing concepts', 'Practice simple network configuration'],
    miniProject: 'Document a simple network topology and how it works.',
    durationDays: 10,
  },
  linux: {
    objective: 'Master basic Linux commands for system operations.',
    why: 'Many servers and cloud infrastructure run on Linux.',
    after: 'You can navigate, manage files, and run basic processes on Linux.',
    resources: [{ title: 'Linux Command Line Basics', provider: 'Linux Foundation', type: 'course' }],
    tasks: ['Learn basic commands (cd, ls, grep, etc.)', 'Learn permission and process management', 'Practice simple shell scripting'],
    miniProject: 'Write a shell script that automates a simple task.',
    durationDays: 8,
  },
  git: {
    objective: 'Master version control with Git and branching workflows.',
    why: 'Git is the industry standard for collaboration and tracking code history.',
    after: 'You can work with branches, merge, and resolve simple conflicts.',
    resources: [{ title: 'Git Handbook', provider: 'GitHub Docs', type: 'doc' }],
    tasks: ['Learn commit, branch, and merge', 'Practice resolving merge conflicts', 'Practice the pull request workflow'],
    miniProject: 'Manage one small project with a clean branching workflow on GitHub.',
    durationDays: 6,
  },
  communication: {
    objective: 'Practice explaining ideas clearly to both technical and non-technical audiences.',
    why: 'Even great technical skills have less impact without the ability to communicate them.',
    after: 'You can put together presentations or reports that different audiences can easily follow.',
    resources: [{ title: 'Effective Communication', provider: 'LinkedIn Learning', type: 'course' }],
    tasks: ['Practice writing short summaries of technical analyses', 'Practice presenting to non-technical audiences', 'Ask a friend or mentor for feedback'],
    miniProject: 'Present one project result to a non-technical audience in 5 minutes.',
    durationDays: 7,
  },
  problemsolving: {
    objective: 'Practice a systematic approach to solving problems.',
    why: 'This skill determines how effectively you handle new problems you have never seen before.',
    after: 'You can break complex problems into small, actionable steps.',
    resources: [{ title: 'Problem Solving Techniques', provider: 'Coursera', type: 'course' }],
    tasks: ['Practice structured case studies', 'Learn root-cause analysis frameworks', 'Apply it to one real problem from a university project'],
    miniProject: 'Document one real problem-solving process from start to solution.',
    durationDays: 7,
  },
  projectmanagement: {
    objective: 'Understand the basics of project planning and execution.',
    why: 'This skill keeps team work on schedule and on track.',
    after: 'You can build a timeline and milestones and track the progress of a small project.',
    resources: [{ title: 'Project Management Basics', provider: 'Coursera', type: 'course' }],
    tasks: ['Learn basic Agile/Scrum methodology', 'Create a timeline and milestones for one project', 'Practice tracking progress with a simple board'],
    miniProject: 'Manage one university group project with a simple Kanban board.',
    durationDays: 8,
  },
};

/**
 * Data demand skill industri (dummy / demo data untuk halaman Industry Insights).
 */
/**
 * Region yang bisa difilter di Industry Insights & Career Explorer.
 * REGION_MULTIPLIER dipakai untuk menyimulasikan variasi demand per
 * wilayah dari angka demand nasional — bukan data regional riil.
 */
const REGIONS = ['National', 'Jabodetabek', 'Jawa Timur', 'Jawa Barat', 'Remote'];
const REGION_MULTIPLIER = {
  National: 1,
  Jabodetabek: 1.08,
  'Jawa Timur': 0.88,
  'Jawa Barat': 0.97,
  Remote: 0.72,
};

const INDUSTRY_INSIGHTS = [
  { skillId: 'sql', demand: 82, trend: 'stable', jobSampleSize: 350, period: 'Last 3 months' },
  { skillId: 'python', demand: 74, trend: 'up', jobSampleSize: 330, period: 'Last 3 months' },
  { skillId: 'problemsolving', demand: 77, trend: 'stable', jobSampleSize: 315, period: 'Last 3 months' },
  { skillId: 'communication', demand: 71, trend: 'stable', jobSampleSize: 325, period: 'Last 3 months' },
  { skillId: 'javascript', demand: 68, trend: 'stable', jobSampleSize: 310, period: 'Last 3 months' },
  { skillId: 'git', demand: 66, trend: 'up', jobSampleSize: 270, period: 'Last 3 months' },
  { skillId: 'cloud', demand: 61, trend: 'up', jobSampleSize: 255, period: 'Last 3 months' },
  { skillId: 'excel', demand: 60, trend: 'stable', jobSampleSize: 245, period: 'Last 3 months' },
  { skillId: 'datapipeline', demand: 58, trend: 'up', jobSampleSize: 255, period: 'Last 3 months' },
  { skillId: 'statistics', demand: 55, trend: 'stable', jobSampleSize: 235, period: 'Last 3 months' },
  { skillId: 'ml', demand: 52, trend: 'up', jobSampleSize: 220, period: 'Last 3 months' },
  { skillId: 'cybersecurity', demand: 49, trend: 'up', jobSampleSize: 210, period: 'Last 3 months' },
  { skillId: 'powerbi', demand: 47, trend: 'stable', jobSampleSize: 180, period: 'Last 3 months' },
  { skillId: 'docker', demand: 45, trend: 'up', jobSampleSize: 205, period: 'Last 3 months' },
  { skillId: 'uidesign', demand: 44, trend: 'stable', jobSampleSize: 185, period: 'Last 3 months' },
  { skillId: 'projectmanagement', demand: 40, trend: 'stable', jobSampleSize: 165, period: 'Last 3 months' },
  { skillId: 'react', demand: 39, trend: 'up', jobSampleSize: 155, period: 'Last 3 months' },
  { skillId: 'networking', demand: 36, trend: 'down', jobSampleSize: 150, period: 'Last 3 months' },
  { skillId: 'linux', demand: 34, trend: 'stable', jobSampleSize: 125, period: 'Last 3 months' },
  { skillId: 'figma', demand: 33, trend: 'stable', jobSampleSize: 160, period: 'Last 3 months' },
];

const TESTIMONIALS = [
  { name: 'Naila R.', role: 'Information Systems student, semester 7', quote: 'I finally know which skills to focus on first instead of learning everything at once.' },
  { name: 'Fajar A.', role: 'Computer Science fresh graduate', quote: 'The roadmap gave my post-internship learning real direction, with clear weekly targets.' },
  { name: 'Dinda P.', role: 'Management student, interested in Product', quote: 'I realized soft skills count too, not just technical ones. I feel much more ready for interviews.' },
];

const FAQ_ITEMS = [
  { q: 'Does SkillBridge replace job portals like LinkedIn?', a: 'No. SkillBridge helps you understand your readiness and skill gaps for a specific career. It is not a place to apply for jobs.' },
  { q: 'Where does the industry skill demand data come from?', a: 'In this prototype, the industry figures shown on the landing page are sample data used to illustrate the concept. The formula and data sources can be configured further.' },
  { q: 'Is the Career Readiness Score 100% accurate?', a: 'The score is an estimate based on the skills, portfolio, and experience you enter. It is not an official assessment from any company.' },
  { q: 'Can I change my target career later?', a: 'Yes. You can change your target career at any time from Career Explorer, and all analyses will be recalculated.' },
];

/**
 * Item checklist Portfolio Readiness yang ditoggle manual oleh user.
 * Bagian "Technical Skills" pada halaman Portfolio Readiness dihitung
 * otomatis dari hasil skill assessment, jadi tidak didefinisikan di sini.
 */
const PORTFOLIO_CHECKLIST = [
  { id: 'project_basic', category: 'Portfolio', label: '1 completed project' },
  { id: 'project_realworld', category: 'Portfolio', label: 'End-to-end / real-world project' },
  { id: 'github_docs', category: 'Portfolio', label: 'Well-documented GitHub repository' },
  { id: 'internship', category: 'Experience', label: 'Internship experience' },
  { id: 'open_source', category: 'Experience', label: 'Open source contribution' },
  { id: 'cv', category: 'Career Documents', label: 'CV' },
  { id: 'portfolio_site', category: 'Career Documents', label: 'Portfolio website' },
];

const ACHIEVEMENT_DEFS = [
  { code: 'first_assessment', title: 'First Assessment', description: 'Complete your first skill assessment.' },
  { code: 'first_roadmap', title: 'Roadmap Started', description: 'Start your first learning roadmap.' },
  { code: 'first_module_done', title: 'Skill Builder', description: 'Complete your first roadmap module.' },
  { code: 'roadmap_completed', title: 'Roadmap Completed', description: 'Complete every phase of your roadmap.' },
  { code: 'portfolio_ready', title: 'Portfolio Ready', description: 'Reach a Portfolio Readiness Score of 80% or higher.' },
];
