import { SvData } from '../lib/kcs';
declare global {
    namespace NodeJS {
        interface Global {
            //svdata: SvData;
        }
    }
}