import {
  Skeleton,
  Stack,
  Group,
  Box,
  Text,
  Paper,
  Avatar,
  Divider,
} from "@mantine/core";

export default function TrackingLoader() {
  return (
    <Group align="flex-start" p={16} className="h-full">
      {/* Left timeline panel */}
      <Paper radius="md" shadow="sm" p="md" withBorder w={350}>
        <Group align="center" mb="md">
          <Skeleton height={48} circle />
          <Box>
            <Skeleton height={8} width="60%" radius="sm" mb={4} />
            <Skeleton height={8} width="80%" radius="sm" />
          </Box>
        </Group>

        <Divider my="sm" />

        <Stack p="sm">
          {/* Order created */}
          <Box>
            <Skeleton height={10} width="40%" radius="sm" mb={4} />
            <Skeleton height={8} width="80%" radius="sm" />
          </Box>

          {/* Shipment picked up */}
          <Box>
            <Skeleton height={10} width="50%" radius="sm" mb={4} />
            <Skeleton height={8} width="60%" radius="sm" />
          </Box>
          <Box>
            <Skeleton height={10} width="50%" radius="sm" mb={4} />
            <Skeleton height={8} width="60%" radius="sm" />
          </Box>
          <Box>
            <Skeleton height={10} width="50%" radius="sm" mb={4} />
            <Skeleton height={8} width="60%" radius="sm" />
          </Box>
          <Box>
            <Skeleton height={10} width="50%" radius="sm" mb={4} />
            <Skeleton height={8} width="60%" radius="sm" />
          </Box>
        </Stack>
      </Paper>

      {/* Right map panel */}
      <Box
        style={{ flex: 1, position: "relative" }}
        bg="dark.8"
        className="rounded h-[calc(100dvh-10rem)]"
      >
        {/* Simulated origin & destination markers */}
        <Skeleton
          height={24}
          width={140}
          radius="md"
          style={{ position: "absolute", top: 16, left: 16 }}
        />
        <Skeleton
          height={24}
          width={160}
          radius="md"
          style={{ position: "absolute", bottom: 16, right: 16 }}
        />
        {/* Simulated arc or map background */}
        <Skeleton height="100%" width="100%" radius="md" />
      </Box>
    </Group>
  );
}
