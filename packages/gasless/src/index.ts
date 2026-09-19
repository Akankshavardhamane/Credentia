export interface GaslessTransactionAdapter {
  submit(request: { to: `0x${string}`; data: `0x${string}` }): Promise<{
    transactionHash: string;
  }>;
}
export class DirectTransactionAdapter implements GaslessTransactionAdapter {
  constructor(private readonly sender: GaslessTransactionAdapter) {}
  submit(request: { to: `0x${string}`; data: `0x${string}` }) {
    return this.sender.submit(request);
  }
}
export class BiconomyAdapter implements GaslessTransactionAdapter {
  constructor(
    private readonly submitter: (request: {
      to: `0x${string}`;
      data: `0x${string}`;
    }) => Promise<{ transactionHash: string }>,
  ) {}
  submit(request: { to: `0x${string}`; data: `0x${string}` }) {
    return this.submitter(request);
  }
}
