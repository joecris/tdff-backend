/**
 * Lives in the shared kernel, not the `user` module, deliberately — `role`
 * is an authorization concept the auth seam (a cross-cutting concern, not a
 * module) needs to reference directly (`AuthPrincipal`, `requireRole`
 * middleware). `user.entity.ts` imports this rather than declaring its own
 * copy, so the two can never drift apart.
 */
export type UserRole = 'user' | 'admin';
