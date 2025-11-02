import { getApiUrl } from "@omenai/url-config/src/config";
import { Client } from "@upstash/workflow";

const client = new Client({ token: process.env.QSTASH_TOKEN });

export async function createWorkflow(
  task_route: string,
  workflowRun_id: string,
  params?: string
) {
  try {
    const { workflowRunId } = await client.trigger({
      url: `https://40d5d04988a0.ngrok-free.app${task_route}`,
      body: params,
      workflowRunId: workflowRun_id,
      headers: { Origin: "https://omenai.app" },
      retries: 3, // Optional retries for the initial request
    });

    return workflowRunId;
  } catch (error) {
    console.log(error);
  }
}
