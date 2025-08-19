import { Card, Stack, Title, Text, Group, Button } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useThemeStore } from "@src/stores/themeStore";

function ThemeSection() {
  const { colorScheme, toggleColorScheme } = useThemeStore();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3}>테마</Title>
        <Text c="dimmed" size="sm">
          다크모드와 라이트모드를 전환할 수 있습니다.
        </Text>
        <Group>
          <Button
            variant={colorScheme === "light" ? "filled" : "outline"}
            leftSection={<IconSun size={16} />}
            onClick={() => colorScheme === "dark" && toggleColorScheme()}
          >
            라이트모드
          </Button>
          <Button
            variant={colorScheme === "dark" ? "filled" : "outline"}
            leftSection={<IconMoon size={16} />}
            onClick={() => colorScheme === "light" && toggleColorScheme()}
          >
            다크모드
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

export default ThemeSection;
