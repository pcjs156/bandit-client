import { Group, Text } from "@mantine/core";
import { IconMusic } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { memo } from "react";
import { LAYOUT_CONSTANTS } from "@src/constants/layout";

/**
 * 헤더용 로고 컴포넌트
 * 클릭 시 홈으로 이동
 */
export const HeaderLogo = memo(() => (
  <Link
    to="/"
    style={{
      textDecoration: "none",
      color: "inherit",
    }}
  >
    <Group gap="xs">
      <IconMusic
        size={LAYOUT_CONSTANTS.ICON_SIZES.LOGO}
        style={{ color: "var(--mantine-primary-color-6)" }}
      />
      <Text
        size="xl"
        fw={700}
        c="var(--mantine-primary-color-6)"
        style={{ userSelect: "none" }}
      >
        BANDIT
      </Text>
    </Group>
  </Link>
));

HeaderLogo.displayName = "HeaderLogo";
