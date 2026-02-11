export abstract class Extractor {
  private lines: string[] = []

  /**
   * Get the accumulated message lines
   */
  getLines(): string[] {
    return this.lines
  }

  /**
   * Get the accumulated message as a single string
   */
  getResult(): string {
    return this.lines.join("\n")
  }

  /**
   * Add a line to the accumulated message lines
   */
  addLine(line: string): void {
    this.lines.push(line)
  }

  /**
   * Clear the accumulated message lines
   */
  clear(): void {
    this.lines = []
  }
}
