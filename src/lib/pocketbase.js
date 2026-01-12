import PocketBase from 'pocketbase'

const url = import.meta.env.DEV
  ? 'http://127.0.0.1:8090'
  : 'https://quitters.mattport.com/api'

const pb = new PocketBase(url)

export default pb
