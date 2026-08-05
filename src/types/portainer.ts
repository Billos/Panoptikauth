// Portainer alerting webhook types
// Portainer's alerting webhook payload follows the Prometheus Alertmanager format.
// See https://docs.portainer.io/user/observability/alerting

export type PortainerAlertStatus = "firing" | "resolved"

export interface PortainerAlert {
  status: PortainerAlertStatus
  labels: Record<string, string>
  annotations: Record<string, string>
  startsAt: string
  endsAt: string
  generatorURL?: string
  fingerprint?: string
}

export interface PortainerWebhookPayload {
  receiver: string
  status: PortainerAlertStatus
  alerts: PortainerAlert[]
  groupLabels?: Record<string, string>
  commonLabels?: Record<string, string>
  commonAnnotations?: Record<string, string>
  externalURL?: string
  version?: string
  groupKey?: string
}
