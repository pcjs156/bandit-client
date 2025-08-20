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
  }: ModalActionsProps) => (
    <Group justify="flex-end">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={isSubmitDisabled || isLoading}
        loading={isLoading}
      >
        {submitText}
      </Button>
    </Group>
  ),
);

ModalActions.displayName = "ModalActions";
