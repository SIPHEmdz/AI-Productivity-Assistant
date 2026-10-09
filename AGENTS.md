<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data access uses the browser backend client with row-level security policies (owner = business.owner_id); why: keeps v1 simple with no server functions needed.
- One business per user account (businesses.owner_id unique); why: dashboard and requests assume a single acting business.
- Signed-in pages live under src/routes/_authenticated/; why: single client-side auth gate.
