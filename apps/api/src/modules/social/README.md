# Social Studio

Reserved module. Do not add features until the existing Social Studio is ported in.

- HTTP: `/v1/admin/social` returns 501.
- The port must reuse MediaAsset, StorageDriver, AgentRuntime, pg-boss, and the tokens in `packages/ui`.
- Shared types live in `@nina/contracts`. `ports.ts` re-exports them.

See `docs/BUILD_GUIDE.md` section 17.
