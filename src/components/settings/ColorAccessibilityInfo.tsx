import { Group, Badge, Text } from "@mantine/core";
import { memo } from "react";
import {
  getAccessibilityGrade,
  getGradeColor,
  getContrastRatio,
} from "@src/utils/colorContrast";

interface ColorAccessibilityInfoProps {
  color: string;
  backgroundColor?: string;
}

/**
 * 색상 접근성 정보 표시 컴포넌트
 */
export const ColorAccessibilityInfo = memo(
  ({ color, backgroundColor = "#ffffff" }: ColorAccessibilityInfoProps) => {
    const grade = getAccessibilityGrade(color, backgroundColor);
    const contrastRatio = getContrastRatio(color, backgroundColor);

    return (
      <Group gap="xs">
        <Badge color={getGradeColor(grade)} size="sm" variant="light">
          {grade}
        </Badge>
        <Text size="xs" c="dimmed">
          대비: {contrastRatio.toFixed(1)}:1
        </Text>
      </Group>
    );
  }
);

ColorAccessibilityInfo.displayName = "ColorAccessibilityInfo";

/**
 * 접근성 경고 메시지 컴포넌트
 */
interface AccessibilityWarningProps {
  color: string;
  backgroundColor?: string;
}

export const AccessibilityWarning = memo(
  ({ color, backgroundColor = "#ffffff" }: AccessibilityWarningProps) => {
    const grade = getAccessibilityGrade(color, backgroundColor);

    if (grade !== "FAIL") return null;

    return (
      <Text size="xs" c="red" mt="xs">
        ⚠️ 이 색상은 접근성 기준을 만족하지 않습니다. (최소 4.5:1 대비 필요)
      </Text>
    );
  }
);

AccessibilityWarning.displayName = "AccessibilityWarning";
