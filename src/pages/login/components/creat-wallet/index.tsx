import React, { PureComponent } from 'react'
import styles from './style.module.scss'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import { createAndDownloadFile } from '@/utils/tools'
import { Link } from 'react-router-dom'

interface IProps {
  stepIndex: number
  generateKeystore: (password: string) => void
  setDownload: () => void
  keystoreJson?: any
}

interface IState {
  password: string
  tipsShow: boolean
  downloadSuc: boolean // 下载是否成功
  passwordStrength: string // 密码强度
}
export default class CreatWallet extends PureComponent<IProps, IState> {
  state = {
    password: '',
    tipsShow: false,
    downloadSuc: false,
    passwordStrength: 'weak', // 小写字母、数字、大写字母、特殊符号包含一种为'weak'，两种为‘middle‘，三种及以上为‘good'
  }
  changePassword = (e: any) => {
    const { value } = e.target
    if (value.length > 8) {
      // 密码长度至少为9位
      // 密码强度验证
      let typeLen = 0
      // 是否包含小写字母
      if (/[a-z]/.test(value)) {
        typeLen++
      }
      // 是否包含大写字母
      if (/[A-Z]/.test(value)) {
        typeLen++
      }
      // 是否包含数字
      if (/\d/.test(value)) {
        typeLen++
      }
      // 是否包含特殊字符
      if (/\W/.test(value)) {
        typeLen++
      }
      this.setState({
        password: value,
        passwordStrength:
          typeLen === 1 || typeLen === 0 ? 'weak' : typeLen === 2 ? 'middle' : 'good',
      })
    } else {
      this.setState({
        password: value,
      })
    }
  }
  toogleTips = () => {
    const { tipsShow } = this.state
    this.setState({
      tipsShow: !tipsShow,
    })
  }
  downloadFile = () => {
    // 下载文件的demo，只需要传入keystore内容就行
    createAndDownloadFile('keystore', JSON.stringify(this.props.keystoreJson))
    // 下载成功回调函数
    this.setState({
      downloadSuc: true,
    })
    this.props.setDownload()
  }
  render() {
    const { password, tipsShow, downloadSuc, passwordStrength } = this.state
    const { stepIndex, generateKeystore } = this.props
    const tipsArr = [
      {
        iconName: 'iconfileprotectwenjianbaohu',
        title: 'Don’t Lose It',
        content: 'Be careful, it can not be recovered if you lose it',
      },
      {
        iconName: 'iconicons-hacker',
        title: 'Don’t Share It',
        content: 'Your funds will be stollen if you use this file on a malicious phishing site.',
      },
      {
        iconName: 'iconbeifen',
        title: 'Make a Backup',
        content: 'Secure it like the millions of dollars it may one day be worth.',
      },
    ]
    return (
      <div className={styles.creatWallet}>
        {downloadSuc ? (
          <div className={styles.sucBox}>
            <svg className={styles.rightIc} aria-hidden="true">
              <use xlinkHref="#iconchenggong1" />
            </svg>
            <p className={styles.sucTxt}>You have created a wallet successfully!</p>
            <Link to="/wallet">
              <Button
                variant="contained"
                className={styles.loginButton}
                style={{ width: '181px', height: '40px' }}
              >
                Access My Wallet
              </Button>
            </Link>
          </div>
        ) : !stepIndex ? (
          <div className={styles.container1}>
            <div className={styles.passWordLine}>
              <TextField
                id="input-adornment-password"
                className={styles.txt}
                variant="standard"
                type="password"
                label="Your Password"
                value={password}
                onChange={this.changePassword}
                placeholder="Please Enter At Least 9 Characters"
              />
              <svg className={styles.qsIc} aria-hidden="true" onClick={this.toogleTips}>
                <use xlinkHref="#iconjieshi" />
              </svg>
              {tipsShow && (
                <SnackbarContent
                  className={styles.snackBar}
                  message={
                    'This password encrypts your private key. \
                    This does not act as a seed to generate your keys.'
                  }
                />
              )}
            </div>
            {password.length > 8 && (
              <p className={styles.passStrength}>
                Password Strength:{' '}
                <span style={{ color: passwordStrength === 'weak' ? '#C31212' : '#10D182' }}>
                  {passwordStrength}
                </span>
              </p>
            )}
            <Button
              variant="contained"
              disabled={password.length < 9}
              className={styles.loginButton}
              style={{ backgroundColor: password.length < 9 ? 'rgba(0,0,0,0.38)' : '#1E3DE4' }}
              onClick={() => generateKeystore(password)}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className={styles.container2}>
            <div className={styles.conBox}>
              {tipsArr.map((item, index) => (
                <div className={styles.conItem} key={`tips${index}`}>
                  <div className={styles.imgBox}>
                    <svg className={styles.conIc} aria-hidden="true">
                      <use xlinkHref={`#${item.iconName}`} />
                    </svg>
                  </div>
                  <div className={styles.txtBox}>
                    <p className={styles.txt1}>{item.title}</p>
                    <p className={styles.txt2}>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="contained"
              className={styles.loginButton}
              style={{ width: '227px' }}
              onClick={this.downloadFile}
            >
              Download Keystore File
            </Button>
          </div>
        )}
      </div>
    )
  }
}
