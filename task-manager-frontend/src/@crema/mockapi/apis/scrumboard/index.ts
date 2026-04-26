/* eslint-disable @typescript-eslint/no-explicit-any */
import {AxiosRequestConfig} from 'axios';
import mock from '../MockConfig.tsx';
import labelList from '../../fakedb/apps/scrumboard/labelList';
import boardList from '../../fakedb/apps/scrumboard/boardList';
import {memberList} from '../../fakedb/apps/scrumboard/memberList';
import {
  BoardObjType,
  CardListObjType,
  CardObjType,
} from '@crema/types/models/apps/ScrumbBoard';
import {generateRandomUniqueNumber} from '@crema/helpers/Common';
import './resetStorage'; // Import reset utility for debugging
// Import TeamService directly
import TeamService from '../team';
// Import NotificationService
import NotificationService from '../notifications/NotificationService';

// Load from localStorage if available, otherwise use default boardList
const loadBoardData = (): BoardObjType[] => {
  try {
    const saved = localStorage.getItem('scrumboard_boards');
    if (saved) {
      console.log('Mock API: Loading boards from localStorage');
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Mock API: Error loading from localStorage', error);
  }
  console.log('Mock API: Using default boardList');
  return boardList;
};

// Save to localStorage
const saveBoardData = (data: BoardObjType[]) => {
  try {
    localStorage.setItem('scrumboard_boards', JSON.stringify(data));
    console.log('Mock API: Saved boards to localStorage');
    
    // Trigger custom event to notify Reports component
    window.dispatchEvent(new CustomEvent('scrumboardDataChanged'));
  } catch (error) {
    console.error('Mock API: Error saving to localStorage', error);
  }
};

let boardData = loadBoardData();

mock.onGet('/api/scrumboard/board/list').reply(() => {
  console.log('Mock API: GET /api/scrumboard/board/list called');
  console.log('Mock API: Current boardData length:', boardData.length);
  console.log('Mock API: Board IDs:', boardData.map(b => b.id));
  return [200, boardData];
});

mock.onGet('/api/scrumboard/label/list').reply(200, labelList);

mock.onGet('/api/scrumboard/member/list').reply(200, memberList);

// API để lấy members của board cụ thể
mock.onGet(/\/api\/scrumboard\/board\/\d+\/members/).reply((request: AxiosRequestConfig) => {
  console.log('🔍 Mock API called:', request.url);
  const url = request.url || '';
  const boardIdMatch = url.match(/\/api\/scrumboard\/board\/(\d+)\/members/);
  
  if (!boardIdMatch) {
    console.log('❌ Invalid board ID in URL:', url);
    return [400, { error: 'Invalid board ID' }];
  }
  
  const boardId = parseInt(boardIdMatch[1]);
  console.log('📋 Getting members for board ID:', boardId);
  
  console.log('🔍 TeamService imported:', !!TeamService);
  console.log('🔍 TeamService.getBoardMembersSync:', typeof TeamService.getBoardMembersSync);
  
  let members: unknown[] = [];
  
  try {
    // Debug localStorage before getting members
    if (TeamService && TeamService.debugStorage) {
      TeamService.debugStorage();
    }
    
    // Lấy board members từ TeamService
    if (TeamService && TeamService.getBoardMembersSync) {
      const boardMembers = TeamService.getBoardMembersSync(boardId);
      console.log('👥 Board members found:', boardMembers.length);
      
      // Chuyển đổi BoardMember thành MemberObjType
      members = boardMembers.map((boardMember: { member: unknown }) => boardMember.member);
    } else {
      console.error('❌ TeamService methods not available');
    }
    
  } catch (error) {
    console.error('❌ Error getting board members:', error);
    // Fallback: return empty array
    members = [];
  }
  
  console.log(`✅ API: /api/scrumboard/board/${boardId}/members - Returning ${members.length} members:`, members);
  return [200, members];
});

mock
  .onPost('/api/scrumboard/add/board')
  .reply((request: AxiosRequestConfig) => {
    const {board} = JSON.parse(request.data);
    const newBoard = {
      id: generateRandomUniqueNumber(),
      name: board.name,
      list: [],
    };
    console.log('Mock API: Creating new board:', newBoard);
    boardData = boardData.concat(newBoard);
    saveBoardData(boardData); // Save to localStorage
    
    // Tự động thêm owner vào board mới
    const ownerId = 500; // John Doe as default owner
    const ownerName = 'John Doe';
    const ownerAvatar = '/assets/images/avatar/A1.jpg';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TeamService.addBoardMember(newBoard.id, ownerId, 'PM' as any).then(() => {
      console.log(`✅ Added PM ${ownerId} to board ${newBoard.id}`);
      
      // Create notification for board creation
      NotificationService.notifyBoardCreated(
        newBoard.name,
        newBoard.id,
        ownerId,
        ownerName,
        ownerAvatar,
        [ownerId] // Notify the owner
      );
    }).catch((error: unknown) => {
      console.error(`❌ Failed to add owner to board ${newBoard.id}:`, error);
    });
    
    console.log('Mock API: Updated boardData length:', boardData.length);
    console.log('Mock API: All board IDs:', boardData.map(b => b.id));
    return [200, newBoard];
  });

mock
  .onPut('/api/scrumboard/edit/board')
  .reply((request: AxiosRequestConfig) => {
    const {board} = JSON.parse(request.data);
    boardData = boardData.map((data) => (data.id === board.id ? board : data));
    saveBoardData(boardData); // Save to localStorage
    return [200, board];
  });

mock.onGet('/api/scrumboard/board/').reply((config: AxiosRequestConfig) => {
  const {params} = config;
  const response = boardData.find((board) => board.id === parseInt(params.id));
  return [200, response];
});

mock.onPost('/api/scrumboard/add/list').reply((request: AxiosRequestConfig) => {
  const {boardId, list} = JSON.parse(request.data);
  const newList = {
    id: generateRandomUniqueNumber(),
    cards: [],
    name: list.name,
  };
  boardData = boardData.map((data) => {
    if (data.id === boardId) {
      data.list = data.list.concat(newList);
      return data;
    }
    return data;
  });
  saveBoardData(boardData); // Save to localStorage
  const updatedBoard = boardData.find((data: unknown) => (data as { id: number }).id === boardId);
  return [200, updatedBoard];
});

mock.onPut('/api/scrumboard/edit/list').reply((request: AxiosRequestConfig) => {
  const {boardId, list} = JSON.parse(request.data);
  boardData = boardData.map((data) => {
    if (data.id === boardId) {
      data.list = data.list.map((item: unknown) =>
        (item as { id: number }).id === list.id ? list : item,
      );
      return data;
    }
    return data;
  });
  saveBoardData(boardData); // Save to localStorage
  const updatedBoard = boardData.find((data: unknown) => (data as { id: number }).id === boardId);
  return [200, updatedBoard];
});

mock
  .onPut('/api/cards/update/category')
  .reply((request: AxiosRequestConfig) => {
    const {cardId, sourceLaneId, categoryId, position, boardId} = JSON.parse(
      request.data,
    );
    
    let movedCard: CardObjType | null = null;
    let sourceLaneName = '';
    let targetLaneName = '';
    let boardName = '';
    
    boardData = boardData.map((data: BoardObjType) => {
      if (data.id === boardId) {
        boardName = data.name;
        const sourceLane = data.list.find(
          (item: CardListObjType) => item.id === sourceLaneId,
        );
        const card = sourceLane?.cards.find(
          (item: CardObjType) => item.id === cardId,
        );
        if (sourceLane && card) {
          sourceLaneName = sourceLane.name || 'Unknown List';
          movedCard = card;
          sourceLane.cards = sourceLane.cards
            ? sourceLane.cards.filter((item) => item.id !== cardId)
            : [];
        }
        const targetLane = data.list.find(
          (item: CardListObjType) => item.id === categoryId,
        );
        if (targetLane) {
          targetLaneName = targetLane.name || 'Unknown List';
          if (targetLane?.cards) {
            targetLane?.cards.splice(position, 0, card!);
          } else {
            targetLane!.cards = [card!];
          }
        }
        data.list = data.list.map((item: CardListObjType) => {
          if (item.id === sourceLane?.id) return sourceLane;
          return item;
        }) as CardListObjType[];
        return data;
      }
      return data;
    });
    saveBoardData(boardData); // Save to localStorage
    
    // Create notification for card move
    if (movedCard && sourceLaneName !== targetLaneName) {
      const actorId = 500; // John Doe as default actor
      const actorName = 'John Doe';
      const actorAvatar = '/assets/images/avatar/A1.jpg';
      const card = movedCard as CardObjType;
      const assignedMembers = card.members?.map((m: any) => m.id) || [];
      
      NotificationService.notifyCardMoved(
        card.title,
        boardId,
        boardName,
        sourceLaneName,
        targetLaneName,
        actorId,
        actorName,
        actorAvatar,
        assignedMembers
      );
    }
    
    const updatedBoard = boardData.find((data: unknown) => (data as { id: number }).id === boardId);
    return [200, updatedBoard];
  });

mock.onPost('/api/scrumboard/add/card').reply((request: AxiosRequestConfig) => {
  const {board, list, card} = JSON.parse(request.data);
  const selectedBoard: BoardObjType = boardData.find(
    (data) => data.id === board.id,
  )!;
  const selectedList: CardListObjType = selectedBoard.list.find(
    (data) => data.id === list.id,
  )!;
  selectedList.cards = selectedList.cards.concat(card);
  selectedBoard.list = selectedBoard.list.map((data) =>
    data.id === selectedList.id ? selectedList : data,
  );
  boardData = boardData.map((data) =>
    data.id === selectedBoard.id ? selectedBoard : data,
  );
  saveBoardData(boardData); // Save to localStorage
  
  // Create notification for card creation
  const actorId = 500; // John Doe as default actor
  const actorName = 'John Doe';
  const actorAvatar = '/assets/images/avatar/A1.jpg';
  const assignedMembers = card.members?.map((m: any) => m.id) || [];
  
  NotificationService.notifyCardCreated(
    card.title,
    selectedBoard.id,
    selectedBoard.name,
    actorId,
    actorName,
    actorAvatar,
    assignedMembers
  );
  
  return [200, selectedBoard];
});

mock.onPut('/api/scrumboard/edit/card').reply((request: AxiosRequestConfig) => {
  const {board, list, card} = JSON.parse(request.data);
  const selectedBoard: BoardObjType = boardData.find(
    (data) => data.id === board.id,
  )!;
  const selectedList: CardListObjType = selectedBoard.list.find(
    (data) => data.id === list.id,
  )!;
  selectedList.cards = selectedList.cards.map((data: CardObjType) =>
    data.id === card.id ? card : data,
  );
  selectedBoard.list = selectedBoard.list.map((data) =>
    data.id === selectedList.id ? selectedList : data,
  );
  boardData = boardData.map((data) =>
    data.id === selectedBoard.id ? selectedBoard : data,
  );
  saveBoardData(boardData); // Save to localStorage
  return [200, selectedBoard];
});

mock
  .onPost('/api/scrumboard/delete/card')
  .reply((request: AxiosRequestConfig) => {
    const {boardId, listId, cardId} = JSON.parse(request.data);
    const selectedBoard: BoardObjType = boardData.find(
      (data) => data.id === boardId,
    )!;
    const selectedList: CardListObjType = selectedBoard.list.find(
      (data) => data.id === listId,
    )!;
    selectedList.cards = selectedList.cards.filter(
      (data) => data.id !== cardId,
    );
    selectedBoard.list = selectedBoard.list.map((data) =>
      data.id === selectedList.id ? selectedList : data,
    );
    boardData = boardData.map((data) =>
      data.id === selectedBoard.id ? selectedBoard : data,
    );
    saveBoardData(boardData); // Save to localStorage
    return [200, selectedBoard];
  });

mock
  .onPost('/api/scrumboard/delete/board')
  .reply((request: AxiosRequestConfig) => {
    const {boardId} = JSON.parse(request.data);
    boardData = boardData.filter((data) => data.id !== boardId);
    saveBoardData(boardData); // Save to localStorage
    return [200, boardId];
  });

mock
  .onPut('/api/scrumboard/delete/board')
  .reply((request: AxiosRequestConfig) => {
    const {boardId} = JSON.parse(request.data);
    console.log('🗑️ Deleting board with ID:', boardId);
    boardData = boardData.filter((data) => data.id !== boardId);
    saveBoardData(boardData); // Save to localStorage
    console.log('✅ Board deleted successfully. Remaining boards:', boardData.length);
    return [200, boardId];
  });

mock
  .onPost('/api/scrumboard/delete/list')
  .reply((request: AxiosRequestConfig) => {
    const {boardId, listId} = JSON.parse(request.data);
    const selectedBoard: BoardObjType = boardData.find(
      (data) => data.id === boardId,
    )!;
    selectedBoard.list = selectedBoard.list.filter(
      (item) => item.id !== listId,
    );
    boardData = boardData.map((data) =>
      data.id === selectedBoard.id ? selectedBoard : data,
    );
    saveBoardData(boardData); // Save to localStorage
    return [200, selectedBoard];
  });
