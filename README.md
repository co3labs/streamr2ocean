<p align="center">
    <b>Streamr Streams ➡️ Ocean Market</b>
    <br>
    Publish Streamr Streams on Ocean Market
</p>

Publish and monetize *your* Streamr Streams on Ocean Market. Directly from the Streamr Core app.

### Challenge
During the development the focus was on the implementation of a bridge between Streamr Network, Skynet and Ocean Protocol. The publishing process in single steps: 
1. Extract static content from a selected Streamr stream ([Streamr.ts](src/Streamr.ts))
2. Upload the stream snapshot to Skynet, get an encrypted file url ([Skynet.ts](src/Skynet.ts))
3. Use Ocean Protocol to publish the data set on Ocean Market ([Ocean.ts](src/Ocean.ts))


### Features
* Hand drafted, light weighted source code
* No 3rd webpages, just a browser extension

#### Ocean Protocol
* Generate, mint, approve data token
* Create access service
* Publish asset
* Utilised [ocean.js](https://github.com/oceanprotocol/ocean.js)

#### Streamr Network
* Full integration in to Streamr Core app
* Status messages during publishing process
* Permission check
* Session token handling
* Utilised [Streamr JavaScript Client](https://github.com/streamr-dev/streamr-client-javascript)


### How to
* Install the Chromium extension
    * [Download the last build](https://github.com/sergejmueller/streamr2ocean/raw/master/build/streamr2ocean.zip)
    * Extract the `.zip` file
    * Switch to your Chromium-based browser 
    * Go to `chrome://extensions/`
    * Enable `Developer mode`
    * Load the extracted folder as an unpacked extension
* Login in to [Ocean Market app](https://market.oceanprotocol.com)
* Login in to [Streamr Core app](https://streamr.network/core/)
* Select a stream with `stream_share` permission
    * Usually it is a stream that was created by you
* Click the `Sell` button near the other call2action buttons
* Fill out the `Publish` form
* Submit the form by clicking the `Publish` button
    * The publishing process is in progress now
* If successful, click the button `View on Ocean Market`
    * The published asset opens in a new browser window

#### Important
Make sure you are logged in to Ocean Market and Streamr Core with the same address/account and are connected to the same network.
    

### Next Release
* Generate a sample file
* Time range (timestamp - timestamp) for stream snapshots
* Consideration of multiple partitions for streams
* Prefill form input fields with stream infos
