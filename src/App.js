import React, {Component} from 'react';
import './App.css';
import 'antd/dist/antd.css';
import './layout.css';

import {
    SideBarComponent,
    WebViewComponent,
    EmptySelectedChannel,
    SplashScreenComponent,
    FormAliasSapoComponent,
    GuideComponent
} from './component';
import {notification} from 'antd';
import {
    IconShopee,
    IconTiki,
    IconSendo,
    IconLazada,
    LogoSapo2,
    IconClose,
    IconArrowRight1,
    IconShopeeRound,
    IconSendoRound,
    IconLazadaRound,
    IconTikiRound
} from './icons';
import channelUrl from './constants/domains';
import moment from 'moment';

require('moment/locale/vi');

export default class AppComponent extends Component {
    constructor(props) {
        super(props);
        this.shops_default = [];
        try {
            this.shops_default = [
                {
                    "name": 'Shop tiki 1',
                    "type": "tiki",
                    "cookies": "",
                    "id": 1,
                    "time_created": 1604131176460
                },
                {
                    "name": 'Shop tiki 2',
                    "type": "tiki",
                    "cookies": "",
                    "id": 2,
                    "time_created": 1604131176460
                },
                {
                    "name": 'shopee 1',
                    "type": "shopee",
                    "cookies": "",
                    "id": 3,
                    "time_created": 1604131175475
                },
                {
                    "name": 'shopee 2',
                    "type": "shopee",
                    "cookies": "",
                    "id": 4,
                    "time_created": 1604131175146
                },
                {
                    "name": 'sendo 1',
                    "type": "sendo",
                    "cookies": "",
                    "id": 5,
                    "time_created": 1604131174939
                },
                {
                    "name": 'sendo 2',
                    "type": "sendo",
                    "cookies": "",
                    "id": 6,
                    "time_created": 1604131174731
                },
                {
                    "name": 'lazada 1',
                    "type": "lazada",
                    "cookies": "",
                    "id": 7,
                    "time_created": 1604131174203
                },
                {
                    "name": 'lazada 2',
                    "type": "lazada",
                    "cookies": "",
                    "id": 8,
                    "time_created": 1604131174203
                }
            ];
            this.shops_default.map((item) => {
                item.option_webview = this.getOptionChannel(item);
                return item;
            })
        } catch (err) {

        }
        let alias_admin = localStorage.getItem("alias_admin");
        this.state = {
            userMain: null,
            listShop: [],
            listShopWebview: [],
            shopActive: null,
            webViewActive: null,
            viewChannelsId: this.getViewChannelsId(),
            open_admin: false,
            loginAdmin: false,
            notifyInApp: true,
            nextApp: !localStorage.getItem("next_app"),
            linkAdmin: alias_admin ? `https://${alias_admin}.mysapo.vn` : null,
            settingLinkAdmin: !!localStorage.getItem("next_app"),
            countNotifyChannel: 0,
            alias_admin: alias_admin,
            visiblePopupFilter: false,
            guideScreen: false,
            showFormAdmin: false,
        };
        this.time_set_baget = null;
    }

    componentDidMount = async () => {
        if (window.ipcRenderer) {
            window.ipcRenderer.on('ping', (event, arg) => {
                this.setState({ipc: true});
                window.ipcRenderer.send('ping', 'ok')
            });
            window.ipcRenderer.on('noti-in-app', (event, arg) => {
                this.setState({
                    notifyInApp: arg
                })
            });
            window.ipcRenderer.send('app_version');
            window.ipcRenderer.on('app_version', (event, arg) => {
                window.ipcRenderer.removeAllListeners('app_version');
                console.log('Version ' + arg.version);
            });
            window.ipcRenderer.on('update_available', () => {
                window.ipcRenderer.removeAllListeners('update_available');
                console.log('A new update is available. Downloading now...');
            });
            window.ipcRenderer.on('update_downloaded', () => {
                window.ipcRenderer.removeAllListeners('update_downloaded');
                console.log('Update Downloaded. It will be installed on restart. Restart now?');
            });
        }
    };

    updateShop = (id, data) => {
        // if(id == 1) console.log(id, data);
        let shopIndex = this.state.listShop.findIndex((item) => item.id === id);
        if (shopIndex > -1) {
            for (let key in data) {
                this.state.listShop[shopIndex][key] = data[key];
            }
            this.setState({reload: !this.state.reload});
        }
    };

