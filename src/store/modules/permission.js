import { asyncRoutes, constantRoutes } from '@/router'
import { queryAllMenus } from '@/api/sys/sysMenu'
import { generateMenuTree } from '@/utils/menuUtils'


/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
        const platForm = 10
        // api查询后台 返回json菜单接口数据 
        queryAllMenus(platForm).then(res=>{

          const menuRouters = generateMenuTree(res.menuList)

          const asyncRoutes = [
            { path: '*', redirect: '/404', hidden: true }
          ].concat(menuRouters.length >0 ? menuRouters : [])

          if (roles.includes('admin')) {
            accessedRoutes = asyncRoutes.length >0 ? asyncRoutes : []
          } else {
            accessedRoutes = filterAsyncRoutes(menuRouters, roles)
          }
          accessedRoutes=accessedRoutes.filter(tmp=>tmp.children && tmp.children.length>0)

          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
