# Shared state

Add shared in-memory state only when a concrete cross-module need exists. This multi-page app reloads documents between routes; do not add a framework-style global store or rely on it for durable/auth-sensitive data.