    activeWebView = (option) => {
        let {key, url} = option;
        // if (!key) return;
        // console.log(key);
        this.setState({
            webViewActive: key
        });
        if (url) {
            let webview = document.querySelector(`.${key}`);
            if (webview) {
                let src_now = new URL(webview.src);
                let src_new = new URL(url);
                if (src_now.pathname !== src_new.pathname) {
                    webview.src = url;
                }
            }
        }
    };

    notification = (option) => {
        let {message, description, placement, type, duration, key} = option;
        placement = placement ? placement : 'topRight';
        type = type ? type : 'info';
        let msg = {
            message: message,
            description: description,
            placement: placement,
            rtl: false,
            duration: duration ? duration : 5
        };

        if (key) msg['key'] = key;
        notification[type](msg);
    };

    getViewChannelsId = () => {
        try {
            return localStorage.getItem("view_channels") ? JSON.parse(localStorage.getItem("view_channels")) : [];
        } catch (err) {
            return [];
        }
    };

    getLogoChannels = (type) => {
        let result = {
            default: LogoSapo2
        };
        switch (type) {
            case 'shopee':
                result['default'] = IconShopee;
                result['round'] = IconShopeeRound;
                break;
            case 'lazada':
                result['default'] = IconLazada;
                result['round'] = IconLazadaRound;
                break;
            case 'sendo':
                result['default'] = IconSendo;
                result['round'] = IconSendoRound;
                break;
            case 'tiki':
                result['default'] = IconTiki;
                result['round'] = IconTikiRound;
                break;
            default:
                break
        }
        return result;
    };

    saveViewChannel = (ids = []) => {
        localStorage.setItem("view_channels", JSON.stringify(ids));
        this.setState({
            viewChannelsId: ids
        })
    };

    getOptionChannel = (option) => {
        let {type, id} = option;
        let result = {
            key_seller: `seller_${type}_${id}`,
            partition: `persist:${id}`,
            icon_channel: this.getLogoChannels(type)
        };
        switch (type) {
            case 'shopee':
                result['key_webchat'] = `webchat_${type}_${id}`;
                result['url_chat'] = `${channelUrl['shopee']['vn']}/webchat/conversations`;
                result['url_seller'] = `${channelUrl['shopee']['vn']}`;
                break;
            case 'lazada':
                result['key_webchat'] = `webchat_${type}_${id}`;
                result['url_chat'] = `${channelUrl['lazada']['vn']}/apps/im/window`;
                result['url_seller'] = `${channelUrl['lazada']['vn']}`;
                break;
            case 'sendo':
                // result['url_chat'] = `${channelUrl['sendo']['vn']}`;
                result['url_seller'] = `${channelUrl['sendo']['vn']}`;
                break;
            case 'tiki':
                // result['url_chat'] = `${channelUrl['tiki']['vn']}`;
                result['url_seller'] = `${channelUrl['tiki']['vn']}`;
                break;
            default:
                break;
        }

        return result;
    };

    getListShop = async () => {
        try {
            this.setState({reloadShop: true});
            let cookies = this.state.userMain.cookies;
            let admin_session = cookies.find((item) => item.name === "_admin_session_id");
            if (!admin_session) throw ('not session');
            // var url = `https://market-place.sapoapps.vn/home/connections?alias=${this.state.alias_admin}`;
            const url = `https://market-place-staging.sapoapps.vn/home/connections?alias=${this.state.alias_admin}`;
            // var url = `http://localhost:8868/home/connections?alias=${this.state.alias_admin}`;
            const formData = new FormData();
            formData.append("Cookie", `_admin_session_id=${admin_session.value}`)
            const option = {
                method: "POST",
                headers: {},
                body: formData,
                credentials: "include"
            };
            const fetchResult = await fetch(url, option);
            let data = await fetchResult.json();
            if (data.connections) {
                let view_channel_ids = this.getViewChannelsId();
                data = data.connections.map((item) => {
                    item.type = item.type.toLowerCase();
                    item.option_webview = this.getOptionChannel(item);
                    return item;
                });
                let new_view_channel_ids = [];
                view_channel_ids.forEach((item) => {
                    if (data.find((channel) => channel.id === parseInt(item))) {
                        new_view_channel_ids.push(item);
                    }
                });
                localStorage.setItem("view_channels", JSON.stringify(new_view_channel_ids));
                setTimeout(() => {
                    this.setState({
                        reloadShop: false,
                        listShop: data,
                        viewChannelsId: new_view_channel_ids
                    });
                    this.notification({
                        message: "Làm mới gian hàng",
                        description: "Làm mới gian hàng thành công!",
                        type: 'success'
                    });
                    if (data.length === 0) {
                        this.activeWebView({
                            key: 'admin_sapo',
                            url: this.state.linkAdmin + '/admin/apps/market-place/home/dashboard'
                        })
                    } else {
                        if (this.time_set_baget) clearInterval(this.time_set_baget);
                        this.time_set_baget = setInterval(() => {
                            if (this.state.userMain) {
                                this.setBaget();
                            } else {
                                clearInterval(this.time_set_baget)
                            }
                        }, 1000)
                    }
                }, 500)
            }
        } catch (err) {
            this.setState({reloadShop: false});
            console.log(err);
            this.notification({
                message: "Làm mới gian hàng",
                description: "Đã có lỗi xảy ra..",
                type: 'warning'
            });
            this.activeWebView({
                key: 'admin_sapo'
            })
        }
    };

