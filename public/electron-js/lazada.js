const { ipcRenderer } = require("electron");
const md5 = require('md5');

const { IPC_CHANNEL } = require("./constants/ipc_channels");

const { html } = require('./modal/access_denied');

var firstNoti = false;
let isLogin = false;
let first = false;

exports.lazada = () => {
  init();
};

const init = () => {
  ipcRenderer.on(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, (e, shop, type) => {
    if (!shop || !shop.allow_access) {
      if (!document.querySelector('#myModal')) {
        document.querySelector('#root').insertAdjacentHTML('beforebegin', html);
      }
    }
    setTimeout(() => {
      let msg = {
        is_logged: false,
        location: JSON.parse(JSON.stringify(window.location)),
      };
      if (window.location.pathname.indexOf('apps/seller/login') == -1 && window.location.pathname.indexOf('user/forgetPassword') == -1 && window.location.pathname.indexOf('apps/register') == -1) {
        msg['is_logged'] = true;
        isLogin = true;
      } else {
        msg['is_logged'] = false;
        isLogin = false;
      }
      if(msg['is_logged']){
        if(!first){
          first = true;
          if(document.querySelector('.im-page-header-icon')) document.querySelector('.im-page-header-icon').addEventListener("click", function(e){
            console.log(e);
            e.preventDefault();
            e.stopPropagation();
          })
        }
      }
      ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_CHECK_ONLINE, msg);
    }, 2000)
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, (e, shop) => {
    if(window.location.pathname.indexOf('apps/im/window') == -1) return;
    setTimeout(() => {
      if(isLogin){
        getUnread(shop);
        return
        if(window.location.pathname.indexOf('apps/im/window') == -1){
          let document_unread = document.querySelector('.im-icon .unread-count');
          ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
            total_unread: document_unread ? parseInt(document_unread.textContent) : 0
          })
        } else {
          // let document = document.querySelector('.session-view .session-item')

        }
      } else {
        ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
      }
    }, 500)
  })

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_INPUT_AUTO_FILL, (e, value = '', type, channel) => {
    if (channel === 'lazada' && value) {
      if (type === 'account') {
        setTimeout(() => {
          const inputAccount = document.querySelector("input[name='TPL_username']")
          handler(inputAccount, value);
        }, 1000);
      } else {
        setTimeout(() => {
          const inputAccount = document.querySelector("input[name='TPL_password']")
          handler(inputAccount, value);
        }, 1000);
      }
    }
  });

  ipcRenderer.on(IPC_CHANNEL.CHANNEL_AUTO_SIGN_IN_CLICK, (e, channel) => {
    if (channel === 'lazada') {
      setTimeout(() => {
        const buttonElement = document.querySelector("button[data-spm='d_loginbtn']");
        if (buttonElement) {
          buttonElement.click();
        }
      }, 1500);
    }
  });
  // document.querySelector('.im-icon .unread-count')
  // apps/im/window
};

const handler = (inputDOM, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeInputValueSetter.call(inputDOM, value);
  const inputEvent = new Event("input", { bubbles: true });
  inputDOM.dispatchEvent(inputEvent);
};

const getUnread = (shop) => {
  try {
    let conversations = document.querySelectorAll('.session-list .session-item');
    let unreads = document.querySelectorAll('.session-list .session-item .badge')
    if(!firstNoti){
      let md5_convertions = [];
      conversations.forEach((item) => {
        md5_convertions.push(md5(item.textContent))
      })

      firstNoti = true;
      ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, {
        conversation: {
          last_time: Date.now(),
          md5_convertions: md5_convertions
        },
        total_unread: unreads.length
      });
    } else {
      let new_conversations = [];
      for(let i = 0; i < conversations.length; i++){
        let item = conversations[i];
        if(item.querySelector('.badge')){
          let time = item.querySelector('.date').textContent;
          if(time.indexOf(":") > -1){
            let date_now = new Date();
            let time_arr = time.split(":");
            date_now.setHours(parseInt(time_arr[0]));
            date_now.setMinutes(parseInt(time_arr[1]));
            let conversation = {
              user_name: item.querySelector('.title-name').textContent,
              time: date_now.getTime(),
              snippet: item.querySelector('.desc').textContent,
              md5: md5(item.textContent)
            };
            if(date_now.getTime() > shop.conversation.last_time){
              if(shop.conversation.md5_convertions.indexOf(md5(item.textContent)) > -1) break;
              new_conversations.push(conversation);
            }
          }
        }
      }
      let msg = {
        total_unread: unreads.length,
        new_conversations: new_conversations
      }
      if(new_conversations.length > 0){
        let md5_convertions = shop.conversation.md5_convertions;
        for(let i = new_conversations.length - 1; i >= 0; i--){
          md5_convertions.unshift(new_conversations[i]['md5']);
        }
        msg['conversation'] = {
          last_time: new_conversations[0]['time'],
          md5_convertions: md5_convertions.length > 10 ? md5_convertions.splice(0, 10) : md5_convertions
        }
      }
      ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION, msg);
    }

  } catch(err){
    console.log(err);
    ipcRenderer.sendToHost(IPC_CHANNEL.CHANNEL_GET_NEW_CONVERSATION)
  }
}
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};