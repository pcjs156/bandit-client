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
  Box,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@src/stores/authStore";
import { useRegisterForm } from "@src/hooks/useRegisterForm";
import AppLogo from "@src/components/common/AppLogo";
import ValidationIcon from "@src/components/common/ValidationIcon";
import PasswordStrengthIndicator from "@src/components/common/PasswordStrengthIndicator";
import type { RegisterRequest } from "@src/types/api";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, status, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useRegisterForm();

  const handleSubmit = async (values: RegisterRequest) => {
    setIsLoading(true);
    clearError();

    try {
      await register(values);
      navigate("/"); // 회원가입 성공 시 홈으로 이동
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

        {/* 회원가입 폼 */}
        <Paper
          shadow="md"
          p={{ base: "lg", sm: "xl" }}
          radius="md"
          w="100%"
          maw={400}
        >
          <Title order={2} ta="center" mb="lg">
            회원가입
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
                placeholder="영문, 숫자 4-20자"
                description="영문과 숫자만 사용 가능합니다"
                size="md"
                {...form.getInputProps("userId")}
                disabled={isLoading || status === "loading"}
                rightSection={
                  <ValidationIcon
                    form={form}
                    fieldName="userId"
                    value={form.values.userId}
                  />
                }
              />

              <Box>
                <PasswordInput
                  label="비밀번호"
                  placeholder="영문, 숫자 포함 8자 이상"
                  size="md"
                  {...form.getInputProps("password")}
                  disabled={isLoading || status === "loading"}
                />
                <PasswordStrengthIndicator password={form.values.password} />
              </Box>

              <TextInput
                label="닉네임"
                placeholder="2-20자"
                description="다른 사용자에게 표시되는 이름입니다"
                size="md"
                {...form.getInputProps("nickname")}
                disabled={isLoading || status === "loading"}
                rightSection={
                  <ValidationIcon
                    form={form}
                    fieldName="nickname"
                    value={form.values.nickname}
                  />
                }
              />

              <Button
                type="submit"
                size="md"
                fullWidth
                loading={isLoading || status === "loading"}
                mt="md"
                disabled={
                  !form.values.userId ||
                  !form.values.password ||
                  !form.values.nickname ||
                  !!form.errors.userId ||
                  !!form.errors.password ||
                  !!form.errors.nickname
                }
              >
                회원가입
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="md" size="sm" c="dimmed">
            이미 계정이 있으신가요?{" "}
            <Anchor component={Link} to="/login" size="sm">
              로그인
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}

export default RegisterPage;
