import { Group, Text, ColorPicker } from "@mantine/core";
import { memo } from "react";
import { defaultColorSwatches } from "@src/constants/colors";
import {
  ColorAccessibilityInfo,
  AccessibilityWarning,
} from "./ColorAccessibilityInfo";

interface ColorPickerSectionProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

/**
 * 색상 선택 섹션 컴포넌트
 * 색상 피커 + 접근성 정보 + 경고 메시지를 포함
 */
export const ColorPickerSection = memo(
  ({ value, onChange, disabled = false }: ColorPickerSectionProps) => (
    <div>
      <Group justify="space-between" align="center" mb="xs">
        <Text size="sm" fw={500}>
          색상 선택
        </Text>
        {value && <ColorAccessibilityInfo color={value} />}
      </Group>

      <ColorPicker
        value={value}
        onChange={disabled ? () => {} : onChange}
        format="hex"
        swatches={defaultColorSwatches}
      />

      {value && <AccessibilityWarning color={value} />}
    </div>
  )
);

ColorPickerSection.displayName = "ColorPickerSection";