    notificationChannel = (options = {}) => {
        try {
            let {group, icon, subtitle, title, content, duration, time, event} = options;
            group = group ? group : Date.now();
            duration = duration ? duration * 1000 : 3000;

            let notify_group = document.querySelector(`.notification-group[data-group="${group}"]`);
            let item = document.createElement("div");
            item.setAttribute("class", "notification-item");
            item.insertAdjacentHTML("beforeend", `
        <div class="notification-header">
            <div class="icon">
                <img src=${icon} />
            </div>
            <div class="title">${title}</div>
            <div class="time">${moment(time).fromNow()}</div>
        </div>
      `)
            item.insertAdjacentHTML("beforeend", `
      <div class="notification-content">
          <h3>${subtitle}</h3>
          <div>
          ${content}
          </div>
      </div>
      `)
            item.insertAdjacentHTML("beforeend", `
      <div class="notification-bottom">
        <img src=${IconArrowRight1} />
      </div>
      `);

            if (notify_group) {
                let list_items = notify_group.querySelectorAll(".notification-item");
                let top = 0;
                let width = notify_group.clientWidth;
                item.style.zIndex = list_items.length + 1;
                list_items.forEach((notify, i) => {
                    if (i > 3) return;
                    top += 7;
                    width -= 14;
                    notify.style.top = `${top}px`;
                    notify.style.width = `${width}px`;
                    notify.style.zIndex = list_items.length - i;
                });
                notify_group.prepend(item);
            } else {
                notify_group = document.createElement("div");
                notify_group.setAttribute("class", "notification-group");
                notify_group.setAttribute("data-group", group);
                notify_group.append(item);
                document.querySelector(".notification-content").append(notify_group)
            }
            document.querySelector('.notification-close').style.display = "block";

            if (event) item.addEventListener("click", () => {
                event();
                item.parentElement.remove();
                if (document.querySelectorAll(".notification .notification-item").length === 0) {
                    document.querySelector('.notification .notification-close').style.display = "none";
                }
            });

            let document_groups = document.querySelectorAll(`.notification-group`);
            if (document_groups.length > 3) {
                for (let i = 0; i < document_groups.length - 3; i++) {
                    try {
                        document_groups[i].remove();
                    } catch (err) {
                    }
                }
            }

            setTimeout(() => {
                try {
                    if (item.parentElement.querySelectorAll(".notification-item").length === 1) {
                        item.parentElement.remove();
                    } else {
                        item.remove();
                    }
                    if (document.querySelectorAll(".notification .notification-item").length === 0) {
                        document.querySelector('.notification .notification-close').style.display = "none";
                    }
                } catch (err) {

                }
            }, duration)

        } catch (err) {
            console.log(err);
        }
    };

    setBaget = () => {
        let badge = 0;
        let listShop = this.state.listShop;
        if (listShop) {
            listShop.forEach((item) => {
                badge += item.total_unread ? item.total_unread : 0
            });
            // badge = badge >= 10 ? `9+` : badge > 0 ? `${badge.toString()}` : '';
            window.ipcRenderer.send('set-badge', {
                badge: badge
            })
        }
    };

