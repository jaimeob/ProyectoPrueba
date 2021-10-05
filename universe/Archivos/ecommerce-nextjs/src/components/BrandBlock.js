import React, { Component } from 'react'
import compose from 'recompose/compose'


// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'
import { getDataAPI } from '../api/CRUD'

const styles = theme => ({
  blockTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 48
  },
  blockDescription: {
    width: '100%',
    textAlign: 'center',
    fontSize: 22
  },
  item: {
    marginTop: '16px',
    height: '187px',
  },
  image: {
    width: '100%',
    'object-fit': 'contain'
  }
})

class BrandBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      brands: [],
      configs: JSON.parse(this.props.configs)
    }
  }

  

  async componentWillMount() {
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: this.props.resource,
      filters: JSON.parse(this.props.filters)
    })
    this.setState({
      brands: response.data
    })

  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <Grid container justify="space-evenly" style={{width: '85%', margin: '0 auto'}}>
        <Typography variant="h2" className={classes.blockTitle}>
          {this.props.title}
        </Typography>
        <Typography variant="h6" className={classes.blockDescription}>
          {this.props.description}
        </Typography>
        {
          (this.state.brands.length > 0) ?
          this.state.brands.map((brand, idx) => {
            return (
                <Grid key={idx} container item className={classes.item} lg={2} md={3} sm={4} xs={6}>
                  <Link to={self.state.configs.callToActions[idx]} style={{display: 'flex', 'justify-content': 'center', width: '90%', background: '#e8e8e8'}}>
                    <img
                      className={classes.image}
                      src={brand.url_imagen}
                      alt=" "
                    />
                  </Link>
                </Grid>
            )
          })
          :
          ''
        }
      </Grid>
    )
  }
}

export default compose(
  
  withStyles(styles)
)(BrandBlock)
