/**
 * src/utils/date.js
 * 时间处理工具库 - 基于 dayjs
 *
 * 安装：npm install dayjs
 */

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// ========== 加载所有插件 ==========
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)
dayjs.extend(duration)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// 设置中文
dayjs.locale('zh-cn')

// 设置默认时区为北京时间
dayjs.tz.setDefault('Asia/Shanghai')

// ========== 常量 ==========
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_SHORT: 'MM-DD HH:mm',
  YEAR_MONTH: 'YYYY-MM',
  CHINESE_DATE: 'YYYY年MM月DD日',
  CHINESE_DATETIME: 'YYYY年MM月DD日 HH:mm:ss',
  TIMESTAMP: 'x',        // 毫秒时间戳
  TIMESTAMP_SECOND: 'X', // 秒时间戳
}

// ========== 1. 基础格式化 ==========

/**
 * 格式化日期为字符串
 * @param {string|number|Date|null|undefined} date 日期，如 '2026-01-29'、1769652853654、new Date()
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 格式模板，默认 DATE_FORMATS.DATETIME
 * @returns {string} 格式化后的字符串；入参为空或非法时返回 '-'
 * @example
 *   formatDate(1769652853654)                         // '2026-01-29 10:14:13'
 *   formatDate('2026-01-29', DATE_FORMATS.DATE)       // '2026-01-29'
 *   formatDate(null)                                  // '-'
 */
export function formatDate(date, format = DATE_FORMATS.DATETIME) {
  if (date === null || date === undefined || date === '' || date === 'null') return '-'
  const d = dayjs(date)
  if (!d.isValid()) return '-'
  return d.format(format)
}

/**
 * 仅日期：YYYY-MM-DD
 * @param {string|number|Date|null|undefined} date 日期，如 '2026-01-29 10:14:13'
 * @returns {string} 如 '2026-01-29'；非法时返回 '-'
 * @example formatDateOnly('2026-01-29 10:14:13')  // '2026-01-29'
 */
export function formatDateOnly(date) {
  return formatDate(date, DATE_FORMATS.DATE)
}

/**
 * 仅时间：HH:mm:ss
 * @param {string|number|Date|null|undefined} date 日期，如 '2026-01-29 10:14:13'
 * @returns {string} 如 '10:14:13'；非法时返回 '-'
 * @example formatTimeOnly('2026-01-29 10:14:13')  // '10:14:13'
 */
export function formatTimeOnly(date) {
  return formatDate(date, DATE_FORMATS.TIME)
}

/**
 * 中文格式：YYYY年MM月DD日
 * @param {string|number|Date|null|undefined} date 日期，如 '2026-01-29'
 * @returns {string} 如 '2026年01月29日'；非法时返回 '-'
 * @example formatChineseDate('2026-01-29')  // '2026年01月29日'
 */
export function formatChineseDate(date) {
  return formatDate(date, DATE_FORMATS.CHINESE_DATE)
}

/**
 * 短格式：MM-DD HH:mm（用于聊天记录、最近动态）
 * @param {string|number|Date|null|undefined} date 日期，如 '2026-01-29 10:14:13'
 * @returns {string} 如 '01-29 10:14'；非法时返回 '-'
 * @example formatShortDate('2026-01-29 10:14:13')  // '01-29 10:14'
 */
export function formatShortDate(date) {
  return formatDate(date, DATE_FORMATS.DATETIME_SHORT)
}

// ========== 2. 时间戳处理 ==========

/**
 * 自动识别秒级/毫秒级时间戳并格式化
 * @param {number|string} timestamp 时间戳，10 位（秒）或 13 位（毫秒），如 1769652853 或 1769652853654
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 格式模板
 * @returns {string} 如 '2026-01-29 10:14:13'；空值或非数字返回 '-'
 * @example
 *   formatTimestamp(1769652853)      // '2026-01-29 10:14:13'（秒，自动 ×1000）
 *   formatTimestamp(1769652853654)   // '2026-01-29 10:14:13'（毫秒）
 */
export function formatTimestamp(timestamp, format = DATE_FORMATS.DATETIME) {
  if (!timestamp) return '-'
  const ts = String(timestamp)
  // 秒级时间戳（10位）转毫秒
  const ms = ts.length === 10 ? Number(ts) * 1000 : Number(ts)
  if (isNaN(ms)) return '-'
  return dayjs(ms).format(format)
}

