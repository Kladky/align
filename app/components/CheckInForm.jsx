import React from 'react'
import { Link } from 'react-router'
let nameRef, descriptionRef, dateRef, uploadsRef, parentRef

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import DatePicker from 'material-ui/DatePicker'
import UploadForm from './Upload'

export default class extends React.Component {
  constructor(props) {
    super()
    this.state = {
      name: '',
      description: '',
      isOpen: true,
      date: new Date().getTime()
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

    // Whenever a ref's value changes, set {value} on our state:

    const nameListener = nameRef.on('value', snapshot =>
      this.setState({ name: snapshot.val() }))

    const descriptionListener = descriptionRef.on('value', snapshot => {
      this.setState({ description: snapshot.val() })
    })

    const dateListener = dateRef.on('value', snapshot => {
      this.setState({ date: snapshot.val() })
      if (snapshot.val() === null) dateRef.set(new Date().getTime())
    })

    const uploadsListener = uploadsRef.on('value', snapshot => {
      if (snapshot.val()) this.setState({ uploads: Object.values(snapshot.val()) })
    })

    // Set unsubscribe to be a function that detaches the listener.
    this.unsubscribe = () => {
      nameRef.off('value', nameListener)
      descriptionRef.off('value', descriptionListener)
      dateRef.off('value', dateListener)
      uploadsRef.off('value', uploadsListener)
    }
  }

  // Write is defined using the class property syntax.
  // This is roughly equivalent to saying,
  //
  //    this.write = event => (etc...)
  //
  // in the constructor. Incidentally, this means that write
  // is always bound to this.
  writeName = (event) => {
    nameRef.set(event.target.value)
  }

  writeDescription = (event) => {
    descriptionRef.set(event.target.value)
  }

  writeIsOpen = (event, id) => {
    // for 'isOpen', we're setting it to false if the user says they already achieved it, or true if they say they haven't
    // the id is the index of the select option clicked
    if (id === 0) {
      isOpenRef.set(false)
    }
    if (id === 1) {
      isOpenRef.set(true)
    }
  }

  writeDate = (event, date) => {
    // get time converts regular date format to timestamp
    dateRef.set(date.getTime())
  }

  render() {
    // Rendering form with material UI
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <Link to={`/goal/${this.props.goalId}`}>Back to goal</Link>
          <br/>
          <Link to='/timelines'>Back to timelines</Link>
          <h1>Edit page for check in: <span id='checkInName'>{this.state.name}</span></h1>
          <div className='form-group'>
            <TextField
              hintText='Your check in name'
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
              id='description'
            />
          </div>
          <div className='form-group'>
            <DatePicker id='date' value={new Date(this.state.date)} onChange={this.writeDate} floatingLabelText='Date of check in' />
          </div>
          <div>
            <h3>Uploads:</h3>
            <UploadForm goalRef={parentRef} checkInRef={uploadsRef} checkInId={this.props.checkInId} />
            { this.state.uploads && this.state.uploads.map((upload, index) => {
                return (
                  <img key={index} src={upload.imageURL} />
                )
              })
            }
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}
