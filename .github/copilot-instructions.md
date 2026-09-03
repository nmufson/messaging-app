### 🔧 Function Signature Consistency

**Rule:** When declaring any new function or component that accepts **multiple arguments or props**, you must define the function using a single `props` or `params` object/variable. All arguments should then be **immediately destructured** within the function body. Use interfaces instead of types for the props/params.
**Purpose:** This enforces predictable function signatures and simplifies argument handling, especially when adding future parameters.
**Example: Correct**
const CoolComponent = (props: CoolComponentProps) => {
const {profile, name, user} = props;
...
};

**Rules:**

- Before implementing any non-trivial feature or making significant changes, present a detailed plan to the user for approval.
- Do not use the tailwind class 'space'

### 🎨 Project Design System

Use the project's existing design tokens and palette instead of introducing arbitrary colors.

#### Brand Palette

- `brand`: `#2563eb` — Electric Blue
- `brand-dark`: `#0f172a` — Deep Charcoal
- `brand-light`: `#dbeafe` — Soft Blue
- `brand-accent`: `#f8fafc` — Off-White
- `brand-neutral`: `#f1f5f9` — Neutral Surface
- `brand-surface`: `#f8fafc` — Main Background
- `brand-success`: `#10b981` — Online/Success

#### Semantic Colors

- `success-500`: `#10b981`
- `warning-500`: `#f59e0b`
- `error-500`: `#dc2626`
- `accent-500`: `#2563eb`

#### Neutral Colors

- `grey-50`: `#f8fafc`
- `grey-100`: `#f1f5f9`
- `grey-150`: `#e2e8f0`
- `grey-200`: `#cbd5e1`

#### Usage Rules

- Prefer the existing theme tokens/classes over arbitrary Tailwind colors such as `blue-500`, `slate-900`, or arbitrary hex values.
- Do not introduce new colors unless the existing palette cannot reasonably support the requirement.
- When a new color is genuinely necessary, add it to the project's theme/design system rather than using an inline or arbitrary color.
- Maintain visual consistency with the existing palette when implementing new UI.
- Use semantic tokens according to their meaning. For example, use `success-500` for success/online states and `error-500` for destructive/error states.
