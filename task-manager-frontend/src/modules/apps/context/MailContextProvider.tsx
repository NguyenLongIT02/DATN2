import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { useLocation, useParams } from "react-router-dom";
import type {
  ConnectionObjType,
  FolderObjType,
  LabelObjType,
  MailObjType,
} from "@crema/types/models/apps/Mail";
import { APIDataProps } from "@crema/types/models/APIDataProps";

export type MailContextType = {
  labelList: LabelObjType[];
  connectionList: ConnectionObjType[];
  folderList: FolderObjType[];
  mailList: APIDataProps<MailObjType[]>;
  loading: boolean;
  page: number;
};

export type MailActionContextType = {
  setMailData: (data: APIDataProps<MailObjType[]>) => void;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    data: number,
  ) => void;
};

const ContextState: MailContextType = {
  labelList: [],
  folderList: [],
  connectionList: [],
  mailList: {} as APIDataProps<MailObjType[]>,
  loading: false,
  page: 0,
};

const MailContext = createContext<MailContextType>(ContextState);
const MailActionsContext = createContext<MailActionContextType>({
  setMailData: (data: APIDataProps<MailObjType[]>) => {
    console.log(data);
  },
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    data: number,
  ) => {
    console.log(data);
    console.log(event);
  },
});

export const useMailContext = () => useContext(MailContext);

export const useMailActionsContext = () => useContext(MailActionsContext);

type Props = {
  children: ReactNode;
};
export const MailContextProvider = ({ children }: Props) => {
  const params = useParams();
  const { pathname } = useLocation();
  const [{ apiData: labelList }] = useGetDataApi<LabelObjType[]>(
    "/api/mailApp/labels/list",
  );
  const [{ apiData: connectionList }] = useGetDataApi<ConnectionObjType[]>(
    "/api/mailApp/connection/list",
  );
  const [{ apiData: folderList }] = useGetDataApi<FolderObjType[]>(
    "/api/mailApp/folders/list",
  );
  const [page, setPage] = useState(0);

  const [
    { apiData: mailList, loading },
    { setQueryParams, setData: setMailData },
  ] = useGetDataApi<APIDataProps<MailObjType[]>>(
    "/api/mailApp/folder/mail/List",
    undefined,
    {
      type: params?.folder ? "folder" : "label",
      name: params?.folder || params?.label,
      page: page,
    },
    false,
  );

  useEffect(() => {
    setPage(0);
  }, [pathname]);

  useEffect(() => {
    setQueryParams({
      type: params?.folder ? "folder" : "label",
      name: params?.folder || params?.label,
      page,
    });
  }, [page, pathname]);

  const onPageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number,
  ) => {
    console.log("value", event);
    setPage(value);
  };

  return (
    <MailContext.Provider
      value={{
        labelList,
        connectionList,
        folderList,
        mailList,
        loading,
        page,
      }}
    >
      <MailActionsContext.Provider
        value={{
          setMailData,
          onPageChange,
        }}
      >
        {children}
      </MailActionsContext.Provider>
    </MailContext.Provider>
  );
};
export default MailContextProvider;