/**
 * 获取当前时间戳（毫秒）
 * @returns {number} 13 位毫秒时间戳，如 1769652853654
 * @example nowTimestamp()  // 1769652853654
 */
export function nowTimestamp() {
  return Date.now()
}

/**
 * 获取当前时间戳（秒）
 * @returns {number} 10 位秒级时间戳，如 1769652853
 * @example nowTimestampSecond()  // 1769652853
 */
export function nowTimestampSecond() {
  return Math.floor(Date.now() / 1000)
}

/**
 * 将日期转为时间戳
 * @param {string|Date} date 日期，如 '2026-01-29 10:14:13' 或 new Date()
 * @param {boolean} [inSeconds=false] 是否返回秒级；默认 false 返回毫秒
 * @returns {number|null} 毫秒时间戳（默认）或秒级时间戳；入参为空返回 null
 * @example
 *   toTimestamp('2026-01-29 10:14:13')        // 1769652853000
 *   toTimestamp('2026-01-29 10:14:13', true)  // 1769652853
 */
export function toTimestamp(date, inSeconds = false) {
  if (!date) return null
  const ts = dayjs(date).valueOf()
  return inSeconds ? Math.floor(ts / 1000) : ts
}

// ========== 3. 相对时间 ==========

/**
 * 相对时间（几分钟前、几天前）
 * @param {string|number|Date} date 目标时间，如 Date.now() - 3600000
 * @param {boolean} [withoutSuffix=false] 是否不带后缀；true 返回 '1 小时'，false 返回 '1 小时前'
 * @returns {string} 如 '1 小时前'；空值返回 '-'
 * @example
 *   fromNow(Date.now() - 5 * 60 * 1000)        // '5 分钟前'
 *   fromNow(Date.now() - 5 * 60 * 1000, true)  // '5 分钟'
 */
export function fromNow(date, withoutSuffix = false) {
  if (!date) return '-'
  return dayjs(date).fromNow(withoutSuffix)
}

/**
 * 相对时间（到某个时间点）
 * @param {string|number|Date} date 目标时间，如 Date.now() + 3600000
 * @returns {string} 如 '1 小时内'；空值返回 '-'
 * @example toNow(Date.now() + 60 * 60 * 1000)  // '1 小时内'
 */
export function toNow(date) {
  if (!date) return '-'
  return dayjs(date).toNow()
}

/**
 * 两个时间之间的相对描述
 * @param {string|number|Date} date1 起始时间，如 '2026-01-01'
 * @param {string|number|Date} date2 结束时间，如 '2026-01-29'
 * @returns {string} 如 '28 天后'；任一为空返回 '-'
 * @example fromTo('2026-01-01', '2026-01-29')  // '28 天后'
 */
export function fromTo(date1, date2) {
  if (!date1 || !date2) return '-'
  return dayjs(date1).from(dayjs(date2))
}

// ========== 4. 时间范围 ==========

/**
 * 获取预设时间范围
 * @param {string} type 范围类型：today/yesterday/tomorrow/last7days/last30days/last90days/thisWeek/lastWeek/thisMonth/lastMonth/thisQuarter/thisYear
 * @returns {[dayjs.Dayjs, dayjs.Dayjs]|null[]} 返回 [开始 dayjs, 结束 dayjs]；未知类型返回 [null, null]
 * @example
 *   const [start, end] = getTimeRange('today')
 *   start.format('YYYY-MM-DD HH:mm:ss')  // 当天 '2026-10-11 00:00:00'
 *   end.format('YYYY-MM-DD HH:mm:ss')    // 当天 '2026-10-11 23:59:59'
 */
