import { useMemo, type FC, type ReactNode } from "react";
import {
  type EasLog_Default,
  EasLogKind,
  type EasLog,
  type EasLog_GrpcClient,
  type EasLog_GrpcServer,
  type EasLog_Gin,
  type EasLog_Gorm,
  type EasLog_Mongo,
  type EasLog_Amq,
  type EasLog_Rmq,
} from "../interface";
import ReactJson, { type ReactJsonViewProps } from "react-json-view";
import { useDarkMode } from "../useDarkMode";
import clsx from "clsx";

export const logPreviewString = (log: EasLog): string => {
  let data;
  switch (log.kind) {
    case EasLogKind.Default:
      data = log.data as EasLog_Default;
      return data.msg;
    case EasLogKind.GrpcClient:
      data = log.data as EasLog_GrpcClient;
      return `${data.endKey ? `[${data.elapsed?.toFixed(2)}ms] ` : ""}${
        data.call
      }`;
    case EasLogKind.GrpcServer:
      data = log.data as EasLog_GrpcServer;
      return `${data.endKey ? `[${data.elapsed?.toFixed(2)}ms] ` : ""}${
        data.call
      }`;
    case EasLogKind.Gin:
      data = log.data as EasLog_Gin;
      return `${data.endKey ? `[${data.elapsed?.toFixed(2)}ms] ` : ""} ${
        data.method
      } ${data.path}`;
    case EasLogKind.Gorm:
      data = log.data as EasLog_Gorm;
      return `[${data.duration.toFixed(2)}ms] ${data.sql}`;
    case EasLogKind.Mongo:
      data = log.data as EasLog_Mongo;
      return "";
    case EasLogKind.Amq:
      data = log.data as EasLog_Amq;
      return "";
    case EasLogKind.Rmq:
      data = log.data as EasLog_Rmq;
      return "";
    default:
      return "";
  }
};

export const LogDataViewer: FC<{ log: EasLog }> = ({ log }): ReactNode => {
  let data;
  switch (log.kind) {
    case EasLogKind.Default:
      data = log.data as EasLog_Default;
      return (
        <Field name="消息">
          <JsonViewer src={data.msg} />
        </Field>
      );
    case EasLogKind.GrpcClient:
      data = log.data as EasLog_GrpcClient;
      if (data.startKey) {
        return (
          <>
            <Field name="服务">{data.name}</Field>
            <Field name="函数">{data.call}</Field>
            <Field name="请求">
              <JsonViewer src={data.req} collapsed={1} />
            </Field>
          </>
        );
      } else if (data.endKey) {
        return (
          <>
            <Field name="服务">{data.name}</Field>
            <Field name="函数">{data.call}</Field>
            <Field name="耗时">{data.elapsed}ms</Field>
            <Field name="错误">
              <Block src={data.error} />
            </Field>
            <Field name="响应">
              <JsonViewer src={data.resp} collapsed={1} />
            </Field>
          </>
        );
      }
      return null;
    case EasLogKind.GrpcServer:
      data = log.data as EasLog_GrpcServer;
      if (data.startKey) {
        return (
          <>
            <Field name="来源">{data.from}</Field>
            <Field name="服务">{data.name}</Field>
            <Field name="方法">{data.call}</Field>
            <Field name="请求">
              <JsonViewer src={data.req} collapsed={1} />
            </Field>
          </>
        );
      } else if (data.endKey) {
        return (
          <>
            <Field name="来源">{data.from}</Field>
            <Field name="服务">{data.name}</Field>
            <Field name="方法">{data.call}</Field>
            <Field name="耗时">{data.elapsed}ms</Field>
            <Field name="错误">
              <Block src={data.error} />
            </Field>
            <Field name="响应">
              <JsonViewer src={data.resp} collapsed={1} />
            </Field>
          </>
        );
      }
      return null;
    case EasLogKind.Gin:
      data = log.data as EasLog_Gin;
      if (data.startKey) {
        return (
          <>
            <Field name="来源">{data.from}</Field>
            <Field name="服务">{data.name}</Field>
            <Field name="方法">{data.method}</Field>
            <Field name="路径">{data.path}</Field>
            <Field name="头部">
              <JsonViewer src={data.header} collapsed={0} />
            </Field>
            <Field name="请求">
              <JsonViewer src={data.req} collapsed={1} />
            </Field>
          </>
        );
      } else if (data.endKey) {
        return (
          <>
            <Field name="来源">{data.from}</Field>
            <Field name="服务">{data.name}</Field>
            <Field name="方法">{data.method}</Field>
            <Field name="路径">{data.path}</Field>
            <Field name="耗时">{data.elapsed}ms</Field>
            <Field name="状态">{data.status}</Field>
            <Field name="错误">
              {data.errors?.length
                ? data.errors.map((e, i) => <Block key={i} src={e} />)
                : "空"}
            </Field>
            <Field name="响应">
              <JsonViewer src={data.resp} collapsed={1} />
            </Field>
          </>
        );
      }
      return null;
    case EasLogKind.Gorm:
      data = log.data as EasLog_Gorm;
      return (
        <>
          <Field name="影响">{data.rows}行</Field>
          <Field name="耗时">{data.duration}ms</Field>
          <Field name="错误">
            <Block src={data.error} />
          </Field>
          <Field name="语句">
            <Block src={data.sql} />
          </Field>
        </>
      );
    case EasLogKind.Mongo:
      data = log.data as EasLog_Mongo;
      return "";
    case EasLogKind.Amq:
      data = log.data as EasLog_Amq;
      return "";
    case EasLogKind.Rmq:
      data = log.data as EasLog_Rmq;
      return "";
    default:
      return "";
  }
};

export const Field: FC<{ name: string; children: ReactNode }> = ({
  name,
  children,
}) => {
  return (
    <div className="flex mt-1 items-center">
      <div className="font-bold flex-none w-12 text-right">{name}:</div>
      <div className="ml-2 flex-auto">{children}</div>
    </div>
  );
};

export const JsonViewer: FC<
  Omit<ReactJsonViewProps, "src"> & {
    className?: string;
    src: string | object | undefined;
  }
> = ({ className, src: _src, ...props }) => {
  const [isDark] = useDarkMode();
  const src = useMemo(() => {
    if (typeof _src === "string") {
      try {
        return JSON.parse(_src);
      } catch (e) {
        return _src;
      }
    }
    return _src;
  }, []);

  if (typeof src === "string" || !src) {
    return <Block src={src} />;
  }

  return (
    <div className={clsx(className, "bg-color-bg-4 border rounded-lg p-2")}>
      <ReactJson
        src={src}
        collapsed={1}
        name={null}
        displayDataTypes={false}
        theme={isDark ? "monokai" : "rjv-default"}
        {...props}
      />
    </div>
  );
};

const Block: FC<{ src: string | undefined }> = ({ src }) => {
  if (!src) {
    return "无";
  }
  return (
    <div className="border rounded-lg p-2 bg-color-bg-4 whitespace-pre-wrap">
      {src}
    </div>
  );
};

// const Block = styled.div`
//   border-width: 1px;
//   border-radius: 0.5rem /* 8px */;
//   padding: 0.5rem /* 8px */;
//   background-color: var(--color-bg-4);
//   white-space: pre-wrap;
// `;
