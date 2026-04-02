class PriorityQueue {
  constructor() {
    this.queue = [];
    this.counter = 0;
  }

  enqueue(item, priority) {
    this.queue.push({
      item: item,
      priority: priority,
      order: this.counter++,
    });
  }

  removeItem(index) {
    if (index < 0 || this.queue.length <= index) {
      return null;
    }

    const [removed] = this.queue.splice(index, 1);
    return removed.item;
  }

  dequeue(mode) {
    if (this.queue.length === 0) {
      return null;
    }

    if (mode === "oldest") {
      return this.removeItem(0);
    }

    if (mode === "new") {
      return this.removeItem(this.queue.length - 1);
    }

    if (mode === "highest") {
      let highestIndex = 0;

      for (let i = 1; i < this.queue.length; i++) {
        if (this.queue[i].priority < this.queue[highestIndex].priority) {
          highestIndex = i;
        }
      }

      return this.removeItem(highestIndex);
    }
    if (mode === "lowest") {
      let lowIndex = 0;

      for (let i = 1; i < this.queue.length; i++) {
        if (this.queue[i].priority > this.queue[lowIndex].priority) {
          lowIndex = i;
        }
      }

      return this.removeItem(lowIndex);
    }
  }

  peekHighest() {
    if (this.queue.length === 0) {
      return null;
    }

    let highest = this.queue[0];

    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority < highest.priority) {
        highest = this.queue[i];
      }
    }
    return highest.item;
  }

  peekLowest() {
    if (this.queue.length === 0) {
      return null;
    }

    let lowest = this.queue[0];

    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority > lowest.priority) {
        lowest = this.queue[i];
      }
    }
    return lowest.item;
  }

  peekOldest() {
    return this.queue.length === 0 ? null : this.queue[0].item;
  }

  peekNew() {
    return this.queue.length === 0
      ? null
      : this.queue[this.queue.length - 1].item;
  }
}
