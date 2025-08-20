import { Center, Box, Title } from "@mantine/core";
import { IconMusic } from "@tabler/icons-react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
}

/**
 * 앱 로고 컴포넌트 (아이콘 + 타이틀)
 */
function AppLogo({ size = "lg", showTitle = true }: AppLogoProps) {
  const iconSize = size === "sm" ? 28 : size === "md" ? 36 : 48;
  const titleSize =
    size === "sm" ? "1.5rem" : size === "md" ? "1.75rem" : "2rem";

  return (
    <Center>
      <Box ta="center">
        <IconMusic
          size={iconSize}
          style={{ color: "var(--mantine-primary-color-6)" }}
          data-testid="icon-music"
        />
        {showTitle && (
          <Title
            order={1}
            size={titleSize}
            fw={900}
            c="var(--mantine-primary-color-6)"
            mt="xs"
          >
            BANDIT
          </Title>
        )}
      </Box>
    </Center>
  );
}

export default AppLogo;
