import { Basilisk } from './helpers/api';
import { getSigner, getSignerBob } from './helpers/utils';

async function main() {
    const api = await Basilisk.getInstance();
    if (!api) throw 'could not get api';
    const signer = getSigner();
    const tx = await api.tx.currencies.transfer(
        'bXjpVq9SMdXuP5mVmcYZC8kFWepMX3bRSxpNwdtaAXgsSxPwd',
        '1',
        '5'
    );

    const tx2 = await api.tx.currencies.transfer(
        'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
        '1',
        '5'
    );
    
    return new Promise<void>(async (resolve, reject) => {
        try {
            const unsub = await tx2.signAndSend(
                getSignerBob(),
                async ({ status, events: _events, dispatchError }) => {
                    //console.log('before extrinsic tx hash', tx2.hash.toHex());
                    if (status.isBroadcast) {
                        console.log(
                            'is broadcast block tx hash:',
                            status.hash.toHex()
                        );

                        // need to save tx.hash.toHex() => extrensic hash
                        // -> block 55
                        // -> ex hash in block 55+1, 55+2, 
                    }
                    // most complicated case happens here
                    // <----->
                    // impatient user refreshes shortly after broadcasting
                    // need to search for ex.hash in the blocks
                    if (status.isInBlock) {
                        console.log(
                            'status.asInBlock.toHex():',
                            status.asInBlock.toHex()
                        );

                        // goal: "id": "0000000057-000002-28ed9"
                        //         block number     index  asInFinalized

                        const blockHash = status.asInBlock.toString();
                        const signedBlock = await api.rpc.chain.getBlock(
                            blockHash
                        );
                        const paraChainBlockHeight =
                            signedBlock.block.header.number.toBigInt();

                        signedBlock.block.extrinsics.forEach((ex, index) => {
                            //console.log(index, ex.hash.toHex());
                            if(ex.hash.toHex() === tx2.hash.toHex())
                            console.log(`index is: ${index} for relevant extrinsic hash: ${ex.hash.toHex()}`)
                        });            

    
                        _events.forEach(({ event: _event, phase }) => {
                            if (api.events.system.ExtrinsicSuccess.is(_event)) {
                                // extract the data for this event
                                // (In TS, because of the guard above, these will be typed)
                                const [dispatchInfo] = _event.data;

                                console.log(
                                    `${_event.section}.${
                                        _event.method
                                    }:: ExtrinsicSuccess:: ${dispatchInfo.toHuman()}`
                                );
                            } else if (
                                api.events.system.ExtrinsicFailed.is(_event)
                            ) {
                                // extract the data for this event
                                const [dispatchError, dispatchInfo] =
                                    _event.data;
                                let errorInfo;

                                // decode the error
                                if (dispatchError.isModule) {
                                    // for module errors, we have the section indexed, lookup
                                    // (For specific known errors, we can also do a check against the
                                    // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
                                    const decoded = api.registry.findMetaError(
                                        dispatchError.asModule
                                    );

                                    errorInfo = `${decoded.section}.${decoded.name}`;
                                } else {
                                    // Other, CannotLookup, BadOrigin, no extra info
                                    errorInfo = dispatchError.toString();
                                }

                                console.log(
                                    `${_event.section}.${_event.method}:: ExtrinsicFailed:: ${errorInfo}`
                                );
                            }
                        });
                    }
                    //
                    // what if refresh happens here and reorg?
                    //
                    if (status.isFinalized) {
                     
                        console.log(
                            'status.asFinalized.toHex()',
                            status.asFinalized.toHex()
                        );

                        console.log('number of events', _events.length);
                        console.log('header hash:', status.hash.toHex());
                        _events.forEach(
                            ({ event: { data, method, section }, phase }) => {
                                console.log('////event-info//////');
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
                                console.log('///////////////////');
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
            console.log('extrinsic hash', tx2.hash.toHex());
        } catch (e: any) {
            console.log(e);
            reject(e);
        }
        //await tx2.signAndSend(getSignerBob(), { nonce: -1 });
    });
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
