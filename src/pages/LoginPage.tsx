import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import AppLogo from "@src/components/common/AppLogo";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@src/stores/authStore";
import type { LoginRequest } from "@src/types/api";

function LoginPage() {
  const navigate = useNavigate();
  const { login, status, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginRequest>({
    initialValues: {
      userId: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginRequest) => {
    setIsLoading(true);
    clearError();

    try {
      await login(values);
      navigate("/"); // 로그인 성공 시 홈으로 이동
    } catch {
      // 에러는 store에서 관리됨
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" py={{ base: "xl", sm: 60 }}>
      <Stack gap="xl" align="center">
        <AppLogo />

        {/* 로그인 폼 */}
        <Paper
          shadow="md"
          p={{ base: "lg", sm: "xl" }}
          radius="md"
          w="100%"
          maw={400}
        >
          <Title order={2} ta="center" mb="lg">
            로그인
          </Title>

          {/* 에러 메시지 */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              mb="md"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="아이디"
                placeholder="아이디를 입력하세요"
                size="md"
                {...form.getInputProps("userId")}
                disabled={isLoading || status === "loading"}
              />

              <PasswordInput
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                size="md"
                {...form.getInputProps("password")}
                disabled={isLoading || status === "loading"}
              />

              <Button
                type="submit"
                size="md"
                fullWidth
                loading={isLoading || status === "loading"}
                mt="md"
              >
                로그인
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="md" size="sm" c="dimmed">
            계정이 없으신가요?{" "}
            <Anchor component={Link} to="/register" size="sm">
              회원가입
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}

export default LoginPage;
