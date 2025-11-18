import configCatClient from "@omenai/configcat-config";

export async function fetchConfigCatValue(
  featureKeyword: string
): Promise<boolean> {
  const isFeatureEnabled = await configCatClient.getValueAsync(
    featureKeyword,
    false
  );
  return isFeatureEnabled;
}
