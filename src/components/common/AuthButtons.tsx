import { Group, Button, ActionIcon, Menu, Avatar } from "@mantine/core";
import { IconSettings, IconUser, IconLogout } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { memo, useCallback } from "react";
import type { User } from "@src/types/user";
import { LAYOUT_CONSTANTS } from "@src/constants/layout";

/**
 * 로딩 상태의 인증 버튼
 */
export const LoadingAuthButton = memo(() => (
  <Group>
    <Button variant="subtle" loading>
      로그인
    </Button>
  </Group>
));

LoadingAuthButton.displayName = "LoadingAuthButton";

/**
 * 게스트용 인증 버튼들
 */
export const GuestAuthButtons = memo(() => (
  <Group>
    <Button variant="subtle" component={Link} to="/login">
      로그인
    </Button>
    <Button component={Link} to="/register">
      회원가입
    </Button>
  </Group>
));

GuestAuthButtons.displayName = "GuestAuthButtons";

/**
 * 사용자 메뉴 컴포넌트
 */
interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export const UserMenu = memo(({ user, onLogout }: UserMenuProps) => {
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <Menu shadow="md" width={LAYOUT_CONSTANTS.USER_MENU_WIDTH}>
      <Menu.Target>
        <Button
          variant="subtle"
          leftSection={
            <Avatar size={LAYOUT_CONSTANTS.AVATAR_SIZE} radius="xl" />
          }
        >
          {user.nickname}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>내 계정</Menu.Label>
        <Menu.Item
          leftSection={
            <IconUser size={LAYOUT_CONSTANTS.ICON_SIZES.MENU_ITEM} />
          }
        >
          프로필
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={
            <IconLogout size={LAYOUT_CONSTANTS.ICON_SIZES.MENU_ITEM} />
          }
          onClick={handleLogout}
        >
          로그아웃
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
});

UserMenu.displayName = "UserMenu";

/**
 * 인증된 사용자용 버튼들
 */
interface AuthenticatedUserButtonsProps {
  user: User;
  onLogout: () => void;
}

export const AuthenticatedUserButtons = memo(
  ({ user, onLogout }: AuthenticatedUserButtonsProps) => (
    <Group>
      <ActionIcon
        component={Link}
        to="/settings"
        variant="subtle"
        size="lg"
        aria-label="설정"
      >
        <IconSettings size={LAYOUT_CONSTANTS.ICON_SIZES.SETTINGS} />
      </ActionIcon>
      <UserMenu user={user} onLogout={onLogout} />
    </Group>
  ),
);

AuthenticatedUserButtons.displayName = "AuthenticatedUserButtons";
