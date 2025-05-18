import { createNiceModal } from "@/utils/nicemodel";
import { Modal } from "@arco-design/web-react";
import { TraceIdResult } from ".";

export const openTraceId = createNiceModal<{ id: string }, any>(
  ({ _modal, id }) => {
    return (
      <Modal title={id} {..._modal.props} footer={null} className={"!w-[85vw]"}>
        <TraceIdResult traceId={id} className="!h-[70vh]" />
      </Modal>
    );
  }
);
