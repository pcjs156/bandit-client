import { AppShell, Container, Group } from "@mantine/core";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@src/stores/authStore";
import { useEffect, useCallback } from "react";
import { HeaderLogo } from "@src/components/common/HeaderLogo";
import {
  LoadingAuthButton,
  GuestAuthButtons,
  AuthenticatedUserButtons,
} from "@src/components/common/AuthButtons";
import { LAYOUT_CONSTANTS } from "@src/constants/layout";

function Layout() {
  const navigate = useNavigate();
  const { user, status, logout, initialize } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initialize();
  }, [initialize]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const renderAuthButtons = useCallback(() => {
    if (status === "loading") {
      return <LoadingAuthButton />;
    }

    if (status === "authenticated" && user) {
      return <AuthenticatedUserButtons user={user} onLogout={handleLogout} />;
    }

    return <GuestAuthButtons />;
  }, [status, user, handleLogout]);

  return (
    <AppShell header={{ height: LAYOUT_CONSTANTS.HEADER_HEIGHT }} padding="md">
      <AppShell.Header>
        <Container size="lg">
          <Group h={LAYOUT_CONSTANTS.HEADER_HEIGHT} justify="space-between">
            <HeaderLogo />
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
