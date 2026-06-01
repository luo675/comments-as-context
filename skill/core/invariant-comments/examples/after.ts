interface Task {
  id: string;
  priority: number;
  description: string;
  createdAt: Date;
}

/**
 * @invariant The items array MUST remain sorted by priority (descending)
 *            at all times. Insertion and deletion operations must re-sort.
 *            Violation: task scheduler will process tasks out of order,
 *            potentially skipping critical high-priority work.
 */
class PriorityTaskQueue {
  private items: Task[] = [];

  add(task: Task): void {
    this.items.push(task);
    this.items.sort((a, b) => b.priority - a.priority);
  }

  processNext(): Task | undefined {
    return this.items.shift();
  }

  remove(taskId: string): void {
    this.items = this.items.filter(t => t.id !== taskId);
  }
}

/**
 * @invariant localCache and remote DB MUST be eventually consistent.
 *            After flush(), dirtyKeys MUST be empty AND localCache values
 *            MUST match server values.
 *            Violation: stale balance data leads to incorrect transactions.
 *            The gap between updateBalance() and flush() is the
 *            inconsistency window — keep it as short as possible.
 */
class AccountCache {
  private localCache = new Map<string, number>();
  private dirtyKeys = new Set<string>();

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    this.localCache.set(accountId, newBalance);
    this.dirtyKeys.add(accountId);
  }

  async flush(): Promise<void> {
    for (const key of this.dirtyKeys) {
      await fetch(`/api/accounts/${key}/balance`, {
        method: "PUT",
        body: JSON.stringify({ balance: this.localCache.get(key) }),
      });
    }
    this.dirtyKeys.clear();
  }

  getBalance(accountId: string): number | undefined {
    return this.localCache.get(accountId);
  }
}

/**
 * @invariant State transitions MUST follow the defined graph.
 *            Once "shipped", no further transitions are allowed.
 *            Violation: an order could be cancelled after shipping,
 *            causing financial reconciliation errors.
 */
class OrderStateMachine {
  private state: string = "pending";
  /**
   * @invariant All transition rules are defined here.
   *            Adding a new state MUST include all allowed transitions.
   *            Removing a state MUST ensure no other state references it.
   */
  private allowedTransitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
  };

  transition(to: string): void {
    const allowed = this.allowedTransitions[this.state];
    if (!allowed?.includes(to)) throw new Error(`Cannot transition from ${this.state} to ${to}`);
    this.state = to;
  }

  get currentState(): string {
    return this.state;
  }
}
