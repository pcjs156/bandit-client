import { Group, Button } from "@mantine/core";
import { memo } from "react";

interface ModalActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  submitText?: string;
  cancelText?: string;
}

/**
 * 모달 액션 버튼들 컴포넌트
 */
export const ModalActions = memo(
  ({
    onSubmit,
    onCancel,
    isLoading = false,
    isSubmitDisabled = false,
    submitText = "추가",
    cancelText = "취소",
  }: ModalActionsProps) => {
    const handleSubmitKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isSubmitDisabled && !isLoading) {
          onSubmit();
        }
      }
    };

    const handleCancelKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isLoading) {
          onCancel();
        }
      }
    };

    return (
      <Group justify="flex-end">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          onKeyDown={handleCancelKeyDown}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled || isLoading}
          loading={isLoading}
          onKeyDown={handleSubmitKeyDown}
        >
          {submitText}
        </Button>
      </Group>
    );
  },
);

ModalActions.displayName = "ModalActions";