export function getTimeRange(type) {
  const now = dayjs()
  switch (type) {
    case 'today':
      return [now.startOf('day'), now.endOf('day')]
    case 'yesterday':
      return [now.subtract(1, 'day').startOf('day'), now.subtract(1, 'day').endOf('day')]
    case 'tomorrow':
      return [now.add(1, 'day').startOf('day'), now.add(1, 'day').endOf('day')]
    case 'last7days':
      return [now.subtract(6, 'day').startOf('day'), now.endOf('day')]
    case 'last30days':
      return [now.subtract(29, 'day').startOf('day'), now.endOf('day')]
    case 'last90days':
      return [now.subtract(89, 'day').startOf('day'), now.endOf('day')]
    case 'thisWeek':
      return [now.startOf('week'), now.endOf('week')]
    case 'lastWeek':
      return [now.subtract(1, 'week').startOf('week'), now.subtract(1, 'week').endOf('week')]
    case 'thisMonth':
      return [now.startOf('month'), now.endOf('month')]
    case 'lastMonth':
      return [now.subtract(1, 'month').startOf('month'), now.subtract(1, 'month').endOf('month')]
    case 'thisQuarter':
      return [now.startOf('quarter'), now.endOf('quarter')]
    case 'thisYear':
      return [now.startOf('year'), now.endOf('year')]
    default:
      return [null, null]
  }
}

/**
 * 获取时间范围并格式化为字符串数组（直接给 el-date-picker 用）
 * @param {string} type 范围类型，同 getTimeRange，如 'last7days'
 * @param {string} [format='YYYY-MM-DD'] 输出格式，默认 DATE_FORMATS.DATE
 * @returns {string[]} 如 ['2026-10-05', '2026-10-11']；未知类型返回 []
 * @example getTimeRangeFormatted('last7days')  // ['2026-10-05', '2026-10-11']
 */
export function getTimeRangeFormatted(type, format = DATE_FORMATS.DATE) {
  const range = getTimeRange(type)
  if (!range[0]) return []
  return [range[0].format(format), range[1].format(format)]
}

/**
 * 获取最近 N 天范围
 * @param {number} days 天数，如 7 表示含今天在内的最近 7 天
 * @param {string} [format] 输出格式，默认 'YYYY-MM-DD'
 * @returns {string[]} [开始日期, 结束日期]，如 ['2026-10-05', '2026-10-11']
 * @example getLastDaysRange(7)  // ['2026-10-05', '2026-10-11']
 */
export function getLastDaysRange(days, format) {
  const now = dayjs()
  return [
    now.subtract(days - 1, 'day').startOf('day').format(format || DATE_FORMATS.DATE),
    now.endOf('day').format(format || DATE_FORMATS.DATE)
  ]
}

// ========== 5. 日期计算 ==========

/**
 * 加减天数
 * @param {string|number|Date} date 原始日期，如 '2026-01-29'
 * @param {number} days 增加的天数，可为负数，如 3
 * @returns {dayjs.Dayjs} 计算后的 dayjs 对象（可用 .format() 转字符串）
 * @example addDays('2026-01-29', 3).format('YYYY-MM-DD')  // '2026-02-01'
 */
export function addDays(date, days) {
  return dayjs(date).add(days, 'day')
}

/**
 * 减去天数
 * @param {string|number|Date} date 原始日期，如 '2026-01-29'
 * @param {number} days 减去的天数，如 10
 * @returns {dayjs.Dayjs} 计算后的 dayjs 对象
 * @example subtractDays('2026-01-29', 10).format('YYYY-MM-DD')  // '2026-01-19'
 */
export function subtractDays(date, days) {
  return dayjs(date).subtract(days, 'day')
}

/**
 * 加减月份
 * @param {string|number|Date} date 原始日期，如 '2026-01-31'
 * @param {number} months 增加的月份数，可为负数，如 1
 * @returns {dayjs.Dayjs} 计算后的 dayjs 对象
 * @example addMonths('2026-01-31', 1).format('YYYY-MM-DD')  // '2026-02-28'（自动处理月末）
 */
export function addMonths(date, months) {
  return dayjs(date).add(months, 'month')
}

/**
 * 减去月份
 * @param {string|number|Date} date 原始日期，如 '2026-03-15'
 * @param {number} months 减去的月份数，如 2
 * @returns {dayjs.Dayjs} 计算后的 dayjs 对象
 * @example subtractMonths('2026-03-15', 2).format('YYYY-MM-DD')  // '2026-01-15'
 */
export function subtractMonths(date, months) {
  return dayjs(date).subtract(months, 'month')
}

/**
 * 获取月份天数
 * @param {string|number|Date} date 日期，如 '2026-02-01'
 * @returns {number} 当月天数，如闰年 2 月返回 29
 * @example getDaysInMonth('2024-02-01')  // 29
 */
