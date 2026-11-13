import { Button } from "./Button";
import { cn } from "@/lib/cn";

type DeckActionsProps = {
  /** Which face of the card is showing. */
  side: "front" | "back";
  firstName: string;
  /** Records "ignored" feedback and moves the card to the back of the deck. */
  onSkip: () => void;
  /** Flips the card. Leave out while there is no intro side (Phase 2 dashboard). */
  onFlip?: () => void;
  onEdit?: () => void;
  /** Records "accepted" feedback and sends. */
  onSend?: () => void;
  editing?: boolean;
  /** True only when the intro's SafetyStatus is "passed". */
  canSend?: boolean;
  sending?: boolean;
  className?: string;
};

/**
 * The action row under a classmate card. Not now is always available on both faces.
 * Send is the only primary action on the back, and it stays disabled until the
 * safety check passes. Nothing ever sends without this button.
 */
export function DeckActions({
  side,
  firstName,
  onSkip,
  onFlip,
  onEdit,
  onSend,
  editing = false,
  canSend = false,
  sending = false,
  className,
}: DeckActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {side === "front" ? (
        <>
          <Button variant="secondary" size="lg" onClick={onSkip}>
            Not now
          </Button>
          {onFlip ? (
            <Button variant="primary" size="lg" onClick={onFlip}>
              Show intro
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <Button variant="secondary" size="lg" onClick={onSkip} disabled={sending}>
            Not now
          </Button>
          {onEdit ? (
            <Button variant="secondary" size="lg" onClick={onEdit} disabled={sending}>
              {editing ? "Done editing" : "Edit intro"}
            </Button>
          ) : null}
          <Button variant="primary" size="lg" onClick={onSend} disabled={!canSend || sending || editing}>
            {sending ? "Sending" : "Send intro"}
          </Button>
          {onFlip ? (
            <Button variant="quiet" size="lg" onClick={onFlip} disabled={sending}>
              Back to {firstName}
            </Button>
          ) : null}
        </>
      )}
      <p className="basis-full text-small text-muted sm:basis-auto sm:flex-1">
        Not now moves {firstName} to the back of the deck.
      </p>
    </div>
  );
}
