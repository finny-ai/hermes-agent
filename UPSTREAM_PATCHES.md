# Generic upstream patch inventory

Candidate base: `5bba024d8ddd388f56f354c1f789be825e3d8a3c`. This branch is an isolated desktop compatibility candidate; it does not replace the supported checkout or constitute deployment acceptance.

## Dependency and workspace declarations

Patch commit: `85388388a4cda71fc75133bf2e693ad7e7ad535d`.

The desktop framework, build/test dependencies and vulnerable transitive pins are updated in manifests and the lock. Shared tests now declare Vitest, desktop backend tests declare WebSocket and its types, and the root JavaScript test workspace uses the matching Vitest pin. XML parser overrides retain separate supported minor lines. No domain or provider policy code is present in this patch.

A plugin cannot change the host's framework, build dependencies or workspace typecheck dependency graph. The candidate uses the project's existing release-age policy and exclusions without modifying them. Lifecycle scripts were disabled for locked installation.

Validation: desktop and web typechecks passed; native boundary tests: 71 passed; UI/SDK tests: 39 passed. The locked root + desktop + web + shared + root-JavaScript-test audit returned 0 findings. This is a scoped package audit; unselected workspaces and exploit reachability are not accepted. Deprecation warnings remain recorded.

## Main-script detection through symbolic links

Patch commit: `6ab610076e4771883f0e9967e9c36122afccdec4`.

The existing main-script predicate compared the invoked argv path with Node's canonical module URL. A real CLI launched through a directory link returned success without executing its main block; the existing commit-stamp test failed on both the base and dependency candidate with an absent install-stamp.json. The fix retains the original-path check for --preserve-symlinks-main, then compares the resolved entry path. Three subprocess regressions cover normal linked invocation, preserved-main-symlink invocation and import without execution.

A plugin cannot repair host build-script entrypoint detection. After this generic fix, the existing stamp, build and signing-resource tests plus the new subprocess regressions returned 16 passed. The original failures are preserved separately; they were not counted as passes or suppressed.

## Upstream and removal plan

Upstream issue/PR: none created. Submit these generic commits for upstream review only when authorized. Remove the corresponding local patch once an accepted upstream revision contains the equivalent change and the focused checks and actual desktop packaging/navigation exercise pass on that revision. No forced audit fix, release-age waiver, provider permission, signing identity or distribution approval is part of these commits.
