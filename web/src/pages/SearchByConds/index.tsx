import { useRequest } from "ahooks";
import { SearchBar } from "./SearchBar";
import { request } from "@/utils/request";
import { ToolBar } from "@/common/TraceIdResult/ToolBar";
import { CollapseLog } from "@/common/TraceIdResult/CollapseLog";
import { useState } from "react";
import { type EasLogLevel } from "@/common/interface";
import { Message, Tag } from "@arco-design/web-react";

export default function () {
  const { data, runAsync, loading } = useRequest(
    async (cond?: any) => {
      if (!cond) {
        return undefined;
      }
      const _logs = await request.SearchByConds(cond);
      const logs = _logs.slice(0, 100);
      const hasMore = _logs.length > 100;
      return { logs, hasMore };
    },
    { manual: true }
  );

  const [filterLevels, setFilterLevels] = useState<EasLogLevel[]>([]);

  return (
    <div className="p-4 size-full flex">
      <div className="!w-[230px] flex-none border-r pr-4">
        <SearchBar onSearch={runAsync} />
        {data?.hasMore ? (
          <Tag className="float-right" color="red">
            匹配结果过多，已截断至前100条!
          </Tag>
        ) : null}
      </div>

      <div className="flex flex-col flex-auto pl-4 overflow-hidden">
        {!data ? (
          "请输入查询条件"
        ) : loading ? (
          "loading"
        ) : data.logs.length === 0 ? (
          "没有找到记录"
        ) : (
          <>
            <ToolBar
              className="py-2"
              logs={data.logs}
              filterLevels={filterLevels}
              setFilterLevels={setFilterLevels}
            />
            <div className="overflow-auto">
              <CollapseLog
                logs={data.logs}
                filterLevels={filterLevels}
                showTraceId
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
