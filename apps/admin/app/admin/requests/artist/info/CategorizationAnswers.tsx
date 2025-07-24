"use client";
import {
  Text,
  Avatar,
  Timeline,
  Paper,
  Group,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { ArtistCategorizationAnswerTypes } from "@omenai/shared-types";
import {
  GraduationCap,
  Palette,
  User,
  Users,
  Building2,
  Sparkles,
  Globe,
} from "lucide-react";

const timelineItems = [
  {
    key: "graduate",
    title: "Educational Background",
    question: "Are you a graduate?",
    icon: GraduationCap,
    color: "blue",
  },
  {
    key: "mfa",
    title: "Advanced Degree",
    question: "Do you have an MFA (Masters in Fine Arts)?",
    icon: Palette,
    color: "violet",
  },
  {
    key: "solo",
    title: "Solo Exhibitions",
    question: "How many solo exhibitions have you done?",
    icon: User,
    color: "green",
  },
  {
    key: "group",
    title: "Group Exhibitions",
    question: "How many group exhibitions have you done?",
    icon: Users,
    color: "orange",
  },
  {
    key: "museum_collection",
    title: "Museum Collections",
    question: "Has your piece been in a museum collection?",
    icon: Palette,
    color: "red",
  },
  {
    key: "museum_exhibition",
    title: "Museum Exhibitions",
    question: "Has your piece been featured in a museum exhibition?",
    icon: Building2,
    color: "teal",
  },
  {
    key: "art_fair",
    title: "Art Fair Participation",
    question: "Have you been featured in an art fair?",
    icon: Sparkles,
    color: "pink",
  },
  {
    key: "biennale",
    title: "International Recognition",
    question: "Which Biennale have you been a part of?",
    icon: Globe,
    color: "indigo",
  },
];

export default function CategorizationAnswers({
  answers,
}: {
  answers: ArtistCategorizationAnswerTypes;
}) {
  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)",
        backdropFilter: "blur(10px)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Group mb="xl" align="center">
        <ThemeIcon
          size={48}
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "purple" }}
        >
          <Palette size={24} />
        </ThemeIcon>
        <div>
          <Text size="xl" fw={700} c="dark.7">
            Artist Categorization Profile
          </Text>
          <Text size="sm" c="dimmed">
            Professional background and exhibition history
          </Text>
        </div>
      </Group>

      <Timeline
        active={timelineItems.length - 1}
        bulletSize={32}
        lineWidth={3}
        style={{
          "--timeline-color":
            "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {timelineItems.map((item, index) => {
          const IconComponent = item.icon;
          const answer =
            answers[item.key as keyof ArtistCategorizationAnswerTypes];

          return (
            <Timeline.Item
              key={item.key}
              title={
                <Group gap="sm" mb="xs">
                  <Text fw={600} size="md" c="dark.7">
                    {item.title}
                  </Text>
                  <Badge
                    variant="light"
                    color={item.color}
                    size="sm"
                    style={{ textTransform: "none" }}
                  >
                    Step {index + 1}
                  </Badge>
                </Group>
              }
              bullet={
                <ThemeIcon
                  size={32}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: item.color, to: `${item.color}.7` }}
                  style={{
                    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                    border: "2px solid white",
                  }}
                >
                  <IconComponent size={16} strokeWidth={2} />
                </ThemeIcon>
              }
            >
              <Paper
                p="md"
                radius="md"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  borderLeft: `4px solid var(--mantine-color-${item.color}-5)`,
                  marginTop: "4px",
                }}
              >
                <Text size="sm" c="dimmed" mb="xs" fs="italic">
                  {item.question}
                </Text>
                <Group gap="xs" align="center">
                  <Text fw={500} c="dark.6">
                    Answer:
                  </Text>
                  <Badge
                    variant="filled"
                    color={item.color}
                    size="md"
                    style={{
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    {String(answer)}
                  </Badge>
                </Group>
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Paper>
  );
}
