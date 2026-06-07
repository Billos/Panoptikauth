import { NextFunction, Request, Response } from "express"
import z from "zod"

const Fail2BanQuerySchema = z.object({
  ip: z.string(),
  time: z.string(),
  message: z.string(),
  jail: z.string().optional(),
  timestamp: z.string(),
  failures: z.string().optional(),
})

export type Fail2BanBody = z.infer<typeof Fail2BanQuerySchema>

export async function fail2BanParameters(req: Request<{}, {}, Fail2BanBody>, res: Response, next: NextFunction) {
  const parsed = Fail2BanQuerySchema.safeParse(req.body)
  if (parsed.success) {
    return next()
  }
  console.log("Failed to parse Fail2Ban request body:", parsed.error)
  res.status(400).json(parsed.error)
}
