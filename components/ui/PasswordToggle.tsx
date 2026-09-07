"use client";

/**
 * The show/hide control on a password field.
 *
 * **Why every password field gets one.** Typing a password blind is the single
 * most common reason people fail to sign in on a phone, and the usual response
 * — trying again, more slowly — is exactly what a login throttle is designed to
 * punish. Five attempts a minute is generous against an attacker and tight
 * against somebody with a long passphrase and a small keyboard. Letting them
 * see what they typed removes the failure rather than rate-limiting it.
 *
 * It is equally the right thing on *new* password fields: a confirmation box
 * exists only because the first one is hidden, and a customer who can read
 * both is far less likely to set a password containing a typo they will never
 * be able to reproduce.
 *
 * **The state belongs to the field, not to the session.** Nothing here is
 * remembered: navigate away and the next password box starts hidden again.
 * That is deliberate — a preference that persisted would eventually reveal a
 * password on a shared screen because of a choice made on a different page an
 * hour earlier.
 *
 * This exists as a component because there were nine password inputs across
 * five files and one of them — the reset-password page — had already grown its
 * own copy of this control. Two implementations of the same affordance drift,
 * and the one that drifts is the one nobody looks at.
 */

import { Eye, EyeOff } from "lucide-react";

export function PasswordToggle({
  visible,
  onToggle,
  className = "",
}: {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      // `button`, and explicitly `type="button"`. A bare <button> inside a
      // <form> defaults to type="submit", so revealing the password would
      // submit the form — which on the login page means an attempt burned
      // against the throttle for pressing "show".
      type="button"
      onClick={onToggle}
      // The label carries the state, so a screen reader announces "Show
      // password" / "Hide password" rather than an unlabelled icon. `aria-
      // pressed` would be the other correct choice; the label is what the
      // reset-password page already used and matching it keeps one vocabulary.
      aria-label={visible ? "Hide password" : "Show password"}
      // Not focusable by tab: it sits between the password box and the submit
      // button, and someone tabbing through a login form should reach the
      // button they came for. It stays reachable by pointer and by screen
      // reader navigation.
      tabIndex={-1}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-gray-700 ${className}`}
    >
      {visible ? (
        <EyeOff className="h-5 w-5" aria-hidden />
      ) : (
        <Eye className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
