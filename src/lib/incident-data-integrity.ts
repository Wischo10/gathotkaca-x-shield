// Keep PostgreSQL and local lifecycle storage on the same exclusion rules.
const TEST_IDENTITY = "(^|[^a-z0-9])(test|e2e|mock|dummy|synthetic)([^a-z0-9]|$)";
const TEST_FLAG = '"(is_?)?(test|e2e|mock|dummy|synthetic)(_?(data|event|user|account))?"[ ]*:[ ]*"?(true|1|yes)"?([ ,}]|$)';
const TEST_METADATA = '"(source|environment|recordedByEmail|actorId|actorName|userId|userName|email)"[ ]*:[ ]*"([^"\\\\]*[^a-z0-9])?(test|e2e|mock|dummy|synthetic)([^a-z0-9][^"\\\\]*)?"';

export const OPERATIONAL_LIFECYCLE_SQL = `
  concat_ws(' ', source, actor_id, actor_name) !~* '${TEST_IDENTITY}'
  AND COALESCE(metadata::text, '{}') !~* '${TEST_FLAG}'
  AND COALESCE(metadata::text, '{}') !~* '${TEST_METADATA}'
`;

export function isOperationalLifecycleEvent(event: {
  source?: string;
  actor_id?: string;
  actor_name?: string;
  metadata?: unknown;
}): boolean {
  const identity = [event.source, event.actor_id, event.actor_name].join(' ');
  const metadata = JSON.stringify(event.metadata ?? {});
  return !new RegExp(TEST_IDENTITY, 'i').test(identity)
    && !new RegExp(TEST_FLAG, 'i').test(metadata)
    && !new RegExp(TEST_METADATA, 'i').test(metadata);
}
