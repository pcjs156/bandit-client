import { TextInput } from "@mantine/core";
import { memo } from "react";
import ValidationIcon from "@src/components/common/ValidationIcon";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

interface NicknameFieldProps {
  form: UseFormReturnType<RegisterRequest>;
  disabled?: boolean;
}

/**
 * 닉네임 입력 필드 컴포넌트
 */
export const NicknameField = memo(
  ({ form, disabled = false }: NicknameFieldProps) => (
    <TextInput
      label="닉네임"
      placeholder="2-20자"
      description="다른 사용자에게 표시되는 이름입니다"
      size="md"
      {...form.getInputProps("nickname")}
      disabled={disabled}
      rightSection={
        <ValidationIcon
          form={form}
          fieldName="nickname"
          value={form.values.nickname}
        />
      }
    />
  ),
);

NicknameField.displayName = "NicknameField";
