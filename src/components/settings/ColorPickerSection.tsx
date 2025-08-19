import { Text, ColorPicker } from "@mantine/core";
import { memo } from "react";
import { defaultColorSwatches } from "@src/constants/colors";

interface ColorPickerSectionProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

/**
 * 색상 선택 섹션 컴포넌트
 * 색상 피커만 포함 (접근성 기능 제거됨)
 */
export const ColorPickerSection = memo(
  ({ value, onChange, disabled = false }: ColorPickerSectionProps) => (
    <div>
      <Text size="sm" fw={500} mb="xs">
        색상 선택
      </Text>

      <ColorPicker
        value={value}
        onChange={disabled ? () => {} : onChange}
        format="hex"
        swatches={defaultColorSwatches}
      />
    </div>
  )
);

ColorPickerSection.displayName = "ColorPickerSection";
