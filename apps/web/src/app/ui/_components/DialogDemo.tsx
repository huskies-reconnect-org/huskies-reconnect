"use client";

import { useState } from "react";
import { Button, Dialog } from "@/components/ui";

/** Reference for Dialog: a confirmation with Cancel (quiet) and the action (primary, last). */
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Leave CS 3500
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Leave CS 3500?"
        actions={
          <>
            <Button variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Leave course</Button>
          </>
        }
      >
        You stop getting cards for this course, and you won&apos;t be in its class network when the term ends.
        Intros you already sent stay sent.
      </Dialog>
    </>
  );
}
