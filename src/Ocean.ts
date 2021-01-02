import Web3 from 'web3'
import { OCEAN_MARKETPLACE_ADDRESS } from './Config'
import { DDO, Ocean, Config, ConfigHelper, Account } from '@oceanprotocol/lib'
import createMetaMaskProvider  from 'metamask-extension-provider'

import type { AbstractProvider } from 'web3-core'
import type { File } from '@oceanprotocol/lib/dist/node/ddo/interfaces/File'
import type { Metadata } from "@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata"

export const oceanPublish = async (asset: Metadata, file: File): Promise<DDO> => {
    return new Promise( async (resolve, reject) => {
        window['streamr2ocean'].status = 'Connect Ocean protocol ...'

        const provider = <AbstractProvider> await createMetaMaskProvider()
        const web3 = <Web3> new Web3(provider)
        const network = await web3.eth.net.getNetworkType()
        const config = <Config> { ...(new ConfigHelper().getConfig(network)), web3Provider: web3 }

        await provider.request!({ method: 'eth_requestAccounts' })

        const ocean = <Ocean> await Ocean.getInstance(config)
        const account = <Account> (await ocean.accounts.list())[0]
        const accountId = account.getId()

        const tokenCap = '1000'
        const tokenAmount = '20'
        const serviceCost = '1'
        const publishedDate = new Date(Date.now()).toISOString().split('.')[0] + 'Z'

        window['streamr2ocean'].status = 'Create data token ...'

        const tokenAddress = await ocean.datatokens.create(config.metadataCacheUri!, accountId)

        window['streamr2ocean'].status = 'Mint data token ...'

        await ocean.datatokens.mint(tokenAddress, accountId, tokenCap)

        window['streamr2ocean'].status = 'Approve data token ...'

        await ocean.datatokens.approve(tokenAddress, OCEAN_MARKETPLACE_ADDRESS, tokenAmount, accountId)

        window['streamr2ocean'].status = 'Create access service ...'

        const accessService = await ocean.assets.createAccessServiceAttributes(account, serviceCost, publishedDate)

        asset.main.dateCreated = publishedDate
        asset.main.files = [file]

        window['streamr2ocean'].status = 'Publish asset ...'

        ocean.assets.create(asset, account, [accessService], tokenAddress)
            .then(ddo => resolve(ddo))
            .catch(error => reject(error))
    })
}
