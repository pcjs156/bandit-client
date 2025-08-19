import { Stack, Button, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { memo } from "react";
import { useRegisterForm } from "@src/hooks/useRegisterForm";
import { useRegisterSubmit } from "@src/hooks/useRegisterSubmit";
import { UserIdField } from "./UserIdField";
import { PasswordField } from "./PasswordField";
import { NicknameField } from "./NicknameField";

/**
 * 회원가입 폼 컴포넌트
 * 폼 필드들과 제출 로직을 포함
 */
export const RegisterForm = memo(() => {
  const form = useRegisterForm();
  const { handleSubmit, isSubmitDisabled, isFormDisabled, isLoading, error } =
    useRegisterSubmit();

  return (
    <>
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
          <UserIdField form={form} disabled={isFormDisabled} />
          <PasswordField form={form} disabled={isFormDisabled} />
          <NicknameField form={form} disabled={isFormDisabled} />

          <Button
            type="submit"
            size="md"
            fullWidth
            loading={isLoading}
            mt="md"
            disabled={isSubmitDisabled(form)}
          >
            회원가입
          </Button>
        </Stack>
      </form>
    </>
  );
});

RegisterForm.displayName = "RegisterForm";
