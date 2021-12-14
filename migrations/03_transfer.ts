import { Basilisk } from './helpers/api';
import { getSigner, getSignerBob } from './helpers/utils';

async function main() {
    const api = await Basilisk.getInstance();
    if (!api) throw 'could not get api';
    const signer = getSigner();
    const tx = await api.tx.currencies.transfer(
        'bXjpVq9SMdXuP5mVmcYZC8kFWepMX3bRSxpNwdtaAXgsSxPwd',
        '0',
        '1234560'
    );
    const tx2 = await api.tx.currencies.transfer(
        'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
        '0',
        '10000000'
    );
    const tx3 = await api.tx.currencies.transfer(
        'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
        '1',
        '10101010100'
    );
    const tx4 = await api.tx.currencies.transfer(
        'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
        '2',
        '20202020200'
    );
    
    await tx2.signAndSend(getSignerBob(), 
    ({ status, events: _events, dispatchError }) => {
        //console.log(status)
        
       if (status.isBroadcast) {
            console.log('tx hash:', status.hash.toString());
        }
        if (status.isInBlock) {
            console.log('tx is in block');
        }
        if (status.isFinalized) {
            console.log('number of events', _events.length);
            _events.forEach(
                ({ event: { data, method, section }, phase }) => {
                    // Loop through Vec<EventRecord> to display all events
                    console.log(
                        `\t' ${phase}: ${section}.${method}:: ${data}`
                    );


                    // console.log('>>> data');
                    // console.log(data);
                    // console.log('>>> method');
                    // console.log(method);
                    // console.log('>>> section');
                    // console.log(section);
                    // // console.log('>>> phase');
                    // // console.log(phase);
                    console.log('//////////');
                }
            );
        }
        if (dispatchError) {
            console.log(
                'dispatchError',
                api.registry.findMetaError(dispatchError.asModule)
            );
        }
    });
    await new Promise<void>(async (resolve, reject) => {
        return await tx.signAndSend(
            signer,
            ({ status, events: _events, dispatchError }) => {
                //console.log(status)
                
               if (status.isBroadcast) {
                    console.log('tx hash:', status.hash.toString());
                }
                if (status.isInBlock) {
                    console.log('tx is in block with hash:', status.asInBlock);
                    
                }
                if (status.isFinalized) {
                    console.log('number of events', _events.length);
                    _events.forEach(
                        ({ event: { data, method, section }, phase }) => {
                            // Loop through Vec<EventRecord> to display all events
                            console.log(
                                `\t' ${phase}: ${section}.${method}:: ${data}`
                            );
                            console.log('tx is finalized in block', status.asFinalized)


                            // console.log('>>> data');
                            // console.log(data);
                            // console.log('>>> method');
                            // console.log(method);
                            // console.log('>>> section');
                            // console.log(section);
                            // // console.log('>>> phase');
                            // // console.log(phase);
                            console.log('//////////');
                        }
                    );
                }
                if (dispatchError) {
                    console.log(
                        'dispatchError',
                        api.registry.findMetaError(dispatchError.asModule)
                    );
                }
            }
        );
    });
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
