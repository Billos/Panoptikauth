export interface Fail2banBanRequest {
  ip: string
  jail?: string
}

export interface Fail2banBanEntry {
  ip: string
  jail?: string
  bannedAt: string
}
