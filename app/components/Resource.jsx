// this is a presentational component that we'll call for each resource
// basically just a render function that will return the resource 'card'
// MPM okay LIES

// a resource card should contain: title, thumbnail photo, and a description at the bottom, and it should link somewhere

import React, { Component } from 'react'
import { Link } from 'react-router'

import {Card, CardActions, CardHeader, CardMedia, CardText} from 'material-ui/Card'

let resourceRef, urlRef, titleRef, imageRef, descriptionRef

export default class extends Component {
  constructor(props) {
    super()
    this.state = {
      resourceID: '',
      title: '',
      url: '',
      image: '',
      description: ''
    }
  }

  componentDidMount() {
    // When the component mounts, start listening to the fireRef we were given.
    console.log(this.props)
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

    titleRef = fireRef.titleRef
    urlRef = fireRef.urlRef
    imageRef = fireRef.imageRef
    descriptionRef = fireRef.descriptionRef

    // Whenever our ref's value changes, set {value} on our state.
    // const listener = fireRef.on('value', snapshot =>
    //   this.setState({value: snapshot.val()}))

    const titleListener = titleRef.on('value', snapshot =>
      this.setState({ title: snapshot.val() }))

    // MPM I'm pretty sure we DON'T want URL / image URL to be editable, right?

    const urlListener = urlRef.on('value', snapshot => {
      this.setState({ url: snapshot.val() })
    })

    const imageListener = imageRef.on('value', snapshot => {
      this.setState({ image: snapshot.val() })
    })

    const descriptionListener = descriptionRef.on('value', snapshot => {
      this.setState({ description: snapshot.val() })
    })

    // Set unsubscribe to be a function that detaches the listener.
    this.unsubscribe = () => {
      titleRef.off('value', titleListener)
      urlRef.off('value', urlListener)
      imageRef.off('value', imageListener)
      descriptionRef.off('value', descriptionListener)
    }
  }

  render() {
    // Rendering form with material UI
    return (
      <Card>
        <CardHeader
          title={this.state.title}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardMedia>
          <img src={this.state.image} />
        </CardMedia>
        <CardText
          expandable={true}
        >
          {this.state.description}
        </CardText>
      </Card>
    )
  }
}
