const url = require('url');
const path = require('path');
const electron = require('electron'); 

const { ipcRenderer, remote} = electron;

const Notification = electron.remote.Notification; 
window.session = electron.remote.session;
window.net = electron.remote.net;
window.shell = electron.remote.shell;
window.Notification = Notification;
window.remote = remote;

window.ipcRenderer = ipcRenderer;

window.pathPreloader = url.format({
    pathname: path.join(__dirname, './electron-js/preloader.js'),
    protocol: 'file:',
    slashes: true
})

window.notify= function notify(msg) {
    // msg['icon'] = path.join(__dirname, '/logo-sapo.png')
    
    try {
        const customNotification = new Notification(msg); 
        customNotification.show();
        return customNotification;
    } catch(err){
        console.log(err);
    }
};