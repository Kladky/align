import React, {Component} from 'react'
import firebase from 'APP/fire'
const db = firebase.database()
const resourcesRef = db.ref('resources')

import {MuiThemeProvider, getMuiTheme} from 'material-ui/styles'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import {TextField, IconButton, RaisedButton} from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'

import $ from 'jquery'

export default class extends Component {
  constructor(props) {
    super()
    this.state = {
      url: ''
    }
  }

  componentDidMount() {
    // this.listenTo(this.props.fireRef)
  }

  componentWillUnmount() {
    // this.unsubscribe()
  }

  // move the functions below to our resource component
  // writeURL = (url) => {
  //   urlRef.set(url)
  // }

  // writeTitle = (title) => {
  //   titleRef.set(title)
  // }

  // writeImage = (image) => {
  //   imageRef.set(image)
  // }

  // writeDescription = (description) => {
  //   descriptionRef.set(description)
  // }

  // don't write URL yet... first, make the ajax request
  // THEN write title, image, and description based on JSON returned by ajax call

  handleChange = (event) => {
    this.setState({
      url: event.target.value
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const target = this.state.url
    $.ajax({
      url: 'http://api.linkpreview.net',
      dataType: 'jsonp',
      data: {q: target, key: '59546c0da716e80a54030151e45fe4e025d32430c753a'},
      success: response => {
        console.log('link preview: ', response)
        let key = resourcesRef.push().key
        console.log('what even ', this.props)
        if (this.props.milestoneRef) {
          console.log('props from in milestone thing', this.props)
          // add resource URL to parent goal's uploads:
          this.props.goalRef.child('resources').child(key).set({
            resourceURL: response.url,
            milestoneId: this.props.milestoneId
          })
          // add resource URL to milestone:
          this.props.milestoneRef.child(key).set({
            resourceURL: response.url
          })
        } else {
          // otherwise, just add resource directly to goal
          this.props.goalRef.child(key).set({
            resourceURL: response.url
          })
        }
        resourcesRef.child(key).set(response)
      }
    })
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <form onSubmit={this.handleSubmit}>
            <TextField
              autoFocus
              hintText='Paste a URL here'
              floatingLabelText='URL'
              onChange={this.handleChange}
              id='url'
            />
          <IconButton type="submit" tooltip="click to add" touch={true} tooltipPosition="top-center">
            <ContentAdd />
          </IconButton>
        </form>
      </MuiThemeProvider>
    )
  }
}
