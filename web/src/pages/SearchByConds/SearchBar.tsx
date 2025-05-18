import {
  EasLogKind,
  EasLogKindColorMap,
  type EasLogLevel,
  EasLogLevelColorMap,
} from "@/common/interface";
import {
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Message,
  Popover,
  Select,
} from "@arco-design/web-react";
import dayjs from "dayjs";
import { type FC, useMemo } from "react";
import { AsyncButton } from "@/components/AsyncButton";
import clsx from "clsx";
import { useSys } from "@/utils/hooks";
import { IconDelete, IconPlus } from "@arco-design/web-react/icon";

const STORE_SEARCH_BY_CONDS = "STORE_SEARCH_BY_CONDS";

export const SearchBar: FC<{
  onSearch: (cond?: any) => Promise<any>;
  className?: string;
}> = ({ onSearch, className }) => {
  const sys = useSys((s) => {
    return [...(s?.apps || []), ...(s?.srvs || [])];
  });
  const optionsEasLogLevel = useMemo(
    () => Object.keys(EasLogLevelColorMap) as EasLogLevel[],
    []
  );
  const optionsEasLogKind = useMemo(
    () => Object.keys(EasLogKindColorMap) as EasLogKind[],
    []
  );
  const [form] = Form.useForm();

  const handleSearch = async () => {
    const cond = {} as any;
    try {
      const values = await form.validate();
      if (values.app) {
        cond.app = values.app;
      }
      if (values.srv) {
        cond.srv = values.srv;
      }
      if (values.kind?.length) {
        cond.kind = values.kind;
      }
      if (values.level?.length) {
        cond.level = { $in: values.level };
      }
      if (values.timeStart || values.timeEnd) {
        cond.time = {
          $gte: values.timeStart ? dayjs(values.timeStart).unix() : undefined,
          $lte: values.timeEnd ? dayjs(values.timeEnd).unix() : undefined,
        };
      }
      if (values.data?.msg) {
        cond["data.msg"] = values.useRegex
          ? {
              $regex: values.data.msg,
            }
          : values.data.msg;
      }
      if (values.data?.sql) {
        cond["data.sql"] = values.useRegex
          ? {
              $regex: values.data.sql,
            }
          : values.data.sql;
      }
      if (values.data?.path) {
        cond["data.path"] = values.useRegex
          ? {
              $regex: values.data.path,
            }
          : values.data.path;
      }
      if (values.data?.call) {
        cond["data.call"] = values.useRegex
          ? {
              $regex: values.data.call,
            }
          : values.data.call;
      }
      if (values.data?.req) {
        Object.assign(
          cond,
          makeObjectListCond("data.req", values.data.req, values.useRegex)
        );
      }
      if (values.data?.resp) {
        Object.assign(
          cond,
          makeObjectListCond("data.resp", values.data.resp, values.useRegex)
        );
      }
      if (values.data?.header) {
        Object.assign(
          cond,
          makeObjectListCond("data.header", values.data.header, values.useRegex)
        );
      }
    } catch (e) {
      console.error(e);
      Message.error("请检查询条件");
      return;
    }
    await onSearch(cond);
  };

  const initialValues = useMemo(() => {
    try {
      const s = localStorage.getItem(STORE_SEARCH_BY_CONDS);
      if (s) {
        return JSON.parse(s);
      }
    } catch {}
  }, []);

  return (
    <Form
      css={`
        .arco-row {
          margin-bottom: 4px;
        }
      `}
      form={form}
      size="mini"
      className={clsx(className)}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
      onChange={(_, v) => {
        localStorage.setItem(STORE_SEARCH_BY_CONDS, JSON.stringify(v));
      }}
      initialValues={initialValues}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Form.Item label="开始" field="timeStart">
          <DatePicker
            showTime={{
              format: "HH:mm:ss",
            }}
            placeholder="开始时间"
            format="YYYY/MM/DD HH:mm:ss"
            disabledDate={(current) => current.isAfter(dayjs())}
          />
        </Form.Item>
        <Form.Item label="结束" field="timeEnd">
          <DatePicker
            showTime={{
              format: "HH:mm:ss",
            }}
            placeholder="结束时间"
            format="YYYY/MM/DD HH:mm:ss"
            disabledDate={(current) => current.isAfter(dayjs())}
          />
        </Form.Item>
        <Form.Item label="应用" field="app">
          <AutoComplete data={sys?.apps} allowClear placeholder="应用" />
        </Form.Item>
        <Form.Item label="服务" field="srv">
          <AutoComplete data={sys?.srvs} allowClear placeholder="服务" />
        </Form.Item>
        <Form.Item label="等级" field="level">
          <Select
            options={optionsEasLogLevel}
            mode="multiple"
            allowClear
            placeholder="等级"
          />
        </Form.Item>
        <Form.Item label="类型" field="kind">
          <Select options={optionsEasLogKind} allowClear placeholder="类型" />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, next) => prev.kind !== next.kind}
        >
          {(formData) => {
            // {fields.length ? (
            //
            // ) : null}
            switch (formData.kind) {
              case EasLogKind.Default:
                return (
                  <Form.Item label="消息" field="data.msg">
                    <Input allowClear placeholder="消息关键词（支持正则）" />
                  </Form.Item>
                );
              case EasLogKind.Gorm:
                return (
                  <Form.Item label="SQL" field="data.sql">
                    <Input allowClear placeholder="SQL关键词（支持正则）" />
                  </Form.Item>
                );
              case EasLogKind.GrpcClient:
              case EasLogKind.GrpcServer:
                return (
                  <>
                    <Form.Item label="函数" field="data.call">
                      <Input allowClear placeholder="函数关键词（支持正则）" />
                    </Form.Item>
                    <Form.Item label="请求">
                      <ObjectList field="data.req" />
                    </Form.Item>
                    <Form.Item label="响应">
                      <ObjectList field="data.resp" />
                    </Form.Item>
                  </>
                );
              case EasLogKind.Gin:
                return (
                  <>
                    <Form.Item label="路径" field="data.path">
                      <Input allowClear placeholder="路径关键词（支持正则）" />
                    </Form.Item>
                    <Form.Item label="头部">
                      <ObjectList field="data.header" />
                    </Form.Item>
                    <Form.Item label="请求">
                      <ObjectList field="data.req" />
                    </Form.Item>
                  </>
                );
            }
          }}
        </Form.Item>

        <Form.Item
          shouldUpdate={(prev, next) => prev.kind !== next.kind}
          noStyle
        >
          {(formData) => {
            if (!formData.kind) {
              return null;
            }
            return (
              <Form.Item
                label="选项"
                field="useRegex"
                triggerPropName="checked"
              >
                <Checkbox>模糊匹配（使用正则）</Checkbox>
              </Form.Item>
            );
          }}
        </Form.Item>

        <div className="w-full flex justify-end gap-4">
          <Button
            onClick={() => {
              form.clearFields();
              localStorage.removeItem(STORE_SEARCH_BY_CONDS);
            }}
          >
            重置
          </Button>
          <AsyncButton type="primary" onClick={handleSearch}>
            查询
          </AsyncButton>
        </div>
      </div>
    </Form>
  );
};

const makeObjectListCond = (
  field: string,
  conds: Array<{ key: string; val: string }>,
  useRegex: boolean
) => {
  const cond = {} as any;
  conds.forEach((f) => {
    if (f.key && f.val) {
      cond[`${field}.${f.key}`] = useRegex
        ? {
            $regex: f.val,
          }
        : f.val;
    }
  });
  return cond;
};

const ObjectList: FC<{ field: string }> = ({ field }) => {
  return (
    <Form.List field={field}>
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field, index) => {
              return (
                <div key={field.key} className="flex gap-1">
                  <Form.Item field={`${field.field}.key`}>
                    <Input placeholder="键名路径" />
                  </Form.Item>
                  <Form.Item field={`${field.field}.val`}>
                    <Input placeholder="关键词" />
                  </Form.Item>
                  <Button
                    type="text"
                    icon={<IconDelete />}
                    onClick={() => {
                      remove(index);
                    }}
                  />
                </div>
              );
            })}
            <div className="flex justify-between">
              <Button
                type="text"
                icon={<IconPlus />}
                onClick={() => {
                  add();
                }}
              >
                添加
              </Button>
            </div>
          </div>
        );
      }}
    </Form.List>
  );
};
