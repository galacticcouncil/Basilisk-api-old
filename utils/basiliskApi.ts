import { Api, ApiPromise } from 'hydradx-js';

// TODO Must be updated type
let basiliskApi: any = null;

const getApi = (): any => basiliskApi;

export const initialize = async (): Promise<void> => {
    basiliskApi = await Api.initializeBasilisk(
        {
            error: (e: Error) => {
                console.log('on error listener - ', e);
            },
            disconnected: () => {
                console.log('on disconnected listener');
            },
            connected: () => {
                console.log('on connected listener');
            },
            ready: (apiInstance?: ApiPromise) => {
                console.log('on ready listener');
            },
            onTxEvent: eventData => {
                console.log('onTxEvent >>>');
            },
        },
        process.env.API_CONNECTION_URL
    );
};

export default {
    initialize,
    getApi,
};
