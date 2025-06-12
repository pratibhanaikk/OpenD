import type { Principal } from '@dfinity/principal';
export interface NFT {
  'getImage' : () => Promise<Array<number>>,
  'getName' : () => Promise<string>,
  'getOwner' : () => Promise<Principal>,
  'getPrincipalId' : () => Promise<Principal>,
}
export interface _SERVICE extends NFT {}
