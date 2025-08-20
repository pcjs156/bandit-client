import { useState, useCallback } from "react";
import { validateColorInput } from "@src/utils/colorValidation";
import { showColorAddedError } from "@src/utils/colorNotifications";
import type { CustomColor } from "@src/stores/themeStore";

const DEFAULT_COLOR = "#f63b3e";

interface UseColorFormProps {
  customColors: CustomColor[];
  onAddColor: (name: string, color: string) => void;
  onClose: () => void;
}

/**
 * 색상 추가 폼 로직을 관리하는 커스텀 훅
 */
export function useColorForm({
  customColors,
  onAddColor,
  onClose,
}: UseColorFormProps) {
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState(DEFAULT_COLOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setColorName("");
    setColorValue(DEFAULT_COLOR);
    setError("");
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
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
  }, [colorName, colorValue, customColors, onAddColor, onClose, resetForm]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const isSubmitDisabled = !colorName.trim();

  return {
    // State
    colorName,
    colorValue,
    isLoading,
    error,
    isSubmitDisabled,

    // Actions
    setColorName,
    setColorValue,
    clearError,
    handleSubmit,
    handleClose,
    resetForm,
  };
}