export function getDaysInMonth(date) {
  return dayjs(date).daysInMonth()
}

/**
 * 获取某月第一天
 * @param {string|number|Date} date 日期，如 '2026-01-29'
 * @param {string} [format] 传入格式则返回字符串，不传则返回 dayjs 对象
 * @returns {dayjs.Dayjs|string} 如 '2026-01-01' 或 dayjs 对象
 * @example
 *   getFirstDayOfMonth('2026-01-29', 'YYYY-MM-DD')  // '2026-01-01'
 *   getFirstDayOfMonth('2026-01-29')                 // dayjs 对象
 */
export function getFirstDayOfMonth(date, format) {
  const d = dayjs(date).startOf('month')
  return format ? d.format(format) : d
}

/**
 * 获取某月最后一天
 * @param {string|number|Date} date 日期，如 '2026-02-10'
 * @param {string} [format] 传入格式则返回字符串，不传则返回 dayjs 对象
 * @returns {dayjs.Dayjs|string} 如 '2026-02-28' 或 dayjs 对象
 * @example getLastDayOfMonth('2026-02-10', 'YYYY-MM-DD')  // '2026-02-28'
 */
export function getLastDayOfMonth(date, format) {
  const d = dayjs(date).endOf('month')
  return format ? d.format(format) : d
}

// ========== 6. 日期比较与校验 ==========

/**
 * 判断是否为有效日期
 * @param {string|number|Date} date 待判断值，如 '2026-01-29' 或 'abc'
 * @returns {boolean} 有效返回 true，空值或非法返回 false
 * @example
 *   isValidDate('2026-01-29')  // true
 *   isValidDate('abc')         // false
 */
export function isValidDate(date) {
  if (!date) return false
  return dayjs(date).isValid()
}

/**
 * 判断是否在某个范围内
 * @param {string|number|Date} date 待判断日期，如 '2026-01-15'
 * @param {string|number|Date} start 范围开始，如 '2026-01-01'
 * @param {string|number|Date} end 范围结束，如 '2026-01-31'
 * @param {string} [unit='day'] 比较单位：day/hour/minute/month/year
 * @param {string} [inclusivity='[]'] 边界包含性：'[]' 含两端、'()' 不含、'[)' 含左不含右
 * @returns {boolean} 在范围内返回 true
 * @example isBetweenDates('2026-01-15', '2026-01-01', '2026-01-31')  // true
 */
export function isBetweenDates(date, start, end, unit = 'day', inclusivity = '[]') {
  return dayjs(date).isBetween(dayjs(start), dayjs(end), unit, inclusivity)
}

/**
 * 判断是否为今天
 * @param {string|number|Date} date 日期，如今天的时间戳
 * @returns {boolean} 是今天返回 true，空值返回 false
 * @example isToday(new Date())  // true
 */
