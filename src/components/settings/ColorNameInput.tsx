import { TextInput } from "@mantine/core";
import { memo } from "react";

interface ColorNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onErrorClear?: () => void;
  error?: boolean;
  disabled?: boolean;
}

/**
 * 색상 이름 입력 컴포넌트
 */
export const ColorNameInput = memo(
  ({
    value,
    onChange,
    onErrorClear,
    error,
    disabled = false,
  }: ColorNameInputProps) => (
    <TextInput
      label="색상 이름"
      placeholder="예: 내가 좋아하는 파란색"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        if (error && onErrorClear) {
          onErrorClear();
        }
      }}
      maxLength={20}
      disabled={disabled}
    />
  ),
);

ColorNameInput.displayName = "ColorNameInput";
