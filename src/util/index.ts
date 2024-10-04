import { Interface } from "node:readline";


export function ask(question: string, rl: Interface, placeholder?: string): Promise<string> {
    return new Promise<string>((res, _) => {
      rl.question(question + (placeholder ? " " + placeholder + " " : ""), (answer) => {
        res(answer);
      });
    });
  }

  export function clearLine(): void {
    process.stdout.write(`\u001B[1A`);
    process.stdout.write("\u001B[2K");
    process.stdout.write("\u001B[0G");
  }