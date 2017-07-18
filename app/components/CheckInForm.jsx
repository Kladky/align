import React from 'react'
import { Link, browserHistory } from 'react-router'

import firebase from 'APP/fire'
const db = firebase.database()
const goalsRef = db.ref('goals')
let nameRef, descriptionRef, dateRef, uploadsRef, parentRef, notesRef

import ReactQuill from 'react-quill'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import alignTheme from './AlignTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import DatePicker from 'material-ui/DatePicker'
import RaisedButton from 'material-ui/RaisedButton'
import Close from 'material-ui/svg-icons/navigation/close'
import UploadForm from './Upload'
import UploadCard from './UploadCard'

export default class extends React.Component {
  constructor(props) {
    super()
    this.state = {
      name: '',
      description: '',
      isOpen: true, // Default checkin status is open
      date: new Date().getTime(), // Default date is today
      notes: ''
    }
  }

  componentDidMount() {
    // When the component mounts, start listening to the fireRef
    // we were given.
    this.listenTo(this.props.fireRef)
  }

  componentWillUnmount() {
    // When we unmount, stop listening.
    this.unsubscribe()
  }

  componentWillReceiveProps(incoming, outgoing) {
    // When the props sent to us by our parent component change,
    // start listening to the new firebase reference.
    this.listenTo(incoming.fireRef)
  }

  listenTo(fireRef) {
    // If we're already listening to a ref, stop listening there.
    if (this.unsubscribe) this.unsubscribe()

    // Set up aliases for our Firebase references:
    nameRef = fireRef.nameRef
    descriptionRef = fireRef.descriptionRef
    dateRef = fireRef.dateRef
    uploadsRef = fireRef.uploadsRef
    parentRef = fireRef.parentRef
    notesRef = fireRef.notesRef

    // Whenever a ref's value changes, set {value} on our state:
    const nameListener = nameRef.on('value', snapshot =>
      this.setState({ name: snapshot.val() || '' }))

    const descriptionListener = descriptionRef.on('value', snapshot => {
      this.setState({ description: snapshot.val() || '' })
    })

    const dateListener = dateRef.on('value', snapshot => {
      this.setState({ date: snapshot.val() })
      if (snapshot.val() === null) dateRef.set(new Date().getTime())
    })

    const uploadsListener = uploadsRef.on('value', snapshot => {
      if (snapshot.val()) this.setState({ uploads: Object.entries(snapshot.val()) })
    })

    const notesListener = notesRef.on('value', snapshot => {
      if (snapshot.val()) this.setState({ notes: snapshot.val() })
    })

    // Set unsubscribe to be a function that detaches the listener.
    this.unsubscribe = () => {
      nameRef.off('value', nameListener)
      descriptionRef.off('value', descriptionListener)
      dateRef.off('value', dateListener)
      uploadsRef.off('value', uploadsListener)
      notesRef.off('value', notesListener)
    }
  }

  // These 'write' functions are defined using class property syntax,
  // which is like 'this.writeName = event => (etc.),
  // which means they're always bound to 'this'.
  writeName = (event) => {
    nameRef.set(event.target.value)
  }

  writeDescription = (event) => {
    descriptionRef.set(event.target.value)
  }

  writeNotes = (event) => {
    notesRef.set(event)
  }

  writeIsOpen = (event, id) => {
    // For 'isOpen', we're setting it to false if the user says they already achieved it (first option, 0),
    // or true if they say they haven't (second option, 1)
    if (id === 0) {
      isOpenRef.set(false)
    }
    if (id === 1) {
      isOpenRef.set(true)
    }
  }

  writeDate = (event, date) => {
    // getTime converts regular date format to timestamp
    dateRef.set(date.getTime())
  }

  deleteCheckIn = () => {
    let goalId = this.props.goalId
    let checkInId = this.props.checkInId
    this.unsubscribe()
    goalsRef.child(goalId).child('checkIns').child(checkInId).set(null)
    browserHistory.push('/')
  }

  render() {
    // Rendering form with material UI
    return (
      <div id='mockup-container'>
        <MuiThemeProvider muiTheme={getMuiTheme(alignTheme)}>
          <div className="container-fluid">
            <div id='faux-modal-header'>
              <div className='row faux-header'>
                <div className='col-xs-12'>
                  <h1 id='checkInName'>{this.state.name}<span id='close-icon'><Close onTouchTap={() => browserHistory.push('/')} /></span></h1>
                </div>
              </div>
            </div>
            <div id='faux-modal-body'>
              <div className="row">
                <div className="col-xs-6">
                  <h3>Check-In Information</h3>
                  <div className='form-group'>
                    <TextField
                      hintText='Your check-in name'
                      floatingLabelText='Name'
                      value={this.state.name}
                      onChange={this.writeName}
                      id='name'
                    />
                  </div>
                  <div className='form-group'>
                    <TextField
                      hintText='What do you want to do?'
                      floatingLabelText='Description'
                      value={this.state.description}
                      onChange={this.writeDescription}
                      multiLine={true}
                      id='description'
                    />
                  </div>
                  <div className='form-group'>
                    <DatePicker id='date' value={new Date(this.state.date)} onChange={this.writeDate} floatingLabelText='Date of check-in' />
                  </div>
                </div>
                <div className='upload-container'>
                  <h3>Uploads:</h3>
                  <UploadForm goalRef={parentRef} checkInRef={uploadsRef} checkInId={this.props.checkInId} />
                  <div>
                    {this.state.uploads && this.state.uploads.map((upload, index) => {
                      let uploadId = upload[0]
                      let uploadInfo = upload[1]
                      return (
                        <UploadCard key={index} uploadId={uploadId} url={uploadInfo.imageURL} goalRef={parentRef} checkInRef={uploadsRef} checkInId={this.props.checkInId} />
                      )
                    })
                    }
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <h3>Notes</h3>
                  <ReactQuill
                    value={this.state.notes}
                    onChange={this.writeNotes}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-6" id="bottom-buttons">
                  <div id="button-container"><RaisedButton label="Save Check-In" primary={true} onClick={browserHistory.goBack} /></div>
                  <div><RaisedButton label="Delete this check-in?" secondary={true} onClick={this.deleteCheckIn} /></div>
                </div>
              </div>
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    )
  }
}
