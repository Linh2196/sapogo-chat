import React, { Component } from 'react';
import { Modal, Form, Input, Button} from 'antd';
import { IconShopeeRound, IconClose, IconArrowRight1, LogoSapo2} from '../icons';

export default class NotificationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentDidMount = async () => {

    }
    componentWillUnmount = () => {

    }
    componentWillReceiveProps = (nextProps) => {

    }
    render = () => {
        return (
            <div className="notification-item">
                <div className="notification-header">
                    <div className="icon">
                        <img src={this.props.icon ? this.props.icon : LogoSapo2} />
                    </div>
                    <div className="title">{this.props.title ? this.props.title : 'Gochat'}</div>
                    <div className="time">Bây giờ</div>
                </div>
                <div className="notification-content">
                     <h3>{this.props.subtitle}</h3>
                    <div>
                    {this.props.content}
                    </div>
                </div>
                <div className="notification-bottom">
                    <img src={IconArrowRight1} />
                </div>
            </div>
        );
    }
}
