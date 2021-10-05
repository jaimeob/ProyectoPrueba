import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, Tabs, Tab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Empty from '../components/Empty'
import ComponentModal from '../components/ComponentModal'
import Title from '../components/Title'

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

class Foliador extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      modalType: null,
      agreements: [],
      campaigns: [],
      agreementData: null,
      detailData: null,
      edit: false,
      detail: false,
      folios: [],






      optionSelected: 'REPARTIDORES',
      deliverys: [],
      orders: [],
      deliveryDetail: null,
      orderDetail: null,
      clientDetail: null,
      evidence: null,
      orderSelected: null,
      openDeliveryModal: false,
      openOrderModal: false,
      openClientModal: false,
      openEvidenceModal: false,
      openCancelModal: false,
      openReubicar: false,
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      uploadEvidence: false




    }

    this.loadData = this.loadData.bind(this)
    this.handleChangeTab = this.handleChangeTab.bind(this)
    this.getAgreementById = this.getAgreementById.bind(this)
    this.handleAgreementsActions = this.handleAgreementsActions.bind(this)
    this.handleFoliosActions = this.handleFoliosActions.bind(this)
    this.getFoliosActions = this.getFoliosActions.bind(this)
    this.handleStatusFolio = this.handleStatusFolio.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    this.loadData()
  }

  async loadData() {
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
  }

  async getAgreementById(id) {
    let response = null
    let responseAgreement = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/agreement/' + id
    })
    if (responseAgreement.data !== undefined && responseAgreement.data !== null && responseAgreement.data) {
      response = responseAgreement.data
    }
    return response
  }

  async getCampaignsById(id) {
    let response = null
    let responseAgreement = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/campaign/' + id
    })
    if (responseAgreement.data !== undefined && responseAgreement.data !== null && responseAgreement.data) {
      response = responseAgreement.data
    }
    return response
  }

  getAgreementsActions(item) {
    if (item !== undefined) {
      return [
        {
          "icon": 'visibility',
          "code": 'read',
          "name": 'Ver detalle',
          "key": 'read_agreement',
          "pipeline": []
        },
        {
          "icon": 'edit',
          "code": 'update',
          "name": 'Editar',
          "key": 'edit_agreement',
          "pipeline": []
        }
      ]
    } else {
      return []
    }
  }

  async handleAgreementsActions(item, action) {
    let key = action.key
    // folios, convenios, campaign

    if (key === 'read_agreement') {
      let agreement = await this.getAgreementById(item.id)
      if (agreement !== undefined && agreement !== null) {
        this.setState({
          detailData: agreement,
          modalType: 'convenios',
          detail: true,
          openEvidenceModal: true,
        })
      }
    } else if (key === 'edit_agreement') {
      let agreement = await this.getAgreementById(item.id)
      if (agreement !== undefined && agreement !== null) {
        this.setState({
          detailData: agreement,
          modalType: 'convenios',
          edit: true,
          openEvidenceModal: true,
        })
      }
    }

  }

  getCampaignsActions(item) {
    if (item !== undefined) {
      return [
        {
          "icon": 'visibility',
          "code": 'read',
          "name": 'Ver detalle',
          "key": 'read_campaign',
          "pipeline": []
        },
        {
          "icon": 'edit',
          "code": 'update',
          "name": 'Editar',
          "key": 'edit_campaign',
          "pipeline": []
        }
      ]
    } else {
      return []
    }
  }

  async handleCampaignsActions(item, action) {
    let key = action.key
    // folios, convenios, campaign

    if (key === 'read_campaign') {
      let campaign = await this.getCampaignsById(item.id)
      if (campaign !== undefined && campaign !== null) {
        this.setState({
          detailData: campaign,
          modalType: 'campaign',
          detail: true,
          openEvidenceModal: true,
        })
      }
    } else if (key === 'edit_campaign') {
      let campaign = await this.getCampaignsById(item.id)
      if (campaign !== undefined && campaign !== null) {
        this.setState({
          detailData: campaign,
          modalType: 'campaign',
          edit: true,
          openEvidenceModal: true,
        })
      }
    }

  }

  handleChangeTab = (event, value) => {
    this.setState({ value });
  }

  async handleFoliosActions(item, action) {
    let key = action.key

    if (key === 'read_folio') {
      let folio = await this.getFoliosById(item._id)
      if (folio !== undefined && folio !== null) {
        this.setState({
          detailData: folio,
          modalType: 'folios',
          detail: true,
          openEvidenceModal: true,
        })
      }
    } else if (key === 'edit_folio') {
      let folio = await this.getFoliosById(item._id)
      if (folio !== undefined && folio !== null) {
        this.setState({
          detailData: folio,
          modalType: 'folios',
          edit: true,
          openEvidenceModal: true,
        })
      }
    } else if (key === 'status'){
      await this.handleStatusFolio(item._id)
      this.loadData()
    }

  }

  getFoliosActions(item) {
    if (item !== undefined) {
      return [
        {
          "icon": 'visibility',
          "code": 'read',
          "name": 'Ver detalle',
          "key": 'read_folio',
          "pipeline": []
        },
        {
          "icon": 'edit',
          "code": 'update',
          "name": 'Editar',
          "key": 'edit_folio',
          "pipeline": []
        },
        {
          "icon": (item.status === "Activo") ? 'lock' : 'lock_open',
          "code": 'update',
          "key": 'status',
          "name": (item.status === "Activo") ? 'Deshabilitar' : 'Habilitar',
          "pipeline": []
        },
      ]
    } else {
      return []
    }
  }

  async getFoliosById(id) {
    let response = null
    let responseFolios = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/folio/' + id
    })
    if (responseFolios.data !== undefined && responseFolios.data !== null && responseFolios.data) {
      response = responseFolios.data
    }
    return response
  }

  async handleStatusFolio(id) {

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'PATCH',
      resource: 'users',
      endpoint: '/folio/' + id,
      data: {
        status: 1,
      }
    })
    if (response.data !== undefined && response.data !== null && response.data.edited) {
      // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
      await this.loadData()
    } else {
      await this.setState({ messageSnack: 'No se ha podido modificar convenio.', openSnack: true })
    }

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
              title="Foliador"
              description="Folios de monedero azul"
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid xs={3} style={{ display: 'block', marginLeft: 'auto' }} >
                {
                  (this.state.value === 0) ?
                    <Button fullWidth onClick={() => { this.setState({ openEvidenceModal: true, modalType: 'folios' }) }} style={{ fontSize: '17px', background: '#1b2d63', color: 'white', textTransform: 'none' }} >
                      <AddIcon fontSize='small' />
                      Agegar Folios
                      </Button>
                    :
                    (this.state.value === 1) ?
                      <Button fullWidth onClick={() => { this.setState({ openEvidenceModal: true, modalType: 'convenios' }) }} style={{ fontSize: '17px', background: '#1b2d63', color: 'white', textTransform: 'none' }} >
                        <AddIcon fontSize='small' />
                      Agregar Convenio
                      </Button>
                      :
                      <Button fullWidth onClick={() => { this.setState({ openEvidenceModal: true, modalType: 'campaign' }) }} style={{ fontSize: '17px', background: '#1b2d63', color: 'white', textTransform: 'none' }} >
                        <AddIcon fontSize='small' />
                      Agregar Campaña
                      </Button>
                }
              </Grid>
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: '20px' }}>
            <Grid item xs={12}>
              <div className={classes.root}>
                <Tabs
                  value={this.state.value}
                  onChange={this.handleChangeTab}
                  classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                >
                  <Tab
                    disableRipple
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Folios"
                  />
                  <Tab
                    disableRipple
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Convenios"
                  />
                  <Tab
                    disableRipple
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Campañas"
                  />

                </Tabs>
              </div>
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: '20px' }}>
            <Grid item xs={12} style={{ marginLeft: '10px', marginRight: '10px' }} >
              {
                (this.state.value === 0) ?
                  <Grid container>
                    {/* Folios vigentes */}
                    <Grid item xs={12}  >
                      {
                        (this.state.folios.length > 0) ?
                          <TableCRUD
                            user={this.state.user}
                            module={module}
                            data={this.state.folios}
                            actionsFunction={(item) => this.getFoliosActions(item)}
                            handleActionsFunction={(item, option) => { this.handleFoliosActions(item, option) }}
                            params={[
                              {
                                title: "Convenio",
                                name: "agreement",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Campaña",
                                name: "campaign",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Folio Inicial",
                                name: "initFolio",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Folio Final",
                                name: "finishFolio",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Importe",
                                name: "import",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Estatus",
                                name: "status",
                                type: "string",
                                responsive: "xs",
                              }
                            ]}
                          />
                          :
                          <Empty
                            title="¡No hay Folios!"
                          />
                      }
                    </Grid>

                  </Grid>
                  :
                  (this.state.value === 1) ?
                    <Grid container>
                      {/* Convenios  */}
                      <Grid item xs={12}  >
                        {
                          (this.state.agreements.length > 0) ?
                            <TableCRUD
                              user={this.state.user}
                              module={module}
                              data={this.state.agreements}
                              actionsFunction={(item) => this.getAgreementsActions(item)}
                              handleActionsFunction={(item, option) => { this.handleAgreementsActions(item, option) }}
                              params={[
                                {
                                  title: "Nombre",
                                  name: "name",
                                  type: "string",
                                  responsive: "xs"
                                },
                                {
                                  title: "Alias",
                                  name: "nickname",
                                  type: "string",
                                  responsive: "xs"
                                },
                                {
                                  title: "Prefijo",
                                  name: "prefix",
                                  type: "string",
                                  responsive: "xs"
                                },
                                {
                                  title: "Contacto",
                                  name: "contactName",
                                  type: "string",
                                  responsive: "xs"
                                },
                                {
                                  title: "Teléfono",
                                  name: "cellphone",
                                  type: "string",
                                  responsive: "xs",
                                }
                              ]}
                            />
                            :
                            <Empty
                              title="¡No hay Convenios!"
                              descrpition="No hay convenios para mostrar" />
                        }
                      </Grid>

                    </Grid>
                    :
                    <Grid container>
                      {/* Campañas  */}
                      <Grid item xs={12}  >
                        {
                          (this.state.campaigns.length > 0) ?
                            <TableCRUD
                              user={this.state.user}
                              module={module}
                              data={this.state.campaigns}
                              actionsFunction={(item) => this.getCampaignsActions(item)}
                              handleActionsFunction={(item, option) => { this.handleCampaignsActions(item, option) }}
                              params={[
                                {
                                  title: "Nombre",
                                  name: "name",
                                  type: "string",
                                  responsive: "xl"
                                }
                              ]}
                            />
                            :
                            <Empty
                              title="¡No hay Campañas!"
                              descrpition="No hay campañas para mostrar" />
                        }
                      </Grid>

                    </Grid>

              }
            </Grid>

          </Grid>
          <ComponentModal
            modalType={this.state.modalType}
            open={this.state.openEvidenceModal}
            data={this.state.detailData}
            edit={this.state.edit}
            detail={this.state.detail}
            agreements={this.state.agreements}
            campaigns={this.state.campaigns}
            addConvenio={() => { this.setState({ modalType: 'convenios' }) }}
            addCampaign={() => { this.setState({ modalType: 'campaign' }) }}
            folios={() => { this.setState({ modalType: 'folios' }) }}
            handleEdit={() => { this.setState({ detail: false, edit: true }) }}
            handleClose={() => {
              this.setState({
                openEvidenceModal: false,
                edit: false,
                detail: false
              })
            }}
            loadData={() => this.loadData()}
          >

          </ComponentModal>

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
)(Foliador)
