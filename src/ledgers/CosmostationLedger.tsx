import { cosmos, InstallError } from "@cosmostation/extension-client"
import { AddChainParams } from "@cosmostation/extension-client/types/message"
import { CHAIN_DETAILS } from "utils/constants"

export const connectCosmostationLedger = async (chosenNetwork: string): Promise<{ address: string; accountName: string; }> => {

  let userAccountAddress: string = ''
  let userAccountName: string = ''

  try {
    const provider = await cosmos()
    const activatedChains = await provider.getActivatedChains()

    if (!activatedChains.includes(CHAIN_DETAILS.CHAIN_NAME[chosenNetwork].toLowerCase())) {

      const chainToAdd: AddChainParams = {
        chainId: CHAIN_DETAILS.CHAIN_ID[chosenNetwork],
        chainName: CHAIN_DETAILS.CHAIN_NAME[chosenNetwork],
        restURL: CHAIN_DETAILS.API_ADDRESS[chosenNetwork],
        addressPrefix: CHAIN_DETAILS.CURRENCY_DISPLAY_NAME.toLowerCase(),
        baseDenom: CHAIN_DETAILS.NATIVE_TOKEN_DENOM,
        displayDenom: CHAIN_DETAILS.CURRENCY_DISPLAY_NAME,
        decimals: 18,
        coinGeckoId: CHAIN_DETAILS.CURRENCY_DISPLAY_NAME.toLowerCase(),
        gasRate: {
          average: (Number(CHAIN_DETAILS.GAS_PRICE) * 2).toString(),
          low: (Number(CHAIN_DETAILS.GAS_PRICE) * 2).toString(),
          tiny: CHAIN_DETAILS.GAS_PRICE.toString(),
        }
      }

      await provider.addChain(chainToAdd)
    }

    const acccount = await provider.requestAccount(CHAIN_DETAILS.CHAIN_NAME[chosenNetwork])
    userAccountAddress = acccount.address
    userAccountName = acccount.name

  } catch (error) {

    if (error instanceof InstallError) {
      throw new Error("Cosmostation extension not found")
    }

    if ((error as { code: number }).code === 4001) {
      throw new Error("user rejected request")
    }

  }

  return { address: userAccountAddress, accountName: userAccountName }
}
