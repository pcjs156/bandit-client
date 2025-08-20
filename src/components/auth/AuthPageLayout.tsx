import { Container, Paper, Title, Stack, Text, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { memo, type ReactNode } from "react";
import AppLogo from "@src/components/common/AppLogo";

interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

/**
 * 인증 페이지 공통 레이아웃 컴포넌트
 * 로그인/회원가입 페이지에서 공통으로 사용
 */
export const AuthPageLayout = memo(
  ({
    title,
    children,
    footerText,
    footerLinkText,
    footerLinkTo,
  }: AuthPageLayoutProps) => (
    <Container size="xs" py={{ base: "xl", sm: 60 }}>
      <Stack gap="xl" align="center">
        <AppLogo />

        <Paper
          shadow="md"
          p={{ base: "lg", sm: "xl" }}
          radius="md"
          w="100%"
          maw={400}
        >
          <Title order={2} ta="center" mb="lg">
            {title}
          </Title>

          {children}

          <Text ta="center" mt="md" size="sm" c="dimmed">
            {footerText}{" "}
            <Anchor component={Link} to={footerLinkTo} size="sm">
              {footerLinkText}
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Container>
  ),
);

AuthPageLayout.displayName = "AuthPageLayout";
