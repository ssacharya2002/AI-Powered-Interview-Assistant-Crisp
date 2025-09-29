import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm?: () => void;
}

const initialState: DialogState = {
  isOpen: false,
  title: "",
  description: "",
  onConfirm: undefined,
};

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (
      state,
      action: PayloadAction<{
        title: string;
        description: string;
        onConfirm: () => void;
      }>
    ) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.onConfirm = action.payload.onConfirm;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.title = "";
      state.description = "";
      state.onConfirm = undefined;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;
