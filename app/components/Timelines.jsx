import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import firebase from 'APP/fire'
const db = firebase.database()
const auth = firebase.auth()
let goalsRef = db.ref('goals')
let usersRef = db.ref('users')
let currentUserGoalsRef

import { VictoryAxis, VictoryChart, VictoryLabel, VictoryLine, VictoryBrushContainer, VictoryZoomContainer, VictoryScatter, VictoryTooltip } from 'victory'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'


// eventually, we'll sort goals array by priority / activity level, so displaying by index will have more significance

export default class extends Component {
  constructor(props) {
    super()
    this.state = {
      menuOpen: false,
      goals: [], //the actual goals that happen to belong to the user
      usersGoals: {}, //from the 'users' object -- the one that just says 'true'
    }
  }

  // VICTORY FUNCTIONS:

  getScatterData(goal, index, goalId) {
    var data = []
    // push start and end dates to data array
    // maybe make end date of completed goals into a star??
    data.push({ x: new Date(goal.startDate), key: `/goal/${goalId}`, y: index, label: `start date: \n ${new Date(goal.startDate).toDateString()}`, symbol: 'circle', fill: goal.color.hex })
    data.push({ x: new Date(goal.endDate), key: `/goal/${goalId}`, y: index, label: 'end date: \n' + new Date(goal.endDate).toDateString(), symbol: 'circle', fill: goal.color.hex })
    // then iterate over the milestones object and push each date to the array
    if (goal.milestones) {
      for (var id in goal.milestones) {
        var milestone = goal.milestones[id]
        data.push({ x: new Date(milestone.displayDate), key: `/milestone/${goalId}/${id}`, y: index, label: milestone.name, symbol: 'square', fill: 'white' })
      }
    }
    if (goal.checkIns) {
      for (var id in goal.checkIns) {
        var checkin = goal.checkIns[id]
        data.push({ x: new Date(checkin.displayDate), key: `/checkin/${goalId}/${id}`, y: index, label: checkin.name, symbol: 'diamond', fill: 'white' })
      }
    }
    return data
  }

  handleZoom(domain) {
    this.setState({ selectedDomain: domain })
  }

  handleBrush(domain) {
    this.setState({ zoomDomain: domain })
  }

