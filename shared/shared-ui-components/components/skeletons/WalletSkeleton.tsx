"use client";

import { Skeleton, Card, Group, Stack, Button } from "@mantine/core";

export default function WalletSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Left Section */}
      <div className="flex flex-col gap-6">
        {/* Wallet Balance Card */}
        <Card
          shadow="sm"
          padding="sm"
          radius="md"
          withBorder
          className="bg-dark text-white"
        >
          <Stack gap="sm">
            <Skeleton height={20} width={120} />
            <Skeleton height={30} width="70%" />
            <Group justify="space-between" mt="md">
              <Stack gap="xs">
                <Skeleton height={15} width={80} />
                <Skeleton height={25} width={100} />
              </Stack>
              <Skeleton height={40} width={140} radius="sm" />
            </Group>
          </Stack>
        </Card>

        {/* Primary Withdrawal Account Card */}
        <Card shadow="sm" padding="sm" radius="md" withBorder>
          <Stack gap="sm">
            <Skeleton height={20} width={180} />
            <Skeleton height={15} width="60%" />
            <Skeleton height={15} width="60%" />
            <Skeleton height={15} width="60%" />
          </Stack>
        </Card>

        {/* Change Primary Account Button */}
        <Button
          variant="outline"
          color="dark"
          radius="sm"
          size="md"
          className="w-full mt-2"
          disabled
        >
          <Skeleton height={20} width="80%" />
        </Button>
      </div>

      {/* Right Section: Transaction History */}
      <div className="flex flex-col gap-4">
        <Group justify="space-between">
          <Skeleton height={20} width={180} />
          <Skeleton height={20} width={60} />
        </Group>

        {/* Transaction Items */}
        <Stack gap="md">
          {Array.from({ length: 6 }).map((_, index) => (
            <Group key={index} justify="space-between">
              <Group gap="sm">
                <Skeleton height={40} width={40} circle />
                <Stack gap={4}>
                  <Skeleton height={15} width={120} />
                  <Skeleton height={12} width={100} />
                </Stack>
              </Group>
              <Skeleton height={20} width={60} />
            </Group>
          ))}
        </Stack>
      </div>
    </div>
  );
}
