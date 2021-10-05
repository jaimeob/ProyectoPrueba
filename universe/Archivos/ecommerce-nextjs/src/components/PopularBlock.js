import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  blockTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 48
  },
  blockDescription: {
    width: '100%',
    textAlign: 'center',
    fontSize: 22,
    marginBottom: 32
  },
  item: {
    margin: 0,
    padding: 16
  },
  itemTag: {
    backgroundColor: 'red',
    position: 'absolute',
    marginTop: 32,
    color: 'white',
    fontSize: 14,
    padding: '4px 8px',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: theme.zIndex.drawer + 1
  },
  itemImage: {
    width: '100%'
  },
  itemName: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 24,
    fontWeight: 800,
  },
  itemDescription: {
    textAlign: 'center',
    fontSize: 16
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 800,
    color: theme.palette.primary.main
  },
  itemOldPrice: {
    fontSize: 12,
    fontWeight: 400,
    color: 'red',
    textDecoration: 'line-through'
  },
  itemBrand: {
    fontSize: 12,
    opacity: 0.5
  },
  itemCode: {
    fontSize: 10,
    opacity: 0.5
  }
})

class PopularBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: null
    }
  }

  componentWillMount() {
    let configs = JSON.parse(this.props.configs)
    this.setState({
      configs: configs
    })
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <Grid container style={{ width: '85%', margin: '0 auto' }}>
        <Typography variant="h2" className={classes.blockTitle}>
          {this.props.title}
        </Typography>
        <Typography variant="h5" className={classes.blockDescription}>
          {this.props.description}
        </Typography>
        {
          (this.state.configs.items.length > 0) ?
            this.state.configs.items.map(function (item, idx) {
              return (
                <Grid item className={classes.item} xl={3} lg={3} md={3} sm={6} xs={6}>
                  {
                    (Utils.isExternalLink(item.url)) ?
                    <a href={item.url}>
                      { self.renderDetail(item) }
                    </a>
                    :
                    <Link to={item.url}>
                      { self.renderDetail(item) }
                    </Link>
                  }
                </Grid>
              )
            })
            :
            ''
        }
      </Grid>
    )
  }

  renderDetail(item) {
    const { classes } = this.props
    return (
      <div>
        <img
          className={classes.itemImage}
          src={Utils.constants.CONFIG_ENV.HOST + item.banner}
          alt=" "
        />
        <div className={classes.itemDescription}>
          <Typography variant="h2" className={classes.itemName}>{item.title}</Typography>
          <Typography variant="body1" className={classes.itemDescription}>{item.description}</Typography>
        </div>
      </div>
    )
  }
}

export default compose(
  
  withStyles(styles)
)(PopularBlock)
