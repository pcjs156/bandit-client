import { TextInput } from "@mantine/core";
import { memo } from "react";
import ValidationIcon from "@src/components/common/ValidationIcon";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

interface UserIdFieldProps {
  form: UseFormReturnType<RegisterRequest>;
  disabled?: boolean;
}

/**
 * 사용자 ID 입력 필드 컴포넌트
 */
export const UserIdField = memo(
  ({ form, disabled = false }: UserIdFieldProps) => (
    <TextInput
      label="아이디"
      placeholder="영문, 숫자 4-20자"
      description="영문과 숫자만 사용 가능합니다"
      size="md"
      {...form.getInputProps("userId")}
      disabled={disabled}
      rightSection={
        <ValidationIcon
          form={form}
          fieldName="userId"
          value={form.values.userId}
        />
      }
    />
  ),
);

UserIdField.displayName = "UserIdField";
