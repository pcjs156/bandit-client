import {
  Modal,
  Stack,
  TextInput,
  Text,
  ColorPicker,
  Group,
  Button,
  Alert,
  Badge,
} from "@mantine/core";
import { useState, useEffect, useCallback } from "react";
import { defaultColorSwatches } from "@src/constants/colors";
import { useThemeStore } from "@src/stores/themeStore";
import { validateColorInput } from "@src/utils/colorValidation";
import { showColorAddedError } from "@src/utils/colorNotifications";
import {
  getAccessibilityGrade,
  getGradeColor,
  getContrastRatio,
} from "@src/utils/colorContrast";

interface AddColorModalProps {
  opened: boolean;
  onClose: () => void;
  onAddColor: (name: string, color: string) => void;
}

const DEFAULT_COLOR = "#f63b3e";

function AddColorModal({ opened, onClose, onAddColor }: AddColorModalProps) {
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState(DEFAULT_COLOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const customColors = useThemeStore((state) => state.customColors);

  const resetForm = () => {
    setColorName("");
    setColorValue(DEFAULT_COLOR);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    const validationError = validateColorInput(
      colorName,
      colorValue,
      customColors,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      onAddColor(colorName.trim(), colorValue);
      resetForm();
      onClose();
    } catch {
      showColorAddedError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && opened) {
        handleClose();
      }
    };

    if (opened) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [opened, handleClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="커스텀 색상 추가"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" title="입력 오류">
            {error}
          </Alert>
        )}

        <TextInput
          label="색상 이름"
          placeholder="예: 내가 좋아하는 파란색"
          value={colorName}
          onChange={(e) => {
            setColorName(e.target.value);
            if (error) setError(""); // 입력 시 에러 메시지 제거
          }}
          maxLength={20}
        />

        <div>
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" fw={500}>
              색상 선택
            </Text>
            {colorValue && (
              <Group gap="xs">
                <Badge
                  color={getGradeColor(getAccessibilityGrade(colorValue))}
                  size="sm"
                  variant="light"
                >
                  {getAccessibilityGrade(colorValue)}
                </Badge>
                <Text size="xs" c="dimmed">
                  대비: {getContrastRatio(colorValue, "#ffffff").toFixed(1)}:1
                </Text>
              </Group>
            )}
          </Group>
          <ColorPicker
            value={colorValue}
            onChange={setColorValue}
            format="hex"
            swatches={defaultColorSwatches}
          />
          {colorValue && getAccessibilityGrade(colorValue) === "FAIL" && (
            <Text size="xs" c="red" mt="xs">
              ⚠️ 이 색상은 접근성 기준을 만족하지 않습니다. (최소 4.5:1 대비
              필요)
            </Text>
          )}
        </div>

        <Group justify="flex-end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!colorName.trim() || isLoading}
            loading={isLoading}
          >
            추가
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default AddColorModal;
