Perfect — here’s a **short, reusable personal checklist** you can literally keep in your notes and apply to **any backend project** (Mongo *or* SQL).
No theory, just decisions.

---

# Backend Sanity Checklist (Personal)

## 1. Data ownership (decide first)

Ask for every piece of data:

* **Stored data?** → Database schema is the source of truth
* **Incoming data?** → Validation schema is the source of truth
* **Derived logic?** → Plain function
* **Behavior on entity?** → Method (optional, explicit)

If two layers describe the same thing → delete one.

---

## 2. Database + TypeScript rule

**Never hand-write document interfaces.**

✔️ Do:

```ts
type Entity = InferSchemaType<typeof entitySchema>;
type EntityDocument = HydratedDocument<Entity>;
```

❌ Don’t:

```ts
interface Entity extends Document { ... }
```

If you feel tempted → stop and infer instead.

---

## 3. Validation rule (hard boundary)

**Validate only at trust boundaries.**

Trust boundaries:

* `req.body`
* `req.params`
* `req.query`
* Webhooks
* External APIs

✔️ Use Zod
❌ Don’t validate DB data or internal objects

---

## 4. Controller input rule (non-negotiable)

Once validated:

✔️ Always use:

```ts
req.validatedData
```

❌ Never use again:

```ts
req.body
req.params
```

If you need the type → `z.infer<typeof schema>` **inside the controller**.

---

## 5. Express typing rule

Global request extensions should be **loose**:

```ts
validatedData?: unknown;
user?: UserDocument;
```

Narrow **locally**, not globally.

If TS complains → you missed a guard or a contract.

---

## 6. How to read TypeScript errors

Translate them mentally:

* `possibly undefined` → missing runtime guard
* `string not assignable to union` → untyped validated input
* `property does not exist` → runtime feature not typed
* `unknown` → you forgot to narrow

TS is not blocking you — it’s pointing.

---

## 7. Document methods rule

Use document methods **only if**:

* They act on the document
* They depend on document state

If you use them:

```ts
interface EntityMethods {
  method(): ReturnType;
}

type EntityDocument =
  HydratedDocument<Entity, EntityMethods>;
```

Otherwise → plain function.

---

## 8. Pure logic placement

If logic:

* doesn’t mutate the document
* doesn’t need Mongoose internals

✔️ Put it in a helper
❌ Don’t attach it to schema

Rule of thumb:

> If you can unit-test it without a DB → it’s not a schema method.

---

## 9. Relationships sanity check

Ask:

* Is this **relational** data? → SQL feels better
* Is this an **aggregate** (chat, feed, log)? → Mongo feels better

Mongo rule:

* If child cannot exist without parent → **embed**
* If queried independently → **separate collection**

---

## 10. Stop condition (important)

You are **done refactoring** when:

* `tsc` is clean
* Types feel boring
* Errors are obvious
* Adding a route is mechanical

At that point:

> **Stop. Ship. Learn by building.**

---

## One-line mantra (keep this)

> **Validate at the edges.
> Infer from reality.
> Let TypeScript enforce contracts, not guess them.**

---
