import withWidth, { isWidthUp } from '@material-ui/core/withWidth'
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints'
import React, { Component } from 'react'
import styles from './style.module.scss'
import { namespace } from '@/models/cfx'
import { namespace as namespaceOfCommon } from '@/models/global/common'
import { namespace as namespaceOfLogin } from '@/models/login/index'
import { connect } from 'react-redux'
import TopHeader from './top-header'
import SiderMenus from './sider-menus'
import { RouteComponentProps, withRouter } from 'react-router'
import { IDispatch } from '@/typings'
interface IDvaPropsOfCommon {
  lockStatus: boolean
  simpleLayout?: boolean
}
interface IDvaPropsOfCfx {
  /** 钱包地址 */
  currentAccountAddress: string
}
type IProps = RouteComponentProps &
  Partial<IDvaPropsOfCommon> &
  Partial<IDvaPropsOfCfx> &
  IDispatch & {
    lockError?: boolean
    unlockError?: boolean
    isShowLeftMenu?: boolean
    width?: Breakpoint
  }
interface IState {
  // 侧边导航标志
  mobileOpen?: boolean
}
/**
 * Layout组件
 */
class BasicLayout extends Component<IProps, IState> {
  state: IState = {
    mobileOpen: false,
  }
  onToggleMenus() {
    this.setState({
      mobileOpen: !this.state.mobileOpen,
    })
  }
  closeAction() {
    this.props.dispatch({
      type: `${namespaceOfCommon}/close`,
    })
  }
  lockAction(val) {
    const { callback, password } = val
    if (this.props.lockStatus) {
      this.props.dispatch({
        type: `${namespaceOfLogin}/unLock`,
        payload: { callback, password },
      })
    } else {
      this.props.dispatch({
        type: `${namespaceOfLogin}/lock`,
        payload: { callback, password },
      })
    }
  }
  render() {
    const { mobileOpen } = this.state
    const { lockStatus, isShowLeftMenu, simpleLayout, lockError, unlockError } = this.props
    const currentLockError = lockStatus ? unlockError : lockError
    return (
      <div className={styles.root}>
        <TopHeader
          simpleLayout={simpleLayout}
          isLogin={isShowLeftMenu}
          lockStatus={lockStatus}
          lockError={currentLockError}
          lockAction={val => {
            this.lockAction(val)
          }}
          onToggleMenus={() => {
            this.onToggleMenus()
          }}
        />
        <SiderMenus
          currentAccountAddress={this.props.currentAccountAddress}
          mobileOpen={mobileOpen}
          isLogin={isShowLeftMenu}
          lockStatus={lockStatus}
          closeAction={() => {
            this.closeAction()
          }}
          onToggleMenus={() => {
            this.onToggleMenus()
          }}
        />
        <main className={isWidthUp('sm', this.props.width) ? styles.content : styles.contentM}>
          {this.props.children}
        </main>
      </div>
    )
  }
}

const mapStateToProps = models => {
  return {
    ...models[namespace],
    ...models[namespaceOfCommon],
    ...models[namespaceOfLogin],
  }
}
export default withRouter(connect(mapStateToProps)(withWidth()(BasicLayout)))
