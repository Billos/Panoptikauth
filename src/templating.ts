import path from "path"

import nunjucks from "nunjucks"

export class TemplatingService {
  private env: nunjucks.Environment

  constructor() {
    const templatesDir = path.join(__dirname, "templates")
    const loader = new nunjucks.FileSystemLoader(templatesDir)
    this.env = new nunjucks.Environment(loader, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    })
  }

  render(template: string, context: Record<string, unknown>): string {
    return this.env.render(template, context).trim()
  }
}
