import type { TaskRow } from "@/lib/firestore-data";
import {
  generateSmartStudyPlan,
  rebalanceMissedSessions,
  type SmartPlannerConfig,
  type SmartStudyBlock,
} from "@/lib/study-planner";

export type StudyPlannerWorkerRequest =
  | {
      requestId: string;
      type: "generate";
      config: SmartPlannerConfig;
      pendingTasks: TaskRow[];
    }
  | {
      requestId: string;
      type: "rebalance";
      currentBlocks: SmartStudyBlock[];
      dailyCapMin: number;
    };

export type StudyPlannerWorkerResponse =
  | {
      requestId: string;
      type: "generate";
      result: ReturnType<typeof generateSmartStudyPlan>;
    }
  | {
      requestId: string;
      type: "rebalance";
      result: ReturnType<typeof rebalanceMissedSessions>;
    };

self.onmessage = (event: MessageEvent<StudyPlannerWorkerRequest>) => {
  const payload = event.data;
  if (payload.type === "generate") {
    const result = generateSmartStudyPlan(payload.config, payload.pendingTasks);
    const response: StudyPlannerWorkerResponse = {
      requestId: payload.requestId,
      type: "generate",
      result,
    };
    self.postMessage(response);
  } else if (payload.type === "rebalance") {
    const result = rebalanceMissedSessions(payload.currentBlocks, payload.dailyCapMin);
    const response: StudyPlannerWorkerResponse = {
      requestId: payload.requestId,
      type: "rebalance",
      result,
    };
    self.postMessage(response);
  }
};
