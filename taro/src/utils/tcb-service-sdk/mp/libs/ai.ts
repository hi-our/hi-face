import Base from './base';
import {
    ReturnValue
} from '../../common/interface';

export default class AI extends Base {
    public async init(): Promise<ReturnValue> {
        let { result } = await this.tcbService.cloud.callFunction({
            name: this.action,
            data: this.data
        });
        return result;
    }
}