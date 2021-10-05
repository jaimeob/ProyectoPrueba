import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

// Components
import NotFound from './NotFound'
import PersonComponent from '../components/PersonComponents'
import PersonModal from '../components/PersonComponentModal'
import Title from '../components/Title'
import Loading from '../components/Loading'
import Empty from '../components/Empty'
import PersonInformation from '../components/PersonInformation'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsRoot: {
    borderBottom: '1px solid #e8e8e8',
  },
  tabsIndicator: {
    backgroundColor: '#1890ff',
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 72,
    width: '100%',
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing.unit * 4,
    fontSize: '17px',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      color: '#40a9ff',
      opacity: 1,
    },
    '&$tabSelected': {
      color: '#1890ff',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#40a9ff',
    },
  },
})

class Persons extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openModal: false,
      infoModal: false,
      persons: [],
      loading: false
    }

    this.loadData = this.loadData.bind(this)
  }

  async componentWillMount() {
    this.loadData()
  }

  async loadData() {
    await this.setState({ loading: true })
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/agreement/all'
    })

    if (response.data !== undefined && response.data !== null && response.data) {
      this.setState({
        agreements: response.data.agreements,
        campaigns: response.data.campaigns,
        folios: response.data.folios,
        loading: false
      })
    }

    response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'persons',
      endpoint: '/all'
    })

    if (response.data !== undefined && response.data !== null && response.data) {
      this.setState({
        persons: response.data,
        loading: false
      })
    }
    await this.setState({ loading: false })

  }

  render() {
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Foliador
    if (module.permissions.read) {
      return (
        <Grid container >
          <Grid item xs={12}>
            <Title
              title='Personas'
              description='Perfiles de personas para poder orientar contenido y publicidad.'
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid xs={3} style={{ display: 'block', marginLeft: 'auto' }} >
                <Button fullWidth onClick={() => { this.setState({ openModal: true }) }} style={{ fontSize: '17px', background: '#1b2d63', color: 'white', textTransform: 'none' }} >
                  <AddIcon fontSize='small' />
                      Nuevo perfil
                      </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: '20px' }}>
            {
              (!this.state.loading && this.state.persons !== null && this.state.persons !== undefined && this.state.persons.length > 0) ?
                this.state.persons.map((person, idx) => {
                  return (
                    <Grid item xs={12} style={{ paddingBottom: '10px' }} >
                      <PersonComponent
                        title={person.name}
                        subtitle={String(person.status)}
                      >
                      </PersonComponent>
                    </Grid>
                  )
                })
                :
                <Grid container style={{ width: '100%', height: '55vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                  {
                    (!this.state.loading && this.state.persons !== null && this.state.persons !== undefined && this.state.persons.length === 0) ?
                      <Grid item xs={5}>
                        <Empty title='No hay perfiles de personas creadas' ></Empty>
                      </Grid>
                      :
                      <Grid item xs={1}>
                        <Loading></Loading>
                      </Grid>
                  }
                </Grid>
            }
          </Grid>
          <PersonInformation
            open={this.state.infoModal}
            handleClose={() => { this.setState({ openModal: false }) }}
            loadData={ ()=>{ this.loadData() } }
          ></PersonInformation>
        </Grid>
      )
    } else {
      return (
        <NotFound />
      )
    }
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Persons)
