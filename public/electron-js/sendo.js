const electron = require("electron");

const { ipcRenderer } = electron;
const session = electron.remote.session;

const { IPC_CHANNEL } = require("./constants/ipc_channels");

const { html } = require('./modal/access_denied');

var firstClick = false;
let isLogin = false;

exports.sendo = () => {
  init();
};

const init = () => {
  // token_seller_api
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, (e, msg) => {
    if (!msg || !msg.allow_access) {
      if (!document.querySelector('#myModal')) {
        document.querySelector('#root').insertAdjacentHTML('beforebegin', html);
      }
    }
    setTimeout(() => {
      session.fromPartition(msg.option_webview.partition).cookies.get({ url: window.location.origin, name: "token_seller_api"})
      .then((cookies) => {
        let msg = {
          is_logged: false,
          location: JSON.parse(JSON.stringify(window.location)),
        };
        if(cookies.length > 0){
          msg['is_logged'] = true;
          isLogin = true;
        } else {
          isLogin = false;
        }
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
      }).catch((error) => {
        console.log(error)
      })
    }, 2000)
  })
  setTimeout(() => {
    let showPassBtn = document.querySelector('.d7e-7bcd6e');
    if (showPassBtn) {
      showPassBtn.hidden = true;
    }
  }, 1000);
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, () => {
    setTimeout(() => {
      if(isLogin){
        let selector = document.querySelector('.ChatButton_notifyMessage_2dZsP.seller');
          ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
            total_unread: selector ? parseInt(selector.textContent) : 0
          })
      } else {
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
      }
    }, 500)
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_INPUT_AUTO_FILL, (e, value = '', type, channel) => {
    if (channel === 'sendo' && value) {
      if (type === 'account') {
        setTimeout(() => {
          const inputAccount = document.querySelector("input[name='username']");
          handler(inputAccount, value);
        }, 1000);
      } else {
        setTimeout(() => {
          const inputAccount = document.querySelector("input[name='password']");
          handler(inputAccount, value);
        }, 1000);
      }
    }
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_AUTO_SIGN_IN_CLICK, (e, channel) => {
    if (channel === 'sendo') {
      setTimeout(() => {
        const buttonElement = document.querySelector('.d7e-dc4b7b');
        if (buttonElement) {
          buttonElement.click();
        }
      }, 1500);
    }
  });
};

const handler = (inputDOM, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeInputValueSetter.call(inputDOM, value);
  const inputEvent = new Event("input", { bubbles: true });
  inputDOM.dispatchEvent(inputEvent);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};