    componentWillUnmount = () => {
        if (this.time_set_baget) clearInterval(this.time_set_baget)
    };

    render = () => {
        if (!this.state.userMain) {
            return <div id="app" className="bg-login">
                {
                    this.state.nextApp ?
                        <SplashScreenComponent nextApp={() => {
                            this.setState({nextApp: false, guideScreen: true});
                            localStorage.setItem("next_app", 1);
                        }} notification={this.notification}/>
                        : null
                }
                {
                    this.state.guideScreen ? <GuideComponent nextApp={() => {
                        this.setState({guideScreen: false, settingLinkAdmin: true, errorAlias: null});
                        localStorage.setItem("next_app", 2);
                    }} notification={this.notification}/> : null
                }
                {
                    this.state.settingLinkAdmin ?
                        <FormAliasSapoComponent
                            notification={this.notification} loginAdmin={(e) => {
                            // console.log(e);
                            this.setState({
                                loadingWebViewAdmin: true,
                                linkAdmin: e.domain,
                                alias_admin: e.alias,
                                showFormAdmin: true
                            })
                        }}
                            errorAlias={this.state.errorAlias}
                            changeErrorAlias={(message) => this.setState({errorAlias: message})}
                            loadingWebViewAdmin={this.state.loadingWebViewAdmin}
                            handleLoadingButton={(e) => this.setState({loadingWebViewAdmin: e})}
                        /> : null
                }
                {
                    this.state.showFormAdmin ?
                        <WebViewComponent
                            src={this.state.linkAdmin}
                            visible={!this.state.loadingWebViewAdmin} id={'admin_sapo'}
                            type='admin' partition={`persist:admin_sapo`}
                            loginStatus={(msg) => {
                                if (msg.is_logged) {
                                    setTimeout(() => {
                                        this.setState({
                                            linkAdmin: msg.location.origin,
                                            userMain: msg,
                                            showFormAdmin: false,
                                            errorAlias: null
                                        });
                                        this.getListShop();
                                    }, 300)
                                } else {
                                    this.setState({userMain: null})
                                }
                            }}
                            notification={this.notification}
                            errorAliasAdmin={(e) => {
                                this.setState({
                                    showFormAdmin: false,
                                    settingLinkAdmin: true,
                                    errorAlias: e.message
                                })
                            }}
                            viewAliasAdmin={() => {
                                this.setState({
                                    showFormAdmin: false,
                                    settingLinkAdmin: true
                                })
                            }}
                            handleLoadingButton={(e) => this.setState({loadingWebViewAdmin: e})}
                            typeAdmin="login"
                        /> : null
                }
            </div>
        }

        const {listShop} = this.state;
        return (
            <div id="app">
                {/* <NotificationComponent /> */}
                <div className="ant-notification ant-notification-bottomRight notification">
                    <div className="notification-content">
                    </div>
                    <div style={{display: "none"}} className="notification-close" onClick={() => {
                        document.querySelector('.notification .notification-close').style.display = "none";
                        document.querySelector('.notification .notification-content').innerHTML = "";
                    }}
                    >
                        <img src={IconClose}  alt="img" />
                    </div>
                </div>
                <SideBarComponent
                    listShop={listShop}
                    activeWebView={this.activeWebView}
                    webViewActive={this.state.webViewActive}
                    notification={this.notification} viewChannelsId={this.state.viewChannelsId}
                    getLogoChannels={this.getLogoChannels} saveViewChannel={this.saveViewChannel}
                    getOptionChannel={this.getOptionChannel} userMain={this.state.userMain}
                    linkAdmin={this.state.linkAdmin}
                    getListShop={this.getListShop} reloadShop={this.state.reloadShop}
                    getViewChannelsId={this.getViewChannelsId}
                    updateShop={this.updateShop} visiblePopupFilter={this.state.visiblePopupFilter}
                    setVisibleFilter={(visible) => this.setState({visiblePopupFilter: visible})}
                    GuideScreen={() => this.setState({
                        // guideScreenAdmin: true,
                        webViewActive: null
                    })}
                />
                <div id="webview">
                    {
                        this.state.guideScreenAdmin ? <GuideComponent/> : !this.state.webViewActive ?
                            <EmptySelectedChannel/> : null
                    }
                    {
                        this.state.listShop.map((item) => {
                            if (this.state.viewChannelsId.length > 0 && this.state.viewChannelsId.indexOf(item.id.toString()) === -1) return null;
                            let webviews = [
                                <WebViewComponent key={item.option_webview.key_seller} shop={item}
                                                  src={item.option_webview.url_seller}
                                                  partition={item.option_webview.partition} updateShop={this.updateShop}
                                                  visible={this.state.webViewActive === item.option_webview.key_seller}
                                                  id={item.option_webview.key_seller} activeWebView={this.activeWebView}
                                                  type="channel"
                                                  notifyInApp={this.state.notifyInApp} typeChannel="seller"
                                                  notificationChannel={this.notificationChannel}
                                                  notification={this.notification}
                                                  visiblePopupFilter={this.state.visiblePopupFilter}
                                                  setVisibleFilter={(visible) => this.setState({visiblePopupFilter: visible})}
                                                  setBaget={this.setBaget}
                                                  alias_admin={this.state.alias_admin}
                                />
                            ];
                            if (item.is_logged && item.option_webview.key_webchat) {
                                webviews.push(<WebViewComponent key={item.option_webview.key_webchat}
                                                                id={item.option_webview.key_webchat} shop={item}
                                                                src={item.option_webview.url_chat}
                                                                partition={item.option_webview.partition}
                                                                visible={this.state.webViewActive === item.option_webview.key_webchat}
                                                                updateShop={this.updateShop}
                                                                activeWebView={this.activeWebView} type="channel"
                                                                notifyInApp={this.state.notifyInApp} typeChannel="chat"
                                                                notificationChannel={this.notificationChannel}
                                                                notification={this.notification}
                                                                visiblePopupFilter={this.state.visiblePopupFilter}
                                                                setVisibleFilter={(visible) => this.setState({visiblePopupFilter: visible})}
                                                                setBaget={this.setBaget}
                                />)
                            }
                            if (item.tab_blanks) {
                                item.tab_blanks.forEach((tab) => {
                                    webviews.push(<WebViewComponent key={tab.key} src={tab.url}
                                                                    partition={item.option_webview.partition}
                                                                    visible={this.state.webViewActive === tab.key}
                                                                    id={tab.key} activeWebView={this.activeWebView}
                                                                    type="tab_blank"
                                                                    notifyInApp={this.state.notifyInApp}
                                                                    notificationChannel={this.notificationChannel}
                                                                    shop={item} updateShop={this.updateShop}
                                                                    notification={this.notification}
                                                                    visiblePopupFilter={this.state.visiblePopupFilter}
                                                                    setVisibleFilter={(visible) => this.setState({visiblePopupFilter: visible})}
                                                                    setBaget={this.setBaget}
                                    />)
                                })
                            }
                            return webviews
                        })
                    }
                    <WebViewComponent src={this.state.linkAdmin}
                                      visible={this.state.webViewActive === 'admin_sapo'} id={'admin_sapo'}
                                      activeWebView={this.activeWebView}
                                      type='admin' partition={`persist:admin_sapo`}
                                      loginStatus={(msg) => {
                                          if (msg.is_logged) {
                                              this.setState({userMain: msg})
                                          } else {
                                              this.setState({
                                                  linkAdmin: null, userMain: null, settingLinkAdmin: true,
                                                  listShop: [],
                                                  listShopWebview: [],
                                                  shopActive: null,
                                                  webViewActive: null,
                                                  viewChannelsId: this.getViewChannelsId(),
                                                  open_admin: false,
                                                  loginAdmin: false,
                                                  notifyInApp: true,
                                                  nextApp: !localStorage.getItem("next_app"),
                                                  countNotifyChannel: 0,
                                                  alias_admin: localStorage.getItem("alias_admin"),
                                                  visiblePopupFilter: false,
                                                  guideScreen: false,
                                                  showFormAdmin: false,
                                              })
                                          }
                                      }}
                                      notifyInApp={this.state.notifyInApp}
                                      getListShop={this.getListShop}
                                      alias_admin={this.state.alias_admin}
                                      notification={this.notification}
                                      visiblePopupFilter={this.state.visiblePopupFilter}
                                      setVisibleFilter={(visible) => this.setState({visiblePopupFilter: visible})}
                    />
                </div>
            </div>
        );
    }
}
