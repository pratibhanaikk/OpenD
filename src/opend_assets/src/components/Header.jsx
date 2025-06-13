import React, {useEffect, useState} from "react";
import logo from "../../assets/logo.png";
import homeImage from "../../assets/home-img.png";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import {opend} from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";



function Header() {
  const [listofNFTs, setlistNFTs] = useState();
  const [listinGallery, setListingGallery] = useState();
  async function getNFT(){
      const list = await opend.getOwnerNFTs(CURRENT_USER_ID);
      console.log(list);
      setlistNFTs(<Gallery title="My NFTs" nftIDs={list} role="Collection"/>);
      const listedIds = await opend.getListedNFTs();
      console.log(listedIds);
      setListingGallery(<Gallery title="Discover" nftIDs={listedIds} role="Discover"/>)
  }
  
  useEffect(()=>{
   getNFT();
  }, [])

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">
                Discover
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route path="/discover">
          {listinGallery}
        </Route>
        <Route path="/minter">
            <Minter />
        </Route>
        <Route path="/collection">
           {listofNFTs}
        </Route>
        <Route path="/">
            <img className="bottom-space" src={homeImage}/>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
