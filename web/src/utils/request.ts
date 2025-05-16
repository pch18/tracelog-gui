import { type EasLog } from "@/common/interface";
import { Message } from "@arco-design/web-react";

const baseUrl = "/api/v1";

const customFetch = async <T>(
  url: string,
  param?: any,
  other?: RequestInit
) => {
  let res: Response | undefined;
  try {
    res = await fetch(url, {
      ...other,
      method: "POST",
      body: JSON.stringify(param),
    });
  } catch {}
  if (!res) {
    Message.error("网络错误");
    throw new Error("网络错误");
  }

  if (res.status === 401) location.href = "/login";
  if (res.status !== 200) {
    Message.error(`${res.status} ${res.statusText}`);
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
};

export const request = {
  SearchById: async (id: string) => {
    return await customFetch<EasLog[]>(`${baseUrl}/search_by_id`, {
      traceid: id,
    });
  },

  SearchByConds: async (cond: any) => {
    return await customFetch<EasLog[]>(`${baseUrl}/search_by_cond`, cond);
  },

  Login: async (auth: string) => {
    return await customFetch<{ err?: string }>(`${baseUrl}/login`, { auth });
  },

  Logout: async () => {
    return await customFetch<{ err?: string }>(`${baseUrl}/logout`, {});
  },

  getSys: async (time: number) => {
    return await customFetch<{
      storage: number;
      rows: number;
    }>(`${baseUrl}/get_sys`, {
      time,
    });
  },
};
