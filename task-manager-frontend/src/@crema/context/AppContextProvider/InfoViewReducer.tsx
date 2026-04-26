import { InfoViewData } from "./InfoViewContextProvider";

export const InFoViewActions = {
  FETCH_STARTS: "FETCH_STARTS",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  SET_MESSAGE: "SET_MESSAGE",
  SET_ERROR: "SET_ERROR",
  SET_NOTIFICATION: "SET_NOTIFICATION",
  CLEAR_INFOVIEW: "CLEAR_INFOVIEW",
} as const;

export function contextReducer(state: InfoViewData, action: any) {
  switch (action.type) {
    case InFoViewActions.FETCH_STARTS: {
      return {
        ...state,
        loading: true,
        displayMessage: "",
        error: "",
      };
    }
    case InFoViewActions.FETCH_SUCCESS: {
      return {
        ...state,
        loading: false,
        displayMessage: "",
        error: "",
      };
    }
    case InFoViewActions.SET_MESSAGE: {
      return {
        ...state,
        loading: false,
        displayMessage: action.payload,
        error: "",
      };
    }
    case InFoViewActions.SET_ERROR: {
      return {
        ...state,
        loading: false,
        displayMessage: "",
        error: action.payload,
        notification: null,
      };
    }
    case InFoViewActions.SET_NOTIFICATION: {
      return {
        ...state,
        loading: false,
        displayMessage: "",
        error: "",
        notification: action.payload,
      };
    }
    case InFoViewActions.CLEAR_INFOVIEW: {
      return {
        ...state,
        loading: false,
        displayMessage: "",
        error: "",
        notification: null,
      };
    }
    default:
      return state;
  }
}
