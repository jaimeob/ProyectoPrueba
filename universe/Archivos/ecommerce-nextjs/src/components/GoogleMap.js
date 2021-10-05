import React, { Component } from 'react'
import compose from 'recompose/compose'
import GoogleMapReact from 'google-map-react'

import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  imgMarker: {
    '&:hover': {
      cursor: 'pointer'
    }
  }
})

class GoogleMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mapMaker: null,
      branches: [],
      center: ''
    }
    this.loadBranches = this.loadBranches.bind(this)
  }

  async componentWillMount() {
    await this.loadBranches()
  }

  async loadBranches() {
    this.setState({
      branches: this.props.branches
    })
  }

  render() {
    let self = this
    const { classes } = this.props

    let center = {
      lat: this.props.lat || this.props.userCoords.lat,
      lng: this.props.lng || this.props.userCoords.lng
    }

    if (!(center.lat && center.lng)) {
      center = {
        lat: 25.790466,
        lng: -108.985886
      }
    }

    return (
      <div style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%', marginBottom: '100px' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
          center={center}
          zoom={this.props.zoom}
        >
          {
            (this.state.branches) ?
              this.state.branches.map((branch, index) => {
                return (
                  <img 
                    ker={index}
                    className={classes.imgMarker}
                    src={self.props.mapMarker || "https://img.icons8.com/office/30/000000/marker.png"} 
                    alt=" " 
                    lat={branch.lat} 
                    lng={branch.lng} 
                    onClick={() => { self.props.handleClickBranch(branch) }}/>
                )
              })
              : ""
          }
          {
            (this.props.userCoords) ?
              <img src='/ubicacion.svg' alt=" " lat={this.props.userCoords.lat} lng={this.props.userCoords.lng} height="32" width="auto" />
              : ""
          }
        </GoogleMapReact>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
)(GoogleMap)
