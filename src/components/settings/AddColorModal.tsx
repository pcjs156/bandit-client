import { Modal, Stack, Alert } from "@mantine/core";
import { useEffect } from "react";
import { useThemeStore } from "@src/stores/themeStore";
import { useColorForm } from "@src/hooks/useColorForm";
import { ColorNameInput } from "./ColorNameInput";
import { ColorPickerSection } from "./ColorPickerSection";
import { ModalActions } from "./ModalActions";

interface AddColorModalProps {
  opened: boolean;
  onClose: () => void;
  onAddColor: (name: string, color: string) => void;
}

/**
 * 커스텀 색상 추가 모달
 * 색상 이름, 색상 선택, 접근성 정보를 포함
 */
function AddColorModal({ opened, onClose, onAddColor }: AddColorModalProps) {
  const customColors = useThemeStore((state) => state.customColors);

  const {
    colorName,
    colorValue,
    isLoading,
    error,
    isSubmitDisabled,
    setColorName,
    setColorValue,
    clearError,
    handleSubmit,
    handleClose,
  } = useColorForm({
    customColors,
    onAddColor,
    onClose,
  });

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

        <ColorNameInput
          value={colorName}
          onChange={setColorName}
          onErrorClear={clearError}
          error={!!error}
          disabled={isLoading}
        />

        <ColorPickerSection
          value={colorValue}
          onChange={setColorValue}
          disabled={isLoading}
        />

        <ModalActions
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
          isSubmitDisabled={isSubmitDisabled}
        />
      </Stack>
    </Modal>
  );
}

export default AddColorModal;
