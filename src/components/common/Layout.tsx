import {
  AppShell,
  Group,
  Button,
  Text,
  Container,
  ActionIcon,
  Menu,
  Avatar,
} from "@mantine/core";
import {
  IconMusic,
  IconSettings,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@src/stores/authStore";
import { useEffect } from "react";

function Layout() {
  const navigate = useNavigate();
  const { user, status, logout, initialize } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initialize();
  }, [initialize]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderAuthButtons = () => {
    if (status === "loading") {
      return (
        <Group>
          <Button variant="subtle" loading>
            로그인
          </Button>
        </Group>
      );
    }

    if (status === "authenticated" && user) {
      return (
        <Group>
          <ActionIcon
            component={Link}
            to="/settings"
            variant="subtle"
            size="lg"
            aria-label="설정"
          >
            <IconSettings size={20} />
          </ActionIcon>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="subtle"
                leftSection={<Avatar size="sm" radius="xl" />}
              >
                {user.nickname}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>내 계정</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />}>프로필</Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                로그아웃
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      );
    }

    return (
      <Group>
        <Button variant="subtle" component={Link} to="/login">
          로그인
        </Button>
        <Button component={Link} to="/register">
          회원가입
        </Button>
      </Group>
    );
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg">
          <Group h={60} justify="space-between">
            {/* Logo */}
            <Group style={{ textDecoration: "none" }}>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <IconMusic
                  size={28}
                  style={{ color: "var(--mantine-primary-color-6)" }}
                />
                <Text size="xl" fw={700} c="var(--mantine-primary-color-6)">
                  BANDIT
                </Text>
              </Link>
            </Group>

            {/* Navigation */}
            {renderAuthButtons()}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
