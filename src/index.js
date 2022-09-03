import { ProviderRpcClient } from 'everscale-inpage-provider'
import { utils } from 'ethers'

export const EverWalletWebProvider = {
  ever: function () {
    return new ProviderRpcClient()
  },
  isConnected: async function () {
    const ever = this.ever()
    let isConnected = false
    if (await ever.hasProvider()) {
      try {
        await ever.ensureInitialized()
        isConnected = true
      } catch (error) {}
    }
    return isConnected
  },
  connectInfo:{
    hasError: true,
    errorMessage: '',
    address:null
  },
  connect: async function () {

    const ever = this.ever()
    if (!(await ever.hasProvider())) {
        this.connectInfo.errorMessage = 'Extension Ever is not installed';
      return this.connectInfo;
    }

    const { accountInteraction } = await ever.requestPermissions({
      permissions: ['basic', 'accountInteraction'],
    })

    if (accountInteraction == null) {
        this.connectInfo.errorMessage = 'Insufficient permissions'
      return this.connectInfo;
    }
    this.connectInfo.hasError = false;
    this.connectInfo.address = accountInteraction.address.toString()
    return this.connectInfo
  },
  onConnect: async function(){
    await this.connect();
    if(this.connectInfo.hasError){
        document.getElementById('Error').innerHTML = this.connectInfo.errorMessage
    }else{
        document.getElementById('Address').innerHTML = this.connectInfo.address
    }

  },
  getBalance: async function () {    
    const ever = this.ever()
    if(this.connectInfo.hasError){
        return 0;
    }
    const { state } = await ever.getFullContractState({
      address: this.connectInfo.address,
    })
    let balance = state ? parseFloat(utils.formatUnits(state.balance)) : 0
    alert('Balance: '+balance)
  },
}

document.getElementById("connect").addEventListener("click", () => EverWalletWebProvider.onConnect());

document.getElementById("getBalance").addEventListener("click", () => EverWalletWebProvider.getBalance());
