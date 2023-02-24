import type { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import { useEffect } from "react";
import {
  tokenRefresh,
  selectAccessToken,
  logoutAction,
} from "features/authSlice";
import { useAppSelector, useAppDispatch } from "app/hooks";

console.log("process.env.REACT_APP_BASE_URL", process.env.REACT_APP_BASE_URL);

type ErrorMsg = {
  errorCode: number;
  errorMessage: string;
};
// url 호출 시 기본 값 셋팅
const client = axios.create({
  baseURL: "http://15.164.195.118:3100/",
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    accept: "application/json;charset=UTF-8",
  }, // data type
});

type Props = {
  children: any;
};

export const AxiosInterceptor = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const TokenUpdate = useAppSelector(selectAccessToken);

  useEffect(() => {
    // eslint-disable-next-line consistent-return
    function onRequest(config: AxiosRequestConfig): any {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      config = {
        ...config,
        headers: {
          "Content-type": "application/json",
          accept: "application/json;charset=UTF-8",
        },
      };

      const accessToken = localStorage.getItem("token");

      // 요청시 AccessToken 계속 보내주기
      if (!accessToken) {
        config = {
          ...config,
          headers: {
            "Content-type": "application/json",
          },
        };
        return config;
      }

      if (config.headers && accessToken) {
        config.headers.authorization = `Bearer ${accessToken}`;

        return config;
      }
      // Do something before request is sent
      console.log("request start", config);
      return config;
    }
    async function onErrorResponse(error: { response: any; config?: any }) {
      const {
        config,
        response: { status },
      } = error;
      if (status === 401) {
        if (error.response.data.errorCode === -113) {
          const originalRequest = config;

          // token refresh 요청
          const data = await axios
            .post(
              `${process.env.REACT_APP_BASE_URL}refresh`, // token refresh api
            )
            .catch((refError) => {
              console.log("리프레쉬 에러", refError);
              dispatch(logoutAction());
              console.log("유저 데이터 삭제함");
            });

          console.log("성공 데이터", data);
          // 새로운 토큰 저장
          // const { data: newAccessToken } = data;
          // // console.log("newAccessToken", newAccessToken);
          // dispatch(tokenRefresh(newAccessToken));
          // originalRequest.headers.authorization = `Bearer ${newAccessToken}`;
          // 401로 요청 실패했던 요청 새로운 accessToken으로 재요청
          return axios(originalRequest);
        }
      }

      console.log("response error", error);
      return Promise.reject(error);
    }

    const onResponse = (response: AxiosResponse): AxiosResponse => {
      const { method, url } = response.config;
      const { status } = response;
      console.log("성공", url, "method", method, "status", status);

      return response;
    };

    const requestInterceptor = client.interceptors.request.use(onRequest);
    const responseInterceptor = client.interceptors.response.use(
      onResponse,
      onErrorResponse,
    );

    const axiosEject = () => {
      client.interceptors.request.eject(requestInterceptor);
      client.interceptors.response.eject(responseInterceptor);
    };

    return () => axiosEject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export { client };
