import path from "path"

import nunjucks from "nunjucks"

export class TemplatingService {
  private env: nunjucks.Environment

  constructor() {
    const templatesDir = path.join(__dirname, "..", "templates")
    this.env = nunjucks.configure(templatesDir, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    })
  }

  render(template: string, context: Record<string, unknown>): string {
    return this.env.render(template, context).trim()
  }
}
