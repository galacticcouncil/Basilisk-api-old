import { Balances } from "../types/balances"
import handlePostBlock from "./block/handlePostBlock"
import handleCurrenciesTransferred from "./currencies/handleCurrenciesTransferred";
import {Tokens} from "../types/tokens"
import { LBP } from "../types/lbp";
import { EventContext, StoreContext } from '@subsquid/hydra-common'
const handleTokensTransfer = async ({ block, event, store }: any) => {
    console.log(`tokens.Transfer`)
    console.log(`method ${event.extrinsic?.method}`)
    const [currency, from, to, balance] = new Tokens.TransferEvent(event).params;
    console.log(`tokens transfer of currencyId ${currency} from ${from.toString().substring(0,5)} to ${to.toString().substring(0,5)} balance ${balance}`)
};

const handleBalanceTransfer = async ({ block, event, store }: any) => {
    console.log("balance.Transfer");
    console.log(`method ${event.extrinsic?.method}`)
    console.log(`arguments ${JSON.stringify(event.extrinsic!.args)}`)
    const [from, to, balance] = new Balances.TransferEvent(event).params;
    console.log(`balance transfer of BSX from ${from.toString().substring(0,5)} to ${to.toString().substring(0,5)} balance ${balance}`)
};

const handleBuyExecuted = async ({ block, event, store }: any) => {
    console.log("lbp.BuyExecuted");
    console.log(`arguments of extrinsic resulting in lbp.BuyExecuted ${JSON.stringify(event.extrinsic!.args)}`)
};

const handleLiquidityAdded = async ({ block, event, store }: any) => {
    console.log("lbp.LiquidityAdded");
    console.log(`arguments of extrinsic resulting in lbp.LiquidityAdded ${JSON.stringify(event.extrinsic!.args)}`)
};

const handleLiquidityRemoved = async ({ block, event, store }: any) => {
    console.log("lbp.LiquidityRemoved");
    console.log(`arguments of extrinsic resulting in lbp.LiquidityRemoved ${JSON.stringify(event.extrinsic!.args)}`)
};

const handleTokensEndowed = async ({ block, event, store }: any) => {
    console.log("tokens.Endowed");
    console.log(`arguments of extrinsic: ${event.extrinsic!.args[0].value}`)
    const [currency, to, balance] = new Tokens.EndowedEvent(event).params;
    console.log(`tokens endowed of currencyId ${currency} to ${to.toString().substring(0,5)} balance ${balance}`)
};

const handlePoolCreated = async ({ block, event, store, extrinsic }: EventContext & StoreContext): Promise<void> => {
    console.log("lbp.PoolCreated");
    console.log(`arguments of extrinsic resulting in lbp.PoolCreated: ${JSON.stringify(event.extrinsic!.args[0].value)}`)
};

const handleSellExecuted = async ({ block, event, store }: any) => {
    console.log("lbp.SellExecuted");
    console.log(`arguments of extrinsic resulting in lbp.SellExecuted ${JSON.stringify(event.extrinsic!.args)}`)
    console.log('...')
};


export { handlePostBlock, handleTokensTransfer, handleBalanceTransfer, handleBuyExecuted, handleLiquidityAdded, handleLiquidityRemoved, handleTokensEndowed, handlePoolCreated, handleSellExecuted, handleCurrenciesTransferred };
