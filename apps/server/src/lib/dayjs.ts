import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

// 设置默认时区
dayjs.tz.setDefault('Asia/Shanghai')

/**
 * 格式化时间为 ISO 字符串
 * @param date 时间对象或字符串
 * @returns ISO 格式时间字符串
 */
export const formatToISO = (date?: Date | string | number): string => {
  return dayjs(date).toISOString()
}

/**
 * 格式化时间为可读字符串
 * @param date 时间对象或字符串
 * @param format 格式模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export const formatDateTime = (
  date?: Date | string | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  return dayjs(date).format(format)
}

/**
 * 格式化时间为日期字符串
 * @param date 时间对象或字符串
 * @returns 日期字符串 YYYY-MM-DD
 */
export const formatDate = (date?: Date | string | number): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 获取相对时间
 * @param date 时间对象或字符串
 * @returns 相对时间字符串，如 '2小时前'
 */
export const getRelativeTime = (date?: Date | string | number): string => {
  return dayjs(date).fromNow()
}

/**
 * 计算时间差
 * @param date1 时间1
 * @param date2 时间2，默认为当前时间
 * @param unit 单位，默认为毫秒
 * @returns 时间差
 */
export const getTimeDiff = (
  date1: Date | string | number,
  date2: Date | string | number = new Date(),
  unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' = 'millisecond'
): number => {
  return dayjs(date1).diff(dayjs(date2), unit)
}

/**
 * 检查时间是否在指定范围内
 * @param date 要检查的时间
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @returns 是否在范围内
 */
export const isTimeInRange = (
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean => {
  const target = dayjs(date)
  return target.isAfter(dayjs(startDate)) && target.isBefore(dayjs(endDate))
}

/**
 * 获取时间的开始或结束
 * @param date 时间对象或字符串
 * @param type 类型：'start' 或 'end'
 * @param unit 单位：'day'、'week'、'month'、'year'
 * @returns 调整后的时间
 */
export const getTimeBoundary = (
  date: Date | string | number,
  type: 'start' | 'end',
  unit: 'day' | 'week' | 'month' | 'year' = 'day'
): Date => {
  const d = dayjs(date)
  return type === 'start' ? d.startOf(unit).toDate() : d.endOf(unit).toDate()
}

// 导出 dayjs 实例以便直接使用
export { dayjs }