  // MUI FUNCTIONS:

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault()

    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget,
    })
  }

  handleRequestClose = () => {
    this.setState({
      menuOpen: false,
    })
  }

  // FIREBASE FUNCTIONS:

  createNewGoal = (event, menuItem, index) => {
    // check to see if the index of the menu item is the index of the add goal item aka 0
    if (index === 0) {
      let newGoalRef = goalsRef.push()
      let newGoalId = newGoalRef.key
      let newGoalPath = `/goal/${newGoalId}`
      let newUserGoalRelation = currentUserGoalsRef.child(newGoalId).set(true) //takes ID of the new Goal, and adds it as a key: true in user's goal object
      console.log('newGoalId: ', newGoalId)
      browserHistory.push(newGoalPath)
    }
  }

  componentDidMount() {
    this.unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const userId = user.uid
        currentUserGoalsRef = usersRef.child(userId).child('goals')
      }
      currentUserGoalsRef.on('value', (snapshot) => {
        // MPM: just realized Object.entries is "experimental", so it might not work in all browsers
        // do we want to go back to just using Object.keys or a for-in loop?

        this.setState({ usersGoals: snapshot.val() }) //taking current user's {goals: true} object and setting it on the state

        let userGoalIds = Object.keys(this.state.usersGoals)
        let userGoals = {};
        userGoalIds.map(goalId => {
          goalsRef.child(goalId).on('value', (goalSnapshot) => {
            userGoals[goalId] = goalSnapshot.val()
            this.setState({goals: Object.entries(userGoals)})
          })
        })

      })
    })

  }

  // MPM: add componentWillUnmount

  render() {
    const chartStyle = { parent: { minWidth: '50%', maxWidth: '80%', marginLeft: '10%', cursor: 'pointer' } }
    return (
      <div>
        <VictoryChart width={600} height={400} scale={{ x: 'time' }} style={chartStyle}
          domain={{
            // MPM: eventually, manipulate this time span using moment library
            // for now, though, just start the view at the beginning of 2017??
            // x: [new Date(2017, 0, 1), Date.now()],
            y: [-1, this.state.goals.length]
          }}
          // MPM: add domainPadding?
          containerComponent={
            <VictoryZoomContainer
              dimension='x'
              zoomDomain={this.state.zoomDomain}
              onDomainChange={this.handleZoom.bind(this)}
            />
          }
        >
          <VictoryAxis
            style={{
              axis: {
                stroke: 'none'
              },
              tickLabels: {
                angle: -45
              }
            }}
          />

          {
            this.state.goals && this.state.goals.map((goal, index) => {
              // get goal info out of goal array: index 0 is goal id and index 1 is object with all other data
              let goalInfo = goal[1]
              return (
                <VictoryLine
                  key={index}
                  style={{
                    data: {
                      stroke: goalInfo.color.hex,
                      strokeWidth: 4,
                    }
                  }}
                  events={[{
                    target: 'data',
                    eventHandlers: {
                      onClick: (event) => {
                        console.log('clicked line #', index)
                      }
                    }
                  }]}
                  data={[
                    { x: new Date(goalInfo.startDate), y: index },
                    { x: new Date(goalInfo.endDate), y: index }
                  ]}
                />
              )
            })
          }{
            this.state.goals && this.state.goals.map((goal, index) => {
              let goalInfo = goal[1]
              let goalId = goal[0]
              return (
                <VictoryScatter
                  key={index}
                  style={{
                    data: {
                      stroke: goalInfo.color.hex,
                      strokeWidth: 3,
                      fill: 'white'
                    }
                  }}
                  events={[{
                    target: 'data',
                    eventHandlers: {
                      onClick: (event, props) => {
                        let goalPath = props.data[props.index].key
                        browserHistory.push(goalPath)
                      }
                    }
                  }]}
                  data={this.getScatterData(goalInfo, index, goalId)}
                  labelComponent={<VictoryTooltip />}
                />
              )
            })
          }
        </VictoryChart>

        <VictoryChart
          // eventually, we want this size to be responsive / relative to # of goals?
          padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
          width={600} height={50} scale={{ x: 'time' }} style={chartStyle}
          domain={{ y: [-1, this.state.goals.length] }}
          containerComponent={
            <VictoryBrushContainer
              dimension='x'
              selectedDomain={this.state.selectedDomain}
              onDomainChange={this.handleBrush.bind(this)}
            />
          }
        >
          <VictoryAxis
            // tickFormat={(x) => new Date(x).getFullYear()}
            tickValues={[]}
            style={{
              axis: {
                stroke: 'none'
              }
            }}
          />
          {
            this.state.goals && this.state.goals.map((goal, index) => {
              let goalInfo = goal[1]
              return (
                <VictoryLine
                  key={index}
                  style={{
                    data: {
                      stroke: goalInfo.color.hex,
                      strokeWidth: 3
                    }
                  }}
                  data={[
                    { x: new Date(goalInfo.startDate), y: index },
                    { x: new Date(goalInfo.endDate), y: index }
                  ]}
                />
              )
            })
          }
        </VictoryChart>
        <FloatingActionButton secondary={true} onTouchTap={this.handleTouchTap}>
          <ContentAdd />
        </FloatingActionButton>
        <Popover
          open={this.state.menuOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu onItemTouchTap={this.createNewGoal}>
            <MenuItem id='add-goal' primaryText='Add goal' />
            <MenuItem primaryText='Add milestone' />
            <MenuItem primaryText='Add check in' />
          </Menu>
        </Popover>
      </div>
    )
  }
}
