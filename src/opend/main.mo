import List "mo:base/List";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

actor OpenD {

    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };

    var mapofNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var mapofOwner = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    var mapofListing = HashMap.HashMap<Principal,  Listing>(1, Principal.equal, Principal.hash);
 
    public shared(msg) func mint(imgData: [Nat8], name: Text): async Principal{
         let owner: Principal = msg.caller;

         Debug.print(debug_show(Cycles.balance()));
         Cycles.add(100_500_000_000);
         let newNFT = await NFTActorClass.NFT(name, owner, imgData);
         Debug.print(debug_show(Cycles.balance()));

         let newNFTPrincipal = await newNFT.getPrincipalId();
         mapofNFTs.put(newNFTPrincipal, newNFT);
         addToOwnershipMap(owner, newNFTPrincipal);

         return newNFTPrincipal;
    } ;

    private func addToOwnershipMap(owner:Principal, nftID:Principal){
         var ownedNFT: List.List<Principal> = switch (mapofOwner.get(owner)){
            case null List.nil<Principal>();
            case (?result) result;
         };

         ownedNFT:=List.push(nftID, ownedNFT);
         mapofOwner.put(owner, ownedNFT);
    };

    public query func getOwnerNFTs(user: Principal): async [Principal]{
          var listOfNFTs: List.List<Principal> = switch(mapofOwner.get(user)){
            case null List.nil<Principal>();
            case (?result) result;
          };
          var arrayofNFTs = List.toArray(listOfNFTs);
          return arrayofNFTs;
    };

    public shared(msg) func listItem(id: Principal, price: Nat):async Text{
        var item: NFTActorClass.NFT = switch(mapofNFTs.get(id)){
            case null return "NFT does not exist";
            case (?result) result;
        };

        var owner = await item.getOwner();
        if(Principal.equal(owner, msg.caller)){
             let newListing:Listing = {
                itemOwner = owner;
                itemPrice = price;
             };
             mapofListing.put(id, newListing);
        return "Success";
        }else{
            return "You don't own the NFT";
        }
    };

    public query func fetchCanisterId(): async Principal{
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id: Principal): async Bool{
         if(mapofListing.get(id) == null){
            return false;
         }else{
            return true;
         }
    };

    public query func getListedNFTs(): async [Principal]{
       let ids = Iter.toArray(mapofListing.keys());
       return ids;
    };

    public query func getOriginalOwner(id: Principal): async Principal{
           var listing: Listing = switch(mapofListing.get(id)){
              case null return Principal.fromText("");
              case (?result) result
           };

           return listing.itemOwner;
    };
    public query func getNFTPrice(id: Principal): async Nat{
        var listing: Listing = switch(mapofListing.get(id)){
            case null return 0;
            case (?result) result;
        };
        return listing.itemPrice;
    };

    public shared(msg) func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal): async Text{
        var purchasedNFT: NFTActorClass.NFT = switch(mapofNFTs.get(id)){
            case null return "NFT Does not exist";
            case (?result) result
        };
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
        if(transferResult == "Success"){
            mapofListing.delete(id);
            var ownerNFT:List.List<Principal> = switch(mapofOwner.get(ownerId)){
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownerNFT:=List.filter(ownerNFT, func(listItemIds: Principal): Bool{
                  return listItemIds!=id;
            });
            addToOwnershipMap(newOwnerId, id);
            return "Success";
        }else{
            return transferResult;
        }
    }
};
