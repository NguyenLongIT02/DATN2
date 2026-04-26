import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { contextReducer, InFoViewActions } from "./InfoViewReducer";

export type NotificationType = "success" | "error" | "warning" | "info";

export type NotificationMessage = {
  message: string;
  type: NotificationType;
};

export type InfoViewData = {
  error: string;
  displayMessage: string;
  loading: boolean;
  notification: NotificationMessage | null;
};

export type InfoViewActions = {
  fetchStart: () => void;
  fetchSuccess: () => void;
  fetchError: (error: string) => void;
  showMessage: (displayMessage: string) => void;
  showNotification: (message: string, type: NotificationType) => void;
  clearInfoView: () => void;
};

export const ContextState: InfoViewData = {
  loading: false,
  error: "",
  displayMessage: "",
  notification: null,
};

const InfoViewContext = createContext<InfoViewData>(ContextState);
const InfoViewActionsContext = createContext<InfoViewActions>({
  fetchStart: () => {},
  fetchSuccess: () => {},
  fetchError: () => {},
  showMessage: () => {},
  showNotification: () => {},
  clearInfoView: () => {},
});

export const useInfoViewContext = () => useContext(InfoViewContext);
export const useInfoViewActionsContext = () =>
  useContext(InfoViewActionsContext);

type InfoViewContextProviderProps = {
  children: ReactNode;
};
const InfoViewContextProvider: React.FC<InfoViewContextProviderProps> = (
  props
) => {
  const [state, dispatch] = useReducer(
    contextReducer,
    ContextState,
    () => ContextState
  );

  const fetchStart = useCallback(() => {
    dispatch({ type: InFoViewActions.FETCH_STARTS });
  }, []);

  const fetchSuccess = useCallback(() => {
    dispatch({ type: InFoViewActions.FETCH_SUCCESS });
  }, []);

  const fetchError = (error: string) => {
    dispatch({ type: InFoViewActions.SET_ERROR, payload: error });
  };

  const showMessage = (displayMessage: string) => {
    dispatch({ type: InFoViewActions.SET_MESSAGE, payload: displayMessage });
  };

  const showNotification = (message: string, type: NotificationType) => {
    dispatch({
      type: InFoViewActions.SET_NOTIFICATION,
      payload: { message, type },
    });
  };

  const clearInfoView = () => {
    dispatch({ type: InFoViewActions.CLEAR_INFOVIEW });
  };

  return (
    <InfoViewContext.Provider value={state}>
      <InfoViewActionsContext.Provider
        value={{
          fetchStart,
          fetchSuccess,
          fetchError,
          showMessage,
          showNotification,
          clearInfoView,
        }}
      >
        {props.children}
      </InfoViewActionsContext.Provider>
    </InfoViewContext.Provider>
  );
};

export default InfoViewContextProvider;