export function isToday(date) {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否为昨天
 * @param {string|number|Date} date 日期
 * @returns {boolean} 是昨天返回 true，空值返回 false
 * @example isYesterday(dayjs().subtract(1, 'day'))  // true
 */
export function isYesterday(date) {
  if (!date) return false
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 判断是否为本周
 * @param {string|number|Date} date 日期
 * @returns {boolean} 是本周返回 true，空值返回 false
 * @example isThisWeek(new Date())  // true
 */
export function isThisWeek(date) {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * 判断两个日期是否相同
 * @param {string|number|Date} date1 日期1，如 '2026-01-29 10:00'
 * @param {string|number|Date} date2 日期2，如 '2026-01-29 18:00'
 * @param {string} [unit='day'] 比较单位；默认 'day' 只比较到天，传 'hour' 则需同时同分
 * @returns {boolean} 相同返回 true，任一为空返回 false
 * @example
 *   isSameDate('2026-01-29 10:00', '2026-01-29 18:00')           // true（同一天）
 *   isSameDate('2026-01-29 10:00', '2026-01-29 18:00', 'hour')   // false
 */
export function isSameDate(date1, date2, unit = 'day') {
  if (!date1 || !date2) return false
  return dayjs(date1).isSame(dayjs(date2), unit)
}

/**
 * 计算两个日期差值
 * @param {string|number|Date} date1 日期1（被减数），如 '2026-01-29'
 * @param {string|number|Date} date2 日期2（减数），如 '2026-01-01'
 * @param {string} [unit='day'] 差值单位：day/hour/minute/second/month/year
 * @returns {number} date1 - date2 的差值（带正负号）
 * @example diffDate('2026-01-29', '2026-01-01')  // 28
 */
export function diffDate(date1, date2, unit = 'day') {
  return dayjs(date1).diff(dayjs(date2), unit)
}

/**
 * 计算年龄（周岁）
 * @param {string|Date} birthday 生日，如 '2000-05-20'
 * @returns {number|null} 周岁年龄，如 25；空值或非法日期返回 null
 * @example calcAge('2000-05-20')  // 26（按当前日期计算）
 */
export function calcAge(birthday) {
  if (!birthday || !isValidDate(birthday)) return null
  return dayjs().diff(dayjs(birthday), 'year')
}

// ========== 7. 时区处理 ==========

/**
 * UTC 时间转本地时间
 * @param {string|number|Date} utcDate UTC 时间，如 '2026-01-29T02:14:13Z'
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 输出格式
 * @returns {string} 本地（北京）时间，如 '2026-01-29 10:14:13'；空值返回 '-'
 * @example utcToLocal('2026-01-29T02:14:13Z')  // '2026-01-29 10:14:13'
 */
export function utcToLocal(utcDate, format = DATE_FORMATS.DATETIME) {
  if (!utcDate) return '-'
  return dayjs.utc(utcDate).local().format(format)
}

/**
 * 本地时间转 UTC
 * @param {string|number|Date} date 本地时间，如 '2026-01-29 10:14:13'
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 输出格式
 * @returns {string} UTC 时间字符串；空值返回 '-'
 * @example localToUtc('2026-01-29 10:14:13')  // '2026-01-29 02:14:13'
 */
export function localToUtc(date, format = DATE_FORMATS.DATETIME) {
  if (!date) return '-'
  return dayjs(date).utc().format(format)
}

/**
 * 指定时区格式化
 * @param {string|number|Date} date 时间，如 '2026-01-29 10:14:13'
 * @param {string} tz IANA 时区名，如 'Asia/Tokyo'、'America/New_York'
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 输出格式
 * @returns {string} 指定时区下的时间；空值返回 '-'
 * @example formatInTimezone('2026-01-29 10:14:13', 'Asia/Tokyo')  // '2026-01-29 11:14:13'
 */
export function formatInTimezone(date, tz, format = DATE_FORMATS.DATETIME) {
  if (!date) return '-'
  return dayjs(date).tz(tz).format(format)
}

// ========== 8. 倒计时/剩余时间 ==========

/**
 * 获取倒计时描述（如 "还有 3 天 2 小时"）
 * @param {string|number|Date} targetDate 目标时间，如 Date.now() + 3 * 86400000
 * @returns {string} 已过期返回 '已过期'；否则返回 '还有 N 天 N 小时' / '还有 N 小时 N 分钟' / '还有 N 分钟'；空值返回 '-'
 * @example
 *   countdownText(Date.now() + 3 * 86400000)  // '还有 3 天 0 小时'
 *   countdownText(Date.now() - 1000)          // '已过期'
 */
export function countdownText(targetDate) {
  if (!targetDate) return '-'
  const target = dayjs(targetDate)
  const now = dayjs()
  if (target.isBefore(now)) return '已过期'

  const diffMs = target.diff(now)
  const dur = dayjs.duration(diffMs)

  const days = Math.floor(dur.asDays())
  const hours = dur.hours()
  const minutes = dur.minutes()

  if (days > 0) return `还有 ${days} 天 ${hours} 小时`
  if (hours > 0) return `还有 ${hours} 小时 ${minutes} 分钟`
  return `还有 ${minutes} 分钟`
}

// ========== 9. 季度/周 ==========

/**
 * 获取季度
 * @param {string|number|Date} date 日期，如 '2026-05-01'
 * @returns {number} 季度序号 1-4，5 月属于第 2 季度
 * @example getQuarter('2026-05-01')  // 2
 */
export function getQuarter(date) {
  return dayjs(date).quarter()
}

/**
 * 获取星期几（1-7，1=周一）
 * @param {string|number|Date} date 日期，如 '2026-01-29'（周四）
 * @returns {number} 1（周一）到 7（周日）
 * @example getDayOfWeek('2026-01-26')  // 1（周一）；周日返回 7
 */
export function getDayOfWeek(date) {
  return dayjs(date).day() || 7
}

/**
 * 获取周数（一年中的第几周）
 * @param {string|number|Date} date 日期
 * @returns {number} 周数（基于已加载的 weekOfYear 插件），如 5
 * @example getWeekOfYear('2026-02-01')  // 5
 */
export function getWeekOfYear(date) {
  return dayjs(date).week()
}

// ========== 10. 解析非标准日期字符串 ==========

/**
 * 按自定义格式解析日期字符串
 * @param {string} dateStr 日期字符串，如 '29/01/2026'
 * @param {string} format 该字符串遵循的格式，如 'DD/MM/YYYY'
 * @returns {dayjs.Dayjs|null} 解析成功返回 dayjs 对象，失败返回 null
 * @example
 *   parseDate('29/01/2026', 'DD/MM/YYYY')          // dayjs 对象
 *   parseDate('2026-13-99', 'YYYY-MM-DD')?.format('YYYY-MM-DD')  // null（非法）
 */
export function parseDate(dateStr, format) {
  const d = dayjs(dateStr, format)
  return d.isValid() ? d : null
}

// ========== 11. 表格 formatter 快捷函数 ==========

/**
 * el-table column formatter - 日期时间
 * 用法：<el-table-column :formatter="datetimeFormatter" prop="createAt" />
 * @param {Object} row 当前行
 * @param {Object} column 当前列
 * @param {string|number} cellValue 单元格值，如 1769652853654
 * @returns {string} 如 '2026-01-29 10:14:13'；空值返回 '-'
 */
export function datetimeFormatter(row, column, cellValue) {
  return formatDate(cellValue)
}

/**
 * el-table column formatter - 仅日期
 * 用法：<el-table-column :formatter="dateFormatter" prop="diaryDate" />
 * @param {Object} row 当前行
 * @param {Object} column 当前列
 * @param {string|number} cellValue 单元格值，如 '2026-01-29 10:14:13'
 * @returns {string} 如 '2026-01-29'；空值返回 '-'
 */
export function dateFormatter(row, column, cellValue) {
  return formatDateOnly(cellValue)
}

/**
 * el-table column formatter - 相对时间
 * 用法：<el-table-column :formatter="relativeTimeFormatter" prop="createdAt" />
 * @param {Object} row 当前行
 * @param {Object} column 当前列
 * @param {string|number} cellValue 单元格值，如 5 分钟前的时间戳
 * @returns {string} 如 '5 分钟前'；空值返回 '-'
 */
export function relativeTimeFormatter(row, column, cellValue) {
  return fromNow(cellValue)
}

// ========== 12. el-date-picker 快捷选项 ==========

/**
 * 返回 el-date-picker 的 shortcuts 配置
 * 用法：<el-date-picker :shortcuts="getDatePickerShortcuts()" />
 * @returns {Array<{text: string, value: Function}>} Element Plus 日期选择器快捷选项数组
 * @example
 *   const shortcuts = getDatePickerShortcuts()
 *   // [{ text: '今天', value: [Function] }, { text: '昨天', ... }, { text: '最近7天', ... }, ...]
 */
export function getDatePickerShortcuts() {
  return [
    {
      text: '今天',
      value: () => getTimeRange('today').map(d => d.toDate())
    },
    {
      text: '昨天',
      value: () => getTimeRange('yesterday').map(d => d.toDate())
    },
    {
      text: '最近7天',
      value: () => getTimeRange('last7days').map(d => d.toDate())
    },
    {
      text: '最近30天',
      value: () => getTimeRange('last30days').map(d => d.toDate())
    },
    {
      text: '本周',
      value: () => getTimeRange('thisWeek').map(d => d.toDate())
    },
    {
      text: '本月',
      value: () => getTimeRange('thisMonth').map(d => d.toDate())
    },
    {
      text: '上月',
      value: () => getTimeRange('lastMonth').map(d => d.toDate())
    }
  ]
}

// ========== 默认导出 ==========
export default dayjs
