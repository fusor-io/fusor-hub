export async function sleep(ms = 0): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
