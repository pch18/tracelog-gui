import { Button, Input, Tabs } from "@arco-design/web-react";
import { checkTraceId } from "./utils";
import { TraceIdResult } from "@/common/TraceIdResult";
import { useStateStore } from "@/utils/hooks";

const STORE_SEARCH_BY_ID_1 = "STORE_SEARCH_BY_ID_1";
const STORE_SEARCH_BY_ID_2 = "STORE_SEARCH_BY_ID_2";
const STORE_SEARCH_BY_ID_3 = "STORE_SEARCH_BY_ID_3";
const STORE_SEARCH_BY_ID_4 = "STORE_SEARCH_BY_ID_4";

export default function () {
  const [traceId, setTraceId] = useStateStore("", STORE_SEARCH_BY_ID_1);
  const [tabs, setTabs] = useStateStore<string[]>([], STORE_SEARCH_BY_ID_2);
  const [activeTab, setActiveTab] = useStateStore<string | undefined>(
    undefined,
    STORE_SEARCH_BY_ID_3
  );
  const [refreshKey, setRefreshKey] = useStateStore<Record<string, number>>(
    {},
    STORE_SEARCH_BY_ID_4
  );

  const handleSearch = () => {
    if (!checkTraceId(traceId)) {
      return;
    }
    setTabs((_t) => {
      if (!_t.includes(traceId)) {
        return [..._t, traceId];
      }
      return _t;
    });
    setActiveTab(traceId);
    setRefreshKey((_k) => ({ ..._k, [traceId]: (_k[traceId] || 0) + 1 }));
  };

  const handleClear = () => {
    setTabs([]);
    setActiveTab(undefined);
  };

  return (
    <div className="p-4 size-full flex flex-col">
      <div className="flex gap-4 mb-4">
        <Input
          maxLength={16}
          className="h-12 font-bold !text-2xl tracking-widest font-mono"
          value={traceId}
          onChange={setTraceId}
          placeholder="请输入要查询的 Trace ID"
          onPressEnter={handleSearch}
          onFocus={(e) => {
            e.target.selectionStart = 0;
            e.target.selectionEnd = e.target.value.length;
          }}
        />
        <Button
          className="!h-12 !px-7 !text-xl "
          onClick={handleSearch}
          disabled={!checkTraceId(traceId)}
        >
          {tabs.includes(traceId) ? "刷新" : "搜索"}
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        onClickTab={setTraceId}
        tabPosition="left"
        className="font-mono flex-1"
        css={`
          .arco-tabs-content-inner,
          .arco-tabs-pane {
            height: 100%;
          }
          // .arco-tabs-content {
          //   overflow: auto;
          // }
          // .arco-tabs-content-item-active {
          //   overflow: visible;
          // }
          .arco-tabs-header-nav {
            width: 108px;
          }
          .arco-tabs-header-extra {
            width: 100%;
            padding: 0 12px;
          }
        `}
        extra={
          tabs?.length ? (
            <Button
              size="small"
              type="secondary"
              className="w-full"
              onClick={handleClear}
            >
              清空
            </Button>
          ) : undefined
        }
      >
        {tabs.map((tab) => (
          <Tabs.TabPane
            key={tab}
            title={<div className="w-[68px] text-wrap break-all">{tab}</div>}
          >
            <TraceIdResult traceId={tab} key={refreshKey[tab]} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
}
