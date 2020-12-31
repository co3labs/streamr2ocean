import Web3 from 'web3'
import { OCEAN_MARKETPLACE_ADDRESS } from './Config'
import { DDO, Ocean, Config, ConfigHelper, Account } from '@oceanprotocol/lib'
import detectEthereumProvider from '@metamask/detect-provider'

import type { AbstractProvider } from 'web3-core'
import type { File } from '@oceanprotocol/lib/dist/node/ddo/interfaces/File'
import type { Metadata } from "@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata"

export const oceanPublish = async (fileMetadata: File): Promise<DDO> => {
    return new Promise( async (resolve) => {
        console.log('Publish on Ocean Market ...')

        const provider = <AbstractProvider> await detectEthereumProvider()
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

        const tokenAddress = await ocean.datatokens.create(config.metadataCacheUri!, accountId)

        await ocean.datatokens.mint(tokenAddress, accountId, tokenCap)
        await ocean.datatokens.approve(tokenAddress, OCEAN_MARKETPLACE_ADDRESS, tokenAmount, accountId)

        const accessService = await ocean.assets.createAccessServiceAttributes(account, serviceCost, publishedDate)

        const asset = <Metadata> {
            main: {
                type: 'dataset',
                name: 'dataset-v7',
                dateCreated: publishedDate,
                author: 'team-v7',
                license: 'MIT',
                files: [fileMetadata]
            },
            additionalInformation: {
                description: 'A *better* `code` for **description**'
            }
        }

        const ddo = <DDO> await ocean.assets.create(asset, account, [accessService], tokenAddress)

        return resolve(ddo)
    })
}
