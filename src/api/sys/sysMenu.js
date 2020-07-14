import request from '@/utils/request'
import qs from 'qs'
import { queryParamEncoder } from '@/utils'
/**
 *
 * @相关表：SysMenu  系统菜单相关
 * @模块:sys
 * @作者：renxd
 * @创建日期: 2020/05/28 20:24:46
 *
 **/

// 获取所有目录菜单（不包括按钮）
export function queryAllMenus(platform = 'l0') {
  return request({
    url: '/admin/sys/sysMenu/queryAllMenus',
    method: 'get',
    params: { platform }
  })
}
