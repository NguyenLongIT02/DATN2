import { ReactNode, createContext, useContext } from "react";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type {
  BoardObjType,
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";

export type ScrumContextType = {
  boardList: BoardObjType[];
  labelList: LabelObjType[];
  memberList: MemberObjType[];
};

export type ScrumActionContextType = {
  setData: (data: BoardObjType[]) => void;
};

const ContextState: ScrumContextType = {
  boardList: [],
  labelList: [],
  memberList: [],
};

const ScrumContext = createContext<ScrumContextType>(ContextState);
const ScrumActionsContext = createContext<ScrumActionContextType>({
  setData: (data: BoardObjType[]) => {
    console.log(data);
  },
});

export const useScrumContext = () => useContext(ScrumContext);

export const useScrumActionsContext = () => useContext(ScrumActionsContext);

type Props = {
  children: ReactNode;
};

export const ScrumContextProvider = ({ children }: Props) => {
  const [{ apiData: boardList }, { setData }] = useGetDataApi<BoardObjType[]>(
    "/api/scrumboard/board/list",
    []
  );

  // TODO: Backend chưa implement /scrumboard/label/list endpoint
  // Sử dụng mock data để tránh 404 error
  const mockLabelList: LabelObjType[] = [
    { id: 1, name: "Bug", type: 1, color: "#FF6B6B" },
    { id: 2, name: "Feature", type: 2, color: "#4ECDC4" },
    { id: 3, name: "Enhancement", type: 3, color: "#45B7D1" },
    { id: 4, name: "Critical", type: 4, color: "#FFA07A" },
    { id: 5, name: "Low Priority", type: 5, color: "#98D8C8" },
  ];

  const [{ apiData: labelList }] = useGetDataApi<LabelObjType[]>(
    "/scrumboard/label/list",
    mockLabelList // Fallback to mock data
  );
  // TODO: Backend chưa implement /scrumboard/member/list endpoint
  // Sử dụng empty array để tránh 404 error
  const [{ apiData: memberList }] = useGetDataApi<MemberObjType[]>(
    "/scrumboard/member/list",
    []
  );

  return (
    <ScrumContext.Provider
      value={{
        boardList,
        labelList,
        memberList,
      }}
    >
      <ScrumActionsContext.Provider
        value={{
          setData,
        }}
      >
        {children}
      </ScrumActionsContext.Provider>
    </ScrumContext.Provider>
  );
};
export default ScrumContextProvider;
