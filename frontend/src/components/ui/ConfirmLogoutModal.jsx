import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

/**
 * ConfirmLogoutModal
 *
 * Props:
 * - open (boolean)
 * - onOpenChange (fn)
 * - onConfirm (fn)
 */
export default function ConfirmLogoutModal({
  open,
  onOpenChange,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <LogOut className="h-5 w-5" />
          </div>
        </div>

        <AlertDialogHeader>
          <AlertDialogTitle>
            Confirm logout
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to log out?  
            You’ll need to sign in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-5 hover:bg-red-700 focus:ring-red-500"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
