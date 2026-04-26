import mock from '../MockConfig.tsx';
import { BoardObjType } from '@crema/types/models/apps/ScrumbBoard';
import TeamService from '../team';

// Load board data from localStorage (same as scrumboard API)
const loadBoardData = (): BoardObjType[] => {
  try {
    const saved = localStorage.getItem('scrumboard_boards');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Reports API: Error loading from localStorage', error);
  }
  return [];
};

// Generate reports data from real scrumboard data
const generateReportsData = () => {
  const boards = loadBoardData();
  const boardMembers = TeamService.getBoardMembersSync();
  
  // Calculate stats from real data
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let todoTasks = 0;
  let totalMembers = 0;
  
  const boardAnalytics = boards.map(board => {
    const boardTasks = board.list?.reduce((acc, list) => {
      return acc + (list.cards?.length || 0);
    }, 0) || 0;
    
    const boardCompleted = board.list?.reduce((acc, list) => {
      if (list.name?.toLowerCase().includes('done') || list.name?.toLowerCase().includes('completed')) {
        return acc + (list.cards?.length || 0);
      }
      return acc;
    }, 0) || 0;
    
    const boardInProgress = board.list?.reduce((acc, list) => {
      if (list.name?.toLowerCase().includes('progress') || list.name?.toLowerCase().includes('doing')) {
        return acc + (list.cards?.length || 0);
      }
      return acc;
    }, 0) || 0;
    
    const boardTodo = board.list?.reduce((acc, list) => {
      if (list.name?.toLowerCase().includes('todo') || list.name?.toLowerCase().includes('backlog')) {
        return acc + (list.cards?.length || 0);
      }
      return acc;
    }, 0) || 0;
    
    totalTasks += boardTasks;
    completedTasks += boardCompleted;
    inProgressTasks += boardInProgress;
    todoTasks += boardTodo;
    
    const progress = boardTasks > 0 ? Math.round((boardCompleted / boardTasks) * 100) : 0;
    
    return {
      id: board.id.toString(),
      name: board.name,
      totalTasks: boardTasks,
      completed: boardCompleted,
      progress: progress,
      status: 'Active'
    };
  });
  
  // Count unique members across all boards
  const uniqueMembers = new Set();
  boardMembers.forEach(member => {
    uniqueMembers.add(member.memberId);
  });
  totalMembers = uniqueMembers.size;
  
  // Generate task completion data (last 7 days)
  const taskCompletionData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Simulate daily data based on total tasks
    const dailyCompleted = Math.floor(completedTasks / 7) + Math.floor(Math.random() * 5);
    const dailyInProgress = Math.floor(inProgressTasks / 7) + Math.floor(Math.random() * 3);
    const dailyTodo = Math.floor(todoTasks / 7) + Math.floor(Math.random() * 2);
    
    taskCompletionData.push({
      name: dayName,
      completed: dailyCompleted,
      inProgress: dailyInProgress,
      todo: dailyTodo
    });
  }
  
  // Generate task distribution
  const taskDistribution = [
    { name: 'Completed', value: completedTasks },
    { name: 'In Progress', value: inProgressTasks },
    { name: 'Todo', value: todoTasks },
    { name: 'Blocked', value: Math.floor(totalTasks * 0.05) }
  ];
  
  // Generate recent activities from board data
  const recentActivities = [];
  boards.forEach(board => {
    board.list?.forEach(list => {
      list.cards?.slice(0, 2).forEach(card => {
        recentActivities.push({
          id: card.id,
          user: { 
            name: card.members?.[0]?.name || 'Unknown User', 
            avatar: card.members?.[0]?.avatar || '/assets/images/avatar/A1.jpg' 
          },
          action: `created card "${card.title}"`,
          time: '2 hours ago'
        });
      });
    });
  });
  
  // Generate upcoming deadlines from cards with due dates
  const upcomingDeadlines = [];
  boards.forEach(board => {
    board.list?.forEach(list => {
      list.cards?.forEach(card => {
        if (card.dueDate) {
          upcomingDeadlines.push({
            id: card.id,
            task: card.title,
            board: board.name,
            dueDate: new Date(card.dueDate).toLocaleDateString(),
            priority: card.priority || 'medium'
          });
        }
      });
    });
  });
  
  return {
    statsCards: [
      {
        id: 1,
        title: 'Completed Tasks',
        value: completedTasks.toString(),
        growth: completedTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        icon: 'CheckCircleOutlined',
        color: '#52c41a',
      },
      {
        id: 2,
        title: 'In Progress',
        value: inProgressTasks.toString(),
        growth: inProgressTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
        icon: 'ClockCircleOutlined',
        color: '#1890ff',
      },
      {
        id: 3,
        title: 'Team Members',
        value: totalMembers.toString(),
        growth: 3.0,
        icon: 'TeamOutlined',
        color: '#722ed1',
      },
      {
        id: 4,
        title: 'Active Boards',
        value: boards.length.toString(),
        growth: 2.0,
        icon: 'ProjectOutlined',
        color: '#fa8c16',
      },
    ],
    taskCompletionData,
    taskDistribution,
    boardAnalytics,
    recentActivities: recentActivities.slice(0, 10), // Limit to 10 recent activities
    upcomingDeadlines: upcomingDeadlines.slice(0, 10) // Limit to 10 upcoming deadlines
  };
};

mock.onGet('/api/reports/data').reply(() => {
  console.log('Reports API: Generating reports data from real scrumboard data');
  const reportsData = generateReportsData();
  console.log('Reports API: Generated data:', reportsData);
  return [200, reportsData];
});

export {};

