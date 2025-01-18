import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import copy from 'copy-to-clipboard';
import { useToast } from "@/hooks/use-toast"

export default function SaveLoginModal({ 
  open, 
  onOpenChange, 
  recipient, 
  signature, 
  address,
  onSave,
  onClose 
}) {
  const { toast } = useToast()

  const handleCopy = () => {
    const credential = `ecashchat${btoa(`${recipient}_${signature}`)}ecashchat`
    copy(credential)
    toast({
      title: "✅Copy",
      description: "Copied"
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <button className="hidden">Open</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save login details?</AlertDialogTitle>
          <AlertDialogDescription>
            Saving login details will reduce the number of times you're asked to login.<br />
            Please ensure you're the only person who uses this device.<br /><br />
            {recipient && signature && (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm break-all">
                    {`ecashchat${btoa(`${recipient}_${signature}`)}ecashchat`}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  👆 You can copy this credential for future login
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            className="mt-2 sm:mt-0"
            onClick={onClose}
            variant="outline"
          >
            Don't save login
          </Button>
          <Button onClick={onSave}>
            Save login
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 