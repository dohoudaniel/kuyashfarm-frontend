import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormField } from "@/components/ui/FormField";
import { AuthField } from "@/components/auth/AuthShell";

/**
 * Every password field can be revealed.
 *
 * Typing a password blind is the commonest reason a sign-in fails on a phone,
 * and the natural response — try again, more carefully — is precisely what the
 * login throttle punishes at five attempts a minute. Showing the characters
 * removes the failure instead of rate-limiting it.
 *
 * The control is built into `FormField` and `AuthField` rather than added at
 * each call site, because there were nine password inputs across five files
 * and an affordance that has to be remembered ends up on some fields and not
 * others — which teaches people it is unreliable and stops them looking.
 */

function typed(label: string) {
  // `{ selector: "input" }` matters: the toggle's accessible name is "Show
  // password", so an unconstrained label query matches the button as well as
  // the field and fails with "Found multiple elements".
  return screen.getByLabelText(label, { selector: "input" }) as HTMLInputElement;
}

describe("FormField", () => {
  it("hides a password until asked", () => {
    render(<FormField label="Password" name="pw" type="password" value="" onChange={vi.fn()} />);

    expect(typed("Password").type).toBe("password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("reveals it, and hides it again", async () => {
    render(<FormField label="Password" name="pw" type="password" value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(typed("Password").type).toBe("text");

    // The label carries the state, so a screen reader hears what the control
    // will do rather than an unlabelled icon.
    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(typed("Password").type).toBe("password");
  });

  it("puts no control on an ordinary field", () => {
    render(<FormField label="Full name" name="name" value="" onChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /password/i })).not.toBeInTheDocument();
  });

  it("does not submit the form when pressed", async () => {
    /*
     * A bare <button> inside a <form> defaults to type="submit". On the login
     * page that would mean pressing "show" burns an attempt against the
     * throttle — the exact thing this feature exists to avoid.
     */
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <FormField label="Password" name="pw" type="password" value="" onChange={vi.fn()} />
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps what was typed when the type flips", async () => {
    // Swapping the input type must not reset the field.
    let value = "";
    const onChange = vi.fn((e) => {
      value = e.target.value;
    });
    const { rerender } = render(
      <FormField label="Password" name="pw" type="password" value={value} onChange={onChange} />,
    );

    await userEvent.type(typed("Password"), "correct-horse");
    rerender(
      <FormField label="Password" name="pw" type="password" value={value} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(typed("Password").value).toBe(value);
    expect(typed("Password").type).toBe("text");
  });
});

describe("AuthField", () => {
  it("reveals a sign-in password", async () => {
    render(
      <AuthField id="password" label="Password" type="password" value="" onChange={vi.fn()} />,
    );

    expect(typed("Password").type).toBe("password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(typed("Password").type).toBe("text");
  });

  it("leaves the email field alone", () => {
    render(<AuthField id="email" label="Email address" type="email" value="" onChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /password/i })).not.toBeInTheDocument();
  });

  it("does not disturb the password manager's view of the field", async () => {
    /*
     * `autoComplete` has to keep working. The rendered type changes; the
     * field's identity — new-password vs current-password — does not, so a
     * manager still offers to generate or fill.
     */
    render(
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        value=""
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(typed("Password").autocomplete).toBe("new-password");
  });
});
