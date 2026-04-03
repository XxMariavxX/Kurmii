class PriorityQueue {
  constructor(maxSize = 20) {
    this.queue = [];
    this.counter = 0;
    this.maxSize = maxSize;
  }

  enqueue(item, priority) {
    this.queue.push({
      item: item,
      priority: priority,
      order: this.counter++,
    });

    if (this.queue.length > this.maxSize) {
      this.removeItem(0);
    }
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

    if (mode === "newest") {
      return this.removeItem(this.queue.length - 1);
    }

    if (mode === "highest") {
      let highest = 0;

      for (let i = 1; i < this.queue.length; i++) {
        if (this.queue[i].priority < this.queue[highest].priority) {
          highest = i;
        }
      }

      return this.removeItem(highest);
    }
    
    if (mode === "lowest") {
      let lowest = 0;

      for (let i = 1; i < this.queue.length; i++) {
        if (this.queue[i].priority > this.queue[lowest].priority) {
          lowest = i;
        }
      }

      return this.removeItem(lowest);
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

// it will be used for users to save their attempts and the best one in the week will be on the interface