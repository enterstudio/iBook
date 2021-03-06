import React, { Component } from 'react';
import { Switch, Route} from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';
import ArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AccountCircleIcon from 'material-ui/svg-icons/action/account-circle';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ExitToAppIcon from 'material-ui/svg-icons/action/exit-to-app';

import ListBookScreen from './ListBook';
import BookEditorScreen from './BookEditor';
import BookViewerScreen from './BookViewer';
import ChapterListScreen from './ChapterList';
import SettingScreen from './Setting';
import AboutScreen from './About';

import config from '../../config';

import GoogleDriveAPI from '../../api/GoogleDriveAPI';
import {setUserInfo, clearUserInfo, getUID, getName, getEmail, getAvatar} from '../../api/UserAPI';
import {getTimeAutoSync} from "../../api/SettingAPI";

import browserHistory from "../../utils/browserHistory";
import {sync} from "../../utils/helper";

import './BookManager.css';

class BookManagerScreen extends Component {

  state={
    openDrawer: false,
    user_id: getUID(),
    user_name: getName(),
    user_email: getEmail(),
    user_avatar: getAvatar(),
    title_app_bar: config.app_name,
    app_bar_sub_element: null,
  };

  constructor(props){
    super(props);

    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
  }

  componentDidMount() {
    GoogleDriveAPI.addLibrary(()=>{
      console.log('added gapi');
      GoogleDriveAPI.handleClientLoad(this.updateSigninStatus)
    });

    sync();
    global.timerSync=setInterval(function () {
      sync();
    }, getTimeAutoSync()*60*1000);
  }

  toggleDrawer(){
    this.setState({openDrawer: !this.state.openDrawer});
  }

  updateSigninStatus(isSignedIn){
    if (isSignedIn) {
      console.log("sign in");

      //send token to serviceWorker
      if('serviceWorker' in navigator){
        var token=window.gapi.auth.getToken();
        navigator.serviceWorker.ready.then(()=>{
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'token',
              data: token,
            });
          }
        });
      }

      //save data in localStorage
      var basicProfile=window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
      var user_id=basicProfile.getId();
      var user_name=basicProfile.getName();
      var user_avatar=basicProfile.getImageUrl();
      var user_email=basicProfile.getEmail();

      setUserInfo(user_id, user_email, user_name, user_avatar);

      this.setState({
        user_id: getUID(),
        user_name: getName(),
        user_email: getEmail(),
        user_avatar: getAvatar(),
      });

      sync();

      //browserHistory.push('/my-file');
    } else {
      console.log("sign out");
      clearUserInfo();

      this.setState({
        user_id: getUID(),
        user_name: getName(),
        user_email: getEmail(),
        user_avatar: getAvatar(),
      });
      //browserHistory.push('/');
    }
  }

  render() {
    var pathname = this.props.location.pathname;
    //right trim
    if (pathname.substring(pathname.length-1)==="/") {
      pathname = pathname.substring(0, pathname.length);
    }

    var is_home = pathname==="/app";

    return (
      <div>
        <AppBar
          title={this.state.title_app_bar}
          //onTitleClick={handleClick}
          style={{position: 'fixed', top: 0}}
          iconElementLeft={
            <IconButton
              onClick={is_home ? this.toggleDrawer : ()=>browserHistory.goBack()}
            >
              {
                is_home ? <NavigationMenuIcon/> : <ArrowBackIcon />
              }
            </IconButton>
          }
          iconElementRight={
            <IconMenu
              iconButtonElement={
                <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              <MenuItem primaryText="Refresh" onClick={() => window.location.reload()} />
              <MenuItem primaryText="Help" />
            </IconMenu>
          }
        />
        <Drawer
          docked={false}
          open={this.state.openDrawer}
          onRequestChange={(openDrawer) => this.setState({openDrawer})}
          className="drawer"
          >
          <div className="header">
            <div className="user-info">
              <div className="avatar">
                <img src={this.state.user_avatar} alt="User avatar" width="50" height="50" />
              </div>
              <div className="user-name">{this.state.user_name}</div>
            </div>
          </div>
          {
            !this.state.user_id ?
            (
              <MenuItem leftIcon={<AccountCircleIcon/>} onClick={GoogleDriveAPI.signIn}>Login Google Drive</MenuItem>
            )
            :
            (
              <MenuItem leftIcon={<ExitToAppIcon/>} onClick={GoogleDriveAPI.signOut}>Logout</MenuItem>
            )
          }
          <MenuItem
            leftIcon={<SettingsIcon/>}
            onClick={()=>{
              browserHistory.push('/app/setting');
              this.setState({openDrawer: false});
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            leftIcon={<InfoIcon/>}
            onClick={()=>{
              browserHistory.push('/app/about');
              this.setState({openDrawer: false});
            }}
          >
            About
          </MenuItem>
        </Drawer>

        <div style={{marginTop: 64}}>
          <Switch>
            <Route exact path="/app" render={(props)=><ListBookScreen {...props} />} />
            <Route exact path="/app/book/:bookId/:chapterId" render={(props)=><BookEditorScreen {...props} />} />
            <Route exact path="/app/book/:bookId" render={(props)=><ChapterListScreen {...props} />} />
            <Route exact path="/app/setting" render={(props)=><SettingScreen {...props} />} />
            <Route exact path="/app/about" render={(props)=><AboutScreen {...props} />} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default BookManagerScreen;
