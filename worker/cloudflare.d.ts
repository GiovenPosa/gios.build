// Just enough of the Workers runtime's types for this folder's own type
// check (the Workers runtime provides the real ones; wrangler bundles the code).

declare module 'cloudflare:workers' {
  export type WorkflowDuration = `${number} ${'second' | 'seconds' | 'minute' | 'minutes' | 'hour' | 'hours'}`;
  export interface WorkflowStepConfig {
    retries?: { limit: number; delay: WorkflowDuration | number; backoff?: 'constant' | 'linear' | 'exponential' };
    timeout?: WorkflowDuration | number;
  }
  export interface WorkflowEvent<T> {
    payload: Readonly<T>;
    timestamp: Date;
    instanceId: string;
  }
  export interface WorkflowStep {
    do<T>(name: string, callback: () => Promise<T>): Promise<T>;
    do<T>(name: string, config: WorkflowStepConfig, callback: () => Promise<T>): Promise<T>;
  }
  export abstract class WorkflowEntrypoint<Env = unknown, T = unknown> {
    protected env: Env;
    abstract run(event: WorkflowEvent<T>, step: WorkflowStep): Promise<unknown>;
  }
}

interface HTMLRewriterElement {
  tagName: string;
  getAttribute(name: string): string | null;
  onEndTag(handler: () => void): void;
}
interface HTMLRewriterText {
  text: string;
  lastInTextNode: boolean;
}
declare class HTMLRewriter {
  on(selector: string, handlers: { element?: (el: HTMLRewriterElement) => void; text?: (text: HTMLRewriterText) => void }): HTMLRewriter;
  transform(response: Response): Response;
}
