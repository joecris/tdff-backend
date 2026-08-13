/**
 * Minimal base for domain entities. Kept intentionally tiny — hexagonal
 * architecture doesn't require an entity base class, but sharing `id`
 * equality semantics avoids repeating it in every entity.
 */
export abstract class BaseEntity<Id> {
  protected constructor(public readonly id: Id) {}

  equals(other: BaseEntity<Id>): boolean {
    if (other === this) return true;
    if (other.constructor !== this.constructor) return false;
    return other.id === this.id;
  }
}
