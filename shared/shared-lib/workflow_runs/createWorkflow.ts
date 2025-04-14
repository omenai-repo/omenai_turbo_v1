// Using the workflow client
import { Client } from "@upstash/workflow";

const client = new Client({ token: process.env.QSTASH_TOKEN });

export async function createWorkflow(
  task_route: string,
  workflowRun_id: string,
  params?: string
) {
  try {
    const { workflowRunId } = await client.trigger({
      url: `${process.env.UPSTASH_WORKFLOW_URL}${task_route}`,
      body: params, // Optional body
      workflowRunId: workflowRun_id,
      headers: { Origin: "http://localhost" }, // Optional headers
      retries: 3, // Optional retries for the initial request
    });

    return workflowRunId;
  } catch (error) {
    console.log(error);
  }
}
