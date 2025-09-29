import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeDialog } from "@/store/features/dialogSlice";



export function ConfirmationDialog() {
  const dispatch = useAppDispatch();
  const { isOpen, title, description, onConfirm } = useAppSelector(
    (state) => state.dialog
  );

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    dispatch(closeDialog());
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => dispatch(closeDialog())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => dispatch(closeDialog())}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
