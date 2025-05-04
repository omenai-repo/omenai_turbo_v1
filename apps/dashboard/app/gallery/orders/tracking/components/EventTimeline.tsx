"use client";
import { Timeline, Text, ScrollArea, Divider } from "@mantine/core";
import { PlaneTakeoff } from "lucide-react";

export default function EventTimeline({ events }: { events: any[] }) {
  return (
    <ScrollArea
      h={"100%"}
      className="w-auto py-5 pr-5 h-full bg-white rounded-xl z-[1500]"
    >
      <h5 className="text-fluid-base font-semibold mb-5">Shipment events</h5>
      <Divider my={"md"} />
      <Timeline active={1} bulletSize={20} color="#1a1a1a" lineWidth={2}>
        <Timeline.Item
          className="text-fluid-xs"
          bullet={
            <PlaneTakeoff size={12} strokeWidth={1.5} absoluteStrokeWidth />
          }
          title="New branch"
        >
          <Text c="dimmed" size="sm">
            You&apos;ve created new branch{" "}
            <Text
              variant="link"
              component="span"
              inherit
              className="text-fluid-xxs"
            >
              fix-notifications
            </Text>{" "}
            from master
          </Text>
          <Text size="xs" mt={4}>
            2 hours ago
          </Text>
        </Timeline.Item>

        <Timeline.Item
          className="text-fluid-xs"
          bullet={
            <PlaneTakeoff size={12} strokeWidth={1.5} absoluteStrokeWidth />
          }
          title="Commits"
        >
          <Text c="dimmed" size="sm">
            You&apos;ve pushed 23 commits to
            <Text
              variant="link"
              component="span"
              inherit
              className="text-fluid-xxs"
            >
              fix-notifications branch
            </Text>
          </Text>
          <Text size="xs" mt={4}>
            52 minutes ago
          </Text>
        </Timeline.Item>

        <Timeline.Item
          title="Pull request"
          className="text-fluid-xs"
          bullet={
            <PlaneTakeoff size={12} strokeWidth={1.5} absoluteStrokeWidth />
          }
          lineVariant="dashed"
        >
          <Text c="dimmed" size="sm">
            You&apos;ve submitted a pull request
            <Text
              variant="link"
              component="span"
              inherit
              className="text-fluid-xxs"
            >
              Fix incorrect notification message (#187)
            </Text>
          </Text>
          <Text size="xs" mt={4}>
            34 minutes ago
          </Text>
        </Timeline.Item>

        <Timeline.Item
          title="Code review"
          className="text-fluid-xs"
          bullet={
            <PlaneTakeoff size={12} strokeWidth={1.5} absoluteStrokeWidth />
          }
        >
          <Text c="dimmed" size="sm">
            <Text
              variant="link"
              component="span"
              inherit
              className="text-fluid-xxs"
            >
              Robert Gluesticker
            </Text>{" "}
            left a code review on your pull request
          </Text>
          <Text size="xs" mt={4}>
            12 minutes ago
          </Text>
        </Timeline.Item>
      </Timeline>
    </ScrollArea>
  );
}
