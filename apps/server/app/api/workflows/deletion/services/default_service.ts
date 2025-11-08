import { DeletionReturnType } from "../utils";

export async function defaultServiceProtocol(): Promise<DeletionReturnType> {
  return {
    success: false,
    note: "Deletion protocol requested is outside pre-stated deletion protocols available",
    count: {},
    error: "Default: Invalid deletion protocol requested",
  };
}
