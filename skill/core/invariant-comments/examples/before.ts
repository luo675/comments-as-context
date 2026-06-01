interface Task {
  id: string;
  priority: number;
  description: string;
  createdAt: Date;
}

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

class OrderStateMachine {
  private state: string = "pending";
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
