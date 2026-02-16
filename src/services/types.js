/**
 * Shared service-layer data contracts for mock and API integrations.
 */

/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} name
 * @property {string} destination
 * @property {string} countryCode
 * @property {number} dataGb
 * @property {string} dataLabel
 * @property {number} validityDays
 * @property {number} price
 * @property {string} speed
 * @property {string} coverage
 * @property {number} originalPriceUzs
 * @property {number} resellerPriceUzs
 * @property {string} sku
 */

/**
 * @typedef {Object} Customer
 * @property {string} name
 * @property {string} [phone]
 * @property {string} [email]
 */

/**
 * @typedef {Object} Group
 * @property {string} id
 * @property {string} [code]
 * @property {string} name
 * @property {string} [destination]
 * @property {string} [destinationCountryCode]
 * @property {string|null} [travelStartDate] ISO date
 * @property {string|null} [travelEndDate] ISO date
 * @property {string} [packageLabel]
 * @property {'scheduled'|'unassigned'|string} [packageStatus]
 * @property {string|null} [packageScheduledAt] ISO datetime
 * @property {Customer[]} members
 * @property {'sms'|'email'|'operator'|'manual'} deliveryMethod
 * @property {'now'|'scheduled'} deliveryTime
 */

/**
 * @typedef {Object} EarningsSummary
 * @property {number} totalCommission Legacy UI label. In current DB discount model, map from partner savings.
 * @property {number} totalOrders
 * @property {number} activeEsims
 * @property {number} monthlyGrowthPct
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} customerName
 * @property {string} destination
 * @property {string} countryCode
 * @property {string} planName
 * @property {number} amount
 * @property {number} commission
 * @property {string} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PortalPackage
 * @property {string} id
 * @property {string} name
 * @property {string} destination
 * @property {string} countryCode
 * @property {number} dataGb
 * @property {number} validityDays
 * @property {string} speed
 * @property {string[]} operators
 * @property {boolean} hotspotSupported
 * @property {string} code
 * @property {number} priceUzs
 */

/**
 * @typedef {Object} PortalTimeline
 * @property {string|null} createdAt
 * @property {string|null} paymentClearedAt
 * @property {string|null} deliveredAt
 * @property {string|null} activatedAt
 * @property {string|null} lastSyncAt
 */

/**
 * @typedef {Object} PortalOrderMember
 * @property {string} id
 * @property {string} name
 * @property {string} [phone]
 * @property {string} [email]
 * @property {'sms'|'email'|'manual'} deliveryMethod
 * @property {'sent'|'pending'|string} deliveryStatus
 * @property {'active'|'pending'|'failed'|'expired'|string} status
 * @property {number} dataUsageGb
 * @property {number} totalDataGb
 * @property {string} iccid
 */

/**
 * @typedef {Object} PortalOrder
 * @property {string} id
 * @property {'client'|'group'|'self'} orderType
 * @property {string} packageId
 * @property {string} [customerName]
 * @property {string} [customerPhone]
 * @property {string} [customerEmail]
 * @property {string} [groupName]
 * @property {'active'|'pending'|'failed'|'expired'|string} status
 * @property {number} dataUsageGb
 * @property {number} totalDataGb
 * @property {string} purchasedAt
 * @property {number} paymentTotalUzs
 * @property {string} iccid
 * @property {PortalTimeline} timeline
 * @property {PortalOrderMember[]} [groupMembers]
 * @property {PortalPackage} [package]
 */

/**
 * @typedef {Object} OrderDetails
 * @property {string} id
 * @property {string} iccid
 * @property {string} qr
 * @property {number} usedGb
 * @property {number} totalGb
 * @property {number} remainingGb
 * @property {string[]} timeline
 */

/**
 * @typedef {Object} PortalInstallLinks
 * @property {string} ios
 * @property {string} android
 */

export const serviceTypes = {};
