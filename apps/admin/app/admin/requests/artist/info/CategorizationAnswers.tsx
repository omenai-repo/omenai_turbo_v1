"use client";
import { Text, Avatar, Timeline } from "@mantine/core";
import { ArtistCategorizationAnswerTypes } from "@omenai/shared-types";
import { ArrowDown, Play, Sun } from "lucide-react";

export default function CategorizationAnswers({
  answers,
}: {
  answers: ArtistCategorizationAnswerTypes;
}) {
  return (
    <Timeline bulletSize={24}>
      <Timeline.Item
        title="Are you a graduate?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.graduate}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Do you have an MFA (Masters in fine arts)"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.mfa}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="How many solo exhibitions have you done?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.solo}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="How many group exhibitions have you done?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.group}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Has your piece been in a museum collection?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.museum_collection}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Has your piece been featured in a museum exhibition?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.museum_exhibition}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Has you been featured in an art fair?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.art_fair}
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Which Biennale have you been a part of?"
        bullet={<ArrowDown size={20} strokeWidth={1.5} absoluteStrokeWidth />}
      >
        <Text c="dimmed" size="sm">
          Answer: {answers.biennale}
        </Text>
      </Timeline.Item>
    </Timeline>
  );
}
