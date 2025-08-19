import { IconCheck, IconX } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

interface ValidationIconProps {
  form: UseFormReturnType<RegisterRequest>;
  fieldName: keyof RegisterRequest;
  value: string;
}

/**
 * 폼 필드의 실시간 검증 결과를 아이콘으로 표시하는 컴포넌트
 */
function ValidationIcon({ form, fieldName, value }: ValidationIconProps) {
  if (!value) return null;

  const error = form.validateField(fieldName).error;

  return error ? (
    <IconX size={16} color="red" />
  ) : (
    <IconCheck size={16} color="green" />
  );
}

export default ValidationIcon;
