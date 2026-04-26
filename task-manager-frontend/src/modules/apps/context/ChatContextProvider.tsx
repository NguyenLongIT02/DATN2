import { createContext, ReactNode, useContext } from "react";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { ConnectionObjType } from "@crema/types/models/apps/Chat";

export type ChatContextType = {
  connectionList: ConnectionObjType[];
  loading: boolean;
};
export type ChatActionContextType = {
  setConnectionData: (data: ConnectionObjType[]) => void;
};

const ContextState: ChatContextType = {
  connectionList: [],
  loading: false,
};

const ChatContext = createContext<ChatContextType>(ContextState);
const ChatActionsContext = createContext<ChatActionContextType>({
  setConnectionData: (data: ConnectionObjType[]) => {
    console.log(data);
  },
});

export const useChatContext = () => useContext(ChatContext);

export const useChatActionsContext = () => useContext(ChatActionsContext);

type Props = {
  children: ReactNode;
};
export const ChatContextProvider = ({ children }: Props) => {
  const [{ apiData: connectionList, loading }, { setData: setConnectionData }] =
    useGetDataApi<ConnectionObjType[]>("/api/chatApp/connections", []);

  return (
    <ChatContext.Provider
      value={{
        connectionList,
        loading,
      }}
    >
      <ChatActionsContext.Provider
        value={{
          setConnectionData,
        }}
      >
        {children}
      </ChatActionsContext.Provider>
    </ChatContext.Provider>
  );
};
export default ChatContextProvider;
