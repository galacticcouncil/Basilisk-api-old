import {EventContext, StoreContext} from "@subsquid/hydra-common"
import {Extrinsic} from "../generated/model/extrinsic.model"


export async function handleExtrinsicSuccess({
    block,
    event,
    store
}: StoreContext & EventContext): Promise<void> {
    let extrinsic = new Extrinsic()
    extrinsic.id = event.id
    extrinsic.name = event.extrinsic?.section + '.' + event.extrinsic?.method
    await store.save(extrinsic)
}
