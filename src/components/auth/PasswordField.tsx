import { PasswordInput, Box } from "@mantine/core";
import { memo } from "react";
import PasswordStrengthIndicator from "@src/components/common/PasswordStrengthIndicator";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

interface PasswordFieldProps {
  form: UseFormReturnType<RegisterRequest>;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
}

/**
 * 비밀번호 입력 필드 컴포넌트
 * 강도 표시기 포함 옵션
 */
export const PasswordField = memo(
  ({
    form,
    disabled = false,
    showStrengthIndicator = true,
  }: PasswordFieldProps) => (
    <Box>
      <PasswordInput
        label="비밀번호"
        placeholder="영문, 숫자 포함 8자 이상"
        size="md"
        {...form.getInputProps("password")}
        disabled={disabled}
      />
      {showStrengthIndicator && (
        <PasswordStrengthIndicator password={form.values.password} />
      )}
    </Box>
  )
);

PasswordField.displayName = "PasswordField";
