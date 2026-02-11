import { NextFunction, Request, Response } from "express"
import z from "zod"

const GotifyQuerySchema = z.object({
  token: z.string(),
  url: z.url(),
  title: z.string().optional(),
})

export type GotifyQuery = z.infer<typeof GotifyQuerySchema>

export async function gotifyParameters(req: Request<{}, {}, {}, GotifyQuery>, res: Response, next: NextFunction) {
  const parsed = GotifyQuerySchema.safeParse(req.query)
  if (parsed.success) {
    return next()
  }
  console.log("Failed to parse  request query:", parsed.error)
  res.status(400).json(parsed.error)
}
