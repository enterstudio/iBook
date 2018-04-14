import React, { Component } from 'react';

import GoogleDriveAPI from '../utils/google-drive-api';

import './FileManager.css';

class FileManagerScreen extends Component {

  constructor(props){
    super(props);

    this.state = {
      list_files: [],
      newFileName: "Untitled file"
    };

    this.loadListFile = this.loadListFile.bind(this);
    this.onClickNewFile = this.onClickNewFile.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.loadListFile(), 1000);
  }

  loadListFile(){
    if(window.gapi && window.gapi.client && window.gapi.client.drive){
      GoogleDriveAPI.listFiles()
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.setState({list_files: response.result.files});
          clearInterval(this.timerID);
        }
      });
    }
  }

  onClickNewFile(){
    GoogleDriveAPI.createFile(this.state.newFileName)
    .then(response=>{
      console.log(response)
      var list_files = this.state.list_files;
      list_files.push(response.result);
      list_files.sort((a, b)=>a.name < b.name)
      this.setState({list_files});
    });
  }

  render() {
    return (
      <div>
        <div>FileManagerScreen</div>
        <button onClick={GoogleDriveAPI.signIn}>Sign In</button>
        <button onClick={GoogleDriveAPI.signOut}>Sign Out</button>
        <button type="button" className="btn" data-toggle="modal" data-target="#modalNewFolder">New File</button>

        <div>
        {
          this.state.list_files.map(file=>(
            <div className="book-item" key={file.id}>
              <img src="https://a.wattpad.com/cover/143193570-80-k140602.jpg" className="book-cover img-fluid" alt="Book cover"/>
              <div className="book-info">
                <h3 className="book-title">{file.name.substring(0, file.name.indexOf('.ibook'))}</h3>
                <div className="modified-date">Updated at {file.modifiedTime}</div>
              </div>
              <div className="book-buttons">
                <div className="book-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-ellipsis-v"></i>
                </div>
                <div className="dropdown-menu dropdown-menu-right">
                  <button className="dropdown-item" type="button">Action</button>
                  <button className="dropdown-item" type="button">Another action</button>
                  <button className="dropdown-item" type="button">Something else here</button>
                </div>
              </div>
            </div>
          ))
        }
        </div>

        <div className="modal fade" id="modalNewFolder" tabIndex="-1" role="dialog" aria-labelledby="modalNewFolderTitle" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modalNewFolderTitle">New Book</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">

              <form>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    ref="newFileInput"
                    value={this.state.newFileName}
                    onChange={(e)=>this.setState({newFileName: e.target.value})}
                    onFocus={()=>{this.refs.newFileInput.select()}}
                  />
                </div>
              </form>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.onClickNewFile}>Create</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FileManagerScreen;
