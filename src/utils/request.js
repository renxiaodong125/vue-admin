import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Logger } from '@/utils/logger'

// create an axios instance
// todo 暂时修改为3分钟，部分导出数据会比较耗时
const _createAxiosInstance = ({ timeout = 180000 } = {}) => {
  return axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: timeout
  })
}

const _loginInterceptor = config => {
  if (store.getters.token) {
    config.headers['token'] = getToken()
  }
  return config
}
const _loginErrInterceptor = error => {
  Logger.log(error)
  Promise.reject(error)
}

const downloadService = _createAxiosInstance()
downloadService.defaults.timeout = 0
downloadService.interceptors.request.use(
  _loginInterceptor,
  _loginErrInterceptor
)
downloadService.interceptors.response.use(
  response => {
    _hideLoading()
    const res = response.data

          console.log('response' + response.status) // for debug
    if (
      response &&
      (response.status === 401 || response.status === 50012 || response.status === 50014)
    ) {
      return _reLogin()
    }
    return response
  },
  error => {
    _hideLoading()
    if (error && error.response && error.response.status === 401) {
      return _reLogin()
    }

    var errorMsg='服务器异常'
    if(error.toString().startsWith('Error: timeout of')
      || error.toString().startsWith('Error: Request failed with status code 504')){
      errorMsg='请求超时'
    }
    Message({
      message: errorMsg,
      type: 'error', showClose: true,
      duration: 5 * 1000
    })
    Logger.log('err' + error)
    return Promise.reject(error)
  }
)
// export download request service
export { downloadService }

const _reLogin = () => {
  return new Promise((resolve, reject) => {
    MessageBox.confirm(
      '你已被登出，可以取消继续留在该页面，或者重新登录',
      '确定登出',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('FedLogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
        reject()
      })
    })
  })
}
// 关闭全局的加载动画
const _hideLoading = () => {
  setTimeout(() => {
    var masks = document.getElementsByClassName('el-loading-mask')
    for (var i = 0; i < masks.length; i++) {
      masks[i].style.display = 'none'
    }
  }, 2000)
}
const service = _createAxiosInstance()
service.interceptors.request.use(_loginInterceptor, _loginErrInterceptor)
service.interceptors.response.use(
  // response => response,
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 xmlhttprequest 来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  response => {
    _hideLoading()
    return handleResponse(response.data)
  },
  error => {
    _hideLoading()
    if (error && error.response && error.response.status === 401) {
      return _reLogin()
    }

    var errorMsg='服务器异常'
    if(error.toString().startsWith('Error: timeout of')
    || error.toString().startsWith('Error: Request failed with status code 504')){
      errorMsg='请求超时'
    }
    Message({
      message: errorMsg,
      type: 'error', showClose: true,
      duration: 5 * 1000
    })
    Logger.log('err' + error)
    return Promise.reject(error)
  }
)

export function handleResponse(res) {
  if (res.status === 200) {
    return res
  }
  //50020:初始登录或密码过期，需修改密码
  if (res.status === 50020 || res.status === 50030 ) {
    return res
  }
  // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  if (res.status === 401 || res.status === 50012 || res.status === 50014) {
    return _reLogin()
  }

  //50010 ：数据库异常
  //5001010:乐观锁
  if (res.status === 5001010) {
    res.error='当前数据已被其他用户更新，请重新刷新后再进行操作。'
  }
  //  todo 暂时处理，返回错误信息含重新登录
  if(res.error && res.error.indexOf('重新登录') !== -1){
    return _reLogin()
  }

  const errMsg = res.error || res.message || '服务器异常'

  Message({
    message: errMsg,
    type: 'error', showClose: true,
    duration: 3 * 1000
  })
  Logger.log('request error', res)
  return Promise.reject(errMsg)
}
/**
 * 下载文件
 * @param {*} res
 * @param {*} fileName
 */
export function downloadFile(res, fileName) {
  // IE兼容处理
  if('msSaveOrOpenBlob' in navigator){
    window.navigator.msSaveOrOpenBlob(new Blob([res.data]), fileName);
  }else {
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
  }
}

// pdf文件预览窗口
var pdfWindow;
/**
 * pdf文件预览
 * @param {*} res
 */
export function previewPDF(res) {
  if('msSaveOrOpenBlob' in navigator){
    window.navigator.msSaveOrOpenBlob(new Blob([res.data]), '预览.pdf');
  }else{
    if(pdfWindow){
      pdfWindow.close()
    }
    pdfWindow = window.open('', 'pdf预览', '')
    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: 'application/pdf' })
    )
    var pdfHtml = `<iframe src="` + url + `" height="100%" width="100%"></iframe>`
    pdfWindow.document.write(pdfHtml)
  }

}

export default service

/**
 * 报表request
 */
const _reportInterceptor = config => {
  if (store.getters.token) {
    config.headers['token'] = getToken()
  }
  config.headers['datasource-type'] = 'slave'
  return config
}
const reportService = _createAxiosInstance()
reportService.interceptors.request.use(
  _reportInterceptor,
  _loginErrInterceptor
)
reportService.interceptors.response.use(
  response => {
    _hideLoading()
    return handleResponse(response.data)
  },
  error => {
    _hideLoading()
    if (error && error.response && error.response.status === 401) {
      return _reLogin()
    }

    var errorMsg='服务器异常'
    if(error.toString().startsWith('Error: timeout of')
      || error.toString().startsWith('Error: Request failed with status code 504')){
      errorMsg='请求超时'
    }
    Message({
      message: errorMsg,
      type: 'error', showClose: true,
      duration: 5 * 1000
    })
    Logger.log('err' + error)
    return Promise.reject(error)
  }
)
export { reportService }
