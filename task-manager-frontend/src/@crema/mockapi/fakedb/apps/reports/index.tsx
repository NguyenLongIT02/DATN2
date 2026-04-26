export type ReportsDataType = {
  statsCards: {
    id: number;
    title: string;
    value: string;
    growth: number;
    icon: string;
    color: string;
  }[];
  taskCompletionData: {
    name: string;
    completed: number;
    inProgress: number;
    todo: number;
  }[];
  taskDistribution: {
    name: string;
    value: number;
  }[];
  boardAnalytics: {
    id: string;
    name: string;
    totalTasks: number;
    completed: number;
    progress: number;
    status: string;
  }[];
  teamProductivity: {
    id: number;
    name: string;
    role: string;
    avatar: string;
    tasksCompleted: number;
    totalTasks: number;
  }[];
  recentActivities: {
    id: number;
    user: { name: string; avatar: string };
    action: string;
    time: string;
  }[];
  upcomingDeadlines: {
    id: number;
    task: string;
    board: string;
    dueDate: string;
    priority: string;
  }[];
};

const reportsData: ReportsDataType = {
  statsCards: [
    {
      id: 1,
      title: 'Completed Tasks',
      value: '156',
      growth: 12.5,
      icon: 'CheckCircleOutlined',
      color: '#52c41a',
    },
    {
      id: 2,
      title: 'In Progress',
      value: '42',
      growth: 5.2,
      icon: 'ClockCircleOutlined',
      color: '#1890ff',
    },
    {
      id: 3,
      title: 'Team Members',
      value: '24',
      growth: 3.0,
      icon: 'TeamOutlined',
      color: '#722ed1',
    },
    {
      id: 4,
      title: 'Active Boards',
      value: '8',
      growth: 2.0,
      icon: 'ProjectOutlined',
      color: '#fa8c16',
    },
  ],
  taskCompletionData: [
    { name: 'Mon', completed: 12, inProgress: 8, todo: 5 },
    { name: 'Tue', completed: 15, inProgress: 6, todo: 7 },
    { name: 'Wed', completed: 10, inProgress: 10, todo: 4 },
    { name: 'Thu', completed: 18, inProgress: 5, todo: 6 },
    { name: 'Fri', completed: 20, inProgress: 7, todo: 3 },
    { name: 'Sat', completed: 8, inProgress: 3, todo: 2 },
    { name: 'Sun', completed: 5, inProgress: 2, todo: 1 },
  ],
  taskDistribution: [
    { name: 'Completed', value: 156 },
    { name: 'In Progress', value: 42 },
    { name: 'Todo', value: 28 },
    { name: 'Blocked', value: 8 },
  ],
  boardAnalytics: [
    {
      id: '1',
      name: 'Dashboard Frontend Application',
      totalTasks: 45,
      completed: 32,
      progress: 71,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      totalTasks: 38,
      completed: 28,
      progress: 74,
      status: 'Active',
    },
    {
      id: '3',
      name: 'Backend API Integration',
      totalTasks: 52,
      completed: 45,
      progress: 87,
      status: 'Active',
    },
    {
      id: '4',
      name: 'Marketing Campaign',
      totalTasks: 24,
      completed: 18,
      progress: 75,
      status: 'Active',
    },
  ],
  teamProductivity: [
    {
      id: 1,
      name: 'Johnson',
      role: 'Frontend Developer',
      avatar: '/assets/images/avatar/A23.jpg',
      tasksCompleted: 12,
      totalTasks: 15,
    },
    {
      id: 2,
      name: 'Joe Root',
      role: 'Backend Developer',
      avatar: '/assets/images/avatar/A24.jpg',
      tasksCompleted: 8,
      totalTasks: 10,
    },
    {
      id: 3,
      name: 'Monty Panesar',
      role: 'UI/UX Designer',
      avatar: '/assets/images/avatar/A25.jpg',
      tasksCompleted: 15,
      totalTasks: 18,
    },
    {
      id: 4,
      name: 'Darren Gough',
      role: 'Project Manager',
      avatar: '/assets/images/avatar/A26.jpg',
      tasksCompleted: 10,
      totalTasks: 12,
    },
  ],
  recentActivities: [
    {
      id: 1,
      user: { name: 'Johnson', avatar: '/assets/images/avatar/A23.jpg' },
      action: 'created card "Design Homepage"',
      time: '2 hours ago',
    },
    {
      id: 2,
      user: { name: 'Joe Root', avatar: '/assets/images/avatar/A24.jpg' },
      action: 'moved card "API Integration" to Done',
      time: '5 hours ago',
    },
    {
      id: 3,
      user: { name: 'Monty Panesar', avatar: '/assets/images/avatar/A25.jpg' },
      action: 'commented on "Bug Fix #123"',
      time: '1 day ago',
    },
    {
      id: 4,
      user: { name: 'Darren Gough', avatar: '/assets/images/avatar/A26.jpg' },
      action: 'assigned you to "Database Migration"',
      time: '2 days ago',
    },
  ],
  upcomingDeadlines: [
    {
      id: 1,
      task: 'Design Homepage',
      board: 'Dashboard Frontend Application',
      dueDate: 'Today',
      priority: 'high',
    },
    {
      id: 2,
      task: 'API Integration',
      board: 'Backend API Integration',
      dueDate: 'Tomorrow',
      priority: 'medium',
    },
    {
      id: 3,
      task: 'Database Migration',
      board: 'Backend API Integration',
      dueDate: 'In 3 days',
      priority: 'high',
    },
    {
      id: 4,
      task: 'User Testing',
      board: 'Mobile App Development',
      dueDate: 'In 5 days',
      priority: 'low',
    },
  ],
};

export default reportsData;

