### 🔧 Function Signature Consistency

**Rule:** When declaring any new function or component that accepts **multiple arguments or props**, you must define the function using a single `props` or `params` object/variable. All arguments should then be **immediately destructured** within the function body or signature. Use interfaces instead of types for the props/params.
**Purpose:** This enforces predictable function signatures and simplifies argument handling, especially when adding future parameters.
**Example: Correct**
const CoolComponent = (props: CoolComponentProps) => {
const {profile, name, user} = props;
...
};

**Rule:** Before implementing any non-trivial feature or making significant changes, present a detailed plan to the user for approval.
