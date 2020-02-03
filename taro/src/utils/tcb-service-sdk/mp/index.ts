import AI from './libs/ai';
import Video from './libs/video';
import SMS from './libs/sms';
import {
    Options,
    ReturnValue
} from '../common/interface';

export default class TcbService {
    private cloud: any;
    constructor(cloud: any = null) {
        this.cloud = cloud || wx.cloud;
    }

    callService({ service, version = 'v1.0.0', action, data }: Options): Promise<ReturnValue> {
        switch (service) {
            case 'ai': {
                const ai = new AI(this, version, action, data);
                return ai.init();
            }
            case 'video': {
                const video = new Video(this, version, action, data);
                return video.init();
            }
            case 'sms': {
                const sms = new SMS(this, version, action, data);
                return sms.init();
            }
        }
    }
}