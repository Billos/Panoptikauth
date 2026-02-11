/**
 * Extractor class for generating message lines from event data
 * Provides a single, consistent way to format each type of data
 */

import { getContinentEmoji, getCountryEmoji } from "../emoji"
import { LoginEventData, LoginFailedEventData, UserWriteEventData } from "../types/authentik"
import { Extractor } from "./extractor"

export class AuthentikExtractor extends Extractor {
  /**
   * Extract user information from login data
   */
  extractUserInfo(_data: LoginEventData, username?: string, email?: string): void {
    if (!username && !email) {
      return
    }

    this.addLine(`\n**User:** ${username || "N/A"}${email ? ` (${email})` : ""}`)
  }

  /**
   * Extract IP address information
   */
  extractIpAddress(ipAddress?: string): void {
    if (!ipAddress) {
      return
    }

    this.addLine(`\n**IP Address:** ${ipAddress}`)
  }

  /**
   * Extract device status from login data
   */
  extractDeviceStatus(data: LoginEventData): void {
    const knownDevice = data.auth_method_args?.known_device
    if (knownDevice === undefined) {
      return
    }

    const deviceStatus = knownDevice ? "✅ Known device" : "⚠️ Unknown device"
    this.addLine(`\n**Device Status:** ${deviceStatus}`)
  }

  /**
   * Extract MFA devices from login data
   */
  extractMfaDevices(data: LoginEventData): void {
    const mfaDevices = data.auth_method_args?.mfa_devices
    if (!mfaDevices || mfaDevices.length === 0) {
      return
    }

    const mfaList = mfaDevices.map((device) => `- ${device.app} (${device.name}, ${device.model_name})`).join("\n")
    this.addLine(`\n**MFA Devices Used:**\n${mfaList}`)
  }

  /**
   * Extract geolocation information from login data
   */
  extractGeoLocation(data: LoginEventData): void {
    const { geo } = data
    if (!geo) {
      return
    }

    const geoParts: string[] = []

    if (geo.continent) {
      geoParts.push(`\n - Continent: ${getContinentEmoji(geo.continent)} ${geo.continent}`)
    }
    if (geo.country) {
      geoParts.push(`\n - Country: ${getCountryEmoji(geo.country)} ${geo.country}`)
    }
    if (geo.city) {
      geoParts.push(`\n - City: ${geo.city}`)
    }

    if (geoParts.length > 0) {
      this.addLine(`\n**Location:** ${geoParts.join(", ")}`)
    }

    if (geo.lat !== undefined && geo.long !== undefined) {
      this.addLine(`\n**Coordinates:** ${geo.lat}, ${geo.long}`)
      const googleMapsUrl = `https://www.google.com/maps?q=${geo.lat},${geo.long}`
      this.addLine(`\n[View on Google Maps](${googleMapsUrl})`)
    }
  }

  /**
   * Extract ASN information from login data
   */
  extractAsnInfo(data: LoginEventData): void {
    const { asn } = data
    if (!asn) {
      return
    }

    const asnParts: string[] = []
    if (asn.asn !== undefined) {
      asnParts.push(`ASN ${asn.asn}`)
    }
    if (asn.as_org) {
      asnParts.push(asn.as_org)
    }
    if (asn.network) {
      asnParts.push(`(${asn.network})`)
    }

    if (asnParts.length === 0) {
      return
    }

    this.addLine(`\n**ASN:** ${asnParts.join(" ")}`)
  }

  /**
   * Extract HTTP request information from user write data
   */
  extractHttpRequest(data: UserWriteEventData): void {
    const httpRequest = data.http_request
    if (!httpRequest || (!httpRequest.method && !httpRequest.path)) {
      return
    }

    this.addLine(`\n**Request:** ${httpRequest.method || "N/A"} ${httpRequest.path || "N/A"}`)
  }

  /**
   * Extract stage information from login failed data
   */
  extractStageInfo(data: LoginFailedEventData): void {
    const { stage } = data
    if (!stage) {
      return
    }

    this.addLine(`\n**Failed Stage:** ${stage.app} (${stage.name}, ${stage.model_name})`)
  }

  /**
   * Extract username from user write data
   */
  extractUsername(data: UserWriteEventData | LoginFailedEventData): void {
    const { username } = data
    if (!username) {
      return
    }

    this.addLine(`\n**Username:** ${username}`)
  }

  /**
   * Extract name from user write data
   */
  extractName(data: UserWriteEventData): void {
    const { name } = data
    if (!name) {
      return
    }

    this.addLine(`\n**Name:** ${name}`)
  }

  /**
   * Extract email from user write data
   */
  extractEmail(data: UserWriteEventData): void {
    const { email } = data
    if (!email) {
      return
    }

    this.addLine(`\n**Email:** ${email}`)
  }

  /**
   * Extract locale from user write data
   */
  extractLocale(data: UserWriteEventData): void {
    const locale = data.attributes?.settings?.locale
    if (!locale) {
      return
    }

    this.addLine(`\n**Locale:** ${locale}`)
  }
}
