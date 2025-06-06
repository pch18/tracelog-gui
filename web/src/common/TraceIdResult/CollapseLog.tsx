import { Button, Collapse, Link, Tag } from "@arco-design/web-react";
import {
  type EasLogLevel,
  type EasLog,
  EasLogKindColorMap,
  EasLogKind,
} from "../interface";
import { useMemo, type FC } from "react";
import dayjs from "dayjs";
import { Field, LogDataViewer, logPreviewString } from "./viewer";
import { Stack } from "./Stack";
import { LevelTag } from "./LevelTag";
import { IconSend } from "@arco-design/web-react/icon";
import clsx from "clsx";
import { openTraceId } from "./openTraceId";

export const CollapseLog: FC<{
  logs: EasLog[];
  filterLevels: EasLogLevel[];
  showTraceId?: boolean;
}> = ({ logs: _logs, filterLevels, showTraceId }) => {
  const logs = useMemo(() => {
    const l = !filterLevels.length
      ? _logs
      : _logs.filter((s) => filterLevels.includes(s.level));

    // todo: 后端还没完全升级，临时处理下
    l.forEach((l) => {
      if (!l.data) {
        l.data = l.logs;
      }
    });
    return l;
  }, [_logs, filterLevels]);

  return (
    <Collapse
      className="select-text"
      css={`
        .arco-collapse-item-header-title {
          flex: auto;
          overflow: hidden;
        }
      `}
    >
      {logs.map((log) => {
        return (
          <Collapse.Item
            destroyOnHide
            key={log._id.toString()}
            name={log._id.toString()}
            header={
              <div className="flex items-center gap-1">
                <LevelTag border level={log.level} />

                <Tag
                  className="flex-none"
                  // color={getColor(procMap[log.trace.prockey]?.srvInd)}
                >
                  {log.app}/{log.srv}
                </Tag>

                <Tag className="flex-none" color={EasLogKindColorMap[log.kind]}>
                  <div className="flex items-center">
                    {log.kind}
                    {"startKey" in log.data || "endKey" in log.data ? (
                      <IconSend
                        className={clsx("text-lg ml-1", {
                          "rotate-180":
                            log.kind === EasLogKind.GrpcClient
                              ? "endKey" in log.data
                              : "startKey" in log.data,
                        })}
                      />
                    ) : null}
                  </div>
                </Tag>

                <div className="truncate flex-auto">
                  {logPreviewString(log)}
                </div>

                <div className="text-xs text-color-text-3 flex-none">
                  {dayjs(log.time).format("YYYY/MM/DD HH:mm:ss")}
                </div>
              </div>
            }
            className="break-all"
          >
            {showTraceId ? (
              <Field name="Trace">
                {log.traceid ? (
                  <div className="flex items-center gap-1">
                    {log.traceid}
                    <Button
                      size="small"
                      type="text"
                      className="!px-1"
                      onClick={() => {
                        void openTraceId({ id: log.traceid });
                      }}
                    >
                      预览
                    </Button>
                  </div>
                ) : (
                  "无"
                )}
              </Field>
            ) : null}
            <LogDataViewer log={log} />
            <Field name="调用栈">
              <Stack list={log.stack} className="flex-[2]" />
            </Field>
          </Collapse.Item>
        );
      })}
    </Collapse>
  );
};
