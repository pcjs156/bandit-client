import { Box, Progress, Text } from "@mantine/core";
import { usePasswordStrength } from "@src/hooks/usePasswordStrength";

interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * 비밀번호 강도를 시각적으로 표시하는 컴포넌트
 */
function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { strength, label, color } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <Box mt="xs">
      <Progress value={strength} color={color} size="xs" mb="xs" />
      <Text size="xs" c="dimmed">
        비밀번호 강도: {label}
      </Text>
    </Box>
  );
}

export default PasswordStrengthIndicator;
