/** Transient notifications, announced to assistive technology via an aria-live region. */
export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly kind: ToastKind;
  readonly action?: { readonly label: string; readonly run: () => void };
}

class Toasts {
  items = $state<Toast[]>([]);
  private seq = 0;

  show(
    message: string,
    kind: ToastKind = 'info',
    options: { timeout?: number; action?: Toast['action'] } = {},
  ): number {
    const id = ++this.seq;
    this.items = [
      ...this.items.slice(-3),
      { id, message, kind, ...(options.action ? { action: options.action } : {}) },
    ];
    const timeout = options.timeout ?? (kind === 'error' ? 6000 : 3200);
    if (timeout > 0) setTimeout(() => this.dismiss(id), timeout);
    return id;
  }

  dismiss(id: number): void {
    this.items = this.items.filter((toast) => toast.id !== id);
  }
}

export const toasts = new Toasts();
