
export default abstract class Base {

    protected tcbService: any;
    protected action: string;
    protected version: string;
    protected data: any;
    protected options: any;

    public constructor(tcbService, version, action, data, options = {}) {
        this.tcbService = tcbService;
        this.action = action;
        this.version = version;
        this.data = data;
        this.options = options;
    }

    public abstract async init()
}