/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import {
  InfoViewActions,
  useInfoViewActionsContext,
} from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { isRequestSuccessful, sanitizeData } from "@crema/helpers/ApiHelper";
import { jwtAxios } from "@crema/services/auth/jwt-auth";
import {
  APIErrorProps,
  APIErrorResProps,
} from "@crema/types/models/APIDataProps";
import { AxiosResponse } from "axios";

export const useGetDataApi = <T,>(
  url: string,
  initialData?: T,
  params?: any,
  initialCall?: boolean,
  callbackFun?: (data: T) => void
) => {
  if (initialCall === undefined) {
    initialCall = true;
  }
  const { fetchError } = useInfoViewActionsContext();
  const [initialUrl, setInitialUrl] = useState<string>(url);
  const [allowApiCall, setAllowApiCall] = useState<boolean>(initialCall);
  const [loading, setLoading] = useState<boolean>(initialCall);
  const [apiData, setData] = useState<T>(
    initialData ? initialData : (undefined as T)
  );
  const [queryParams, updateQueryParams] = useState<object>(params);
  const resStateRef = useRef<boolean>(false);
  const didCancelRef = useRef<boolean>(false);

  const updateInitialUrl = (value: string) => {
    setAllowApiCall(true);
    setInitialUrl(value);
  };

  const reCallAPI = () => {
    setQueryParams(queryParams);
  };

  const setQueryParams = (queryParams: object) => {
    setLoading(true);
    updateQueryParams({ ...queryParams });
    setAllowApiCall(true);
  };

  useEffect(() => {
    didCancelRef.current = false;
    const fetchData = () => {
      resStateRef.current = true;
      let params = {};
      if (!_.isEmpty(queryParams)) {
        params = {
          ...trimObjectValues(queryParams),
        };
      }
      jwtAxios
        .get(initialUrl, { params: sanitizeData(params) })
        .then((data: any) => {
          resStateRef.current = false;
          if (!didCancelRef.current) {
            if (isRequestSuccessful(data.status)) {
              setLoading(false);
              // Unwrap SuccessResponse<T> format: response.data.data
              const actualData =
                data.data?.data !== undefined ? data.data.data : data.data;
              setData(actualData);
              if (callbackFun) callbackFun(actualData);
            } else {
              setLoading(false);
              fetchError(data.data.error ? data.data.error : data.data.message);
              setData(initialData ? initialData : (undefined as T));
              if (callbackFun) callbackFun(data.data);
            }
          }
        })
        .catch((error: any) => {
          resStateRef.current = false;
          if (error.response?.data?.message) {
            if (callbackFun) callbackFun(error.response.data);
            fetchError(error.response.data.message);
          } else {
            fetchError(error.message || "An error occurred");
            if (callbackFun) callbackFun(error);
          }
          setLoading(false);
        });
    };
    if (allowApiCall && !resStateRef.current) fetchData();
    return () => {
      didCancelRef.current = true;
    };
  }, [initialUrl, queryParams, allowApiCall]);
  return [
    {
      loading,
      apiData,
      initialUrl,
    },
    {
      setData,
      setLoading,
      updateInitialUrl,
      setQueryParams,
      reCallAPI,
    },
  ] as const;
};

export const trimObjectValues = (obj: any) => {
  if (_.isEmpty(obj)) {
    return obj;
  }
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    }
  });
  return obj;
};

const handleApiResponse = <T,>(
  url: string,
  fetchSuccess: () => void,
  data: AxiosResponse<T>,
  resolve: (data: T) => void,
  reject: (data: APIErrorResProps) => void
) => {
  fetchSuccess();
  if (isRequestSuccessful(data.status)) {
    // Unwrap SuccessResponse<T> format: response.data.data
    const actualData =
      (data.data as any)?.data !== undefined
        ? (data.data as any).data
        : data.data;
    return resolve(actualData);
  } else {
    return reject(data.data as APIErrorResProps);
  }
};

const handleAPIError = (
  url: string,
  fetchSuccess: () => void,
  error: APIErrorProps,
  reject: (data: APIErrorResProps) => void
) => {
  fetchSuccess();
  if (error.response?.data?.message) {
    return reject(error.response.data);
  } else {
    return reject({
      message: error.message || "An error occurred",
      error: error,
    } as APIErrorResProps);
  }
};

export const postDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  payload: object,
  isHideLoader?: boolean,
  headers = {}
): Promise<T> => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .post(url, sanitizeData(payload), headers ? { headers } : {})
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};

export const putDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  payload: object,
  isHideLoader = false
): Promise<T> => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .put(url, sanitizeData(payload))
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};

export const getDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  params = {},
  isHideLoader = false,
  headers = {}
): Promise<T> => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .get(url, { params: sanitizeData(params), headers })
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};

export const deleteDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  params = {},
  isHideLoader = false
): Promise<T> => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .delete(url, { params })
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};

export const uploadDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  payload = {},
  isHideLoader = false,
  onUploadProgress = () => {},
  allowDownload = false
): Promise<T> => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .post(url, payload, {
        onUploadProgress,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        responseType: allowDownload ? "arraybuffer" : "stream",
      })
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};

export const uploadPutDataApi = <T,>(
  url: string,
  infoViewContext: InfoViewActions,
  payload = {},
  isHideLoader = false
) => {
  const { fetchStart, fetchSuccess } = infoViewContext;
  return new Promise((resolve, reject) => {
    if (!isHideLoader) fetchStart();
    jwtAxios
      .put(url, payload, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((data: any) => {
        return handleApiResponse<T>(url, fetchSuccess, data, resolve, reject);
      })
      .catch((error: any) => {
        return handleAPIError(url, fetchSuccess, error, reject);
      });
    return Promise.resolve();
  });
};
